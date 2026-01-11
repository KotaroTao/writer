import { NextRequest, NextResponse } from 'next/server'
import { analyzeSeo } from '@/lib/seo-analyzer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title, keyword, metaTitle, metaDescription } = body

    if (!content || !title || !keyword) {
      return NextResponse.json(
        { success: false, error: 'content, title, and keyword are required' },
        { status: 400 }
      )
    }

    const analysis = analyzeSeo(content, title, keyword, metaTitle, metaDescription)

    return NextResponse.json({ success: true, data: analysis })
  } catch (error) {
    console.error('Failed to analyze SEO:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze SEO' },
      { status: 500 }
    )
  }
}
