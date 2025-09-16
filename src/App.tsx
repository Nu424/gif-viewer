import { useState, useEffect, useCallback } from 'react';
import { useGifDecoder } from './hooks/useGifDecoder';
import { useGifRenderer } from './hooks/useGifRenderer';
import { useAnimationController } from './hooks/useAnimationController';
import { FileDropZone } from './components/FileDropZone';
import { GifCanvas } from './components/GifCanvas';
import { PlaybackControls } from './components/PlaybackControls';
import { Timeline } from './components/Timeline';
import { MetadataPanel } from './components/MetadataPanel';
import { DEFAULT_COMPOSITION_SETTINGS } from './lib/gif-types';

function App() {
  const [currentFrameData, setCurrentFrameData] = useState<ImageData | ImageBitmap | null>(null);
  
  // GIFデコーダー
  const { gifInfo, isLoading, error, decodeGif, reset } = useGifDecoder();
  
  // レンダラー
  const { renderFrame, preRenderProgress, isPreRendering } = useGifRenderer(
    gifInfo,
    DEFAULT_COMPOSITION_SETTINGS
  );
  
  // アニメーションコントローラー
  const animation = useAnimationController({
    gifInfo,
    onFrameChange: useCallback(async (frameIndex: number) => {
      if (gifInfo) {
        const frameData = await renderFrame(frameIndex);
        setCurrentFrameData(frameData);
      }
    }, [gifInfo, renderFrame])
  });

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gifInfo) return;
      
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          animation.toggle();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (event.shiftKey) {
            animation.jumpFrames(-10);
          } else {
            animation.prevFrame();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (event.shiftKey) {
            animation.jumpFrames(10);
          } else {
            animation.nextFrame();
          }
          break;
        case 'Home':
          event.preventDefault();
          animation.goToStart();
          break;
        case 'End':
          event.preventDefault();
          animation.goToEnd();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gifInfo, animation]);

  // 初期フレームの描画
  useEffect(() => {
    if (gifInfo && animation.currentFrame === 0) {
      renderFrame(0).then(setCurrentFrameData);
    }
  }, [gifInfo, animation.currentFrame, renderFrame]);

  const handleFileSelect = useCallback((file: File) => {
    reset();
    decodeGif(file);
  }, [reset, decodeGif]);

  const handleNewFile = useCallback(() => {
    reset();
    setCurrentFrameData(null);
  }, [reset]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              🎬 GIF フレームビューア
            </h1>
            {gifInfo && (
              <button
                onClick={handleNewFile}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                新しいファイル
              </button>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!gifInfo ? (
          /* ファイル選択画面 */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                GIF フレームビューア
              </h2>
              <p className="text-gray-600">
                GIFを読み込んで、フレーム単位で確認・再生できます
              </p>
            </div>
            
            <FileDropZone
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              error={error}
            />
          </div>
        ) : (
          /* GIF表示画面 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左カラム: キャンバス */}
            <div className="lg:col-span-2 space-y-6">
              {/* キャンバス */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <GifCanvas
                  width={gifInfo.width}
                  height={gifInfo.height}
                  frameData={currentFrameData}
                  fitMode="contain"
                  className="w-full max-w-2xl mx-auto"
                />
              </div>

              {/* タイムライン */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <Timeline
                  gifInfo={gifInfo}
                  currentFrame={animation.currentFrame}
                  onFrameChange={animation.goToFrame}
                  disabled={isLoading}
                />
              </div>

              {/* プレイバックコントロール */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <PlaybackControls
                  animation={animation}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 右カラム: メタデータ */}
            <div className="space-y-6">
              <MetadataPanel
                gifInfo={gifInfo}
                preRenderProgress={preRenderProgress}
                isPreRendering={isPreRendering}
              />

              {/* キーボードショートカット */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  キーボードショートカット
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Space</span>
                    <span>再生/停止</span>
                  </div>
                  <div className="flex justify-between">
                    <span>← / →</span>
                    <span>前/次フレーム</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shift + ← / →</span>
                    <span>10フレーム移動</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home / End</span>
                    <span>最初/最後</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
