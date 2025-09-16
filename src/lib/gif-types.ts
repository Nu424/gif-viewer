import type { Frame as GifuctFrame, Dims } from 'gifuct-js';

export interface ProcessedFrame {
  index: number;
  delay: number;
  dims: Dims;
  disposalType: number;
  transparentIndex?: number;
  // キャッシュされた合成済みイメージ
  composedImageData?: ImageData;
  composedImageBitmap?: ImageBitmap;
  // 元のgifuctフレームデータ
  originalFrame: GifuctFrame;
}

export interface GifInfo {
  width: number;
  height: number;
  totalFrames: number;
  totalDuration: number; // ミリ秒
  averageDelay: number;
  frames: ProcessedFrame[];
}

export interface AnimationState {
  isPlaying: boolean;
  currentFrame: number;
  speed: number;
  loop: boolean;
}

export interface CompositionSettings {
  useImageBitmap: boolean;
  preRenderAll: boolean;
  maxCacheFrames: number;
}

export const DEFAULT_COMPOSITION_SETTINGS: CompositionSettings = {
  useImageBitmap: typeof createImageBitmap !== 'undefined',
  preRenderAll: true,
  maxCacheFrames: 1000,
};
