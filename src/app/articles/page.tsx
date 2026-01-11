import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'

async function getArticles() {
  return prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    include: { clinic: true },
  })
}

async function getSummaryArticles() {
  return prisma.summaryArticle.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ArticlesPage() {
  const [articles, summaryArticles] = await Promise.all([
    getArticles(),
    getSummaryArticles(),
  ])

  const allArticles = [
    ...articles.map((a) => ({ ...a, type: 'article' as const })),
    ...summaryArticles.map((a) => ({ ...a, type: 'summary' as const, clinic: null })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">記事一覧</h1>
        <p className="mt-1 text-gray-500">生成した記事の管理</p>
      </div>

      {allArticles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mb-4">まだ記事がありません</p>
            <div className="flex justify-center gap-4">
              <Link href="/generate" className="text-dental hover:underline">
                記事を生成する
              </Link>
              <Link href="/summary" className="text-dental hover:underline">
                まとめ記事を作成する
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allArticles.map((article) => (
            <Card key={article.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={article.type === 'summary' ? 'info' : 'default'}>
                        {article.type === 'summary' ? 'まとめ' : 'SEO記事'}
                      </Badge>
                      <Badge variant={article.status === 'published' ? 'success' : 'warning'}>
                        {article.status === 'published' ? '公開中' : '下書き'}
                      </Badge>
                    </div>
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-dental truncate block"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {article.clinic && (
                        <span>{article.clinic.name}</span>
                      )}
                      {'area' in article && article.area && (
                        <span>{article.area}</span>
                      )}
                      <span>{article.wordCount}文字</span>
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/articles/${article.id}`}
                    className="ml-4 text-dental hover:underline text-sm"
                  >
                    詳細
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
