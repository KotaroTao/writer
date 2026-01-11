import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'

async function getStats() {
  const [clinicCount, articleCount, summaryCount] = await Promise.all([
    prisma.clinic.count(),
    prisma.article.count(),
    prisma.summaryArticle.count(),
  ])

  return { clinicCount, articleCount, summaryCount }
}

async function getRecentArticles() {
  return prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { clinic: true },
  })
}

export default async function DashboardPage() {
  const stats = await getStats()
  const recentArticles = await getRecentArticles()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-gray-500">
          コンテンツSEO自動生成 for Dental
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">登録医院数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.clinicCount}</p>
              </div>
              <div className="p-3 bg-dental-light rounded-full">
                <svg className="w-6 h-6 text-dental" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">生成記事数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.articleCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">まとめ記事数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.summaryCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/clinics/new">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  新しい医院を登録
                </Button>
              </Link>
              <Link href="/generate">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  SEO記事を生成
                </Button>
              </Link>
              <Link href="/summary">
                <Button variant="outline" className="w-full justify-start">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  まとめ記事を作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近の記事</CardTitle>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <p className="text-sm text-gray-500">まだ記事がありません</p>
            ) : (
              <ul className="space-y-3">
                {recentArticles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/articles/${article.id}`}
                      className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {article.clinic?.name} ・ {article.wordCount}文字
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 使い方 */}
      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-dental text-white text-sm font-medium mr-3 flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">医院情報を登録</p>
                <p className="text-sm text-gray-500">
                  医院名、URL、住所、電話番号、対策診療項目を登録します
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-dental text-white text-sm font-medium mr-3 flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">診療項目の優先設定</p>
                <p className="text-sm text-gray-500">
                  各診療項目について、優先的に盛り込む内容を設定します
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-dental text-white text-sm font-medium mr-3 flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">記事を生成</p>
                <p className="text-sm text-gray-500">
                  対策キーワードと文字数を指定して、SEO記事を自動生成します
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
