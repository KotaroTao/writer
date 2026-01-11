import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateContent, generateMetaInfo } from '@/lib/openai'
import { buildSummaryArticlePrompt } from '@/lib/prompts/article'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { area, category, clinicIds, clinicCount } = body

    // 選択された医院を取得
    const clinics = await prisma.clinic.findMany({
      where: { id: { in: clinicIds } },
    })

    if (clinics.length < 3) {
      return NextResponse.json(
        { success: false, error: 'At least 3 clinics are required' },
        { status: 400 }
      )
    }

    // プロンプトを構築
    const prompt = buildSummaryArticlePrompt(area, category, clinics, clinicCount || 7)

    // 記事を生成
    const content = await generateContent(prompt)

    // タイトルを生成
    const title = `${area}で${category}がおすすめの歯科医院${Math.min(clinics.length, clinicCount || 7)}選`

    // メタ情報を生成
    const metaInfo = await generateMetaInfo(content, `${area} ${category}`)

    // まとめ記事をデータベースに保存
    const summaryArticle = await prisma.summaryArticle.create({
      data: {
        title,
        content,
        area,
        category,
        clinicIds: JSON.stringify(clinicIds),
        metaTitle: metaInfo.title,
        metaDescription: metaInfo.description,
        status: 'draft',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: summaryArticle.id,
        title,
        content,
        metaTitle: metaInfo.title,
        metaDescription: metaInfo.description,
        wordCount: content.replace(/\s/g, '').length,
      },
    })
  } catch (error) {
    console.error('Failed to generate summary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary article' },
      { status: 500 }
    )
  }
}
