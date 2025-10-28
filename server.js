const express = require('express');
const path = require('path');
// ★ 新しくosモジュールを追加 ★
const os = require('os'); 
const app = express();
const PORT = 80;

// Webサーバーとして公開するディレクトリ
app.use(express.static(path.join(__dirname))); 

// サーバーのローカルIPアドレスを取得する関数
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            // IPv4で、内部ループバックではないアドレスを選択
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}
// -----------------------------

// サーバーを起動
app.listen(PORT, () => {
    const localIp = getLocalIp(); // ローカルIPを取得
    console.log(`✅ Webサーバーがポート ${PORT} で起動しました。`);
    console.log(`アクセスURL: http://localhost:${PORT}/index.html`);
    // ★ ログ表示を修正 ★
    console.log(`ローカルIP: ${localIp}`);
    console.log('💡 外部からのアクセスには「このサーバーのグローバルIP」が必要です。');
});
