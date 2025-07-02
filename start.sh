#!/bin/bash

echo "🚀 jpg-to-webp-converter を起動しています..."

# 依存関係をチェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストールしています..."
    npm install
fi

# 開発サーバーをバックグラウンドで起動
echo "🌐 開発サーバーを起動しています..."
npm run dev &

# サーバーPIDを保存
SERVER_PID=$!

# サーバーが起動するまで待機
echo "⏳ サーバーの準備を待っています..."
sleep 3

# ブラウザでページを開く
echo "🌐 ブラウザでアプリケーションを開いています..."
if command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000
elif command -v start &> /dev/null; then
    # Windows (Git Bash)
    start http://localhost:3000
fi

echo "✅ アプリケーションが起動しました！"
echo "🌐 ブラウザで http://localhost:3000 が開かれました"
echo "⏹️  停止するには Ctrl+C を押してください"

# フォアグラウンドでサーバーを実行
wait $SERVER_PID 