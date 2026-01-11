import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: { clinic: true },
    })

    return NextResponse.json({ success: true, data: articles })
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clinicId, title, content, metaTitle, metaDescription, keywords } = body

    const article = await prisma.article.create({
      data: {
        clinicId,
        title,
        content,
        metaTitle,
        metaDescription,
        keywords: JSON.stringify(keywords || []),
        wordCount: content.replace(/\s/g, '').length,
        articleType: 'seo',
        status: 'draft',
      },
    })

    return NextResponse.json({ success: true, data: article })
  } catch (error) {
    console.error('Failed to create article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    )
  }
}
