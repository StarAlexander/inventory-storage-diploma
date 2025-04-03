'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function usePageAccess() {
  const [accessState, setAccessState] = useState<{
    hasAccess: boolean | null
    isLoading: boolean,
    isAuthenticated:boolean
  }>({ hasAccess: null, isLoading: true, isAuthenticated:false })
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setAccessState(prev => ({ ...prev, isLoading: true }))
        // Skip check for public paths
        if (status === 'unauthenticated') {
          setAccessState({ hasAccess: true, isLoading: false,isAuthenticated:false })
          router.push('/login')
          return
        }
        if (pathname === '/login' || pathname === '/unauthorized') {
          setAccessState({ hasAccess: true, isLoading: false,isAuthenticated:true })
          return
        }

        // If not authenticated, no access
        

        // If authenticated, check permissions
        const response = await fetch(`/api/check-permission?path=${encodeURIComponent(pathname)}`)
        
        if (!response.ok) {
          throw new Error('Access check failed')
        }

        const { hasAccess } = await response.json()
        setAccessState({ hasAccess, isLoading: false,isAuthenticated:true })

        if (!hasAccess) {
          router.push('/unauthorized')
        }
      } catch (error) {
        console.error('Access check error:', error)
        router.push('/login')
      }
    }

    checkAccess()
  }, [pathname, router, status])

  return accessState
}