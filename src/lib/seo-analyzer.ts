/**
 * SEO分析ユーティリティ
 * 記事の品質とSEO最適化度をスコアリング
 */

export interface SeoAnalysisResult {
  overallScore: number // 0-100
  details: {
    titleScore: TitleAnalysis
    metaScore: MetaAnalysis
    contentScore: ContentAnalysis
    keywordScore: KeywordAnalysis
    readabilityScore: ReadabilityAnalysis
    structureScore: StructureAnalysis
  }
  suggestions: string[]
}

interface TitleAnalysis {
  score: number
  length: number
  hasKeyword: boolean
  issues: string[]
}

interface MetaAnalysis {
  score: number
  titleLength: number
  descriptionLength: number
  hasKeyword: boolean
  issues: string[]
}

interface ContentAnalysis {
  score: number
  wordCount: number
  paragraphCount: number
  averageParagraphLength: number
  issues: string[]
}

interface KeywordAnalysis {
  score: number
  density: number
  occurrences: number
  inTitle: boolean
  inHeadings: boolean
  issues: string[]
}

interface ReadabilityAnalysis {
  score: number
  averageSentenceLength: number
  kanjiRatio: number
  issues: string[]
}

interface StructureAnalysis {
  score: number
  h2Count: number
  h3Count: number
  hasProperHierarchy: boolean
  issues: string[]
}

/**
 * 記事のSEO分析を実行
 */
export function analyzeSeo(
  content: string,
  title: string,
  keyword: string,
  metaTitle?: string,
  metaDescription?: string
): SeoAnalysisResult {
  const titleAnalysis = analyzeTitle(title, keyword)
  const metaAnalysis = analyzeMeta(metaTitle, metaDescription, keyword)
  const contentAnalysis = analyzeContent(content)
  const keywordAnalysis = analyzeKeyword(content, title, keyword)
  const readabilityAnalysis = analyzeReadability(content)
  const structureAnalysis = analyzeStructure(content)

  // 全体スコアを計算（各項目を重み付け）
  const overallScore = Math.round(
    titleAnalysis.score * 0.15 +
    metaAnalysis.score * 0.15 +
    contentAnalysis.score * 0.20 +
    keywordAnalysis.score * 0.20 +
    readabilityAnalysis.score * 0.15 +
    structureAnalysis.score * 0.15
  )

  // 改善提案を収集
  const suggestions = [
    ...titleAnalysis.issues,
    ...metaAnalysis.issues,
    ...contentAnalysis.issues,
    ...keywordAnalysis.issues,
    ...readabilityAnalysis.issues,
    ...structureAnalysis.issues,
  ]

  return {
    overallScore,
    details: {
      titleScore: titleAnalysis,
      metaScore: metaAnalysis,
      contentScore: contentAnalysis,
      keywordScore: keywordAnalysis,
      readabilityScore: readabilityAnalysis,
      structureScore: structureAnalysis,
    },
    suggestions,
  }
}

/**
 * タイトル分析
 */
function analyzeTitle(title: string, keyword: string): TitleAnalysis {
  const issues: string[] = []
  let score = 100

  const length = title.length
  const hasKeyword = title.toLowerCase().includes(keyword.toLowerCase())

  // タイトル長さチェック
  if (length < 20) {
    issues.push('タイトルが短すぎます（20文字以上推奨）')
    score -= 20
  } else if (length > 60) {
    issues.push('タイトルが長すぎます（60文字以内推奨）')
    score -= 15
  }

  // キーワード有無チェック
  if (!hasKeyword) {
    issues.push('タイトルにキーワードが含まれていません')
    score -= 25
  }

  // 先頭にキーワードがあるか
  if (hasKeyword && !title.toLowerCase().startsWith(keyword.toLowerCase().split(' ')[0])) {
    issues.push('キーワードをタイトル先頭に配置するとより効果的です')
    score -= 10
  }

  return { score: Math.max(0, score), length, hasKeyword, issues }
}

/**
 * メタ情報分析
 */
