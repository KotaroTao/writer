import type { Clinic, TreatmentCategory } from '@/types'

export type OutputFormat = 'text' | 'html'

// 日本語文字数に基づいて各セクションのガイドラインを生成
function getSectionGuidelines(wordCount: number): string {
  // 文字数に応じたセクション別の目安を計算
  const sectionRatio = {
    intro: 0.1,        // 導入部: 10%
    overview: 0.2,     // 概要: 20%
    features: 0.25,    // 特徴・強み: 25%
    flow: 0.2,         // 治療の流れ: 20%
    message: 0.15,     // メッセージ: 15%
    access: 0.1,       // アクセス: 10%
  }

  const introWords = Math.ceil(wordCount * sectionRatio.intro)
  const overviewWords = Math.ceil(wordCount * sectionRatio.overview)
  const featuresWords = Math.ceil(wordCount * sectionRatio.features)
  const flowWords = Math.ceil(wordCount * sectionRatio.flow)
  const messageWords = Math.ceil(wordCount * sectionRatio.message)
  const accessWords = Math.ceil(wordCount * sectionRatio.access)

  return `
【各セクションの目安文字数】
1. 導入部: 約${introWords}文字
2. 概要: 約${overviewWords}文字
3. 特徴・強み: 約${featuresWords}文字（最も詳しく）
4. 治療の流れ・料金: 約${flowWords}文字
5. メッセージ: 約${messageWords}文字
6. アクセス情報: 約${accessWords}文字
合計: ${wordCount}文字以上`
}

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

  // 日本語はトークン効率が悪いため、目標を1.8倍に設定
  const targetWordCount = Math.ceil(wordCount * 1.8)
  const sectionGuidelines = getSectionGuidelines(wordCount)

  const formatInstructions = outputFormat === 'html'
    ? `
【出力形式: HTML】
- WordPressやWebサイトに貼り付けて使えるHTMLで出力
- <h2>、<h3>タグで見出しを構成（自然な見出し文を使用）
- <p>タグで段落を作成
- <ul><li>でリスト表示
- <strong>で重要キーワードを強調
- <table>タグで料金表や比較表を作成（該当する場合）
- インラインスタイルは使用しない
`
    : `
【出力形式: テキスト】
- プレーンテキストで出力
- 見出しは「■」で表現（例：■${category.name}とは）
- 小見出しは「◆」で表現
- 箇条書きは「・」で表現
- HTMLタグは一切使用しない
- 区切り線は使用しない
- そのままブログやSNSにコピペできる自然な文章
`

  return `
あなたはプロの医療系Webライターです。
以下の歯科医院について、人が書いたような自然で読みやすいSEO記事を作成してください。

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
- 優先的に盛り込む内容: ${priorityList}

【文字数について】
目標文字数: ${targetWordCount}文字以上
最低文字数: ${wordCount}文字（これを下回らないこと）

${sectionGuidelines}

【記事の構成と見出し例】
以下の構成で記事を作成してください。見出しは自然な文章にしてください。

1. 導入文（見出しなし）
   - 地域名とキーワードを自然に含める
   - 読者の悩みや関心に寄り添う文章で始める

2. ${category.name}とは
   - 治療内容の分かりやすい説明
   - どんな人におすすめかを具体的に

3. ${clinic.name}の${category.name}の特徴
   - 3〜5つの強みを詳しく紹介
   - 具体的なエピソードや設備の説明

4. 治療の流れと費用について
   - ステップごとの説明
   - 料金の目安（分かる範囲で）

5. 患者様へのメッセージ
   - 不安を解消する温かいメッセージ

6. アクセス・診療時間
   - 住所、電話番号、最寄り駅など
${formatInstructions}

【重要な執筆ルール】
1. 「導入部」「概要」「メッセージ」などの内部ラベルを見出しに使わない
   × ■導入部  → ○ （見出しなしで自然に始める）
   × ■概要    → ○ ■${category.name}とは
   × ■特徴    → ○ ■${clinic.name}が選ばれる理由

2. 自然な日本語で書く
   × 「あなたが〜したいとき」という語りかけを多用しない
   ○ 読者目線で、第三者的に説明する

3. 具体的で信頼感のある文章
   - 専門用語は分かりやすく説明
   - 根拠のある情報を盛り込む
   - 患者さんが安心できる内容

4. SEOを意識した構成
   - キーワードを自然に散りばめる
   - 見出しにもキーワードを含める
   - 地域名を適切に使用

【文字数を満たすテクニック】
- 各段落は3〜5文で構成
- 「例えば」「具体的には」で詳細を追加
- 治療のメリット・デメリットを詳しく説明
- よくある質問への回答を盛り込む

【最終確認】
- 記事が${wordCount}文字以上あるか確認
- 見出しが自然な日本語になっているか確認
- 内部ラベル（導入部、概要等）が出力されていないか確認
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

// 院長サンプル記事の型
interface DirectorSample {
  title: string
  content: string
}

// 院長モード用プロンプト
export function buildDirectorModePrompt(
  clinic: Clinic,
  category: TreatmentCategory,
  keyword: string,
  wordCount: number,
  priorities: string[],
  samples: DirectorSample[],
  outputFormat: OutputFormat = 'text'
): string {
  const priorityList = priorities.length > 0
    ? priorities.join('、')
    : category.defaultPriorities.join('、')

  // 日本語はトークン効率が悪いため、目標を1.8倍に設定
  const targetWordCount = Math.ceil(wordCount * 1.8)
  const sectionGuidelines = getSectionGuidelines(wordCount)

  // サンプル記事を学習用に整形
  const sampleTexts = samples.map((s, i) => `
