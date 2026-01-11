'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Article {
  id: string
  title: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
  status: string
  wordCount: number
  clinic?: { name: string } | null
}

export default function EditArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
  })

  useEffect(() => {
    fetch(`/api/articles/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setArticle(data.data)
          setFormData({
            title: data.data.title,
            content: data.data.content,
            metaTitle: data.data.metaTitle || '',
            metaDescription: data.data.metaDescription || '',
          })
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [params.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/articles/${params.id}`)
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error(error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'published',
        }),
      })

      if (response.ok) {
        router.push(`/articles/${params.id}`)
      } else {
        alert('公開に失敗しました')
      }
    } catch (error) {
      console.error(error)
      alert('公開に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental"></div>
          <span className="ml-3 text-gray-500">読み込み中...</span>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">記事が見つかりませんでした</p>
          <Link href="/articles" className="text-dental hover:underline">
            記事一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const wordCount = formData.content.replace(/\s/g, '').length

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/articles/${params.id}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; 記事詳細に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">記事を編集</h1>
        {article.clinic && (
          <p className="mt-1 text-gray-500">{article.clinic.name}</p>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>メタ情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                label="SEOタイトル"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
                }
                placeholder="60文字以内推奨"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.metaTitle.length}文字
              </p>
            </div>
            <div>
              <Textarea
                label="メタディスクリプション"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    metaDescription: e.target.value,
                  }))
                }
                placeholder="120文字以内推奨"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.metaDescription.length}文字
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>本文</CardTitle>
              <span className="text-sm text-gray-500">{wordCount}文字</span>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <Input
                label="タイトル"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mb-4"
              />
            </div>
            <div>
              <Textarea
                label="コンテンツ"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={20}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-bold mb-4">{formData.title}</h2>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: formData.content
                  .replace(/## (.+)/g, '<h2 class="text-lg font-bold mt-6 mb-2">$1</h2>')
                  .replace(/### (.+)/g, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/\n/g, '<br>'),
              }}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/articles/${params.id}`}>
            <Button variant="outline">キャンセル</Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '下書き保存'}
          </Button>
          <Button onClick={handlePublish} disabled={isSaving}>
            {isSaving ? '保存中...' : '公開する'}
          </Button>
        </div>
      </div>
    </div>
  )
}
