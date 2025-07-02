const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 jpg-to-webp-converter を起動しています...');

// 依存関係をチェック
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('📦 依存関係をインストールしています...');
    const installProcess = spawn('npm', ['install'], { stdio: 'inherit' });
    
    installProcess.on('close', (code) => {
        if (code === 0) {
            startDevelopmentServer();
        } else {
            console.error('❌ 依存関係のインストールに失敗しました');
            process.exit(1);
        }
    });
} else {
    startDevelopmentServer();
}

function startDevelopmentServer() {
    console.log('🌐 開発サーバーを起動しています...');
    
    // 開発サーバーを起動
    const devServer = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
    
    // サーバーが起動するまで待機
    setTimeout(() => {
        console.log('🌐 ブラウザでアプリケーションを開いています...');
        openBrowser('http://localhost:3000');
        console.log('✅ アプリケーションが起動しました！');
        console.log('🌐 ブラウザで http://localhost:3000 が開かれました');
        console.log('⏹️  停止するには Ctrl+C を押してください');
    }, 3000);
    
    // プロセス終了時の処理
    process.on('SIGINT', () => {
        console.log('\n🛑 アプリケーションを停止しています...');
        devServer.kill('SIGTERM');
        process.exit(0);
    });
    
    devServer.on('close', (code) => {
        console.log(`開発サーバーが終了しました (code: ${code})`);
        process.exit(code);
    });
}

function openBrowser(url) {
    const platform = process.platform;
    let command;
    
    switch (platform) {
        case 'darwin': // macOS
            command = `open ${url}`;
            break;
        case 'win32': // Windows
            command = `start ${url}`;
            break;
        default: // Linux and others
            command = `xdg-open ${url}`;
            break;
    }
    
    exec(command, (error) => {
        if (error) {
            console.warn('⚠️  ブラウザを自動で開けませんでした。手動で http://localhost:3000 を開いてください');
        }
    });
} 