function analyzeMeta(
  metaTitle?: string,
  metaDescription?: string,
  keyword?: string
): MetaAnalysis {
  const issues: string[] = []
  let score = 100

  const titleLength = metaTitle?.length || 0
  const descriptionLength = metaDescription?.length || 0
  const hasKeyword = keyword
    ? (metaTitle?.toLowerCase().includes(keyword.toLowerCase()) ||
       metaDescription?.toLowerCase().includes(keyword.toLowerCase())) || false
    : false

  // メタタイトルチェック
  if (!metaTitle) {
    issues.push('SEOタイトルが設定されていません')
    score -= 25
  } else if (titleLength < 30) {
    issues.push('SEOタイトルが短すぎます（30-60文字推奨）')
    score -= 15
  } else if (titleLength > 60) {
    issues.push('SEOタイトルが長すぎます（60文字以内推奨）')
    score -= 10
  }

  // メタディスクリプションチェック
  if (!metaDescription) {
    issues.push('メタディスクリプションが設定されていません')
    score -= 25
  } else if (descriptionLength < 80) {
    issues.push('メタディスクリプションが短すぎます（80-120文字推奨）')
    score -= 15
  } else if (descriptionLength > 160) {
    issues.push('メタディスクリプションが長すぎます（160文字以内推奨）')
    score -= 10
  }

  // キーワード有無
  if (keyword && !hasKeyword) {
    issues.push('メタ情報にキーワードを含めることを推奨します')
    score -= 15
  }

  return { score: Math.max(0, score), titleLength, descriptionLength, hasKeyword, issues }
}

/**
 * コンテンツ分析
 */
function analyzeContent(content: string): ContentAnalysis {
  const issues: string[] = []
  let score = 100

  // 空白を除いた文字数
  const wordCount = content.replace(/\s/g, '').length

  // 段落数（空行で分割）
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0)
  const paragraphCount = paragraphs.length

  // 平均段落長
  const averageParagraphLength = paragraphCount > 0
    ? Math.round(wordCount / paragraphCount)
    : 0

  // 文字数チェック
  if (wordCount < 500) {
    issues.push('コンテンツが短すぎます（500文字以上推奨）')
    score -= 30
  } else if (wordCount < 1000) {
    issues.push('SEO効果を高めるには1000文字以上を推奨します')
    score -= 15
  } else if (wordCount > 10000) {
    issues.push('コンテンツが長すぎる可能性があります（適切に分割を検討）')
    score -= 10
  }

  // 段落チェック
  if (paragraphCount < 3) {
    issues.push('段落が少なすぎます（読みやすさ向上のため段落分けを推奨）')
    score -= 15
  }

  if (averageParagraphLength > 300) {
    issues.push('段落が長すぎます（200文字程度で段落分けを推奨）')
    score -= 10
  }

  return { score: Math.max(0, score), wordCount, paragraphCount, averageParagraphLength, issues }
}

/**
 * キーワード分析
 */
