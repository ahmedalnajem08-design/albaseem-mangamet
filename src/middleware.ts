import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Handle WhatsApp proxy requests
  if (request.nextUrl.pathname.startsWith('/api/wa/')) {
    const path = request.nextUrl.pathname.replace('/api/wa/', '/api/');
    const railwayUrl = `https://albaseem-whatsapp-production.up.railway.app${path}`;
    
    console.log('[Middleware] Proxying to:', railwayUrl);
    
    try {
      const body = request.method !== 'GET' ? await request.text() : undefined;
      
      const response = await fetch(railwayUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body || undefined,
      });
      
      const data = await response.json();
      console.log('[Middleware] Response:', data);
      
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    } catch (error: any) {
      console.error('[Middleware] Error:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Proxy error'
      }, { status: 500 });
    }
  }
  
  // Allow API routes without authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // If Supabase is not configured, just continue without session handling
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === 'https://your-project.supabase.co' || 
      supabaseKey === 'your-anon-key-here') {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  // For now, just allow all requests (no auth required)
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
