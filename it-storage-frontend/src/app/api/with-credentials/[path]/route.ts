// app/api/with-credentials/[...path]/route.ts
import { fetchBackend } from '@/app/utils/fetchBackend'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return handleProxyRequest(req)
}

export async function POST(req: NextRequest) {
  return handleProxyRequest(req)
}
export async function PUT(req: NextRequest) {
  return handleProxyRequest(req)
}
export async function PATCH(req: NextRequest) {
  return handleProxyRequest(req)
}
export async function DELETE(req: NextRequest) {
  return handleProxyRequest(req)
}
export async function OPTIONS(req: NextRequest) {
  return handleProxyRequest(req)
}


async function handleProxyRequest(req: NextRequest) {
  try {
    const path = decodeURIComponent(req.nextUrl.pathname.replace('/api/with-credentials/', ''))
    console.log('Proxying to path:', path)
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    // Get the request body content
    let bodyContent: BodyInit | null = null
    const contentType = req.headers.get('content-type') || ''

    if (req.body) {
      // For JSON or form data, read the body as text
      if (contentType.includes('application/json') || contentType.includes('application/x-www-form-urlencoded')) {
        bodyContent = await req.text()
      } 
      // For binary data or other types, use the raw body
      else {
        bodyContent = req.body
      }
    }

    // Forward the request with Authorization header
    const backendResponse = await fetchBackend(path, {
      method: req.method,
      headers: req.headers,
      body: bodyContent,
      // Add duplex option for streaming bodies
      ...(bodyContent instanceof ReadableStream ? { duplex: 'half' } : {})
    })

    // Handle different response types
    const responseContentType = backendResponse.headers.get('content-type')
    let responseData: any

    if (responseContentType?.includes('application/json')) {
      responseData = await backendResponse.json()
    } else {
      responseData = await backendResponse.text()
    }

    return NextResponse.json(responseData, {
      status: backendResponse.status,
      headers: {
        'content-type': responseContentType || 'application/json'
      }
    })
    
  } catch (error: any) {
    console.error('Proxy error:', error)
    
    if (error.message === 'Not authenticated' || error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401,
          headers: { 'X-Redirect-To': '/login' } 
        }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}