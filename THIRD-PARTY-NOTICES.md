# 第三方内容说明（THIRD-PARTY NOTICES）

本仓库是一个**学习性质的复刻演示**，自有代码以 MIT 发布，但其中包含或依赖以下第三方内容，
它们**不在** MIT 许可范围内，权利归各自所有者。

## 1. 场景数据 —— `src/scenes/moonshotScene.ts`

- **来源**：从 `moonshot.cn`（月之暗面 Moonshot AI 官网）的生产包中提取的场景工程 JSON。
- **权利人**：月之暗面（Moonshot AI）。
- **用途**：仅作为个人学习 WebGL 图层链与组件封装的对照样本，非商用。
- **说明**：该文件不是原创作品，本仓库不对其主张任何权利。若权利人认为不妥，
  请联系仓库所有者，会在收到通知后立即移除相关文件。
- **替代方案**：想要可自由使用的场景，请用 [Unicorn Studio](https://www.unicorn.studio/)
  编辑器自行创建并导出 JSON，替换本文件即可（见 README「换成自己的场景」）。

## 2. 渲染引擎 —— Unicorn Studio 运行时

- **权利人**：Unicorn Studio（UNCRN LLC）。
- **获取方式**：本仓库**不包含**引擎副本，运行时通过其官方 jsDelivr CDN 加载：
  `https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.4/dist/unicornStudio.umd.js`
- **引擎许可原文**（摘自其源码仓库 README，2026-09-12 核对）：

  > Copyright © 2026 Unicorn Studio (UNCRN LLC)
  >
  > Permission is granted to use this software only for integration with legitimate Unicorn Studio
  > projects. The source code is made available for transparency and to facilitate integration, but
  > remains proprietary.
  >
  > Unauthorized uses include but are not limited to:
  > 1. Using this software in any way that violates Unicorn Studio's Terms of Service
  > 2. Creating derivative works not approved by Unicorn Studio
  > 3. **Using this software with non-Unicorn Studio projects**
  > 4. Reverse engineering this software to recreate Unicorn Studio functionality
  > 5. Removing or altering any license, copyright, watermark, or other proprietary notices

- **平台套餐限制**（摘自 unicorn.studio/terms，2026-09-12 核对）：免费套餐**仅限非商业个人项目**，
  且**导出内容会带水印**，并禁止移除、遮蔽或规避该水印；去水印或商用需订阅付费计划。
- **对本仓库的含义**：① 组件只能用于渲染在 Unicorn Studio 编辑器里做出的场景；② 想把本仓库的组件
  用于商业站点，请先自行确认已满足上述条款；③ 本仓库不含引擎副本（因此也不存在移除版权声明的问题），
  如你有自备授权副本，可用组件的 `sdkUrl` 属性指向自己的路径。
- 引擎源码仓库：<https://github.com/hiunicornstudio/unicornstudio.js>

## 3. 字体 —— `public/assets/NotoSans-Latin.woff2`

- **字体**：Noto Sans（Latin 子集）。
- **权利人**：Google / The Noto Project Authors，以 **SIL Open Font License 1.1** 发布。
- **说明**：OFL 允许自由使用、修改与再分发（保留许可声明即可）。此字体是被场景工程引用的
  渲染字体（`fontCSS.src`），可用组件的 `fontSrc` 属性替换成别的字体。

## 4. 未包含的内容

为规避品牌与素材版权风险，本仓库**刻意不包含**：

- 月之暗面官网的任何商标、Logo、图片、视频等视觉素材
- 官网前端生产包（JS / CSS / HTML）原件
- 任何暗示官方关联或背书的名称与标识

演示页面的兜底图是内联 SVG，`heroScene` 的样式为自行编写。
