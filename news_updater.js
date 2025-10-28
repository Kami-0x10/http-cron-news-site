const fs = require('fs/promises'); // ファイル操作（非同期）
const path = require('path');
const axios = require('axios'); // HTTPリクエスト
const { parseString } = require('xml2js'); // XML解析
const cron = require('node-cron'); // スケジュール実行

// RSSフィードのURL
const RSS_FEEDS = {
    top: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml',
    domestic: 'https://news.yahoo.co.jp/rss/topics/domestic.xml',
    world: 'https://news.yahoo.co.jp/rss/topics/world.xml',
    business: 'https://news.yahoo.co.jp/rss/topics/business.xml',
    entertainment: 'https://news.yahoo.co.jp/rss/topics/entertainment.xml',
    sports: 'https://news.yahoo.co.jp/rss/topics/sports.xml'
};

// ファイルパス設定
const TEMPLATE_FILE = path.join(__dirname, 'index_template.html');
// Webサーバーが公開する最終的なHTMLファイル名
const OUTPUT_FILE = path.join(__dirname, 'index.html'); 

// ----------------------------------------------------
// IPアドレス取得関数はエラー回避のため削除されました。
// ----------------------------------------------------

/**
 * RSSフィードを取得・解析し、記事データを整形
 * @param {string} url RSSフィードのURL
 * @returns {Promise<Array<{title: string, link: string, description: string, pubDate: string}>>} 記事データ配列
 */
async function fetchAndParseRss(url) {
    console.log(`  -> RSS取得開始: ${url}`);
    try {
        const response = await axios.get(url, { responseType: 'text' });
        const xmlText = response.data;

        let articles = [];

        // XMLをJavaScriptオブジェクトに変換
        await new Promise((resolve, reject) => {
            parseString(xmlText, { explicitArray: false, ignoreAttrs: true, trim: true }, (err, result) => {
                if (err) return reject(new Error(`XML解析エラー: ${err.message}`));

                // RSSの構造に従い記事部分を取り出す
                const items = result?.rss?.channel?.item || [];
                // 配列でない場合を考慮
                const articleItems = Array.isArray(items) ? items : [items];

                articleItems.forEach(item => {
                    if (item.title && item.link) {
                        // descriptionからHTMLタグを除去し、長さを制限
                        const descriptionContent = item.description || '詳細情報はありません';
                        const description = descriptionContent.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
                        
                        articles.push({
                            title: item.title,
                            link: item.link,
                            description: description,
                            pubDate: item.pubDate || new Date().toUTCString()
                        });
                    }
                });
                resolve();
            });
        });

        console.log(`  -> 記事 ${articles.length} 件取得完了。`);
        return articles.slice(0, 10); // 最新10件に制限
    } catch (error) {
        console.error(`RSS取得・解析失敗 (${url}): ${error.message}`);
        return []; // 失敗時は空の配列を返す
    }
}

/**
 * 記事データからHTML文字列を作成
 * @param {Array<{title: string, link: string, description: string, pubDate: string}>} articles 
 * @returns {string} 記事のHTML文字列
 */
function createArticlesHtml(articles) {
    if (articles.length === 0) {
        return '<p class="error">ニュース記事が見つかりませんでした。</p>';
    }

    return articles.map(article => {
        // pubDateを整形
        const date = new Date(article.pubDate).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <article class="article">
                <h3><a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a></h3>
                <p>${article.description}</p>
                <div class="date">${date}</div>
            </article>
        `;
    }).join('\n');
}

/**
 * ニュースサイトのHTMLを更新
 */
async function updateNewsSite() {
    console.log(`\n--- ニュースサイト更新処理開始: ${new Date().toLocaleString('ja-JP')} ---`);
    try {
        // 1. HTMLテンプレートの読み込み
        let htmlContent = await fs.readFile(TEMPLATE_FILE, 'utf8');
        console.log('1. テンプレートファイル読み込み完了。');

        // 2. 記事データの取得
        // トップニュース
        const topArticles = await fetchAndParseRss(RSS_FEEDS.top);
        // カテゴリ別ニュース (国内を静的に埋め込む)
        const categoryArticles = await fetchAndParseRss(RSS_FEEDS.domestic);

        const topArticlesHtml = createArticlesHtml(topArticles);
        const categoryArticlesHtml = createArticlesHtml(categoryArticles);
        console.log('2. 記事データ取得・HTML生成完了。');

        // 3. HTMLの書き換え（マーカー置換）
        // トップ記事の埋め込み
        htmlContent = htmlContent.replace('', topArticlesHtml);
        
        // カテゴリ記事の埋め込み
        htmlContent = htmlContent.replace('', categoryArticlesHtml);

        // 最終更新時刻の埋め込み処理は削除されました。
        
        console.log('3. HTMLコンテンツ書き換え完了。');

        // 4. 新しいHTMLファイルの保存
        await fs.writeFile(OUTPUT_FILE, htmlContent);
        console.log(`4. 新しいニュースサイト ${path.basename(OUTPUT_FILE)} の保存完了。`);
        
    } catch (error) {
        console.error('致命的なエラーにより更新処理失敗:', error.message);
    }
    console.log('--- ニュースサイト更新処理終了 ---');
}

// -------------------------------------------------------------------
// スケジュール設定と初回実行
// -------------------------------------------------------------------

console.log('バックエンド更新プログラム起動。スケジュール設定中...');

// 午前 9:00 に実行
cron.schedule('0 0 9 * * *', () => {
    console.log('スケジュール実行: 午前 9:00');
    updateNewsSite();
}, {
    scheduled: true,
    timezone: "Asia/Tokyo" // 日本時間で実行
});

// 午後 18:00 に実行
cron.schedule('0 0 18 * * *', () => {
    console.log('スケジュール実行: 午後 18:00');
    updateNewsSite();
}, {
    scheduled: true,
    timezone: "Asia/Tokyo" // 日本時間で実行
});

// プログラム起動時に初回実行
updateNewsSite(); 

console.log('スケジューラはバックグラウンドで実行中です。');
