const express = require('express');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const app = express();
const PORT = 80;

// 公開する静的ファイルのディレクトリ（このファイルと同じ場所）
app.use(express.static(path.join(__dirname)));

// -------------------------------------------------------------------
// 💡 ローカルIPアドレスを取得（LAN内アクセス用）
// -------------------------------------------------------------------
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (
                iface.family === 'IPv4' &&
                !iface.internal &&
                (
                    iface.address.startsWith('192.168.') ||
                    iface.address.startsWith('10.') ||
                    iface.address.startsWith('172.')
                )
            ) {
                return iface.address;
            }
        }
    }
    return '取得失敗: 適切なローカルIPが見つかりません';
}

// -------------------------------------------------------------------
// 💡 グローバルIPアドレスを取得（参考情報）
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
// サーバー起動（0.0.0.0 にバインドして外部アクセス可能に）
// -------------------------------------------------------------------
app.listen(PORT, '0.0.0.0', async () => {
    const localIp = getLocalIpAddress();
    const globalIp = await getGlobalIpAddressByCurl();

    console.log(`\n======================================================`);
    console.log(`✅ Webサーバーがポート ${PORT} で起動しました。`);
    console.log(`🖥️ PCからアクセス: http://localhost:${PORT}/index.html`);
    console.log(`📱 スマホなどからアクセス: http://${localIp}:${PORT}/index.html`);
    console.log(`🌍 グローバルIP（参考）: ${globalIp}`);
    console.log(`======================================================`);
});
