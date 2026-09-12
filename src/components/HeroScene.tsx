import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ensureHeroSceneStyles } from '../lib/heroSceneStyles'

/**
 * <HeroScene /> — 用一份 UnicornStudio 场景工程渲染 WebGL 背景的 React 组件
 *
 * 原理：场景工程是一份 JSON，里面每个图层都带着引擎编译好的 GLSL。引擎把图层
 * 从上到下串成一条后处理链（上一层输出作为下一层输入纹理），在 GPU 上逐像素
 * 叠出效果。本组件不参与绘制，只负责四件事：
 *   1. 按 props 改写场景里的文字图层（文案 / 字号 / 宽高比 / 字体）
 *   2. 把场景 JSON 注入 <script type="application/json">，让引擎就地读取
 *      （引擎的 filePath 支持传 DOM 元素 id，命中则不发起网络请求）
 *   3. 加载引擎 UMD，按设备性能决定 scale / dpi / fps
 *   4. 切后台、滚出视口、用户偏好减弱动效时暂停渲染，销毁时释放 WebGL 上下文
 */

/** 默认从官方 jsDelivr 拉引擎；如需自备副本，用 sdkUrl 换成自己的路径 */
const DEFAULT_SDK_URL =
  'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.4/dist/unicornStudio.umd.js'

/**
 * 默认字体：场景文字图层用的 Noto Sans（OFL 许可）。
 * 走 jsDelivr 分发本仓库里的那份副本，使用方不需要自带字体文件；
 * 想换成自己的字体就传 fontSrc。
 */
const DEFAULT_FONT_SRC =
  'https://cdn.jsdelivr.net/gh/Z41sArrebol/webgl-hero-scene@main/public/assets/NotoSans-Latin.woff2'

export interface SceneQuality {
  /** 渲染倍率（1 为设计尺寸） */
  scale: number
  /** 设备像素比上限 */
  dpi: number
  /** 帧率上限 */
  fps: number
  /** 用户在系统里开启了「减弱动效」，此时强制暂停 */
  reduced: boolean
}

export interface SceneTextOverride {
  /** 要写入文字层的文案 */
  text?: string
  /** 文字层相对字号（相对画布宽） */
  fontSize?: number
  /** 文字层宽高比，需与字号、字符数配套 */
  aspectRatio?: number
  /** 场景字体地址，默认走 CDN；自备字体时传自己的地址 */
  fontSrc?: string
  /** 指定图层 id；默认取第一个 layerType === 'text' 的图层 */
  textLayerId?: string
}

export interface HeroSceneProps extends SceneTextOverride {
  /** 场景工程 JSON 字符串（必填） */
  scene: string
  /** 容器高度，数字按 px 处理 */
  height?: number | string
  /** 引擎地址，默认官方 CDN */
  sdkUrl?: string
  /** 画质策略：'auto' 按设备自适应，也可手动指定其中任意项 */
  quality?: 'auto' | Partial<Omit<SceneQuality, 'reduced'>>
  /** 滚出视口或切到后台时暂停渲染，默认开启 */
  pauseOffscreen?: boolean
  /** 由外部强制暂停 */
  paused?: boolean
  /** 引擎加载失败时显示的兜底图 */
  fallbackImg?: string
  /** 是否自动注入组件自带的样式，默认 true；CSP 不允许内联样式时可关掉并改用 HERO_SCENE_CSS */
  injectStyles?: boolean
  className?: string
  style?: CSSProperties
  onReady?: (quality: SceneQuality) => void
  onError?: (error: Error) => void
}

interface UnicornSceneHandle {
  destroy: () => void
  paused?: boolean
}

declare global {
  interface Window {
    UnicornStudio?: {
      addScene: (options: Record<string, unknown>) => Promise<UnicornSceneHandle>
    }
  }
}

/** 同一个 sdkUrl 只加载一次 */
const sdkLoads = new Map<string, Promise<void>>()
let instanceSeq = 0

function loadSdk(url: string): Promise<void> {
  if (window.UnicornStudio) return Promise.resolve()
  const cached = sdkLoads.get(url)
  if (cached) return cached

  const loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`加载 UnicornStudio 引擎失败：${url}`))
    document.body.appendChild(script)
  })
  // 失败后从缓存里摘掉，允许下次重试
  loading.catch(() => sdkLoads.delete(url))
  sdkLoads.set(url, loading)
  return loading
}

/** 按设备能力给一档保守的画质；弱机或「减弱动效」时降一档 */
export function detectQuality(): SceneQuality {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const nav = (typeof navigator === 'undefined' ? {} : navigator) as Navigator & {
    deviceMemory?: number
  }
  const weak =
    reduced ||
    (nav.deviceMemory ?? 8) <= 4 ||
    (nav.hardwareConcurrency ?? 8) <= 4

  return {
    reduced,
    scale: weak ? 0.4 : 0.5,
    dpi: weak ? 1 : 1.5,
    fps: weak ? 24 : 30,
  }
}

