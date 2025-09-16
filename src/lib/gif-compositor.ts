import type { ProcessedFrame, CompositionSettings } from './gif-types';

export class GifCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private settings: CompositionSettings;
  private previousCanvas?: HTMLCanvasElement; // disposal type 3用

  constructor(width: number, height: number, settings: CompositionSettings) {
    this.width = width;
    this.height = height;
    this.settings = settings;
    
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context could not be created');
    }
    this.ctx = ctx;
    
    // 透明背景で初期化
    this.ctx.clearRect(0, 0, width, height);
  }

  /**
   * 指定フレームまでの合成を行い、結果のImageDataまたはImageBitmapを返す
   */
  async composeFrame(targetIndex: number, frames: ProcessedFrame[]): Promise<ImageData | ImageBitmap> {
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // targetIndexまでのフレームを順次合成
    for (let i = 0; i <= targetIndex; i++) {
      const isLastFrame = i === targetIndex;
      await this.renderSingleFrame(frames[i], isLastFrame ? undefined : frames[i + 1]);
    }
    
    // ImageBitmapを優先して使用
    if (this.settings.useImageBitmap && typeof createImageBitmap !== 'undefined') {
      return createImageBitmap(this.canvas);
    }
    
    // フォールバック: ImageData（整数値でgetImageData呼び出し）
    const safeWidth = Math.floor(this.width) || 1;
    const safeHeight = Math.floor(this.height) || 1;
    return this.ctx.getImageData(0, 0, safeWidth, safeHeight);
  }

  /**
   * 単一フレームの描画処理
   */
  private async renderSingleFrame(frame: ProcessedFrame, nextFrame?: ProcessedFrame): Promise<void> {
    const { originalFrame, disposalType } = frame;
    
    // disposal type 3の場合は現在の状態を保存
    if (disposalType === 3) {
      this.savePreviousCanvas();
    }
    
    // フレームパッチを描画
    this.drawFramePatch(originalFrame);
    
    // 次のフレームがある場合はdisposal methodを適用
    if (nextFrame) {
      this.applyDisposalMethod(frame);
    }
  }

  /**
   * フレームパッチをキャンバスに描画
   */
  private drawFramePatch(frame: any): void {
    const { patch, dims, transparentIndex } = frame;
    
    if (!patch || !dims || dims.width <= 0 || dims.height <= 0) return;
    
    // dimsを整数値に正規化
    const safeWidth = Math.floor(dims.width);
    const safeHeight = Math.floor(dims.height);
    const safeLeft = Math.floor(dims.left);
    const safeTop = Math.floor(dims.top);
    
    if (safeWidth <= 0 || safeHeight <= 0) return;
    
    // ImageDataを作成
    const imageData = this.ctx.createImageData(safeWidth, safeHeight);
    
    // transparentIndexがある場合は透明度を考慮してコピー
    if (transparentIndex !== undefined) {
      for (let i = 0; i < patch.length; i += 4) {
        imageData.data[i] = patch[i];     // R
        imageData.data[i + 1] = patch[i + 1]; // G
        imageData.data[i + 2] = patch[i + 2]; // B
        imageData.data[i + 3] = patch[i + 3]; // A
      }
    } else {
      imageData.data.set(patch);
    }
    
    // 指定位置に描画
    this.ctx.putImageData(imageData, safeLeft, safeTop);
  }

  /**
   * disposal methodを適用
   */
  private applyDisposalMethod(frame: ProcessedFrame): void {
    switch (frame.disposalType) {
      case 1:
        // Do not dispose - 何もしない（次のフレームが上書きされる）
        break;
        
      case 2:
        // Restore to background - フレーム領域を背景色（透明）で塗りつぶし
        this.restoreToBackground(frame);
        break;
        
      case 3:
        // Restore to previous - 前の状態に復元
        this.restoreToPrevious();
        break;
        
      default:
        // 不明なdisposal typeは1として扱う
        break;
    }
  }

  /**
   * フレーム領域を背景色（透明）で塗りつぶし
   */
  private restoreToBackground(frame: ProcessedFrame): void {
    const { dims } = frame;
    const safeLeft = Math.floor(dims.left);
    const safeTop = Math.floor(dims.top);
    const safeWidth = Math.floor(dims.width);
    const safeHeight = Math.floor(dims.height);
    
    if (safeWidth > 0 && safeHeight > 0) {
      this.ctx.clearRect(safeLeft, safeTop, safeWidth, safeHeight);
    }
  }

  /**
   * 前の状態に復元
   */
  private restoreToPrevious(): void {
    if (this.previousCanvas) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.drawImage(this.previousCanvas, 0, 0);
    }
  }

  /**
   * 現在のキャンバス状態を保存
   */
  private savePreviousCanvas(): void {
    if (!this.previousCanvas) {
      this.previousCanvas = document.createElement('canvas');
      this.previousCanvas.width = this.width;
      this.previousCanvas.height = this.height;
    }
    
    const prevCtx = this.previousCanvas.getContext('2d');
    if (prevCtx) {
      prevCtx.clearRect(0, 0, this.width, this.height);
      prevCtx.drawImage(this.canvas, 0, 0);
    }
  }

  /**
   * リソースクリーンアップ
   */
  dispose(): void {
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.previousCanvas = undefined;
  }
}
