import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/authOptions'

export async function checkPageAccess(pathname: string) {
  const session = await getServerSession(authOptions as any) as any
  
  // Public paths
  if (publicPaths.includes(pathname)) {
    return {
      hasAccess: true,
      isAuthenticated: !!session?.user
    }
  }

  // Not authenticated
  if (!session?.user) {
    return {
      hasAccess: false,
      isAuthenticated: false
    }
  }

  // For authenticated users, all pages are accessible
  // Move permission checks to client-side or specific pages
  return {
    hasAccess: true,
    isAuthenticated: true
  }
}

const publicPaths = ['/login', '/unauthorized']