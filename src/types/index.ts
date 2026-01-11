// 医院情報
export interface Clinic {
  id: string
  name: string
  url: string
  address: string
  phone: string
  targetArea: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
  treatments?: ClinicTreatment[]
}

// 診療項目カテゴリ
export interface TreatmentCategory {
  id: string
  name: string
  description: string | null
  defaultPriorities: string[] // JSON parsed
  createdAt: Date
}

// 医院別診療設定
export interface ClinicTreatment {
  id: string
  clinicId: string
  categoryId: string
  priorities: string[] // JSON parsed
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  category?: TreatmentCategory
}

// 生成記事
export interface Article {
  id: string
  clinicId: string | null
  title: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
  keywords: string[] // JSON parsed
  wordCount: number
  articleType: 'seo' | 'summary' | 'faq'
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  clinic?: Clinic
}

// まとめ記事
export interface SummaryArticle {
  id: string
  title: string
  content: string
  area: string
  category: string
  clinicIds: string[] // JSON parsed
  metaTitle: string | null
  metaDescription: string | null
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
}

// 記事生成リクエスト
export interface GenerateArticleRequest {
  clinicId: string
  keyword: string
  treatmentCategory: string
  wordCount: number
  includeFaq?: boolean
  includeMetaInfo?: boolean
}

// まとめ記事生成リクエスト
export interface GenerateSummaryRequest {
  area: string
  category: string
  clinicIds: string[]
  title?: string
  wordCount?: number
}

// API レスポンス
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// フォーム用
export interface ClinicFormData {
  name: string
  url: string
  address: string
  phone: string
  targetArea?: string
  description?: string
}

export interface TreatmentFormData {
  name: string
  description?: string
  defaultPriorities: string[]
}
