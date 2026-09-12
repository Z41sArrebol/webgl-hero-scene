/**
 * webgl-hero-scene 库入口。
 *
 * 除了默认导出的组件，还导出两个纯函数（detectQuality / withTextLayer）
 * 和自带的样式字符串，方便在非 React 环境里复用同一套逻辑。
 */
export { default as HeroScene, default } from '../components/HeroScene';
export { detectQuality, withTextLayer } from '../components/HeroScene';
export { ensureHeroSceneStyles, HERO_SCENE_CSS } from './heroSceneStyles';
export { MOONSHOT_SCENE } from '../scenes/moonshotScene';
export type { HeroSceneProps, SceneQuality, SceneTextOverride } from '../components/HeroScene';
