'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ArticleActionsProps {
  articleId: string
  content: string
  status: string
}

export function ArticleActions({ articleId, content, status }: ArticleActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    alert('コピーしました')
  }

  const handleToggleStatus = async () => {
    setIsUpdating(true)
    try {
      const newStatus = status === 'published' ? 'draft' : 'published'
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error(error)
      alert('更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この記事を削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/articles')
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error(error)
      alert('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy}>
        コピー
      </Button>
      <Link href={`/articles/${articleId}/edit`}>
        <Button variant="outline" size="sm">
          編集
        </Button>
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleStatus}
        disabled={isUpdating}
      >
        {isUpdating ? '更新中...' : status === 'published' ? '非公開にする' : '公開する'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 hover:border-red-300"
      >
        {isDeleting ? '削除中...' : '削除'}
      </Button>
    </div>
  )
}
