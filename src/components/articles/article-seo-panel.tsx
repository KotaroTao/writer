'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { SeoScoreCard } from '@/components/seo/seo-score-card'

interface ArticleSeoPanelProps {
  content: string
  title: string
  metaTitle?: string
  metaDescription?: string
  defaultKeyword?: string
}

export function ArticleSeoPanel({
  content,
  title,
  metaTitle,
  metaDescription,
  defaultKeyword = '',
}: ArticleSeoPanelProps) {
  const [keyword, setKeyword] = useState(defaultKeyword)

  return (
    <div className="space-y-4">
      <div>
        <Input
          label="分析キーワード"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例: 渋谷 インプラント"
        />
        <p className="text-xs text-gray-400 mt-1">
          SEOスコアを計算するキーワードを入力
        </p>
      </div>

      {keyword && (
        <SeoScoreCard
          content={content}
          title={title}
          keyword={keyword}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
        />
      )}
    </div>
  )
}
