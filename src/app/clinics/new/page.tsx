'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClinicForm } from '@/components/forms/clinic-form'

export default function NewClinicPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: {
    name: string
    url: string
    address: string
    phone: string
    targetArea?: string
    description?: string
  }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create clinic')
      }

      // 成功メッセージを表示
      alert(`「${data.name}」を登録しました`)

      // ページを更新してから遷移
      router.refresh()
      router.push('/clinics')
    } catch (error) {
      console.error(error)
      alert('医院の登録に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">新規医院登録</h1>
        <p className="mt-1 text-gray-500">新しい医院の情報を入力してください</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>医院情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="登録"
          />
        </CardContent>
      </Card>
    </div>
  )
}
