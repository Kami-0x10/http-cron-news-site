const express = require('express');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { execSync } = require('child_process');

const app = express();
const PORT = 80;

// 公開する静的ファイルのディレクトリ（このファイルと同じ場所）
app.use(express.static(path.join(__dirname)));


function getLocalIpFromIpconfig() {
    try {
        const output = execSync('ipconfig', { encoding: 'utf8' });
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.includes('IPv4 アドレス') || line.includes('IPv4 Address')) {
                const match = line.match(/(\d{1,3}\.){3}\d{1,3}/);
                if (match) {
                    return match[0];
                }
            }
        }
    } catch (err) {
        console.error('ipconfig 実行エラー:', err.message);
    }
    return '取得失敗: ipconfig からIPが見つかりません';
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
    const localIp = getLocalIpFromIpconfig();
    const globalIp = await getGlobalIpAddressByCurl();

    console.log(`\n======================================================`);
    console.log(`✅ Webサーバーがポート ${PORT} で起動しました。`);
    console.log(`🖥️ PCからアクセス: http://localhost:${PORT}/index.html`);
    console.log(`📱 スマホなどからアクセス: http://${localIp}:${PORT}/index.html`);
    console.log(`🌍 グローバルIP（参考）: ${globalIp}`);
    console.log(`======================================================`);
});
