const express = require('express');
const path = require('path');
// ★ child_process モジュールを追加 ★
const { exec } = require('child_process'); 
const app = express();
const PORT = 80;

// Webサーバーとして公開するディレクトリ
app.use(express.static(path.join(__dirname))); 

// -------------------------------------------------------------------
// 💡 グローバルIPアドレスを取得する関数
//    curlコマンドを直接実行します。
// -------------------------------------------------------------------
function getGlobalIpAddressByCurl() {
    return new Promise((resolve) => {
        // -s オプションでプログレスバーなどの出力を抑制
        exec('curl -s https://api.ipify.org', (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`curl実行エラー: ${error ? error.message : stderr}`);
                resolve('取得失敗: curl実行中にエラーが発生しました');
                return;
            }
            // 成功した場合、stdout (標準出力) がIPアドレス
            resolve(stdout.trim());
        });
    });
}
// -------------------------------------------------------------------

// サーバーを起動
app.listen(PORT, async () => {
    // サーバー起動時にcurlを実行してグローバルIPを取得
    const globalIp = await getGlobalIpAddressByCurl(); 

    console.log(`\n======================================================`);
    console.log(`✅ Webサーバーがポート ${PORT} で起動しました。`);
    console.log(`ローカルアクセス: http://localhost:${PORT}/index.html`);
    console.log(`\n💡 外部 (スマートフォン) からアクセスすべきIPアドレス:`);
    console.log(`   --> ${globalIp}`);
    console.log(`======================================================`);

    if (globalIp.includes('取得失敗')) {
        console.warn('⚠️ IPアドレスの自動取得に失敗しました。このIPを手動で確認し、スマホでアクセスしてください。');
        console.warn('⚠️ このエラーが出た場合、システムにcurlコマンドがインストールされていないか、または外部へのネットワーク接続が以前のようにブロックされている可能性があります。');
    }
});
