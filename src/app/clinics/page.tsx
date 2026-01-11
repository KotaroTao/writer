import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'

// キャッシュを無効化して常に最新データを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getClinics() {
  return prisma.clinic.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      treatments: {
        include: { category: true },
      },
    },
  })
}

type ClinicWithTreatments = Awaited<ReturnType<typeof getClinics>>[number]

export default async function ClinicsPage() {
  const clinics = await getClinics()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">医院管理</h1>
          <p className="mt-1 text-gray-500">登録された医院の一覧と管理</p>
        </div>
        <Link href="/clinics/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </Button>
        </Link>
      </div>

      {clinics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 mb-4">まだ医院が登録されていません</p>
            <Link href="/clinics/new">
              <Button>最初の医院を登録</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {clinics.map((clinic: ClinicWithTreatments) => (
            <Card key={clinic.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{clinic.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{clinic.address}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/clinics/${clinic.id}/edit`}>
                      <Button variant="outline" size="sm">編集</Button>
                    </Link>
                    <Link href={`/clinics/${clinic.id}/treatments`}>
                      <Button variant="outline" size="sm">診療設定</Button>
                    </Link>
                    <Link href={`/clinics/${clinic.id}/director-samples`}>
                      <Button variant="outline" size="sm">院長モード</Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">電話番号</p>
                    <p className="font-medium">{clinic.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">対策地域</p>
                    <p className="font-medium">{clinic.targetArea || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">URL</p>
                    <a
                      href={clinic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dental hover:underline truncate block"
                    >
                      {clinic.url}
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-500">診療項目</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {clinic.treatments.filter((t: { enabled: boolean }) => t.enabled).map((treatment: { id: string; category: { name: string } }) => (
                        <Badge key={treatment.id} variant="info">
                          {treatment.category.name}
                        </Badge>
                      ))}
                      {clinic.treatments.filter((t: { enabled: boolean }) => t.enabled).length === 0 && (
                        <span className="text-gray-400">未設定</span>
                      )}
                    </div>
                  </div>
                </div>
                {clinic.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{clinic.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
