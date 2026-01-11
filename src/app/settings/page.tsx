'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TreatmentCategory {
  id: string
  name: string
  description: string | null
  defaultPriorities: string
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<TreatmentCategory[]>([])
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/treatments')
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
  }, [])

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('診療項目名を入力してください')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      })

      if (!response.ok) {
        throw new Error('Failed to add category')
      }

      const result = await response.json()
      setCategories([...categories, result.data])
      setNewCategory({ name: '', description: '' })
    } catch (error) {
      console.error(error)
      alert('診療項目の追加に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('この診療項目を削除しますか？')) {
      return
    }

    try {
      const response = await fetch(`/api/treatments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      setCategories(categories.filter((c) => c.id !== id))
    } catch (error) {
      console.error(error)
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="mt-1 text-gray-500">診療項目やシステム設定を管理します</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>診療項目管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              新しい診療項目を追加できます。追加した項目は医院ごとの設定で使用できます。
            </p>
            <div className="flex gap-4">
              <Input
                placeholder="診療項目名（例：予防歯科）"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="説明（任意）"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="flex-1"
              />
              <Button onClick={handleAddCategory} isLoading={isLoading}>
                追加
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">登録済み診療項目</p>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API設定</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            OpenAI APIキーは環境変数（OPENAI_API_KEY）で設定してください。
          </p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <code className="text-sm">OPENAI_API_KEY=sk-xxxxx</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
