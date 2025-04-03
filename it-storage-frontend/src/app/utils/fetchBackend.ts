// utils/fetchBackend.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '../authOptions'

export async function fetchBackend(
  path: string,
  options: RequestInit = {},
  serverSession?: any
) {
  // Get session (either passed in or fetched fresh)
  const session = serverSession || await getServerSession(authOptions as any)
  const accessToken = session?.accessToken

  if (!accessToken) {
    throw new Error('Not authenticated')
  }
  
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(path, {
    ...options,
    headers
  })

  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || 'Request failed')
  }

  return response
}