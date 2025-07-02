# Universal Image Converter

これは[Next.js](https://nextjs.org)を使って作られた汎用画像変換アプリケーションです。JPG、PNG、WebP、GIF、BMP形式の相互変換とリサイズが可能です。

## ✨ 機能

- **多形式対応**: JPG, PNG, WebP, GIF, BMP の入力をサポート
- **柔軟な出力**: WebP, PNG, JPEG 形式での出力
- **双方向変換**: WebP ↔ PNG, WebP ↔ JPEG, PNG ↔ JPEG など
- **バッチ処理**: 複数ファイルの一括変換
- **リサイズ機能**: 指定サイズへの画像リサイズ
- **品質調整**: ロスレス/ロッシー圧縮の選択
- **ローカル処理**: ブラウザ内で完結、プライバシー保護

## 🚀 簡単な起動方法

### 自動起動（推奨）
ブラウザが自動で開かれる簡単な起動方法です：

```bash
# シェルスクリプトを使用（macOS/Linux）
./start.sh

# またはNode.jsスクリプトを使用（全OS対応）
node start.js

# またはnpmコマンドを使用
npm run start:auto
# または
npm run dev:open
```

### 通常の起動方法
開発サーバーのみを起動する場合：

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

その後、ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📝 使用方法

1. **ファイル選択**: ドラッグ&ドロップまたはクリックで画像ファイルを選択
2. **設定調整**: 
   - 出力形式を選択（WebP、PNG、JPEG）
   - サイズを指定（幅・高さ）
   - 品質を調整（PNG以外）
3. **変換実行**: "Convert All" ボタンで一括変換
4. **ダウンロード**: ZIP形式で変換済み画像を一括ダウンロード

## 🎛️ 設定オプション

- **Output Format**: 出力形式（WebP/PNG/JPEG）
- **Width/Height**: 出力画像のサイズ（16-4096px）
- **Quality**: 圧縮品質（0-100、PNG以外）
- **Lossless**: ロスレス圧縮（PNGは常時ON）

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
