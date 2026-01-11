import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'

async function getArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    include: { clinic: true },
  })

  if (article) return { ...article, type: 'article' as const }

  const summaryArticle = await prisma.summaryArticle.findUnique({
    where: { id },
  })

  if (summaryArticle) return { ...summaryArticle, type: 'summary' as const, clinic: null }

  return null
}

export default async function ArticleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const article = await getArticle(params.id)

  if (!article) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/articles"
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; 記事一覧に戻る
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={article.type === 'summary' ? 'info' : 'default'}>
            {article.type === 'summary' ? 'まとめ' : 'SEO記事'}
          </Badge>
          <Badge variant={article.status === 'published' ? 'success' : 'warning'}>
            {article.status === 'published' ? '公開中' : '下書き'}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {article.clinic && <span>{article.clinic.name}</span>}
          {'area' in article && article.area && <span>{article.area}</span>}
          <span>{article.wordCount}文字</span>
          <span>{formatDate(article.createdAt)}</span>
        </div>
      </div>

      {(article.metaTitle || article.metaDescription) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>メタ情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {article.metaTitle && (
              <div>
                <p className="text-xs text-gray-500 mb-1">SEOタイトル（{article.metaTitle.length}文字）</p>
                <p className="text-sm font-medium p-2 bg-gray-50 rounded">{article.metaTitle}</p>
              </div>
            )}
            {article.metaDescription && (
              <div>
                <p className="text-xs text-gray-500 mb-1">メタディスクリプション（{article.metaDescription.length}文字）</p>
                <p className="text-sm p-2 bg-gray-50 rounded">{article.metaDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>本文</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(article.content)
              }}
            >
              コピー
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: article.content
                .replace(/## /g, '<h2 class="text-xl font-bold mt-6 mb-3">')
                .replace(/### /g, '<h3 class="text-lg font-semibold mt-4 mb-2">')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/\n/g, '<br>')
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTMLソース</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{article.content}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
