const express = require('express');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const app = express();
const PORT = 80;

// 公開する静的ファイルのディレクトリ（このファイルと同じ場所）
app.use(express.static(path.join(__dirname)));
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
    const localIp = '192.168.0.24'; 
    const globalIp = await getGlobalIpAddressByCurl();

    console.log(`\n======================================================`);
    console.log(`✅ Webサーバーがポート ${PORT} で起動しました。`);
    console.log(`🖥️ PCからアクセス: http://localhost:${PORT}/index.html`);
    console.log(`📱 スマホなどからアクセス: http://${localIp}:${PORT}/index.html`);
    console.log(`🌍 グローバルIP（参考）: ${globalIp}`);
    console.log(`======================================================`);
});
