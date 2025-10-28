const express = require('express');
const path = require('path');
const os = require('os'); // ★ ローカルIP取得用
const { exec } = require('child_process'); 

const app = express();
const PORT = 80;

// Webサーバーとして公開するディレクトリ
app.use(express.static(path.join(__dirname)));

// -------------------------------------------------------------------
// 💡 ローカルIPアドレスを取得する関数
// -------------------------------------------------------------------
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '取得失敗';
}


// -------------------------------------------------------------------
// 💡 グローバルIPアドレスを取得する関数（任意）
// -------------------------------------------------------------------
function getGlobalIpAddressByCurl() {
    return new Promise((resolve) => {
        exec('curl -s https://api.ipify.org', (error, stdout, stderr) => {
            if (error || stderr) {
                resolve('取得失敗: curl実行中にエラーが発生しました');
                return;
            }
            resolve(stdout.trim());
        });
    });
}

// -------------------------------------------------------------------
// サーバーを起動（0.0.0.0 にバインド）
// -------------------------------------------------------------------
app.listen(PORT, '0.0.0.0', async () => {
    const localIp = getLocalIpAddress();
    const globalIp = await getGlobalIpAddressByCurl();

    console.log(`\n======================================================`);
    console.log(`✅ Webサーバーがポート ${PORT} で起動しました。`);
    console.log(`ローカルアクセス: http://localhost:${PORT}/index.html`);
    console.log(`📱 スマホなどからアクセス: http://${localIp}:${PORT}/index.html`);
    console.log(`🌍 グローバルIP（参考）: ${globalIp}`);
    console.log(`======================================================`);
});
