import { useState } from 'react'
import HeroScene, { detectQuality, type SceneQuality } from './components/HeroScene'
import { MOONSHOT_SCENE } from './scenes/moonshotScene'

/** 场景原始参数：11 个字符配 fontSize 0.11 / aspectRatio 8.71 */
const DEFAULTS = { text: 'moonshot-ai', fontSize: 0.11, aspectRatio: 8.71, height: 400 }

/** 演示用兜底图：内联 SVG，不引入任何第三方素材 */
const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="400">
      <defs><radialGradient id="g" cx="50%" cy="50%">
        <stop offset="0%" stop-color="#4a4a4a"/><stop offset="100%" stop-color="#000"/>
      </radialGradient></defs>
      <rect width="1440" height="400" fill="url(#g)"/>
    </svg>`,
  )

type Status = 'loading' | 'ready' | 'error'

export default function App() {
  // 「已应用」的参数：只有点重新渲染才会喂给组件
  const [applied, setApplied] = useState(DEFAULTS)
  // 面板里的草稿参数
  const [draft, setDraft] = useState(DEFAULTS)

  const [paused, setPaused] = useState(false)
  const [status, setStatus] = useState<Status>('loading')
  const [quality, setQuality] = useState<SceneQuality | null>(null)
  const [errorText, setErrorText] = useState('')
  const [autoQuality] = useState(() => detectQuality())

  const dirty =
    draft.text !== applied.text ||
    draft.fontSize !== applied.fontSize ||
    draft.aspectRatio !== applied.aspectRatio ||
    draft.height !== applied.height

  // 字号按「保持总宽度不变」换算：11 字符 0.11 → n 字符 0.11 × 11 / n
  const suggestFontSize = () => {
    const chars = Math.max(draft.text.trim().length, 1)
    setDraft((prev) => ({ ...prev, fontSize: Number((0.11 * (11 / chars)).toFixed(3)) }))
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>WebGL Hero Scene</h1>
        <p>
          把一份 UnicornStudio 场景工程挂成 React 组件的 WebGL 背景：13 层着色器后处理链叠出光晕文字，
          CSS 只负责定位与淡入。场景数据来自对照学习，非原创。
        </p>
      </header>

      <section className="stage">
        <HeroScene
          scene={MOONSHOT_SCENE}
          text={applied.text}
          fontSize={applied.fontSize}
          aspectRatio={applied.aspectRatio}
          height={applied.height}
          paused={paused}
          fallbackImg={FALLBACK_IMG}
          onReady={(q) => {
            setStatus('ready')
            setQuality(q)
          }}
          onError={(error) => {
            setStatus('error')
            setErrorText(error.message)
          }}
        />
      </section>

      <section className="panel">
        <div className="panel__row">
          <label className="panel__label" htmlFor="text">
            文案
          </label>
          <div className="panel__control">
            <input
              id="text"
              className="text-input"
              value={draft.text}
              spellCheck={false}
              onChange={(event) => setDraft((prev) => ({ ...prev, text: event.target.value }))}
            />
            <button className="mini-button" type="button" onClick={suggestFontSize}>
              按宽度推算字号
            </button>
          </div>
        </div>

        <div className="panel__row">
          <label className="panel__label" htmlFor="fontSize">
            字号 <span className="value">{draft.fontSize}</span>
          </label>
          <input
            id="fontSize"
            type="range"
            min={0.03}
            max={0.4}
            step={0.005}
            value={draft.fontSize}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, fontSize: Number(event.target.value) }))
            }
          />
        </div>

        <div className="panel__row">
          <label className="panel__label" htmlFor="aspectRatio">
            宽高比 <span className="value">{draft.aspectRatio}</span>
          </label>
          <input
            id="aspectRatio"
            type="range"
            min={3}
            max={16}
            step={0.01}
            value={draft.aspectRatio}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, aspectRatio: Number(event.target.value) }))
            }
          />
        </div>

        <div className="panel__row">
          <label className="panel__label" htmlFor="height">
            容器高度 <span className="value">{draft.height}px</span>
          </label>
          <input
            id="height"
            type="range"
            min={200}
            max={700}
            step={10}
            value={draft.height}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, height: Number(event.target.value) }))
            }
          />
        </div>

        <div className="panel__actions">
          <button
            className="apply-button"
            type="button"
            disabled={!dirty}
            onClick={() => setApplied(draft)}
          >
            {dirty ? '重新渲染' : '已是最新'}
          </button>
          <button
            className="apply-button apply-button--ghost"
            type="button"
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? '继续渲染' : '暂停渲染'}
          </button>
          <button
            className="apply-button apply-button--ghost"
            type="button"
            onClick={() => {
              setDraft(DEFAULTS)
              setApplied(DEFAULTS)
            }}
          >
            复位
          </button>
        </div>

        <dl className="status">
          <div>
            <dt>引擎</dt>
            <dd>
              {status === 'loading' && '加载中…'}
              {status === 'ready' && '已就绪'}
              {status === 'error' && `失败：${errorText}`}
            </dd>
          </div>
          <div>
            <dt>当前画质</dt>
            <dd>
              {quality
                ? `scale ${quality.scale} · dpi ${quality.dpi} · fps ${quality.fps}`
                : '—'}
            </dd>
          </div>
          <div>
            <dt>设备自适应档位</dt>
            <dd>
              {`scale ${autoQuality.scale} · dpi ${autoQuality.dpi} · fps ${autoQuality.fps}`}
              {autoQuality.reduced ? ' · 已开启减弱动效' : ''}
            </dd>
          </div>
          <div>
            <dt>动画状态</dt>
            <dd>{paused ? '已暂停' : '渲染中（滚出视口或切后台会自动暂停）'}</dd>
          </div>
        </dl>

        <p className="hint">
          改动文案或字号需要点「重新渲染」：文字层是随场景一起加载的，改它等于重建一次 WebGL
          场景。字符数变了记得同时调「按宽度推算字号」和宽高比，否则字会被拉伸或裁切。
        </p>
      </section>

      <footer className="page__footer">
        <p>
          学习性质的复刻演示，非商用。场景数据提取自 moonshot.cn 生产包，版权归月之暗面（Moonshot
          AI）所有；渲染引擎版权归 Unicorn Studio，通过其官方 CDN 加载。本仓库不含任何品牌素材（商标、图片、视频）。
        </p>
        <p>如权利人认为不妥，联系后立即移除。</p>
      </footer>
    </div>
  )
}
