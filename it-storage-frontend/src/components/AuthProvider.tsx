'use client'

import { usePageAccess } from '@/hooks/usePageAccess'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const {hasAccess,isLoading,isAuthenticated} = usePageAccess()

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/login') {
      router.replace('/login')
    }
  }, [status, pathname, router])

  useEffect(()=> {
    if (!hasAccess && !isLoading && isAuthenticated) router.replace('/unauthorized')
    else if (!hasAccess && !isLoading && !isAuthenticated) router.replace('/login')
  },[hasAccess,isLoading,router,isAuthenticated])

  if (status === 'loading') {
    return <div>Загрузка...</div>
  }
  if (isLoading) {
    return <div>Проверка прав пользователя...</div>
  }

  return <>{children}</>
}