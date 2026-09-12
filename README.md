# WebGL Hero Scene

> 把一份 UnicornStudio 场景工程挂成 React 组件的 WebGL 光晕文字背景。

A drop-in React component that renders a WebGL glow-text hero background from a
[Unicorn Studio](https://www.unicorn.studio/) scene project — 13 shader layers chained
into a post-processing pipeline, no 3D library, no `three.js`.

![预览](docs/preview.jpg)

> ⚠️ **这是学习性质的复刻演示，非商用。** 场景数据提取自 `moonshot.cn` 生产包，版权归月之暗面
> （Moonshot AI）所有；渲染引擎版权归 Unicorn Studio。详见[免责声明](#免责声明)。

## 这是什么

一个把「WebGL 场景工程」封装成可复用组件的实验，顺便把过程中值得讲清楚的几件事拆开了：

- **组件不画画面**。绘制全部由 GPU 上的 fragment shader 完成，组件只做参数注入、引擎加载、画质降级和暂停调度。
- **CSS 只负责布局**。容器尺寸、定位、一次淡入——仅此而已，没有任何视觉元素是 CSS 画的。
- **不是 `three.js`**。这是 2D 的图层后处理链（一层输出作为下一层输入纹理），没有相机、网格和光源。

演示页面带一个实时控制面板：改文案、字号、宽高比、容器高度，可以直接看参数对效果的影响
（改文字会重建场景，这是场景工程的加载机制决定的，不是 bug）。

## 效果是怎么实现的

场景工程是一份 JSON，13 个图层，每层都带着引擎编译好的 GLSL（`#version 300 es`）。
引擎把它们从上到下串成一条链，在 GPU 上逐像素叠出画面：

| 图层 | 作用 |
| --- | --- |
| `gradient` | 打底渐变 |
| `text` | 文字层（`opacity 0.42`），挂 `replicate` / `shatter` 两个子效果 |
| `replicate` | 复制残影 |
| `shatter` | voronoi 破碎，`trackMouse 0.8` —— 跟随鼠标 |
| `god_rays` / `beam` | 光束 |
| `progressive_blur` | 渐进模糊，**4 个 pass，辉光的主要来源** |
| `diffuse` / `liquify` / `fbm` | 扩散、液化、分形噪声 |
| `ripple` / `chromatic_aberration` / `retro_screen` | 波纹、色差、扫描线 |

所以那些「光晕」不是一个光晕贴图，是模糊 + 扩散 + 光束叠出来的。文字层本身只被组件改了四个字段：
`textContent`、`fontSize`、`aspectRatio`、`fontCSS.src`。

组件内部做的四件事：

1. **改写文字图层**：解析场景 JSON，定位 `layerType === 'text'` 的图层（或用 `textLayerId` 指定），改字段后重新序列化。
2. **把场景就地喂给引擎**：注入一个 `<script type="application/json" id="...">`，然后把这个 **id 当 `filePath` 传**——引擎会先 `document.getElementById(filePath)`，命中就直接解析，**不发网络请求**。这是能离线跑、也能绕过 CDN 抓场景的关键。
3. **按设备降级**：`deviceMemory` / `hardwareConcurrency ≤ 4` 或系统开了「减弱动效」时降一档（`scale 0.4 / dpi 1 / fps 24`，否则 `0.5 / 1.5 / 30`），也可用手动指定。
4. **暂停与回收**：滚出视口（`IntersectionObserver`，阈值 0.05）、切到后台（`visibilitychange`）、或者 `prefers-reduced-motion` 时置 `handle.paused = true`；卸载时 `destroy()` 释放 WebGL 上下文。

## 快速开始

```bash
npm install
npm run dev      # 打开演示页，带实时控制面板
npm run build    # tsc 类型检查 + vite 打包
```

## 用法

```tsx
import HeroScene from './components/HeroScene'
import { MOONSHOT_SCENE } from './scenes/moonshotScene'

export default function Hero() {
  return (
    <HeroScene
      scene={MOONSHOT_SCENE}
      text="moonshot-ai"
      fontSize={0.11}       // 11 个字符
      aspectRatio={8.71}    // 与上面配套
      height={400}
      onError={(error) => console.warn(error.message)}
    />
  )
}
```

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `scene` | `string` | **必填** | UnicornStudio 场景工程 JSON 字符串 |
| `text` | `string` | — | 写入文字层的文案 |
| `fontSize` | `number` | — | 文字层相对字号（相对画布宽） |
| `aspectRatio` | `number` | — | 文字层宽高比 |
| `fontSrc` | `string` | — | 场景字体地址，替换成自己的字体 |
| `textLayerId` | `string` | 第一个 text 图层 | 指定要改写的图层 `id` |
| `height` | `number \| string` | `400` | 容器高度，数字按 px |
| `sdkUrl` | `string` | 官方 jsDelivr `v2.1.4` | 引擎地址，可换成自备副本 |
| `quality` | `'auto' \| Partial<SceneQuality>` | `'auto'` | 画质策略，可手动指定 `scale` / `dpi` / `fps` |
| `pauseOffscreen` | `boolean` | `true` | 滚出视口时暂停渲染 |
| `paused` | `boolean` | `false` | 由外部强制暂停（切换时不会重建场景） |
| `fallbackImg` | `string` | — | 引擎加载失败时的兜底图 |
| `className` / `style` | — | — | 透传到容器 |
| `onReady` | `(quality: SceneQuality) => void` | — | 引擎就绪，返回最终生效的画质 |
| `onError` | `(error: Error) => void` | — | 引擎加载失败或场景 JSON 非法 |

同时导出两个纯函数，方便单独使用：

```ts
import { detectQuality, withTextLayer } from './components/HeroScene'

detectQuality()                                // → { reduced, scale, dpi, fps }
withTextLayer(sceneJson, { text: 'hello' })    // → 改写文字图层后的新 JSON 字符串
```

## 换成自己的场景

场景 JSON 是通用的，换成自己的项目就是换个字符串：

1. 在 [Unicorn Studio](https://www.unicorn.studio/) 编辑器里做好场景，导出工程 JSON；
2. 存成 `src/scenes/myScene.ts`：`export const MY_SCENE = '{"history": ...}'`；
3. `<HeroScene scene={MY_SCENE} />`。

**改文案的两个数字必须配套**：`fontSize` 是相对画布宽的比例，`aspectRatio` 是文字图层的宽高比，
文字是先光栅化成贴图、再按图层框拉伸的，两者和字符数不匹配就会被拉伸或裁切。经验规则是
「保持总宽度不变」——11 个字符用 `0.11`，n 个字符用 `0.11 × 11 / n`（演示页的「按宽度推算字号」
按钮就是这个式子），同时把 `aspectRatio` 调到跟新文案相称。

## 性能与暂停

- 每个组件实例对应一个独立的 WebGL 场景和上下文，**同屏建议不超过 10 个**（浏览器上下文上限约 16 个）。
- 三个暂停条件：滚出视口、切到后台、`prefers-reduced-motion`（后者是硬暂停，用于尊重系统减弱动效设置）。
- 引擎 SDK 全局只加载一次，`paused` 切换走独立同步路径，不会重建场景。
- 提供 `fallbackImg` 时，引擎加载失败会显示兜底图；不提供则容器停留在透明状态。

## 已知限制

- **改 `scene` / `text` / `fontSize` 会重建整个场景**。文字层是随场景一起加载的，引擎没有提供运行时的图层更新 API。
- 需要 WebGL2 支持。
- 引擎是 UMD 全局脚本，会挂到 `window.UnicornStudio`；组件手写了它的类型声明，官方没有 `.d.ts`。
- 默认从 CDN 加载引擎，离线使用请自备副本并通过 `sdkUrl` 指定（注意引擎的授权条款）。

## 免责声明

- 本仓库是**个人学习性质的复刻演示，非商用**，与月之暗面（Moonshot AI）及 Unicorn Studio **无任何关联或背书关系**。
- `src/scenes/moonshotScene.ts` 的场景数据提取自 `moonshot.cn` 的线上生产包，**不是原创作品**，版权归月之暗面所有，仅作技术学习的对照样本。若权利人认为不妥，联系后会立即移除。
- 渲染引擎版权归 Unicorn Studio，本仓库不包含引擎副本，运行时通过其官方 CDN 加载；引擎的使用条款与授权范围请以其官方说明为准。
- 为规避品牌与素材风险，本仓库**不包含**官网的任何商标、Logo、图片、视频素材，也不包含官网前端生产包原件。
- `public/assets/NotoSans-Latin.woff2` 为 Noto Sans（SIL OFL 1.1），属于第三方内容。
- 自有代码以 [MIT](LICENSE) 发布；**MIT 不覆盖上述第三方内容**，详见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

## 致谢

- [Unicorn Studio](https://www.unicorn.studio/) —— 场景编辑器与渲染引擎，整个效果的地基。
- 月之暗面官网 —— 作为学习复刻的对照样本。
- Noto Sans —— 场景引用的字体。
