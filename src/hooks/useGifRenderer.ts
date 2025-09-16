import { useState, useCallback, useEffect, useRef } from 'react';
import { GifCompositor } from '../lib/gif-compositor';
import type { GifInfo, ProcessedFrame, CompositionSettings } from '../lib/gif-types';
import { DEFAULT_COMPOSITION_SETTINGS } from '../lib/gif-types';

interface UseGifRendererReturn {
  renderFrame: (frameIndex: number) => Promise<ImageData | ImageBitmap | null>;
  preRenderProgress: number; // 0-100
  isPreRendering: boolean;
  cancelPreRender: () => void;
  getFrameFromCache: (frameIndex: number) => ImageData | ImageBitmap | null;
}

export function useGifRenderer(
  gifInfo: GifInfo | null,
  settings: CompositionSettings = DEFAULT_COMPOSITION_SETTINGS
): UseGifRendererReturn {
  const [preRenderProgress, setPreRenderProgress] = useState(0);
  const [isPreRendering, setIsPreRendering] = useState(false);
  
  const compositorRef = useRef<GifCompositor | null>(null);
  const frameCache = useRef<Map<number, ImageData | ImageBitmap>>(new Map());
  const preRenderAbortRef = useRef<AbortController | null>(null);

  // GIF情報が変わったときの初期化
  useEffect(() => {
    if (!gifInfo) {
      // クリーンアップ
      if (compositorRef.current) {
        compositorRef.current.dispose();
        compositorRef.current = null;
      }
      frameCache.current.clear();
      setPreRenderProgress(0);
      setIsPreRendering(false);
      return;
    }

    // 新しいCompositorを作成
    compositorRef.current = new GifCompositor(gifInfo.width, gifInfo.height, settings);
    frameCache.current.clear();
    
    // プリレンダリングを開始
    if (settings.preRenderAll && gifInfo.frames.length <= settings.maxCacheFrames) {
      startPreRendering(gifInfo.frames);
    }
  }, [gifInfo, settings]);

  const startPreRendering = useCallback(async (frames: ProcessedFrame[]) => {
    if (!compositorRef.current) return;
    
    setIsPreRendering(true);
    setPreRenderProgress(0);
    
    // AbortControllerで中断可能にする
    const abortController = new AbortController();
    preRenderAbortRef.current = abortController;
    
    try {
      for (let i = 0; i < frames.length; i++) {
        if (abortController.signal.aborted) break;
        
        const composedResult = await compositorRef.current.composeFrame(i, frames);
        
        if (!abortController.signal.aborted) {
          frameCache.current.set(i, composedResult);
          setPreRenderProgress(Math.round(((i + 1) / frames.length) * 100));
        }
        
        // 重い処理なので適度にyieldする
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    } catch (error) {
      console.error('Pre-rendering failed:', error);
    } finally {
      if (!abortController.signal.aborted) {
        setIsPreRendering(false);
        setPreRenderProgress(100);
      }
      preRenderAbortRef.current = null;
    }
  }, []);

  const cancelPreRender = useCallback(() => {
    if (preRenderAbortRef.current) {
      preRenderAbortRef.current.abort();
      setIsPreRendering(false);
      setPreRenderProgress(0);
    }
  }, []);

  const getFrameFromCache = useCallback((frameIndex: number): ImageData | ImageBitmap | null => {
    return frameCache.current.get(frameIndex) || null;
  }, []);

  const renderFrame = useCallback(async (frameIndex: number): Promise<ImageData | ImageBitmap | null> => {
    if (!gifInfo || !compositorRef.current) return null;
    
    // キャッシュから取得を試行
    const cachedFrame = frameCache.current.get(frameIndex);
    if (cachedFrame) {
      return cachedFrame;
    }
    
    // キャッシュにない場合はその場で合成
    try {
      const composedResult = await compositorRef.current.composeFrame(frameIndex, gifInfo.frames);
      
      // メモリ制限内であればキャッシュに保存
      if (frameCache.current.size < settings.maxCacheFrames) {
        frameCache.current.set(frameIndex, composedResult);
      }
      
      return composedResult;
    } catch (error) {
      console.error('Frame rendering failed:', error);
      return null;
    }
  }, [gifInfo, settings.maxCacheFrames]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      cancelPreRender();
      if (compositorRef.current) {
        compositorRef.current.dispose();
      }
      // ImageBitmapがある場合はclose()でメモリ解放
      frameCache.current.forEach((frame) => {
        if (frame instanceof ImageBitmap && 'close' in frame) {
          frame.close();
        }
      });
      frameCache.current.clear();
    };
  }, [cancelPreRender]);

  return {
    renderFrame,
    preRenderProgress,
    isPreRendering,
    cancelPreRender,
    getFrameFromCache,
  };
}