function analyzeKeyword(content: string, title: string, keyword: string): KeywordAnalysis {
  const issues: string[] = []
  let score = 100

  const lowerContent = content.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  const wordCount = content.replace(/\s/g, '').length

  // キーワード出現回数
  const regex = new RegExp(lowerKeyword, 'gi')
  const matches = content.match(regex)
  const occurrences = matches?.length || 0

  // キーワード密度（%）
  const keywordLength = keyword.replace(/\s/g, '').length
  const density = wordCount > 0 ? (occurrences * keywordLength / wordCount) * 100 : 0

  // タイトル内のキーワード
  const inTitle = title.toLowerCase().includes(lowerKeyword)

  // 見出し内のキーワード
  const headings = content.match(/^##?\s+.+$/gm) || []
  const inHeadings = headings.some(h => h.toLowerCase().includes(lowerKeyword))

  // キーワード出現回数チェック
  if (occurrences === 0) {
    issues.push('キーワードがコンテンツ内に含まれていません')
    score -= 40
  } else if (occurrences < 3) {
    issues.push('キーワードの出現回数が少なすぎます（3回以上推奨）')
    score -= 20
  }

  // キーワード密度チェック
  if (density > 5) {
    issues.push('キーワード密度が高すぎます（過剰なSEOと判断される可能性）')
    score -= 25
  } else if (density < 0.5 && occurrences > 0) {
    issues.push('キーワード密度が低すぎます（1-3%推奨）')
    score -= 15
  }

  // 見出しにキーワードがあるか
  if (!inHeadings && occurrences > 0) {
    issues.push('見出し（H2/H3）にもキーワードを含めることを推奨します')
    score -= 15
  }

  return {
    score: Math.max(0, score),
    density: Math.round(density * 100) / 100,
    occurrences,
    inTitle,
    inHeadings,
    issues,
  }
}

/**
 * 読みやすさ分析
 */
function analyzeReadability(content: string): ReadabilityAnalysis {
  const issues: string[] = []
  let score = 100

  // 文を分割（。！？で区切る）
  const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 0)
  const totalSentenceLength = sentences.reduce((sum, s) => sum + s.replace(/\s/g, '').length, 0)
  const averageSentenceLength = sentences.length > 0
    ? Math.round(totalSentenceLength / sentences.length)
    : 0

  // 漢字率を計算
  const kanjiRegex = /[\u4e00-\u9faf]/g
  const kanjiMatches = content.match(kanjiRegex)
  const kanjiCount = kanjiMatches?.length || 0
  const totalChars = content.replace(/\s/g, '').length
  const kanjiRatio = totalChars > 0 ? (kanjiCount / totalChars) * 100 : 0

  // 文の長さチェック
  if (averageSentenceLength > 80) {
    issues.push('文が長すぎます（1文40-60文字程度を推奨）')
    score -= 20
  } else if (averageSentenceLength > 60) {
    issues.push('文がやや長めです（読みやすさ向上のため短めの文を推奨）')
    score -= 10
  }

  // 漢字率チェック
  if (kanjiRatio > 40) {
    issues.push('漢字率が高すぎます（読みやすさ向上のため30%程度を推奨）')
    score -= 15
  } else if (kanjiRatio < 15) {
    issues.push('漢字率が低すぎます（専門性を示すため適度な漢字使用を推奨）')
    score -= 10
  }

  return {
    score: Math.max(0, score),
    averageSentenceLength,
    kanjiRatio: Math.round(kanjiRatio * 10) / 10,
    issues,
  }
}

/**
 * 構造分析
 */
function analyzeStructure(content: string): StructureAnalysis {
  const issues: string[] = []
  let score = 100

  // 見出しを抽出
  const h2Matches = content.match(/^## .+$/gm) || []
  const h3Matches = content.match(/^### .+$/gm) || []
  const h2Count = h2Matches.length
  const h3Count = h3Matches.length

  // 見出し階層をチェック
  const lines = content.split('\n')
  let hasProperHierarchy = true
  let lastLevel = 1

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (lastLevel < 2) {
        hasProperHierarchy = false
        break
      }
      lastLevel = 3
    } else if (line.startsWith('## ')) {
      lastLevel = 2
    }
  }

  // H2チェック
  if (h2Count === 0) {
    issues.push('H2見出しがありません（記事構成にH2見出しを使用してください）')
    score -= 30
  } else if (h2Count < 2) {
    issues.push('H2見出しが少なすぎます（2つ以上推奨）')
    score -= 15
  } else if (h2Count > 10) {
    issues.push('H2見出しが多すぎます（記事を分割することを検討）')
    score -= 10
  }

  // H3チェック
  if (h2Count >= 2 && h3Count === 0) {
    issues.push('H3見出しがありません（詳細な構成にはH3も使用を推奨）')
    score -= 10
  }

  // 階層チェック
  if (!hasProperHierarchy) {
    issues.push('見出しの階層構造が不適切です（H2の下にH3を配置してください）')
    score -= 20
  }

  return { score: Math.max(0, score), h2Count, h3Count, hasProperHierarchy, issues }
}

/**
 * スコアに応じたグレードを返す
 */
export function getScoreGrade(score: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  label: string
  color: string
} {
  if (score >= 90) return { grade: 'A', label: '優秀', color: 'text-green-600' }
  if (score >= 75) return { grade: 'B', label: '良好', color: 'text-blue-600' }
  if (score >= 60) return { grade: 'C', label: '普通', color: 'text-yellow-600' }
  if (score >= 40) return { grade: 'D', label: '改善推奨', color: 'text-orange-600' }
  return { grade: 'F', label: '要改善', color: 'text-red-600' }
}
