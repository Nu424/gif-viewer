import { useCallback, useState } from 'react';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function FileDropZone({ 
  onFileSelect, 
  isLoading = false, 
  error = null,
  className = '' 
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileInput = useCallback((file: File) => {
    if (file && file.type.includes('gif')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileInput(file);
    }
  }, [handleFileInput]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const gifFile = files.find(file => file.type.includes('gif'));
    
    if (gifFile) {
      handleFileInput(gifFile);
    }
  }, [handleFileInput]);

  return (
    <div className="w-full space-y-4">
      <div
        className={`
          relative w-full min-h-[200px] 
          border-2 border-dashed rounded-xl
          flex flex-col items-center justify-center
          transition-all duration-200 ease-in-out
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }
          ${isLoading ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:shadow-md'}
          ${className}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/gif"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        {/* アイコン */}
        <div className="mb-4">
          <div className="text-6xl mb-2">
            {isLoading ? '⏳' : '🎬'}
          </div>
        </div>
        
        {/* テキスト */}
        <div className="text-center space-y-3 px-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {isLoading ? 'GIFを読み込み中...' : 'GIFファイルを選択'}
          </h3>
          
          <p className="text-gray-600 text-base leading-relaxed max-w-sm">
            {isLoading 
              ? 'しばらくお待ちください' 
              : 'クリックしてファイルを選択するか、ここにドラッグ&ドロップしてください'
            }
          </p>
          
          {!isLoading && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg">
              <span className="mr-2">📄</span>
              対応形式: .gif
            </div>
          )}
        </div>
        
        {/* ローディング時のプログレスアニメーション */}
        {isLoading && (
          <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-700 font-medium">エラー</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
