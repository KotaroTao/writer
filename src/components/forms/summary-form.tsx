'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const summarySchema = z.object({
  area: z.string().min(1, '地域名を入力してください'),
  category: z.string().min(1, '診療項目を選択してください'),
  clinicCount: z.coerce.number().min(3).max(10),
})

type SummaryFormData = z.infer<typeof summarySchema>

interface Clinic {
  id: string
  name: string
  address: string
}

interface TreatmentCategory {
  id: string
  name: string
}

interface SummaryFormProps {
  clinics: Clinic[]
  treatmentCategories: TreatmentCategory[]
  onSubmit: (data: SummaryFormData & { clinicIds: string[] }) => Promise<void>
  isLoading?: boolean
}

export function SummaryForm({
  clinics,
  treatmentCategories,
  onSubmit,
  isLoading,
}: SummaryFormProps) {
  const [selectedClinics, setSelectedClinics] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      clinicCount: 7,
    },
  })

  const categoryOptions = [
    { value: '', label: '診療項目を選択' },
    ...treatmentCategories.map((c) => ({ value: c.name, label: c.name })),
  ]

  const countOptions = [
    { value: '3', label: '3選' },
    { value: '5', label: '5選' },
    { value: '7', label: '7選' },
    { value: '10', label: '10選' },
  ]

  const toggleClinic = (clinicId: string) => {
    setSelectedClinics((prev) =>
      prev.includes(clinicId)
        ? prev.filter((id) => id !== clinicId)
        : [...prev, clinicId]
    )
  }

  const handleFormSubmit = (data: SummaryFormData) => {
    if (selectedClinics.length < 3) {
      alert('少なくとも3つの医院を選択してください')
      return
    }
    onSubmit({ ...data, clinicIds: selectedClinics })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="対象地域"
        placeholder="例: 渋谷区、新宿市"
        error={errors.area?.message}
        {...register('area')}
      />

      <Select
        label="診療項目"
        options={categoryOptions}
        error={errors.category?.message}
        {...register('category')}
      />

      <Select
        label="紹介医院数"
        options={countOptions}
        error={errors.clinicCount?.message}
        {...register('clinicCount')}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          対象医院を選択（{selectedClinics.length}件選択中）
        </label>
        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
          {clinics.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              登録された医院がありません
            </p>
          ) : (
            clinics.map((clinic) => (
              <label
                key={clinic.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={selectedClinics.includes(clinic.id)}
                  onChange={() => toggleClinic(clinic.id)}
                  className="h-4 w-4 rounded border-gray-300 text-dental focus:ring-dental"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{clinic.name}</p>
                  <p className="text-xs text-gray-500">{clinic.address}</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          size="lg"
          disabled={selectedClinics.length < 3}
        >
          まとめ記事を生成
        </Button>
      </div>
    </form>
  )
}
