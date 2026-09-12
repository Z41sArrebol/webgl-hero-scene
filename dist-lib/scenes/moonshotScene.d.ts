/**
 * 「Glitchy Screen」风格 WebGL 光晕文字场景（UnicornStudio 工程数据，JSON 字符串）
 *
 * 来源：从 moonshot.cn 生产包中提取的场景工程，版权归月之暗面（Moonshot AI）所有。
 * 仅用于个人学习与效果复刻演示，非商用；如权利人要求会立即移除。详见 THIRD-PARTY-NOTICES.md。
 *
 * 结构：13 个图层，每层自带引擎编译好的 GLSL（300 es），从上到下串成后处理链。
 *   gradient              打底渐变
 *   text                  文字层（opacity 0.42），挂 replicate / shatter 两个子效果
 *   god_rays              光束
 *   replicate             复制残影
 *   shatter               voronoi 破碎（trackMouse 0.8，跟随鼠标）
 *   retro_screen          扫描线
 *   ripple                波纹
 *   chromatic_aberration  色差
 *   progressive_blur      渐进模糊（4 个 pass，辉光主要来源）
 *   diffuse               扩散
 *   liquify               液化
 *   fbm                   分形噪声
 *   beam                  光束
 *
 * 想换成自己的场景：用 UnicornStudio 编辑器导出工程 JSON，替换本文件即可。
 */
export declare const MOONSHOT_SCENE: string;
