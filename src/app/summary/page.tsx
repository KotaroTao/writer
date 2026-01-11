'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SummaryForm } from '@/components/forms/summary-form'

interface Clinic {
  id: string
  name: string
  address: string
}

interface TreatmentCategory {
  id: string
  name: string
}

export default function SummaryPage() {
  const router = useRouter()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [categories, setCategories] = useState<TreatmentCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    title: string
    content: string
    metaTitle?: string
    metaDescription?: string
  } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/clinics').then((res) => res.json()),
      fetch('/api/treatments').then((res) => res.json()),
    ]).then(([clinicsData, treatmentsData]) => {
      setClinics(clinicsData.data || [])
      setCategories(treatmentsData.data || [])
    })
  }, [])

  const handleSubmit = async (data: {
    area: string
    category: string
    clinicCount: number
    clinicIds: string[]
  }) => {
    setIsLoading(true)
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const result = await response.json()
      setGeneratedContent(result.data)
    } catch (error) {
      console.error(error)
      alert('まとめ記事の生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent) return

    try {
      const response = await fetch('/api/summary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedContent),
      })

      if (!response.ok) {
        throw new Error('Failed to save summary')
      }

      const result = await response.json()
      router.push(`/articles/${result.data.id}`)
    } catch (error) {
      console.error(error)
      alert('まとめ記事の保存に失敗しました')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">まとめ記事作成</h1>
        <p className="mt-1 text-gray-500">
          「〇〇市でインプラントがおすすめの歯科医院7選」のようなまとめ記事を作成します
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>記事設定</CardTitle>
            </CardHeader>
            <CardContent>
              {clinics.length < 3 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    まとめ記事を作成するには、少なくとも3つの医院が必要です
                  </p>
                  <a
                    href="/clinics/new"
                    className="text-dental hover:underline"
                  >
                    医院を登録する
                  </a>
                </div>
              ) : (
                <SummaryForm
                  clinics={clinics}
                  treatmentCategories={categories}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>プレビュー</CardTitle>
                {generatedContent && (
                  <button
                    onClick={handleSave}
                    className="text-sm text-dental hover:underline"
                  >
                    記事を保存
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental"></div>
                  <span className="ml-3 text-gray-500">生成中...</span>
                </div>
              ) : generatedContent ? (
                <div className="space-y-6">
                  {generatedContent.metaTitle && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">SEOタイトル</p>
                      <p className="text-sm font-medium">{generatedContent.metaTitle}</p>
                    </div>
                  )}

                  {generatedContent.metaDescription && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">メタディスクリプション</p>
                      <p className="text-sm">{generatedContent.metaDescription}</p>
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-bold mb-4">{generatedContent.title}</h2>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: generatedContent.content
                          .replace(/## /g, '<h2>')
                          .replace(/### /g, '<h3>')
                          .replace(/\n\n/g, '</p><p>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p>設定を入力してまとめ記事を生成してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
