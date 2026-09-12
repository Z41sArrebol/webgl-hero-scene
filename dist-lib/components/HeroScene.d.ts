import { type CSSProperties } from 'react';
export interface SceneQuality {
    /** 渲染倍率（1 为设计尺寸） */
    scale: number;
    /** 设备像素比上限 */
    dpi: number;
    /** 帧率上限 */
    fps: number;
    /** 用户在系统里开启了「减弱动效」，此时强制暂停 */
    reduced: boolean;
}
export interface SceneTextOverride {
    /** 要写入文字层的文案 */
    text?: string;
    /** 文字层相对字号（相对画布宽） */
    fontSize?: number;
    /** 文字层宽高比，需与字号、字符数配套 */
    aspectRatio?: number;
    /** 场景字体地址，默认走 CDN；自备字体时传自己的地址 */
    fontSrc?: string;
    /** 指定图层 id；默认取第一个 layerType === 'text' 的图层 */
    textLayerId?: string;
}
export interface HeroSceneProps extends SceneTextOverride {
    /** 场景工程 JSON 字符串（必填） */
    scene: string;
    /** 容器高度，数字按 px 处理 */
    height?: number | string;
    /** 引擎地址，默认官方 CDN */
    sdkUrl?: string;
    /** 画质策略：'auto' 按设备自适应，也可手动指定其中任意项 */
    quality?: 'auto' | Partial<Omit<SceneQuality, 'reduced'>>;
    /** 滚出视口或切到后台时暂停渲染，默认开启 */
    pauseOffscreen?: boolean;
    /** 由外部强制暂停 */
    paused?: boolean;
    /** 引擎加载失败时显示的兜底图 */
    fallbackImg?: string;
    /** 是否自动注入组件自带的样式，默认 true；CSP 不允许内联样式时可关掉并改用 HERO_SCENE_CSS */
    injectStyles?: boolean;
    className?: string;
    style?: CSSProperties;
    onReady?: (quality: SceneQuality) => void;
    onError?: (error: Error) => void;
}
interface UnicornSceneHandle {
    destroy: () => void;
    paused?: boolean;
}
declare global {
    interface Window {
        UnicornStudio?: {
            addScene: (options: Record<string, unknown>) => Promise<UnicornSceneHandle>;
        };
    }
}
/** 按设备能力给一档保守的画质；弱机或「减弱动效」时降一档 */
export declare function detectQuality(): SceneQuality;
/** 改写场景里的文字图层，其余图层原样保留 */
export declare function withTextLayer(sceneJson: string, override: SceneTextOverride): string;
export default function HeroScene({ scene, text, fontSize, aspectRatio, fontSrc, textLayerId, height, sdkUrl, quality, pauseOffscreen, paused, fallbackImg, injectStyles, className, style, onReady, onError, }: HeroSceneProps): import("react").JSX.Element;
export {};