/** 改写场景里的文字图层，其余图层原样保留 */
export function withTextLayer(sceneJson: string, override: SceneTextOverride): string {
  let scene: { history?: Array<Record<string, unknown>> }
  try {
    scene = JSON.parse(sceneJson)
  } catch {
    throw new Error('scene 不是合法的 JSON')
  }

  const layers = scene.history
  if (!Array.isArray(layers)) throw new Error('scene 里找不到 history 图层数组')

  const layer = override.textLayerId
    ? layers.find((item) => item.id === override.textLayerId)
    : layers.find((item) => item.layerType === 'text')
  if (!layer) return JSON.stringify(scene)

  if (override.text !== undefined) layer.textContent = override.text
  if (override.fontSize !== undefined) layer.fontSize = override.fontSize
  if (override.aspectRatio !== undefined) layer.aspectRatio = override.aspectRatio
  if (override.fontSrc !== undefined) {
    const fontCSS = layer.fontCSS as { src?: string } | undefined
    if (fontCSS) fontCSS.src = override.fontSrc
  }

  return JSON.stringify(scene)
}

export default function HeroScene({
  scene,
  text,
  fontSize,
  aspectRatio,
  fontSrc = DEFAULT_FONT_SRC,
  textLayerId,
  height = 400,
  sdkUrl = DEFAULT_SDK_URL,
  quality = 'auto',
  pauseOffscreen = true,
  paused = false,
  fallbackImg,
  injectStyles = true,
  className,
  style,
  onReady,
  onError,
}: HeroSceneProps) {
  // 幂等：样式在首帧前就位，容器此时还是透明的
  if (injectStyles) ensureHeroSceneStyles()

  const [ids] = useState(() => {
    const n = ++instanceSeq
    return { element: `hero-scene-el-${n}`, data: `hero-scene-data-${n}` }
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<UnicornSceneHandle | null>(null)
  const setPausedRef = useRef<((value: boolean) => void) | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  // 回调用 ref 兜住，避免父组件每次渲染都重建场景
  const onReadyRef = useRef(onReady)
  const onErrorRef = useRef(onError)
  onReadyRef.current = onReady
  onErrorRef.current = onError

  const manualScale = quality === 'auto' ? undefined : quality.scale
  const manualDpi = quality === 'auto' ? undefined : quality.dpi
  const manualFps = quality === 'auto' ? undefined : quality.fps

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let cancelled = false
    let externalPaused = paused
    let intersecting = true
    let docVisible = document.visibilityState === 'visible'
    const resolved = detectQuality()
    const finalQuality: SceneQuality = {
      reduced: resolved.reduced,
      scale: manualScale ?? resolved.scale,
      dpi: manualDpi ?? resolved.dpi,
      fps: manualFps ?? resolved.fps,
    }

    const applyPaused = () => {
      const handle = handleRef.current
      if (!handle) return
      handle.paused =
        finalQuality.reduced || externalPaused || !docVisible || (pauseOffscreen && !intersecting)
    }
    setPausedRef.current = (value: boolean) => {
      externalPaused = value
      applyPaused()
    }

    const observer = pauseOffscreen
      ? new IntersectionObserver(
          ([entry]) => {
            intersecting = entry.isIntersecting
            applyPaused()
          },
          { threshold: 0.05 },
        )
      : null
    observer?.observe(el)

    const onVisibilityChange = () => {
      docVisible = document.visibilityState === 'visible'
      applyPaused()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // 引擎会先按 filePath 找同 id 的 DOM 节点，命中就直接解析，不发请求
    const dataScript = document.createElement('script')
    dataScript.id = ids.data
    dataScript.type = 'application/json'
    try {
      dataScript.textContent = withTextLayer(scene, {
        text,
        fontSize,
        aspectRatio,
        fontSrc,
        textLayerId,
      })
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error))
      setFailed(true)
      setReady(true)
      onErrorRef.current?.(failure)
      dataScript.remove()
      observer?.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      return
    }
    document.body.appendChild(dataScript)

    loadSdk(sdkUrl)
      .then(() => {
        if (!window.UnicornStudio) throw new Error('UnicornStudio 引擎未就绪')
        return window.UnicornStudio.addScene({
          elementId: ids.element,
          filePath: ids.data,
          scale: finalQuality.scale,
          dpi: finalQuality.dpi,
          fps: finalQuality.fps,
          lazyLoad: false,
          altText: 'Hero background animation',
          ariaLabel: 'Hero background animation',
          production: false,
        })
      })
      .then((handle) => {
        if (cancelled) {
          handle?.destroy()
          return
        }
        handleRef.current = handle
        setReady(true)
        applyPaused()
        onReadyRef.current?.(finalQuality)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setFailed(true)
        setReady(true)
        onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)))
      })

    return () => {
      cancelled = true
      setPausedRef.current = null
      observer?.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      handleRef.current?.destroy()
      handleRef.current = null
      dataScript.remove()
    }
  }, [
    ids,
    scene,
    text,
    fontSize,
    aspectRatio,
    fontSrc,
    textLayerId,
    sdkUrl,
    manualScale,
    manualDpi,
    manualFps,
    pauseOffscreen,
  ])

  // 暂停状态单独同步，避免切暂停时把整个 WebGL 场景重建一遍
  useEffect(() => {
    setPausedRef.current?.(paused)
  }, [paused])

  const containerStyle = {
    ...style,
    ['--hero-scene-height' as string]: typeof height === 'number' ? `${height}px` : height,
  } as CSSProperties

  return (
    <div
      ref={containerRef}
      className={`hero-scene${ready ? ' is-ready' : ''}${className ? ` ${className}` : ''}`}
      style={containerStyle}
    >
      <div className="hero-scene__frame" id={ids.element} />
      {failed && fallbackImg && (
        <img className="hero-scene__fallback" src={fallbackImg} alt="" aria-hidden />
      )}
    </div>
  )
}
