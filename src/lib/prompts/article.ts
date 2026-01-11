import type { Clinic, TreatmentCategory } from '@/types'

export type OutputFormat = 'text' | 'html'

export function buildArticlePrompt(
  clinic: Clinic,
  category: TreatmentCategory,
  keyword: string,
  wordCount: number,
  priorities: string[],
  outputFormat: OutputFormat = 'text'
): string {
  const priorityList = priorities.length > 0
    ? priorities.join('、')
    : category.defaultPriorities.join('、')

  const formatInstructions = outputFormat === 'html'
    ? `
【出力形式: HTML】
- WordPressやWebサイトに貼り付けて使えるHTMLで出力
- <h2>、<h3>タグで見出しを構成
- <p>タグで段落を作成
- <ul><li>でリスト表示
- <strong>で重要キーワードを強調
- <div class="highlight">で特に伝えたいポイントを囲む
- <table>タグで料金表や比較表を作成（該当する場合）
- デザインしやすいセマンティックなHTML構造
- インラインスタイルは使用しない（CSSで調整可能にする）
`
    : `
【出力形式: テキスト】
- プレーンテキストで出力
- 見出しは「■」「◆」「●」などの記号で表現
- 箇条書きは「・」で表現
- 強調したい部分は【】で囲む
- 区切り線は「━━━━━━━━━━━━」で表現
- HTMLタグは一切使用しない
- メールやSNS投稿にそのままコピペできる形式
`

  return `
以下の歯科医院について、SEO・MEO・LLMO対策を意識した記事を作成してください。

【医院情報】
- 医院名: ${clinic.name}
- 住所: ${clinic.address}
- 電話番号: ${clinic.phone}
- ホームページ: ${clinic.url}
${clinic.targetArea ? `- 対策地域: ${clinic.targetArea}` : ''}
${clinic.description ? `- 特徴: ${clinic.description}` : ''}

【記事の条件】
- 対策キーワード: ${keyword}
- 診療項目: ${category.name}
- 目標文字数: 約${wordCount}文字
- 優先的に盛り込む内容: ${priorityList}

【記事の構成】
1. 導入部（キーワードと地域名を含む）
2. ${category.name}について（概要）
3. ${clinic.name}の${category.name}の特徴・強み
4. 治療の流れ・料金目安
5. 患者様へのメッセージ
6. アクセス・予約情報
${formatInstructions}
【注意点】
- 読みやすい段落構成
- 地域住民に寄り添った内容
- 医院の専門性・信頼性をアピール
- 患者様の不安を解消する内容
`
}

export function buildSummaryArticlePrompt(
  area: string,
  category: string,
  clinics: Clinic[],
  count: number = 7,
  outputFormat: OutputFormat = 'text'
): string {
  const clinicList = clinics
    .slice(0, count)
    .map((c, i) => `${i + 1}. ${c.name}（${c.address}）${c.description ? `: ${c.description}` : ''}`)
    .join('\n')

  const formatInstructions = outputFormat === 'html'
    ? `
【出力形式: HTML】
- WordPressやWebサイトに貼り付けて使えるHTMLで出力
- <h2>、<h3>タグで見出しを構成
- <p>タグで段落を作成
- <ul><li>でリスト表示
- <table>タグで比較表を作成
- <strong>で重要キーワードを強調
`
    : `
【出力形式: テキスト】
- プレーンテキストで出力
- 見出しは「■」「◆」「●」などの記号で表現
- 箇条書きは「・」で表現
- HTMLタグは一切使用しない
`

  return `
「${area}で${category}がおすすめの歯科医院${count}選」というまとめ記事を作成してください。

【対象医院】
${clinicList}

【記事の構成】
1. 導入文（${area}で${category}を探している方へ）
2. ${category}の歯科医院を選ぶポイント
3. 各医院の詳細紹介
   - 医院名
   - 特徴・おすすめポイント
   - 住所
   - 電話番号（該当する場合）
4. 比較表（料金目安、特徴など）
5. まとめ
${formatInstructions}
【注意点】
- 各医院を公平に紹介
- 医院ごとの特徴を明確に
- 読者が比較検討しやすい構成
- 地域名を適切に含める
- SEOを意識した見出し構成
`
}

export function buildFaqPrompt(
  clinic: Clinic,
  category: string,
  keyword: string
): string {
  return `
以下の歯科医院について、よくある質問（FAQ）を5つ作成してください。

【医院情報】
- 医院名: ${clinic.name}
- 診療項目: ${category}
- キーワード: ${keyword}

【FAQの条件】
- 患者さんが実際に検索しそうな質問
- 具体的で専門的な回答
- 医院の特徴も織り交ぜる
- 構造化データ（JSON-LD）に対応可能な形式

JSON形式で出力してください:
[
  {"question": "質問1", "answer": "回答1"},
  {"question": "質問2", "answer": "回答2"},
  ...
]
`
}
