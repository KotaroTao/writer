import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArticleActions } from '@/components/articles/article-actions'
import { ArticleSeoPanel } from '@/components/articles/article-seo-panel'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'

// キャッシュを無効化して常に最新データを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // キーワードをJSONから抽出
  let defaultKeyword = ''
  if ('keywords' in article && article.keywords) {
    try {
      const keywords = JSON.parse(article.keywords)
      if (Array.isArray(keywords) && keywords.length > 0) {
        defaultKeyword = keywords[0]
      }
    } catch {
      // パースエラーの場合は空文字のまま
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Link
          href="/articles"
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; 記事一覧に戻る
        </Link>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={article.type === 'summary' ? 'info' : 'default'}>
              {article.type === 'summary' ? 'まとめ' : 'SEO記事'}
            </Badge>
            <Badge variant={article.status === 'published' ? 'success' : 'warning'}>
              {article.status === 'published' ? '公開中' : '下書き'}
            </Badge>
          </div>
          {article.type === 'article' && (
            <ArticleActions
              articleId={article.id}
              content={article.content}
              status={article.status}
            />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {article.clinic && <span>{article.clinic.name}</span>}
          {'area' in article && article.area && <span>{article.area}</span>}
          <span>{article.wordCount}文字</span>
          <span>{formatDate(article.createdAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {(article.metaTitle || article.metaDescription) && (
            <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>本文</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: article.content
                    .replace(/## (.+)/g, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
                    .replace(/### (.+)/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/\n/g, '<br>')
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HTMLソース（マークダウン）</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                <code>{article.content}</code>
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー: SEOスコア */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <ArticleSeoPanel
              content={article.content}
              title={article.title}
              metaTitle={article.metaTitle || undefined}
              metaDescription={article.metaDescription || undefined}
              defaultKeyword={defaultKeyword}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
