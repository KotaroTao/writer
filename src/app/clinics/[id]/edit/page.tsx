'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClinicForm } from '@/components/forms/clinic-form'
import { Button } from '@/components/ui/button'

interface Clinic {
  id: string
  name: string
  url: string
  address: string
  phone: string
  targetArea: string | null
  description: string | null
}

export default function EditClinicPage() {
  const router = useRouter()
  const params = useParams()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/clinics/${params.id}`)
      .then((res) => res.json())
      .then((data) => setClinic(data.data))
      .catch(console.error)
  }, [params.id])

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
      const response = await fetch(`/api/clinics/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update clinic')
      }

      router.push('/clinics')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('医院の更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この医院を削除しますか？関連する記事も削除されます。')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/clinics/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete clinic')
      }

      router.push('/clinics')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('医院の削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!clinic) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">医院情報の編集</h1>
        <p className="mt-1 text-gray-500">{clinic.name}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>医院情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ClinicForm
            defaultValues={{
              name: clinic.name,
              url: clinic.url,
              address: clinic.address,
              phone: clinic.phone,
              targetArea: clinic.targetArea || '',
              description: clinic.description || '',
            }}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="更新"
          />
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">危険な操作</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            この医院を削除すると、関連するすべての診療設定と記事も削除されます。
            この操作は取り消せません。
          </p>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            医院を削除
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
