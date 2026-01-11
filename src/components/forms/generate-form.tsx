'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const generateSchema = z.object({
  clinicId: z.string().min(1, '医院を選択してください'),
  treatmentCategory: z.string().min(1, '診療項目を選択してください'),
  keyword: z.string().min(1, 'キーワードを入力してください'),
  wordCount: z.coerce.number().min(150).max(20000),
  outputFormat: z.enum(['text', 'html']),
  articleStyle: z.enum(['standard', 'director']),
  includeFaq: z.boolean().optional(),
  includeMetaInfo: z.boolean().optional(),
})

type GenerateFormData = z.infer<typeof generateSchema>

interface Clinic {
  id: string
  name: string
  hasDirectorSamples?: boolean
}

interface TreatmentCategory {
  id: string
  name: string
}

interface GenerateFormProps {
  clinics: Clinic[]
  treatmentCategories: TreatmentCategory[]
  onSubmit: (data: GenerateFormData) => Promise<void>
  isLoading?: boolean
}

export function GenerateForm({
  clinics,
  treatmentCategories,
  onSubmit,
  isLoading,
}: GenerateFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      wordCount: 1500,
      outputFormat: 'text',
      articleStyle: 'standard',
      includeFaq: true,
      includeMetaInfo: true,
    },
  })

  const selectedClinicId = watch('clinicId')
  const selectedStyle = watch('articleStyle')
  const selectedClinic = clinics.find((c) => c.id === selectedClinicId)

  const clinicOptions = [
    { value: '', label: '医院を選択' },
    ...clinics.map((c) => ({ value: c.id, label: c.name })),
  ]

  const categoryOptions = [
    { value: '', label: '診療項目を選択' },
    ...treatmentCategories.map((c) => ({ value: c.name, label: c.name })),
  ]

  const wordCountOptions = [
    { value: '150', label: '150文字（短文）' },
    { value: '500', label: '500文字' },
    { value: '1000', label: '1000文字' },
    { value: '1300', label: '1300文字（Instagram）' },
    { value: '1500', label: '1500文字（標準）' },
    { value: '2000', label: '2000文字' },
    { value: '3000', label: '3000文字' },
    { value: '5000', label: '5000文字' },
    { value: '10000', label: '10000文字' },
    { value: '20000', label: '20000文字（長文）' },
  ]

  const outputFormatOptions = [
    { value: 'text', label: 'テキスト版（プレーンテキスト）' },
    { value: 'html', label: 'HTML版（WordPress等向け）' },
  ]

  const articleStyleOptions = [
    { value: 'standard', label: '標準モード' },
    { value: 'director', label: '院長モード（文体模倣）' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Select
        label="医院"
        options={clinicOptions}
        error={errors.clinicId?.message}
        {...register('clinicId')}
      />

      <Select
        label="診療項目"
        options={categoryOptions}
        error={errors.treatmentCategory?.message}
        {...register('treatmentCategory')}
      />

      <Input
        label="対策キーワード"
        placeholder="例: 渋谷 インプラント おすすめ"
        error={errors.keyword?.message}
        {...register('keyword')}
      />

      <Select
        label="文字数"
        options={wordCountOptions}
        error={errors.wordCount?.message}
        {...register('wordCount')}
      />

      <Select
        label="出力形式"
        options={outputFormatOptions}
        error={errors.outputFormat?.message}
        {...register('outputFormat')}
      />

      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-medium mb-1">出力形式について:</p>
        <ul className="space-y-1 ml-2">
          <li>• <strong>テキスト版</strong>: シンプルな文字だけの形式。メールやSNS投稿に最適</li>
          <li>• <strong>HTML版</strong>: WordPressなどに貼り付けて見栄えの良いページが作成可能</li>
        </ul>
      </div>

      <Select
        label="記事スタイル"
        options={articleStyleOptions}
        error={errors.articleStyle?.message}
        {...register('articleStyle')}
      />

      {selectedStyle === 'director' && selectedClinic && !selectedClinic.hasDirectorSamples && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p className="font-medium mb-1">サンプル記事が未登録です</p>
          <p>
            院長モードを使用するには、まず医院管理から「院長モード」設定でサンプル記事を登録してください。
            サンプルがない場合、標準モードで生成されます。
          </p>
        </div>
      )}

      {selectedStyle === 'director' && (
        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
          <p className="font-medium mb-1">院長モードについて:</p>
          <ul className="space-y-1 ml-2">
            <li>• 登録されたサンプル記事の文体を学習して模倣します</li>
            <li>• AIっぽい表現を排除し、院長本人が書いたような自然な文章に</li>
            <li>• SEO要素は維持したまま、個性的な記事を生成</li>
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-dental focus:ring-dental"
            {...register('includeFaq')}
          />
          <span className="text-sm text-gray-700">FAQを含める</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-dental focus:ring-dental"
            {...register('includeMetaInfo')}
          />
          <span className="text-sm text-gray-700">メタ情報を生成</span>
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading} size="lg">
          記事を生成
        </Button>
      </div>
    </form>
  )
}
