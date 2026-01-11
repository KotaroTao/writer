import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateContentStream, generateMetaInfo, generateFaq } from '@/lib/openai'
import { buildArticlePrompt, OutputFormat } from '@/lib/prompts/article'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clinicId, treatmentCategory, keyword, wordCount, outputFormat, includeFaq, includeMetaInfo } = body

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

    // 出力形式（デフォルトはtext）
    const format: OutputFormat = outputFormat === 'html' ? 'html' : 'text'

    // clinicオブジェクトを型に合わせて変換
    const clinicForPrompt = {
      ...clinic,
      treatments: clinic.treatments.map((t) => ({
        ...t,
        priorities: JSON.parse(t.priorities || '[]') as string[],
        category: {
          ...t.category,
          defaultPriorities: JSON.parse(t.category.defaultPriorities || '[]') as string[],
        },
      })),
    }

    // プロンプトを構築
    const prompt = buildArticlePrompt(
      clinicForPrompt,
      { ...category, defaultPriorities: JSON.parse(category.defaultPriorities || '[]') },
      keyword,
      wordCount,
      priorities,
      format
    )

    // ストリーミングレスポンスを作成
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''

        try {
          // コンテンツをストリーミング（wordCountを渡してmax_tokensを動的に設定）
          for await (const chunk of generateContentStream(prompt, wordCount)) {
            fullContent += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', chunk })}\n\n`))
          }

          // タイトルを抽出（形式に応じて）
          let title: string
          if (format === 'html') {
            // HTML形式: <h1>または<h2>タグからタイトルを抽出
            const h1Match = fullContent.match(/<h1[^>]*>(.+?)<\/h1>/i)
            const h2Match = fullContent.match(/<h2[^>]*>(.+?)<\/h2>/i)
            title = h1Match?.[1] || h2Match?.[1] || `${clinic.targetArea || ''}${keyword}｜${clinic.name}`
          } else {
            // テキスト形式: ■マークや最初の行からタイトルを抽出
            const symbolMatch = fullContent.match(/^[■◆●]\s*(.+)$/m)
            const firstLineMatch = fullContent.match(/^(.+)$/m)
            title = symbolMatch?.[1] || firstLineMatch?.[1]?.substring(0, 60) || `${clinic.targetArea || ''}${keyword}｜${clinic.name}`
          }

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
              articleType: format === 'html' ? 'seo-html' : 'seo',
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
              outputFormat: format,
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
