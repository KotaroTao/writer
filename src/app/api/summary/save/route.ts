import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, area, category, clinicIds, metaTitle, metaDescription } = body

    const summaryArticle = await prisma.summaryArticle.create({
      data: {
        title,
        content,
        area: area || '',
        category: category || '',
        clinicIds: JSON.stringify(clinicIds || []),
        metaTitle,
        metaDescription,
        status: 'draft',
      },
    })

    return NextResponse.json({ success: true, data: summaryArticle })
  } catch (error) {
    console.error('Failed to save summary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save summary article' },
      { status: 500 }
    )
  }
}
