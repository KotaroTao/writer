'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface GeneratedContent {
  id?: string
  title: string
  content: string
  metaTitle?: string
  metaDescription?: string
  faq?: Array<{ question: string; answer: string }>
  wordCount?: number
  outputFormat?: 'text' | 'html'
}

export default function GeneratePage() {
  const router = useRouter()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [categories, setCategories] = useState<TreatmentCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [currentOutputFormat, setCurrentOutputFormat] = useState<'text' | 'html'>('text')

  useEffect(() => {
    Promise.all([
      fetch('/api/clinics').then((res) => res.json()),
      fetch('/api/treatments').then((res) => res.json()),
    ]).then(([clinicsData, treatmentsData]) => {
      setClinics(clinicsData.data || [])
      setCategories(treatmentsData.data || [])
    })
  }, [])

  const handleSubmit = useCallback(async (data: {
    clinicId: string
    treatmentCategory: string
    keyword: string
    wordCount: number
    outputFormat: 'text' | 'html'
    includeFaq?: boolean
    includeMetaInfo?: boolean
  }) => {
    setIsLoading(true)
    setGeneratedContent(null)
    setStreamingContent('')
    setStatusMessage('記事を生成中...')
    setCurrentOutputFormat(data.outputFormat)

    try {
      const response = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate article')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(line => line.startsWith('data: '))

        for (const line of lines) {
          try {
            const jsonStr = line.slice(6) // Remove 'data: ' prefix
            const event = JSON.parse(jsonStr)

            switch (event.type) {
              case 'content':
                setStreamingContent(prev => prev + event.chunk)
                break
              case 'status':
                setStatusMessage(event.message)
                break
              case 'complete':
                setGeneratedContent(event.data)
                setStreamingContent('')
                setStatusMessage('')
                break
              case 'error':
                throw new Error(event.error)
            }
          } catch (e) {
            // Skip invalid JSON lines
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
    } catch (error) {
      console.error(error)
      alert('記事の生成に失敗しました')
      setStreamingContent('')
      setStatusMessage('')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSave = async () => {
    if (!generatedContent?.id) return
    router.push(`/articles/${generatedContent.id}`)
  }

  const handleCopy = () => {
    const content = generatedContent?.content || streamingContent
    if (content) {
      navigator.clipboard.writeText(content)
      alert('コピーしました')
    }
  }

  // Render content based on output format
  const renderContent = () => {
    const content = generatedContent?.content || streamingContent
    const format = generatedContent?.outputFormat || currentOutputFormat

    if (!content && !isLoading) {
      return (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>設定を入力して記事を生成してください</p>
        </div>
      )
    }

    // Extract title based on format
    let title: string = ''
    if (format === 'html') {
      const h1Match = content.match(/<h1[^>]*>(.+?)<\/h1>/i)
      const h2Match = content.match(/<h2[^>]*>(.+?)<\/h2>/i)
      title = generatedContent?.title || h1Match?.[1] || h2Match?.[1] || ''
    } else {
      const symbolMatch = content.match(/^[■◆●]\s*(.+)$/m)
      title = generatedContent?.title || symbolMatch?.[1] || ''
    }

    return (
      <div className="space-y-6">
        {/* Status message during streaming */}
        {isLoading && statusMessage && (
          <div className="flex items-center gap-2 p-3 bg-dental-light rounded-lg text-dental">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dental"></div>
            <span className="text-sm">{statusMessage}</span>
          </div>
        )}

        {/* Output format badge */}
        {(content || isLoading) && (
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${format === 'html' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              {format === 'html' ? 'HTML版' : 'テキスト版'}
            </span>
          </div>
        )}

        {/* Meta information (only after complete) */}
        {generatedContent?.metaTitle && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">SEOタイトル</p>
            <p className="text-sm font-medium">{generatedContent.metaTitle}</p>
            <p className="text-xs text-gray-400 mt-1">
              {generatedContent.metaTitle.length}文字
            </p>
          </div>
        )}

        {generatedContent?.metaDescription && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">メタディスクリプション</p>
            <p className="text-sm">{generatedContent.metaDescription}</p>
            <p className="text-xs text-gray-400 mt-1">
              {generatedContent.metaDescription.length}文字
            </p>
          </div>
        )}

        {/* Main content */}
        <div>
          {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}

          {format === 'html' ? (
            // HTML版: そのままHTMLとして表示
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            // テキスト版: preタグで整形表示
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
              {content}
            </pre>
          )}

          {isLoading && streamingContent && (
            <span className="animate-pulse">▊</span>
          )}
        </div>

        {/* Word count */}
        {(generatedContent?.wordCount || content.length > 0) && (
          <div className="text-xs text-gray-400 text-right">
            {generatedContent?.wordCount || content.replace(/\s/g, '').length}文字
          </div>
        )}

        {/* FAQ section (only after complete) */}
        {generatedContent?.faq && generatedContent.faq.length > 0 && (
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
    )
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
                <div className="flex gap-2">
                  {(generatedContent?.content || streamingContent) && (
                    <button
                      onClick={handleCopy}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      コピー
                    </button>
                  )}
                  {generatedContent?.id && (
                    <button
                      onClick={handleSave}
                      className="text-sm text-dental hover:underline"
                    >
                      記事を確認
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
