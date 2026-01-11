# 歯科SEOの達人

## プロジェクト概要

歯科医院向けのSEO・MEO・LLMO対策コンテンツを自動生成するWebアプリケーション。

### 主な機能
- 医院情報管理（URL、住所、電話番号、診療項目など）
- 診療項目別のコンテンツ優先設定
- SEO記事の自動生成（OpenAI GPT-4使用）
- まとめ記事作成（「〇〇市でインプラントがおすすめの歯科医院7選」など）
- メタ情報・FAQ自動生成

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フロントエンド | Next.js 14 + TypeScript + Tailwind CSS |
| バックエンド | Next.js API Routes |
| データベース | Prisma + SQLite |
| AI | OpenAI API (GPT-4) |
| プロセス管理 | PM2 |
| Webサーバー | Nginx |

## ディレクトリ構成

```
src/
├── app/           # Next.js App Router（ページ・API）
├── components/    # UIコンポーネント
├── lib/           # ユーティリティ（DB接続、OpenAI、プロンプト）
└── types/         # 型定義
prisma/
├── schema.prisma  # DBスキーマ
└── seed.ts        # 初期データ
```

## 本番環境

| 項目 | 値 |
|------|-----|
| URL | https://seo.tao-dx.com |
| サーバー | エックスサーバーVPS |
| IP | 210.131.223.161 |
| アプリパス | /var/www/dental-seo |
| OS | Ubuntu 25.04 |

## デプロイフロー（自動）

```
Claude Code で開発
    ↓
git push（featureブランチ）
    ↓
GitHub でPR作成 → マージ（mainへ）
    ↓
GitHub Actions が自動実行
    ↓
VPSに自動デプロイ完了
```

**コマンド操作不要** - GitHubでマージするだけで本番反映されます。

## 開発ルール

### ブランチ戦略
- `main`: 本番環境（直接プッシュ禁止）
- `claude/*`: 開発ブランチ

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント
refactor: リファクタリング
```

### 型チェック
- ビルド時の型エラーはスキップ設定済み（next.config.js）
- 開発時は型を意識するが、厳密さより動作優先

## 環境変数

```
OPENAI_API_KEY=sk-xxxxx
DATABASE_URL="file:./prisma/dev.db"
```

## よく使うコマンド（VPS側）

```bash
# ログ確認
pm2 logs dental-seo

# 再起動
pm2 restart dental-seo

# 手動デプロイ（通常は不要）
cd /var/www/dental-seo && git pull && npm install && npm run build && pm2 restart dental-seo
```

## 今後の開発予定

- [ ] ツール名を「歯科SEOの達人」に変更（UI反映）
- [ ] 競合分析機能
- [ ] キーワード提案機能
- [ ] SEOスコア表示
- [ ] 記事履歴のバージョン管理
- [ ] 口コミ・レビュー活用機能

## 注意事項

- DNS: tao-dx.comはエックスサーバーVPSのネームサーバーを使用
- バリュードメインのDNS設定は無効（エックスサーバーVPS側で設定）
- SSL証明書: Let's Encrypt（certbot自動更新）
