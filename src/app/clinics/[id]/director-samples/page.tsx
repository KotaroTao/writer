'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface DirectorSample {
  id: string
  title: string
  content: string
  note: string | null
  createdAt: string
}

interface Clinic {
  id: string
  name: string
}

export default function DirectorSamplesPage() {
  const params = useParams()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [samples, setSamples] = useState<DirectorSample[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    note: '',
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [clinicRes, samplesRes] = await Promise.all([
        fetch(`/api/clinics/${params.id}`),
        fetch(`/api/clinics/${params.id}/director-samples`),
      ])
      const clinicData = await clinicRes.json()
      const samplesData = await samplesRes.json()
      setClinic(clinicData.data)
      setSamples(samplesData.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '', note: '' })
    setEditingSampleId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      alert('タイトルと本文は必須です')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingSampleId
        ? `/api/clinics/${params.id}/director-samples/${editingSampleId}`
        : `/api/clinics/${params.id}/director-samples`
      const method = editingSampleId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save sample')
      }

      resetForm()
      await loadData()
    } catch (error) {
      console.error(error)
      alert('保存に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (sample: DirectorSample) => {
    setFormData({
      title: sample.title,
      content: sample.content,
      note: sample.note || '',
    })
    setEditingSampleId(sample.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (sampleId: string) => {
    if (!confirm('このサンプル記事を削除しますか？')) {
      return
    }

    try {
      const response = await fetch(
        `/api/clinics/${params.id}/director-samples/${sampleId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete sample')
      }

      await loadData()
    } catch (error) {
      console.error(error)
      alert('削除に失敗しました')
    }
  }

  if (isLoading || !clinic) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">院長モード設定</h1>
        <p className="mt-1 text-gray-500">{clinic.name}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {editingSampleId ? 'サンプル記事を編集' : '新しいサンプル記事を追加'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            院長が過去に書いた記事やブログを登録すると、その文体を学習して記事を生成します。
            2〜3件程度登録すると効果的です。
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="タイトル"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: 矯正治療について考えること"
            />
            <Textarea
              label="本文"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="院長が書いた記事の本文をここに貼り付けてください"
              rows={10}
            />
            <Input
              label="メモ（任意）"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="例: 2024年ブログ記事"
            />
            <div className="flex space-x-2">
              <Button type="submit" isLoading={isSubmitting}>
                {editingSampleId ? '更新' : '追加'}
              </Button>
              {editingSampleId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  キャンセル
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>登録済みサンプル記事</CardTitle>
        </CardHeader>
        <CardContent>
          {samples.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              サンプル記事がまだ登録されていません
            </p>
          ) : (
            <div className="space-y-4">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{sample.title}</h3>
                      {sample.note && (
                        <p className="text-xs text-gray-500 mt-1">{sample.note}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sample)}
                      >
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sample.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {sample.content.substring(0, 200)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {sample.content.length}文字
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">院長モードの使い方</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. 上記フォームから院長が書いた記事を2〜3件登録</li>
          <li>2. 記事生成画面で「院長モード」を選択</li>
          <li>3. 院長の文体を模倣した自然な記事が生成されます</li>
        </ul>
      </div>
    </div>
  )
}
