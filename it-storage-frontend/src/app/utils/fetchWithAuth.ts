// utils/fetchWithAuth.ts
import { getSession } from 'next-auth/react'

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession() as any
  const accessToken = session?.accessToken

  if (!accessToken) {
    throw new Error('Not authenticated')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(`http://localhost:3000/api/with-credentials/${encodeURIComponent(url)}`, {
    ...options,
    headers,
    credentials: 'include'
  })

  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  return response
}