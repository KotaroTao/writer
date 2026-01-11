'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GenerateForm } from '@/components/forms/generate-form'

interface Clinic {
  id: string
  name: string
}

interface TreatmentCategory {
  id: string
  name: string
}

export default function GeneratePage() {
  const router = useRouter()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [categories, setCategories] = useState<TreatmentCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    title: string
    content: string
    metaTitle?: string
    metaDescription?: string
    faq?: Array<{ question: string; answer: string }>
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
    clinicId: string
    treatmentCategory: string
    keyword: string
    wordCount: number
    includeFaq?: boolean
    includeMetaInfo?: boolean
  }) => {
    setIsLoading(true)
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate article')
      }

      const result = await response.json()
      setGeneratedContent(result.data)
    } catch (error) {
      console.error(error)
      alert('記事の生成に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent) return

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedContent),
      })

      if (!response.ok) {
        throw new Error('Failed to save article')
      }

      const result = await response.json()
      router.push(`/articles/${result.data.id}`)
    } catch (error) {
      console.error(error)
      alert('記事の保存に失敗しました')
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">記事生成</h1>
        <p className="mt-1 text-gray-500">SEO・MEO・LLMO対策記事を自動生成します</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>生成設定</CardTitle>
            </CardHeader>
            <CardContent>
              {clinics.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    まず医院を登録してください
                  </p>
                  <a
                    href="/clinics/new"
                    className="text-dental hover:underline"
                  >
                    医院を登録する
                  </a>
                </div>
              ) : (
                <GenerateForm
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
                      <p className="text-xs text-gray-400 mt-1">
                        {generatedContent.metaTitle.length}文字
                      </p>
                    </div>
                  )}

                  {generatedContent.metaDescription && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">メタディスクリプション</p>
                      <p className="text-sm">{generatedContent.metaDescription}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {generatedContent.metaDescription.length}文字
                      </p>
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

                  {generatedContent.faq && generatedContent.faq.length > 0 && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-bold mb-4">よくある質問</h3>
                      <div className="space-y-4">
                        {generatedContent.faq.map((item, index) => (
                          <div key={index} className="border-l-2 border-dental pl-4">
                            <p className="font-medium text-gray-900">{item.question}</p>
                            <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>設定を入力して記事を生成してください</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
