'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TreatmentCategory {
  id: string
  name: string
  defaultPriorities: string
}

interface ClinicTreatment {
  id: string
  categoryId: string
  priorities: string
  enabled: boolean
  category: TreatmentCategory
}

interface Clinic {
  id: string
  name: string
  treatments: ClinicTreatment[]
}

export default function ClinicTreatmentsPage() {
  const params = useParams()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [categories, setCategories] = useState<TreatmentCategory[]>([])
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [editingPriorities, setEditingPriorities] = useState<Record<string, string[]>>({})

  useEffect(() => {
    Promise.all([
      fetch(`/api/clinics/${params.id}`).then((res) => res.json()),
      fetch('/api/treatments').then((res) => res.json()),
    ]).then(([clinicData, treatmentsData]) => {
      setClinic(clinicData.data)
      setCategories(treatmentsData.data || [])

      // 初期の優先設定をセット
      const priorities: Record<string, string[]> = {}
      clinicData.data?.treatments?.forEach((t: ClinicTreatment) => {
        priorities[t.categoryId] = JSON.parse(t.priorities || '[]')
      })
      setEditingPriorities(priorities)
    })
  }, [params.id])

  const getClinicTreatment = (categoryId: string) => {
    return clinic?.treatments?.find((t) => t.categoryId === categoryId)
  }

  const toggleTreatment = async (categoryId: string, enabled: boolean) => {
    setIsLoading(categoryId)
    try {
      await fetch(`/api/clinics/${params.id}/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          enabled,
          priorities: editingPriorities[categoryId] || [],
        }),
      })

      // リロード
      const response = await fetch(`/api/clinics/${params.id}`)
      const data = await response.json()
      setClinic(data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(null)
    }
  }

  const savePriorities = async (categoryId: string) => {
    setIsLoading(categoryId)
    try {
      await fetch(`/api/clinics/${params.id}/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          enabled: true,
          priorities: editingPriorities[categoryId] || [],
        }),
      })

      alert('優先設定を保存しました')
    } catch (error) {
      console.error(error)
      alert('保存に失敗しました')
    } finally {
      setIsLoading(null)
    }
  }

  const updatePriority = (categoryId: string, index: number, value: string) => {
    setEditingPriorities((prev) => {
      const current = [...(prev[categoryId] || [])]
      current[index] = value
      return { ...prev, [categoryId]: current }
    })
  }

  const addPriority = (categoryId: string) => {
    setEditingPriorities((prev) => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), ''],
    }))
  }

  const removePriority = (categoryId: string, index: number) => {
    setEditingPriorities((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter((_, i) => i !== index),
    }))
  }

  if (!clinic) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">診療項目設定</h1>
        <p className="mt-1 text-gray-500">{clinic.name}</p>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const treatment = getClinicTreatment(category.id)
          const isEnabled = treatment?.enabled ?? false
          const priorities = editingPriorities[category.id] ||
            (treatment ? JSON.parse(treatment.priorities || '[]') : JSON.parse(category.defaultPriorities || '[]'))

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{category.name}</CardTitle>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => toggleTreatment(category.id, e.target.checked)}
                      disabled={isLoading === category.id}
                      className="h-4 w-4 rounded border-gray-300 text-dental focus:ring-dental"
                    />
                    <span className="text-sm text-gray-600">有効</span>
                  </label>
                </div>
              </CardHeader>
              {isEnabled && (
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    優先的に盛り込む内容を設定してください（上から優先度が高い）
                  </p>
                  <div className="space-y-2">
                    {priorities.map((priority: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
                        <Input
                          value={priority}
                          onChange={(e) => updatePriority(category.id, index, e.target.value)}
                          placeholder="例: 治療期間、費用、実績など"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePriority(category.id, index)}
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPriority(category.id)}
                      >
                        項目を追加
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => savePriorities(category.id)}
                        isLoading={isLoading === category.id}
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
