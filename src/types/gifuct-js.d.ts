declare module 'gifuct-js' {
  export interface Dims {
    top: number;
    left: number;
    width: number;
    height: number;
  }

  export interface Frame {
    pixels: number[];
    dims: Dims;
    delay: number;
    disposalType: number;
    colorTable: number[][];
    transparentIndex?: number;
    patch: Uint8ClampedArray;
  }

  export interface GIF {
    lsd: {
      width: number;
      height: number;
    };
    frames: any[];
    colorTable: number[][];
    // その他のプロパティは必要に応じて追加
  }

  export function parseGIF(buffer: ArrayBuffer): GIF;
  export function decompressFrames(gif: GIF, buildPatch: boolean): Frame[];
}
