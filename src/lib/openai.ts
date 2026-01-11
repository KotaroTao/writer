import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateContent(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `あなたは歯科医院のSEO・MEO・LLMO対策に特化したコンテンツライターです。
以下の点を重視して記事を作成してください：
- E-E-A-T（経験・専門性・権威性・信頼性）を意識した構成
- 読みやすく、患者さん目線で分かりやすい文章
- 医院の特徴や強みを自然に盛り込む
- 地域性を活かしたローカルSEO対策
- 適切な見出し構成（H2, H3）
- 自然なキーワード配置`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  })

  return response.choices[0]?.message?.content || ''
}

export async function generateMetaInfo(
  content: string,
  keyword: string
): Promise<{ title: string; description: string }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `SEO最適化されたメタ情報を生成してください。
- titleタグ: 60文字以内、キーワードを含む
- meta description: 120文字以内、クリックを促す内容`,
      },
      {
        role: 'user',
        content: `以下の記事内容とキーワードからメタ情報を生成してください。

キーワード: ${keyword}

記事内容:
${content.substring(0, 1000)}

JSON形式で出力してください: {"title": "...", "description": "..."}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
  })

  try {
    const text = response.choices[0]?.message?.content || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // パースエラーの場合はデフォルト値を返す
  }

  return { title: keyword, description: '' }
}

export async function generateFaq(
  clinicName: string,
  treatmentCategory: string,
  keyword: string
): Promise<Array<{ question: string; answer: string }>> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `歯科医院のFAQ（よくある質問）を生成してください。
患者さんが実際に検索しそうな質問と、専門的かつ分かりやすい回答を作成してください。`,
      },
      {
        role: 'user',
        content: `以下の条件でFAQを5つ生成してください。

医院名: ${clinicName}
診療項目: ${treatmentCategory}
キーワード: ${keyword}

JSON配列形式で出力: [{"question": "...", "answer": "..."}, ...]`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })

  try {
    const text = response.choices[0]?.message?.content || '[]'
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // パースエラーの場合は空配列を返す
  }

  return []
}

export default openai
