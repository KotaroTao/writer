import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateContent, generateMetaInfo, generateFaq } from '@/lib/openai'
import { buildArticlePrompt } from '@/lib/prompts/article'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clinicId, treatmentCategory, keyword, wordCount, includeFaq, includeMetaInfo } = body

    // 医院情報を取得
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        treatments: {
          include: { category: true },
        },
      },
    })

    if (!clinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      )
    }

    // 診療項目カテゴリを取得
    const category = await prisma.treatmentCategory.findFirst({
      where: { name: treatmentCategory },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Treatment category not found' },
        { status: 404 }
      )
    }

    // 医院固有の優先設定を取得
    const clinicTreatment = clinic.treatments.find(
      (t) => t.category.name === treatmentCategory
    )
    const priorities = clinicTreatment
      ? JSON.parse(clinicTreatment.priorities || '[]')
      : JSON.parse(category.defaultPriorities || '[]')

    // プロンプトを構築
    const prompt = buildArticlePrompt(
      clinic,
      { ...category, defaultPriorities: JSON.parse(category.defaultPriorities || '[]') },
      keyword,
      wordCount,
      priorities
    )

    // 記事を生成
    const content = await generateContent(prompt)

    // タイトルを抽出（最初の行または生成）
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch
      ? titleMatch[1]
      : `${clinic.targetArea || ''}${keyword}｜${clinic.name}`

    // メタ情報を生成
    let metaTitle: string | undefined
    let metaDescription: string | undefined

    if (includeMetaInfo) {
      const metaInfo = await generateMetaInfo(content, keyword)
      metaTitle = metaInfo.title
      metaDescription = metaInfo.description
    }

    // FAQを生成
    let faq: Array<{ question: string; answer: string }> | undefined

    if (includeFaq) {
      faq = await generateFaq(clinic.name, treatmentCategory, keyword)
    }

    // 記事をデータベースに保存
    const article = await prisma.article.create({
      data: {
        clinicId: clinic.id,
        title,
        content,
        metaTitle,
        metaDescription,
        keywords: JSON.stringify([keyword]),
        wordCount: content.replace(/\s/g, '').length,
        articleType: 'seo',
        status: 'draft',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        title,
        content,
        metaTitle,
        metaDescription,
        faq,
        wordCount: article.wordCount,
      },
    })
  } catch (error) {
    console.error('Failed to generate article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate article' },
      { status: 500 }
    )
  }
}
