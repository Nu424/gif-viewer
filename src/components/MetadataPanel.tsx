import type { GifInfo } from '../lib/gif-types';

interface MetadataPanelProps {
  gifInfo: GifInfo | null;
  preRenderProgress?: number;
  isPreRendering?: boolean;
  className?: string;
}

export function MetadataPanel({ 
  gifInfo, 
  preRenderProgress = 0,
  isPreRendering = false,
  className = '' 
}: MetadataPanelProps) {
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    return `${seconds}.${ms.toString().padStart(3, '0')}s`;
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFrameDelayStats = (gifInfo: GifInfo) => {
    const delays = gifInfo.frames.map(frame => frame.delay * 10);
    const min = Math.min(...delays);
    const max = Math.max(...delays);
    const avg = delays.reduce((sum, delay) => sum + delay, 0) / delays.length;
    const median = [...delays].sort((a, b) => a - b)[Math.floor(delays.length / 2)];
    
    return { min, max, avg, median };
  };

  if (!gifInfo) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">GIF 情報</h3>
        <div className="text-gray-500 text-center py-8">
          GIFファイルを読み込むと情報が表示されます
        </div>
      </div>
    );
  }

  const delayStats = getFrameDelayStats(gifInfo);

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">GIF 情報</h3>
      
      <div className="space-y-3">
        {/* 基本情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">サイズ:</span>
            <span className="ml-2 font-medium">{gifInfo.width} × {gifInfo.height}</span>
          </div>
          <div>
            <span className="text-gray-600">フレーム数:</span>
            <span className="ml-2 font-medium">{gifInfo.totalFrames}</span>
          </div>
        </div>

        {/* 時間情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">総再生時間:</span>
            <span className="ml-2 font-medium">{formatTime(gifInfo.totalDuration)}</span>
          </div>
          <div>
            <span className="text-gray-600">平均フレームレート:</span>
            <span className="ml-2 font-medium">
              {(1000 / gifInfo.averageDelay).toFixed(1)} fps
            </span>
          </div>
        </div>

        {/* フレーム遅延統計 */}
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">フレーム遅延統計</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">最短:</span>
              <span className="ml-1">{delayStats.min}ms</span>
            </div>
            <div>
              <span className="text-gray-600">最長:</span>
              <span className="ml-1">{delayStats.max}ms</span>
            </div>
            <div>
              <span className="text-gray-600">平均:</span>
              <span className="ml-1">{delayStats.avg.toFixed(1)}ms</span>
            </div>
            <div>
              <span className="text-gray-600">中央値:</span>
              <span className="ml-1">{delayStats.median}ms</span>
            </div>
          </div>
        </div>

        {/* プリレンダリング状況 */}
        {(isPreRendering || preRenderProgress > 0) && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              プリレンダリング
              {isPreRendering && <span className="ml-1 text-blue-600">進行中...</span>}
            </h4>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isPreRendering ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${preRenderProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{preRenderProgress.toFixed(0)}% 完了</span>
              <span>
                {isPreRendering 
                  ? '準備中...' 
                  : preRenderProgress >= 100 
                    ? '完了 ✓' 
                    : '部分的に完了'
                }
              </span>
            </div>
          </div>
        )}

        {/* パフォーマンス情報 */}
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">パフォーマンス</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              推定メモリ使用量: {formatFileSize(gifInfo.width * gifInfo.height * 4 * gifInfo.totalFrames)}
            </div>
            <div>
              合成方式: Canvas 2D
            </div>
            <div>
              キャッシュ: {preRenderProgress >= 100 ? '全フレーム' : '部分的'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
