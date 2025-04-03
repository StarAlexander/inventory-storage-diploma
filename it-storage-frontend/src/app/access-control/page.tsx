// app/admin/access-control/page.tsx
'use client'
import { PageAccessControl } from '@/components/admin/PageAccessControl'
import { usePageAccess } from '@/hooks/usePageAccess'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccessControlPage() {
  const { hasAccess, isLoading } = usePageAccess()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push('/unauthorized')
    }
  }, [hasAccess, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка прав доступа...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <PageAccessControl />
    </div>
  )
}