# プロジェクトフォルダを作成し、移動
mkdir news-updater
cd news-updater

sudo apt install -y nodejs
sudo apt install -y curl
curl -L https://www.npmjs.com/install.sh | sudo bash

# package.jsonを作成
sudo npm init -y

# 必要なパッケージをインストール
# axios: HTTPリクエストを行うため
# xml2js: XML（RSS）をJavaScriptオブジェクトに変換するため
# node-cron: スケジュール実行のため
sudo npm install axios xml2js node-cron express
sudo npm i -g pm2

sudo pm2 news_updater.js
