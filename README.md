# コンテンツSEO自動生成 for Dental

歯科医院向けのSEO・MEO・LLMO対策コンテンツを自動生成するツールです。

## 概要

歯科医院のホームページURLと対策キーワードを入力することで、その医院の特徴を活かした独自性の高い記事を自動生成します。

## 主要機能

### 1. 医院情報管理
事前に以下の情報を登録・管理できます：
- 医院URL
- 医院名
- 住所
- 電話番号
- 対策診療項目（矯正、インプラント、審美歯科等）
- 対策地域名（任意）
- 文字数設定（150文字〜10,000文字）

### 2. 診療項目別コンテンツ設定
各診療項目に対して、優先的に盛り込む内容を個別設定可能：
- 矯正歯科：治療期間、費用、症例数、使用装置など
- インプラント：成功率、保証制度、使用メーカーなど
- 審美歯科：ホワイトニング、セラミック、症例写真など
- その他：自由に診療項目を追加可能

### 3. SEO記事生成
- 対策キーワードに基づいた記事自動生成
- 医院の特徴・強みを反映
- E-E-A-T（経験・専門性・権威性・信頼性）を意識した構成
- 文字数指定に対応

### 4. まとめ記事作成機能
「〇〇市でインプラントがおすすめの歯科医院7選」のような比較・まとめ記事を作成：
- 登録済みの複数医院から自動選定
- 各医院の特徴を比較表形式で表示
- 地域性を活かしたローカルSEO対策

## 追加推奨機能

### 5. メタ情報自動生成
- titleタグ（60文字以内）
- meta description（120文字以内）
- OGP情報（SNS共有用）
- 構造化データ（JSON-LD）

### 6. FAQ自動生成
- よくある質問と回答を自動生成
- 構造化データ対応（リッチスニペット表示）
- 音声検索最適化

### 7. 競合分析機能
- 同地域の競合医院のキーワード分析
- 上位表示サイトの構成分析
- 差別化ポイントの提案

### 8. キーワード提案機能
- 関連キーワードの自動提案
- 検索ボリューム表示
- 競合度の表示

### 9. 記事履歴管理
- 生成した記事の保存・編集
- バージョン管理
- 公開ステータス管理

### 10. SEOスコア表示
- 生成記事のSEO最適化度チェック
- 改善提案の表示
- 読みやすさスコア

### 11. 一括記事生成
- 複数キーワードでの一括生成
- 記事シリーズの自動作成
- 内部リンク構造の自動提案

### 12. 画像関連機能
- alt文の自動生成
- アイキャッチ画像の推奨サイズ提案
- 画像SEO最適化チェック

### 13. 記事更新リマインダー
- 古い記事の更新通知
- 季節・イベントに合わせた更新提案
- 検索順位変動時のアラート

### 14. 口コミ・レビュー活用機能
- Google口コミの要約生成
- 口コミを活かした記事作成
- 評判管理ダッシュボード

## 技術スタック

- **フロントエンド**: Next.js 14 + TypeScript + Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Prisma + SQLite
- **AI**: OpenAI API (GPT-4)
- **認証**: NextAuth.js（オプション）

## ディレクトリ構成

```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # トップページ
│   │   ├── layout.tsx         # レイアウト
│   │   ├── clinics/           # 医院管理
│   │   ├── articles/          # 記事管理
│   │   ├── generate/          # 記事生成
│   │   ├── summary/           # まとめ記事
│   │   └── settings/          # 設定
│   ├── components/            # UIコンポーネント
│   │   ├── ui/               # 基本UIパーツ
│   │   ├── forms/            # フォーム部品
│   │   └── layout/           # レイアウト部品
│   ├── lib/                   # ユーティリティ
│   │   ├── db.ts             # データベース接続
│   │   ├── openai.ts         # OpenAI API
│   │   └── prompts/          # プロンプトテンプレート
│   └── types/                 # 型定義
├── prisma/
│   └── schema.prisma          # DBスキーマ
├── public/                    # 静的ファイル
└── package.json
```

## データベース設計

### clinics（医院情報）
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| name | String | 医院名 |
| url | String | ホームページURL |
| address | String | 住所 |
| phone | String | 電話番号 |
| targetArea | String? | 対策地域名 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### treatmentCategories（診療項目）
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| name | String | 項目名 |
| description | String? | 説明 |
| defaultPriorities | JSON | デフォルト優先設定 |
| createdAt | DateTime | 作成日時 |

### clinicTreatments（医院別診療設定）
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| clinicId | UUID | 医院ID |
| categoryId | UUID | 診療項目ID |
| priorities | JSON | 優先内容設定 |
| enabled | Boolean | 有効/無効 |

### articles（生成記事）
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| clinicId | UUID | 医院ID |
| title | String | タイトル |
| content | Text | 本文 |
| metaTitle | String? | SEOタイトル |
| metaDescription | String? | メタ説明 |
| keywords | JSON | キーワード |
| wordCount | Int | 文字数 |
| articleType | String | 記事タイプ |
| status | String | ステータス |
| createdAt | DateTime | 作成日時 |

### summaryArticles（まとめ記事）
| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| title | String | タイトル |
| content | Text | 本文 |
| area | String | 対象地域 |
| category | String | 診療項目 |
| clinicIds | JSON | 対象医院ID |
| createdAt | DateTime | 作成日時 |

## セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envにOPENAI_API_KEYを設定

# データベースの初期化
npx prisma migrate dev

# 開発サーバー起動
npm run dev
```

## 環境変数

```
OPENAI_API_KEY=your-api-key
DATABASE_URL="file:./dev.db"
```

## ライセンス

MIT License
