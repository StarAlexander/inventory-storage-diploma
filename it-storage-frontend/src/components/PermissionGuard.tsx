'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/app/utils/fetchWithAuth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PermissionGuardProps {
  requiredRight: string
  children: React.ReactNode
}

export function PermissionGuard({ requiredRight, children }: PermissionGuardProps) {
  const router = useRouter()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  useEffect(() => {
    const checkPermission = async () => {
      try {
        // First get current user
        const userResponse = await fetchWithAuth('http://backend:8000/me')
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user')
        }

        const user = await userResponse.json()
        setIsAdmin(user.is_system)

        // Admin bypass
        if (user.is_system) {
          setHasPermission(true)
          return
        }

        // Check permission
        const permissionResponse = await fetchWithAuth('/api/check-permission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ right: requiredRight }),
        })

        if (!permissionResponse.ok) {
          throw new Error('Permission check failed')
        }

        const { hasPermission } = await permissionResponse.json()
        setHasPermission(hasPermission)

        if (!hasPermission) {
          router.push('/unauthorized')
        }
      } catch (error) {
        console.error('Permission check error:', error)
        router.push('/login')
      }
    }

    checkPermission()
  }, [requiredRight, router])

  if (hasPermission === null) {
    return <LoadingSpinner />
  }

  if (!hasPermission && !isAdmin) {
    return null // The redirect will happen in the useEffect
  }

  return <>{children}</>
}