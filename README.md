# 🎬 GIF フレームビューア

> GIFアニメーションをフレーム単位で確認・再生できるWebアプリケーション

![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-06b6d4?style=flat-square&logo=tailwindcss)

## ✨ 主な機能

- 📁 **ファイル読み込み** - ドラッグ&ドロップまたはクリックでGIF選択
- 🎞️ **フレーム分解** - GIFを個別フレームに分解して表示
- ⏯️ **再生制御** - 再生/停止・速度変更・ループ設定
- 📊 **タイムライン** - スライダーで任意のフレームへ瞬時に移動
- ⌨️ **キーボード操作** - ショートカットキーで快適な操作
- 📈 **メタデータ表示** - GIF情報・統計・プリレンダリング進捗
- 🖼️ **透明背景対応** - チェッカーパターンで透明部分を可視化

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いて、GIFファイルをドラッグ&ドロップしてください！

## ⌨️ キーボードショートカット

| キー | 機能 |
|------|------|
| `Space` | ▶️ 再生/停止 |
| `←` / `→` | ⏪ 前/次フレーム |
| `Shift + ←/→` | ⏪ 10フレーム移動 |
| `Home` / `End` | ⏮️ 最初/最後のフレーム |

## 🔧 技術スタック

- **React 19** + **TypeScript** - モダンなUI開発
- **Vite** - 高速な開発サーバーとビルドツール
- **Tailwind CSS** - ユーティリティファーストなCSS
- **gifuct-js** - 高性能なGIFデコードライブラリ

## 📂 プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── FileDropZone.tsx    # ファイル選択
│   ├── GifCanvas.tsx       # キャンバス表示
│   ├── PlaybackControls.tsx # 再生制御
│   ├── Timeline.tsx        # タイムライン
│   └── MetadataPanel.tsx   # 情報パネル
├── hooks/              # カスタムフック
│   ├── useGifDecoder.ts    # GIFデコード
│   ├── useGifRenderer.ts   # レンダリング
│   └── useAnimationController.ts # アニメーション制御
├── lib/                # ライブラリ
│   ├── gif-compositor.ts   # フレーム合成
│   └── gif-types.ts        # 型定義
└── types/              # 外部ライブラリ型定義
    └── gifuct-js.d.ts
```

## 🎯 特徴

### 🔥 高性能レンダリング
- **プリレンダリング**: 全フレームを事前合成してスムーズなスクラブ
- **ImageBitmap**: GPU最適化された画像処理
- **Disposal Method対応**: GIF仕様に準拠した正確な描画

### 🎨 モダンなUI/UX
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **アニメーション**: スムーズなトランジション
- **アクセシビリティ**: キーボード操作とスクリーンリーダー対応

## 📋 npm スクリプト

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run preview  # ビルド結果をプレビュー
npm run lint     # ESLintでコードチェック
```
