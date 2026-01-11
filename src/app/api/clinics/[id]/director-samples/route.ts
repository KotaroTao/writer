import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 院長サンプル記事一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const samples = await prisma.directorSample.findMany({
      where: { clinicId: params.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: samples })
  } catch (error) {
    console.error('Failed to fetch director samples:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch director samples' },
      { status: 500 }
    )
  }
}

// 新しい院長サンプル記事を作成
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 医院が存在するか確認
    const clinic = await prisma.clinic.findUnique({
      where: { id: params.id },
    })

    if (!clinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      )
    }

    const sample = await prisma.directorSample.create({
      data: {
        clinicId: params.id,
        title,
        content,
        note: note || null,
      },
    })

    return NextResponse.json({ success: true, data: sample })
  } catch (error) {
    console.error('Failed to create director sample:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create director sample' },
      { status: 500 }
    )
  }
}
