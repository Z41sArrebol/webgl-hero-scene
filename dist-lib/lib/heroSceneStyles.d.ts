/**
 * 组件自带的布局样式：注入一次，使用方不需要额外引 CSS。
 *
 * 只负责给容器定尺寸、让画布铺满、做一次淡入 —— 画面本身全部由 WebGL 绘制。
 * 如果你的站点有严格的 CSP（不允许 inline style），可以改用导出的
 * HERO_SCENE_CSS 自行落成静态 CSS 文件，并传 injectStyles={false}。
 */
export declare const HERO_SCENE_CSS = "\n.hero-scene {\n  position: relative;\n  width: 100%;\n  height: var(--hero-scene-height, 400px);\n  flex-shrink: 0;\n  overflow: hidden;\n  opacity: 0;\n  transition: opacity 0.6s ease-out;\n}\n.hero-scene.is-ready {\n  opacity: 1;\n}\n.hero-scene__frame {\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n/* \u5F15\u64CE\u63D2\u5165\u7684 canvas \u5F80\u5F80\u81EA\u5E26\u5185\u8054\u5C3A\u5BF8\uFF0C\u8FD9\u91CC\u5F3A\u5236\u94FA\u6EE1\u5BB9\u5668 */\n.hero-scene__frame canvas,\n.hero-scene__frame > div {\n  width: 100% !important;\n  height: 100% !important;\n}\n.hero-scene__fallback {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  pointer-events: none;\n}\n@media (prefers-reduced-motion: reduce) {\n  .hero-scene {\n    transition: none;\n  }\n}\n";
/** 幂等注入；SSR 环境（无 document）下自动跳过 */
export declare function ensureHeroSceneStyles(): void;
