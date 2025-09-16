import { useRef, useEffect } from 'react';

interface GifCanvasProps {
  width: number;
  height: number;
  frameData: ImageData | ImageBitmap | null;
  className?: string;
  fitMode?: 'contain' | 'actual';
}

export function GifCanvas({ 
  width, 
  height, 
  frameData, 
  className = '',
  fitMode = 'contain' 
}: GifCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズを設定
    canvas.width = width;
    canvas.height = height;

    // 背景をクリア
    ctx.clearRect(0, 0, width, height);

    // フレームデータを描画
    if (frameData) {
      if (frameData instanceof ImageData) {
        ctx.putImageData(frameData, 0, 0);
      } else if (frameData instanceof ImageBitmap) {
        ctx.drawImage(frameData, 0, 0);
      }
    }
  }, [width, height, frameData]);

  const canvasStyle: React.CSSProperties = {
    maxWidth: fitMode === 'contain' ? '100%' : undefined,
    maxHeight: fitMode === 'contain' ? '100%' : undefined,
    imageRendering: 'pixelated', // ピクセルアートの場合にエッジを保持
  };

  return (
    <div className={`relative ${className}`}>
      {/* 透明チェッカー背景 */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            repeating-conic-gradient(
              #f0f0f0 0% 25%, 
              #d0d0d0 0% 50%
            ) 50% / 16px 16px
          `,
        }}
      />
      
      {/* キャンバス */}
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        className="relative z-10 border border-gray-300 shadow-sm"
      />
      
      {/* フレームが無い場合のプレースホルダー */}
      {!frameData && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-100 border border-gray-300">
          <span className="text-gray-500 text-sm">フレームなし</span>
        </div>
      )}
    </div>
  );
}
