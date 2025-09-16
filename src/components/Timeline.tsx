import { useCallback } from 'react';
import type { GifInfo } from '../lib/gif-types';

interface TimelineProps {
  gifInfo: GifInfo | null;
  currentFrame: number;
  onFrameChange: (frameIndex: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Timeline({
  gifInfo,
  currentFrame,
  onFrameChange,
  disabled = false,
  className = ''
}: TimelineProps) {
  const handleSliderChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const frameIndex = parseInt(event.target.value, 10);
    onFrameChange(frameIndex);
  }, [onFrameChange]);

  const formatTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    return `${seconds}.${ms.toString().padStart(3, '0')}s`;
  }, []);

  const getCurrentTime = useCallback((): number => {
    if (!gifInfo || currentFrame < 0) return 0;
    
    return gifInfo.frames
      .slice(0, currentFrame + 1)
      .reduce((sum, frame) => sum + (frame.delay * 10), 0);
  }, [gifInfo, currentFrame]);

  if (!gifInfo) {
    return (
      <div className={`opacity-50 ${className}`}>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="0"
            value="0"
            disabled
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>フレーム: 0 / 0</span>
            <span>時間: 0.000s / 0.000s</span>
          </div>
        </div>
      </div>
    );
  }

  const maxFrame = gifInfo.totalFrames - 1;
  const currentTime = getCurrentTime();
  const totalTime = gifInfo.totalDuration;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* スライダー */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max={maxFrame}
          value={currentFrame}
          onChange={handleSliderChange}
          disabled={disabled}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 
            slider-thumb:rounded-full slider-thumb:bg-blue-600 
            slider-thumb:cursor-pointer slider-thumb:shadow-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          `}
          style={{
            background: disabled ? undefined : `linear-gradient(
              to right,
              #3b82f6 0%,
              #3b82f6 ${(currentFrame / maxFrame) * 100}%,
              #e5e7eb ${(currentFrame / maxFrame) * 100}%,
              #e5e7eb 100%
            )`
          }}
        />
        
        {/* フレームマーカー（オプション：大きなGIFでは省略） */}
        {gifInfo.totalFrames <= 100 && (
          <div className="absolute top-0 w-full h-2 pointer-events-none">
            {gifInfo.frames.map((_, index) => (
              <div
                key={index}
                className="absolute top-0 w-px h-2 bg-gray-400 opacity-30"
                style={{
                  left: `${(index / maxFrame) * 100}%`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 情報表示 */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex space-x-4">
          <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>
            フレーム: {currentFrame + 1} / {gifInfo.totalFrames}
          </span>
          <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>
            遅延: {gifInfo.frames[currentFrame]?.delay * 10 || 0}ms
          </span>
        </div>
        
        <div className="text-right">
          <span className={disabled ? 'text-gray-400' : 'text-gray-700'}>
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </span>
        </div>
      </div>

      {/* プログレスバー（再生時間ベース） */}
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-100 ${
            disabled ? 'bg-gray-400' : 'bg-green-500'
          }`}
          style={{
            width: `${totalTime > 0 ? (currentTime / totalTime) * 100 : 0}%`
          }}
        />
      </div>
    </div>
  );
}
