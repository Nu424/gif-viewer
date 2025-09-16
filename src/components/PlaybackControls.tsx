import type { UseAnimationControllerReturn } from '../hooks/useAnimationController';

interface PlaybackControlsProps {
  animation: UseAnimationControllerReturn;
  disabled?: boolean;
  className?: string;
}

const SPEED_OPTIONS = [
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
];

export function PlaybackControls({ 
  animation, 
  disabled = false,
  className = '' 
}: PlaybackControlsProps) {
  const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    animation.setSpeed(parseFloat(event.target.value));
  };

  const buttonClass = `
    px-3 py-2 text-sm font-medium rounded-md border transition-colors
    ${disabled 
      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
    }
  `.trim();

  const primaryButtonClass = `
    px-4 py-2 text-sm font-medium rounded-md transition-colors
    ${disabled 
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
      : animation.isPlaying
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }
  `.trim();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* メイン再生コントロール */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={animation.goToStart}
          disabled={disabled}
          className={buttonClass}
          title="最初のフレームへ"
        >
          ⏮️
        </button>
        
        <button
          onClick={animation.prevFrame}
          disabled={disabled}
          className={buttonClass}
          title="前のフレーム"
        >
          ⏪
        </button>
        
        <button
          onClick={animation.toggle}
          disabled={disabled}
          className={primaryButtonClass}
          title={animation.isPlaying ? '一時停止' : '再生'}
        >
          {animation.isPlaying ? '⏸️ 停止' : '▶️ 再生'}
        </button>
        
        <button
          onClick={animation.nextFrame}
          disabled={disabled}
          className={buttonClass}
          title="次のフレーム"
        >
          ⏩
        </button>
        
        <button
          onClick={animation.goToEnd}
          disabled={disabled}
          className={buttonClass}
          title="最後のフレームへ"
        >
          ⏭️
        </button>
      </div>

      {/* 速度とループコントロール */}
      <div className="flex items-center justify-center space-x-4 text-sm">
        <label className="flex items-center space-x-2">
          <span className="text-gray-600">速度:</span>
          <select
            value={animation.speed}
            onChange={handleSpeedChange}
            disabled={disabled}
            className={`
              px-2 py-1 border rounded text-sm
              ${disabled 
                ? 'bg-gray-100 text-gray-400 border-gray-200' 
                : 'bg-white text-gray-700 border-gray-300'
              }
            `}
          >
            {SPEED_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={animation.loop}
            onChange={(e) => animation.setLoop(e.target.checked)}
            disabled={disabled}
            className={`
              ${disabled ? 'text-gray-400' : 'text-blue-600'}
            `}
          />
          <span className={`${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            ループ再生
          </span>
        </label>
      </div>

      {/* ジャンプコントロール */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => animation.jumpFrames(-10)}
          disabled={disabled}
          className={`${buttonClass} text-xs`}
          title="10フレーム戻る"
        >
          -10F
        </button>
        
        <button
          onClick={() => animation.jumpFrames(-1)}
          disabled={disabled}
          className={`${buttonClass} text-xs`}
          title="1フレーム戻る"
        >
          -1F
        </button>
        
        <button
          onClick={() => animation.jumpFrames(1)}
          disabled={disabled}
          className={`${buttonClass} text-xs`}
          title="1フレーム進む"
        >
          +1F
        </button>
        
        <button
          onClick={() => animation.jumpFrames(10)}
          disabled={disabled}
          className={`${buttonClass} text-xs`}
          title="10フレーム進む"
        >
          +10F
        </button>
      </div>
    </div>
  );
}
