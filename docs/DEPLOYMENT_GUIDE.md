# エックスサーバーVPS デプロイガイド

**対象**: プログラミング初心者
**目標**: seo.tao-dx.com でツールを公開する

---

## 目次

1. [事前準備](#1-事前準備)
2. [エックスサーバーVPSの契約](#2-エックスサーバーvpsの契約)
3. [VPSの初期設定](#3-vpsの初期設定)
4. [ドメイン設定](#4-ドメイン設定)
5. [サーバーに接続する](#5-サーバーに接続する)
6. [必要なソフトウェアのインストール](#6-必要なソフトウェアのインストール)
7. [アプリケーションのデプロイ](#7-アプリケーションのデプロイ)
8. [Webサーバー（Nginx）の設定](#8-webサーバーnginxの設定)
9. [SSL証明書の設定（HTTPS化）](#9-ssl証明書の設定https化)
10. [自動起動の設定](#10-自動起動の設定)
11. [動作確認](#11-動作確認)
12. [トラブルシューティング](#12-トラブルシューティング)

---

## 1. 事前準備

### 必要なもの

| 項目 | 説明 |
|------|------|
| パソコン | Windows / Mac どちらでもOK |
| OpenAI APIキー | [OpenAI](https://platform.openai.com/)で取得 |
| クレジットカード | VPS料金の支払い用 |
| tao-dx.com のドメイン管理権限 | DNSレコードを編集できること |

### OpenAI APIキーの取得方法

1. https://platform.openai.com/ にアクセス
2. アカウントを作成（またはログイン）
3. 右上のアイコン → 「API keys」をクリック
4. 「Create new secret key」をクリック
5. 表示されたキー（`sk-`で始まる文字列）をメモ帳にコピーして保存
   - **注意**: このキーは一度しか表示されません！

---

## 2. エックスサーバーVPSの契約

### 手順

1. https://vps.xserver.ne.jp/ にアクセス

2. **「お申し込み」** ボタンをクリック

3. **プランを選択**
   - おすすめ: **2GBプラン**（月額830円〜）
   - 小規模利用なら1GBでも可

4. **OSを選択**
   - **Ubuntu 22.04** を選択（一番使いやすい）

5. **申し込み情報を入力**
   - 名前、住所、メールアドレス等

6. **支払い方法を選択**
   - クレジットカード推奨

7. **申し込み完了**
   - 数分〜数時間でサーバーが準備されます
   - メールで「サーバー設定完了」の通知が届きます

### 届くメールの内容（重要！保存してください）

```
【Xserver VPS】サーバー設定完了のお知らせ

IPアドレス: xxx.xxx.xxx.xxx
rootパスワード: xxxxxxxxxx
```

---

## 3. VPSの初期設定

### 3-1. VPSパネルにログイン

1. https://vps.xserver.ne.jp/ にアクセス
2. 契約時のメールアドレス・パスワードでログイン
3. 対象のVPSをクリック

### 3-2. パケットフィルター（ファイアウォール）設定

1. 左メニューの **「パケットフィルター設定」** をクリック
2. **「ONにする」** を選択
3. 以下のポートを **許可** に設定:

| プロトコル | ポート | 用途 |
|-----------|--------|------|
| SSH | 22 | サーバー接続用 |
| HTTP | 80 | Webサイト表示 |
| HTTPS | 443 | SSL通信 |

4. **「変更する」** をクリック

---

## 4. ドメイン設定

### 4-1. DNSレコードの追加

tao-dx.com のドメインを管理しているサービス（お名前.com、ムームードメイン等）で設定します。

1. ドメイン管理画面にログイン
2. **DNS設定** または **DNSレコード編集** を開く
3. 以下のレコードを追加:

| ホスト名 | タイプ | 値 |
|----------|--------|-----|
| seo | A | （VPSのIPアドレス） |

**例**: VPSのIPが `123.45.67.89` の場合
- ホスト名: `seo`
- タイプ: `A`
- 値: `123.45.67.89`

4. **保存** をクリック

**注意**: DNS設定が反映されるまで最大24時間かかることがあります（通常は数分〜1時間）

### 4-2. 設定確認

コマンドプロンプト（Windows）またはターミナル（Mac）で確認:

```bash
ping seo.tao-dx.com
```

VPSのIPアドレスが表示されればOK！

---

## 5. サーバーに接続する

### Windows の場合

1. **PowerShell** を開く
   - スタートメニューで「PowerShell」と検索
   - 右クリック → 「管理者として実行」

2. SSHで接続:
```powershell
ssh root@（VPSのIPアドレス）
```

例:
```powershell
ssh root@123.45.67.89
```

3. 「Are you sure...?」と聞かれたら `yes` と入力してEnter

4. パスワードを入力（メールに記載のrootパスワード）
   - **注意**: 入力しても画面には表示されません。そのまま入力してEnter

### Mac の場合

1. **ターミナル** を開く
   - Finder → アプリケーション → ユーティリティ → ターミナル

2. 以下を入力:
```bash
ssh root@（VPSのIPアドレス）
```

3. 以降はWindowsと同じ

### 接続成功の目印

```
root@vpsxxxxxx:~#
```
このような表示になればサーバーに接続できています！

---

## 6. 必要なソフトウェアのインストール

**以下のコマンドを1行ずつコピー＆ペーストして実行してください**

### 6-1. システムを最新にする

```bash
apt update && apt upgrade -y
```
（数分かかります。途中で質問が出たらEnterを押してください）

### 6-2. Node.js をインストール

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
```

```bash
apt install -y nodejs
```

確認:
```bash
node -v
```
`v20.x.x` と表示されればOK！

### 6-3. Git をインストール

```bash
apt install -y git
```

### 6-4. PM2 をインストール（アプリを常時起動させるツール）

```bash
npm install -g pm2
```

### 6-5. Nginx をインストール（Webサーバー）

```bash
apt install -y nginx
```

### 6-6. Certbot をインストール（SSL証明書用）

```bash
apt install -y certbot python3-certbot-nginx
```

---

## 7. アプリケーションのデプロイ

### 7-1. アプリ用のディレクトリを作成

```bash
mkdir -p /var/www
cd /var/www
```

### 7-2. GitHubからコードを取得

```bash
git clone https://github.com/KotaroTao/writer.git dental-seo
```

```bash
cd dental-seo
```

### 7-3. 依存パッケージをインストール

```bash
npm install
```
（数分かかります）

### 7-4. 環境変数を設定

```bash
nano .env
```

以下の内容を入力（コピー＆ペースト）:

```
OPENAI_API_KEY=sk-ここにあなたのAPIキーを貼り付け
DATABASE_URL="file:./prisma/dev.db"
```

**保存方法**:
1. `Ctrl + O` を押す（Macは `Control + O`）
2. `Enter` を押す
3. `Ctrl + X` を押して終了

### 7-5. データベースを初期化

```bash
npx prisma migrate deploy
```

```bash
npx prisma db seed
```

### 7-6. アプリをビルド

```bash
npm run build
```
（2〜5分かかります）

### 7-7. 動作テスト

```bash
npm start
```

エラーなく起動したら `Ctrl + C` で停止

---

## 8. Webサーバー（Nginx）の設定

### 8-1. Nginx設定ファイルを作成

```bash
nano /etc/nginx/sites-available/dental-seo
```

以下の内容を **すべてコピー** して貼り付け:

```nginx
server {
    listen 80;
    server_name seo.tao-dx.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

保存: `Ctrl + O` → `Enter` → `Ctrl + X`

### 8-2. 設定を有効化

```bash
ln -s /etc/nginx/sites-available/dental-seo /etc/nginx/sites-enabled/
```

### 8-3. デフォルト設定を削除

```bash
rm /etc/nginx/sites-enabled/default
```

### 8-4. 設定をテスト

```bash
nginx -t
```

`syntax is ok` と `test is successful` が表示されればOK！

### 8-5. Nginxを再起動

```bash
systemctl restart nginx
```

---

## 9. SSL証明書の設定（HTTPS化）

### 9-1. 証明書を取得

```bash
certbot --nginx -d seo.tao-dx.com
```

質問に答えます:
1. **メールアドレス**: あなたのメールアドレスを入力 → Enter
2. **利用規約に同意**: `Y` → Enter
3. **メール配信**: `N` → Enter（不要な場合）

成功すると「Congratulations!」と表示されます。

### 9-2. 自動更新の確認

```bash
certbot renew --dry-run
```

エラーがなければ、証明書は自動更新されます。

---

## 10. 自動起動の設定

### 10-1. PM2でアプリを起動

```bash
cd /var/www/dental-seo
pm2 start npm --name "dental-seo" -- start
```

### 10-2. 起動確認

```bash
pm2 status
```

`online` と表示されればOK！

### 10-3. サーバー再起動時も自動起動するよう設定

```bash
pm2 startup
```

表示されたコマンドをコピーして実行（sudoで始まるコマンド）

```bash
pm2 save
```

---

## 11. 動作確認

### ブラウザで確認

https://seo.tao-dx.com にアクセス

ダッシュボード画面が表示されれば成功です！

### 確認項目チェックリスト

- [ ] ページが表示される
- [ ] HTTPSで接続できている（鍵マークが表示）
- [ ] 医院登録ができる
- [ ] 記事生成ができる

---

## 12. トラブルシューティング

### サイトが表示されない

1. **Nginxの状態確認**
```bash
systemctl status nginx
```

2. **アプリの状態確認**
```bash
pm2 status
```

3. **ログを確認**
```bash
pm2 logs dental-seo
```

### 「502 Bad Gateway」エラー

アプリが起動していない可能性:
```bash
cd /var/www/dental-seo
pm2 restart dental-seo
```

### 「SSL証明書エラー」

```bash
certbot --nginx -d seo.tao-dx.com --force-renewal
```

### データベースエラー

```bash
cd /var/www/dental-seo
npx prisma migrate deploy
npx prisma db seed
pm2 restart dental-seo
```

### APIキーエラー（記事生成ができない）

1. `.env` ファイルを確認:
```bash
cat /var/www/dental-seo/.env
```

2. APIキーが正しいか確認
3. 修正後は再起動:
```bash
pm2 restart dental-seo
```

---

## よく使うコマンド一覧

| 操作 | コマンド |
|------|----------|
| アプリ再起動 | `pm2 restart dental-seo` |
| アプリ停止 | `pm2 stop dental-seo` |
| アプリ起動 | `pm2 start dental-seo` |
| ログ確認 | `pm2 logs dental-seo` |
| Nginx再起動 | `systemctl restart nginx` |
| サーバー再起動 | `reboot` |

---

## アップデート方法

新しいバージョンがリリースされた場合:

```bash
cd /var/www/dental-seo
git pull origin main
npm install
npm run build
pm2 restart dental-seo
```

---

## 料金の目安

| 項目 | 月額 |
|------|------|
| エックスサーバーVPS 2GB | 約830円〜 |
| ドメイン（年間） | 約1,500円/年 |
| OpenAI API | 使用量による |

**OpenAI API料金目安**:
- GPT-4: 約3円/1000文字の入出力
- 月に100記事生成で約300〜1000円程度

---

## サポート

問題が解決しない場合:
1. エックスサーバーのサポートに問い合わせ
2. GitHubのIssuesに投稿

---

**おめでとうございます！** これでデプロイ完了です！
