// app/api/access-check/route.ts
import { NextResponse } from 'next/server'
import { fetchBackend } from '@/app/utils/fetchBackend'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) {
    return NextResponse.json(
      { error: 'Path parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Get pages with authorization
    const pagesResponse = await fetchBackend('http://backend:8000/admin/pages')
    const pages = await pagesResponse.json()
    const page = pages.find((p: any) => p.path === path)

    if (!page) {
      return NextResponse.json({ hasAccess: true })
    }

    // Get user info with authorization
    const userResponse = await fetchBackend('http://backend:8000/me')
    const user = await userResponse.json()

    if (user.is_system) {
      return NextResponse.json({ hasAccess: true })
    }

    // Check permissions
    const requiredRightIds = page.required_rights.map((right: any) => right.id)
    const userRightIds = user.roles?.flatMap((role: any) => 
      role.rights.map((right: any) => right.id)
    ) || []

    const hasAccess = requiredRightIds.every((rightId: number) => 
      userRightIds.includes(rightId)
    )

    return NextResponse.json({ hasAccess })
  } catch (error: any) {
    console.error('Access check error:', error)
    
    if (error.message === 'Not authenticated' || error.message === 'Unauthorized') {
      return NextResponse.json({ hasAccess: false })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}