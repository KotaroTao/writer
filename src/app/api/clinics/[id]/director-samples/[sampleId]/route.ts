import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 院長サンプル記事を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; sampleId: string } }
) {
  try {
    const sample = await prisma.directorSample.findUnique({
      where: { id: params.sampleId },
    })

    if (!sample || sample.clinicId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Director sample not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: sample })
  } catch (error) {
    console.error('Failed to fetch director sample:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch director sample' },
      { status: 500 }
    )
  }
}

// 院長サンプル記事を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sampleId: string } }
) {
  try {
    const body = await request.json()
    const { title, content, note } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // サンプルが存在し、正しい医院に属しているか確認
    const existing = await prisma.directorSample.findUnique({
      where: { id: params.sampleId },
    })

    if (!existing || existing.clinicId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Director sample not found' },
        { status: 404 }
      )
    }

    const sample = await prisma.directorSample.update({
      where: { id: params.sampleId },
      data: {
        title,
        content,
        note: note || null,
      },
    })

    return NextResponse.json({ success: true, data: sample })
  } catch (error) {
    console.error('Failed to update director sample:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update director sample' },
      { status: 500 }
    )
  }
}

// 院長サンプル記事を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; sampleId: string } }
) {
  try {
    // サンプルが存在し、正しい医院に属しているか確認
    const existing = await prisma.directorSample.findUnique({
      where: { id: params.sampleId },
    })

    if (!existing || existing.clinicId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Director sample not found' },
        { status: 404 }
      )
    }

    await prisma.directorSample.delete({
      where: { id: params.sampleId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete director sample:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete director sample' },
      { status: 500 }
    )
  }
}
