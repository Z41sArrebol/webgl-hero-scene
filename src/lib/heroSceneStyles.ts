/**
 * 组件自带的布局样式：注入一次，使用方不需要额外引 CSS。
 *
 * 只负责给容器定尺寸、让画布铺满、做一次淡入 —— 画面本身全部由 WebGL 绘制。
 * 如果你的站点有严格的 CSP（不允许 inline style），可以改用导出的
 * HERO_SCENE_CSS 自行落成静态 CSS 文件，并传 injectStyles={false}。
 */

export const HERO_SCENE_CSS = `
.hero-scene {
  position: relative;
  width: 100%;
  height: var(--hero-scene-height, 400px);
  flex-shrink: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.6s ease-out;
}
.hero-scene.is-ready {
  opacity: 1;
}
.hero-scene__frame {
  position: relative;
  width: 100%;
  height: 100%;
}
/* 引擎插入的 canvas 往往自带内联尺寸，这里强制铺满容器 */
.hero-scene__frame canvas,
.hero-scene__frame > div {
  width: 100% !important;
  height: 100% !important;
}
.hero-scene__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .hero-scene {
    transition: none;
  }
}
`

const STYLE_TAG_ATTR = 'data-webgl-hero-scene'

/** 幂等注入；SSR 环境（无 document）下自动跳过 */
export function ensureHeroSceneStyles(): void {
  if (typeof document === 'undefined') return
  if (document.head.querySelector(`style[${STYLE_TAG_ATTR}]`)) return
  const style = document.createElement('style')
  style.setAttribute(STYLE_TAG_ATTR, '')
  style.textContent = HERO_SCENE_CSS
  document.head.appendChild(style)
}
