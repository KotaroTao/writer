'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SeoAnalysisResult } from '@/lib/seo-analyzer'
import { getScoreGrade } from '@/lib/seo-analyzer'

interface SeoScoreCardProps {
  content: string
  title: string
  keyword: string
  metaTitle?: string
  metaDescription?: string
}

export function SeoScoreCard({
  content,
  title,
  keyword,
  metaTitle,
  metaDescription,
}: SeoScoreCardProps) {
  const [analysis, setAnalysis] = useState<SeoAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const analyze = async () => {
    if (!content || !title || !keyword) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/seo-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, keyword, metaTitle, metaDescription }),
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysis(result.data)
      }
    } catch (error) {
      console.error('Failed to analyze SEO:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (content && title && keyword) {
      analyze()
    }
  }, [content, title, keyword, metaTitle, metaDescription])

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEOスコア</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-dental"></div>
              <span className="ml-2 text-gray-500 text-sm">分析中...</span>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">キーワードを入力して分析</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const grade = getScoreGrade(analysis.overallScore)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">SEOスコア</CardTitle>
          <Button variant="outline" size="sm" onClick={analyze} disabled={isLoading}>
            {isLoading ? '分析中...' : '再分析'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 全体スコア */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={
                  analysis.overallScore >= 75
                    ? '#22c55e'
                    : analysis.overallScore >= 50
                    ? '#eab308'
                    : '#ef4444'
                }
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(analysis.overallScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${grade.color}`}>
                {analysis.overallScore}
              </span>
              <span className="text-xs text-gray-500">{grade.label}</span>
            </div>
          </div>
        </div>

        {/* 項目別スコア */}
        <div className="space-y-3 mb-4">
          <ScoreBar
            label="タイトル"
            score={analysis.details.titleScore.score}
          />
          <ScoreBar
            label="メタ情報"
            score={analysis.details.metaScore.score}
          />
          <ScoreBar
            label="コンテンツ"
            score={analysis.details.contentScore.score}
          />
          <ScoreBar
            label="キーワード"
            score={analysis.details.keywordScore.score}
          />
          <ScoreBar
            label="読みやすさ"
            score={analysis.details.readabilityScore.score}
          />
          <ScoreBar
            label="構造"
            score={analysis.details.structureScore.score}
          />
        </div>

        {/* 改善提案 */}
        {analysis.suggestions.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-sm text-gray-700 hover:text-gray-900"
            >
              <span className="font-medium">
                改善提案 ({analysis.suggestions.length}件)
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isExpanded && (
              <ul className="mt-2 space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 詳細情報 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>
              <span>文字数: </span>
              <span className="font-medium text-gray-700">
                {analysis.details.contentScore.wordCount}
              </span>
            </div>
            <div>
              <span>キーワード密度: </span>
              <span className="font-medium text-gray-700">
                {analysis.details.keywordScore.density}%
              </span>
            </div>
            <div>
              <span>H2見出し: </span>
              <span className="font-medium text-gray-700">
                {analysis.details.structureScore.h2Count}個
              </span>
            </div>
            <div>
              <span>漢字率: </span>
              <span className="font-medium text-gray-700">
                {analysis.details.readabilityScore.kanjiRatio}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getBarColor = (score: number) => {
    if (score >= 75) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-700">{score}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
