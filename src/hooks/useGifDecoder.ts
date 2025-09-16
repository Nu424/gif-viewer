import { useState, useCallback } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';
import type { GifInfo, ProcessedFrame } from '../lib/gif-types';

interface UseGifDecoderReturn {
  gifInfo: GifInfo | null;
  isLoading: boolean;
  error: string | null;
  decodeGif: (file: File | ArrayBuffer) => Promise<void>;
  reset: () => void;
}

export function useGifDecoder(): UseGifDecoderReturn {
  const [gifInfo, setGifInfo] = useState<GifInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setGifInfo(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const decodeGif = useCallback(async (input: File | ArrayBuffer) => {
    setIsLoading(true);
    setError(null);
    setGifInfo(null);

    try {
      let arrayBuffer: ArrayBuffer;
      
      if (input instanceof File) {
        // ファイルタイプチェック
        if (!input.type.includes('gif')) {
          throw new Error('GIFファイルを選択してください');
        }
        arrayBuffer = await input.arrayBuffer();
      } else {
        arrayBuffer = input;
      }

      // 空ファイルチェック
      if (arrayBuffer.byteLength === 0) {
        throw new Error('ファイルが空です');
      }

      // GIFヘッダーチェック（簡易）
      const header = new Uint8Array(arrayBuffer.slice(0, 6));
      const headerString = String.fromCharCode(...header);
      if (!headerString.startsWith('GIF87a') && !headerString.startsWith('GIF89a')) {
        throw new Error('有効なGIFファイルではありません');
      }

      // gifuct-jsでパース
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);

      if (!frames || frames.length === 0) {
        throw new Error('フレームが見つかりません');
      }

      // ProcessedFrameに変換
      const processedFrames: ProcessedFrame[] = frames.map((frame, index) => ({
        index,
        delay: frame.delay,
        dims: frame.dims,
        disposalType: frame.disposalType,
        transparentIndex: frame.transparentIndex,
        originalFrame: frame,
      }));

      // GIFサイズの取得（lsdから、フォールバックは最初のフレーム）
      let width = gif.lsd?.width;
      let height = gif.lsd?.height;
      
      if (!width || !height) {
        // フォールバック: 最初のフレームのdimsから取得
        const firstFrame = processedFrames[0];
        if (firstFrame?.dims) {
          width = firstFrame.dims.width;
          height = firstFrame.dims.height;
        }
      }
      
      // 整数に丸め、有効性チェック
      width = Math.floor(width || 0);
      height = Math.floor(height || 0);
      
      if (width <= 0 || height <= 0) {
        throw new Error(`無効なGIFサイズ: ${width}x${height}`);
      }

      // GIF情報の計算
      const totalDuration = processedFrames.reduce((sum, frame) => sum + (frame.delay * 10), 0); // delay単位は10ms
      const averageDelay = totalDuration / processedFrames.length;

      const gifInfo: GifInfo = {
        width,
        height,
        totalFrames: processedFrames.length,
        totalDuration,
        averageDelay,
        frames: processedFrames,
      };

      // デバッグ情報
      console.debug('GIF decoded:', { width, height, frames: processedFrames.length });

      setGifInfo(gifInfo);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('GIF decode error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    gifInfo,
    isLoading,
    error,
    decodeGif,
    reset,
  };
}
