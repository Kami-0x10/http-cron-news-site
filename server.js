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
    const candidates = [];

    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                candidates.push(iface.address);
            }
        }
    }

    // 優先的に 192.168.x.x → 10.x.x.x → 172.x.x.x を選ぶ
    const preferred = candidates.find(ip => ip.startsWith('192.168.'));
    if (preferred) return preferred;

    const fallback10 = candidates.find(ip => ip.startsWith('10.'));
    if (fallback10) return fallback10;

    const fallback172 = candidates.find(ip => ip.startsWith('172.'));
    if (fallback172) return fallback172;

    return candidates[0] || '取得失敗: ローカルIPが見つかりません';
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
