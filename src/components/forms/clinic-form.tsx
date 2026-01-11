'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const clinicSchema = z.object({
  name: z.string().min(1, '医院名は必須です'),
  url: z.string().url('有効なURLを入力してください'),
  address: z.string().min(1, '住所は必須です'),
  phone: z.string().min(1, '電話番号は必須です'),
  targetArea: z.string().optional(),
  description: z.string().optional(),
})

type ClinicFormData = z.infer<typeof clinicSchema>

interface ClinicFormProps {
  defaultValues?: Partial<ClinicFormData>
  onSubmit: (data: ClinicFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function ClinicForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = '保存',
}: ClinicFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="医院名"
        placeholder="〇〇歯科医院"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="ホームページURL"
        type="url"
        placeholder="https://example.com"
        error={errors.url?.message}
        {...register('url')}
      />

      <Input
        label="住所"
        placeholder="東京都〇〇区〇〇1-2-3"
        error={errors.address?.message}
        {...register('address')}
      />

      <Input
        label="電話番号"
        type="tel"
        placeholder="03-1234-5678"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        label="対策地域名（任意）"
        placeholder="〇〇市、〇〇区 など"
        error={errors.targetArea?.message}
        {...register('targetArea')}
      />

      <Textarea
        label="医院の特徴・説明（任意）"
        placeholder="医院の特徴や強みを入力してください"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