【サンプル${i + 1}: ${s.title}】
${s.content.substring(0, 2000)}${s.content.length > 2000 ? '...(以下省略)' : ''}
`).join('\n')

  const formatInstructions = outputFormat === 'html'
    ? `
【出力形式: HTML】
- WordPressやWebサイトに貼り付けて使えるHTMLで出力
- <h2>、<h3>タグで見出しを構成
- <p>タグで段落を作成
- <ul><li>でリスト表示
- <strong>で重要キーワードを強調
- インラインスタイルは使用しない
`
    : `
【出力形式: テキスト】
- プレーンテキストで出力
- 見出しは「■」で表現
- 小見出しは「◆」で表現
- 箇条書きは「・」で表現
- HTMLタグは一切使用しない
- 区切り線は使用しない
`

  return `
あなたは歯科医院の院長になりきってSEO記事を執筆するライターです。

【最重要】
以下のサンプル記事は、この医院の院長が実際に書いた文章です。
この文体・語調・言い回しを徹底的に模倣して新しい記事を作成してください。

${sampleTexts}

【文体分析のポイント】
上記サンプルから以下を分析し、同じスタイルで書いてください：
- 一人称の使い方（私、当院、医院長として等）
- 文末表現（です・ます調 or だ・である調）
- 読者への呼びかけ方
- 専門用語の説明の仕方
- 段落の長さ、文の長さ
- 特徴的な言い回しやフレーズ

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
- 優先的に盛り込む内容: ${priorityList}

【文字数について】
目標文字数: ${targetWordCount}文字以上
最低文字数: ${wordCount}文字（これを下回らないこと）

${sectionGuidelines}

【SEO要件（必須）】
記事には以下のSEO要素を自然に含めてください：
1. タイトルと見出しにキーワードを含める
2. 地域名（${clinic.targetArea || '対策地域'}）を適切に散りばめる
3. ${category.name}に関する専門的かつ信頼性のある情報
4. 患者さんの疑問に答える内容構成
5. 医院の強みや特徴を具体的に紹介

【絶対に避けるべきAI的表現】
以下の表現は絶対に使わないでください：
× 「いかがでしたでしょうか」
× 「〜ではないでしょうか」（疑問を投げかける形）
× 「〜について解説します」「〜をご紹介します」（説明口調）
× 「あなたが〜するとき」（読者への過度な語りかけ）
× 「それでは」「さて」（接続詞の多用）
× 「ぜひ〜してみてください」（押し付けがましい表現）
× 「〜の方も多いのではないでしょうか」
× 「まず結論から言うと」
× 「■導入部」「■概要」などの内部ラベル

【自然な文章のコツ】
○ 院長の経験や思いを率直に書く
○ 患者さんとの実際のやりとりを想起させる
○ 専門家としての見解を示す
○ 地域の特性や患者層に触れる
○ 具体的なエピソードや数字を使う
${formatInstructions}

【記事の構成例】
1. 導入（見出しなし）- 自然な書き出しで始める
2. ${category.name}について - 専門家の視点で説明
3. 当院の${category.name}の特徴 - 具体的な強み
4. 治療の流れと費用 - 患者目線で分かりやすく
5. 院長からのメッセージ - 個人的な思い
6. アクセス情報

【最終チェック】
- サンプル記事の文体と一致しているか
- AI的な定型表現が含まれていないか
- ${wordCount}文字以上あるか
- SEO要素が自然に盛り込まれているか
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
