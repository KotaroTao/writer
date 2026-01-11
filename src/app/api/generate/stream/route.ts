import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateContentStream, generateMetaInfo, generateFaq } from '@/lib/openai'
import { buildArticlePrompt } from '@/lib/prompts/article'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
      return new Response(
        JSON.stringify({ success: false, error: 'Clinic not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 診療項目カテゴリを取得
    const category = await prisma.treatmentCategory.findFirst({
      where: { name: treatmentCategory },
    })

    if (!category) {
      return new Response(
        JSON.stringify({ success: false, error: 'Treatment category not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 医院固有の優先設定を取得
    const clinicTreatment = clinic.treatments.find(
      (t: { category: { name: string } }) => t.category.name === treatmentCategory
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

    // ストリーミングレスポンスを作成
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''

        try {
          // コンテンツをストリーミング
          for await (const chunk of generateContentStream(prompt)) {
            fullContent += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', chunk })}\n\n`))
          }

          // タイトルを抽出
          const titleMatch = fullContent.match(/^#\s+(.+)$/m)
          const title = titleMatch
            ? titleMatch[1]
            : `${clinic.targetArea || ''}${keyword}｜${clinic.name}`

          // メタ情報を生成（オプション）
          let metaTitle: string | undefined
          let metaDescription: string | undefined

          if (includeMetaInfo) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'メタ情報を生成中...' })}\n\n`))
            const metaInfo = await generateMetaInfo(fullContent, keyword)
            metaTitle = metaInfo.title
            metaDescription = metaInfo.description
          }

          // FAQを生成（オプション）
          let faq: Array<{ question: string; answer: string }> | undefined

          if (includeFaq) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'FAQを生成中...' })}\n\n`))
            faq = await generateFaq(clinic.name, treatmentCategory, keyword)
          }

          // 記事をデータベースに保存
          const article = await prisma.article.create({
            data: {
              clinicId: clinic.id,
              title,
              content: fullContent,
              metaTitle,
              metaDescription,
              keywords: JSON.stringify([keyword]),
              wordCount: fullContent.replace(/\s/g, '').length,
              articleType: 'seo',
              status: 'draft',
            },
          })

          // 完了メッセージを送信
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            data: {
              id: article.id,
              title,
              content: fullContent,
              metaTitle,
              metaDescription,
              faq,
              wordCount: article.wordCount,
            },
          })}\n\n`))

        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'ストリーミング中にエラーが発生しました' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Failed to generate article:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
