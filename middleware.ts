// Next.js Middleware
// TODO: Implement authentication and authorization middleware 

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証が必要なルート
const protectedRoutes = [
  '/posts',
  '/profile',
  '/bookmarks',
  '/notifications',
  '/admin'
]

// 認証済みユーザーがアクセスできないルート
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/otp'
]

// 管理者専用ルート
const adminRoutes = [
  '/admin'
]

// パブリックルート（認証不要）
const publicRoutes = [
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-otp'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 静的ファイルとNext.js内部ルートはスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // 認証トークンの取得
  const authToken = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value

  // デバッグログ（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - Token: ${authToken ? 'Present' : 'None'} - Role: ${userRole || 'None'}`)
  }

  // トークンの検証
  const isAuthenticated = await isValidToken(authToken)
  const isAdmin = userRole === 'admin'

  // 1. 管理者専用ルートの保護
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return redirectToLogin(request, pathname)
    }
    if (!isAdmin) {
      return redirectWithError(request, '/', 'このページにアクセスする権限がありません。')
    }
    return NextResponse.next()
  }

  // 2. 保護されたルートの認証チェック
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return redirectToLogin(request, pathname)
    }
    return NextResponse.next()
  }

  // 3. 認証済みユーザーの認証ページアクセス制限
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 4. パブリックルートまたは未定義ルート
  return NextResponse.next()
}

// トークンの有効性を検証
async function isValidToken(token?: string): Promise<boolean> {
  if (!token) return false
  
  try {
    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    )
    
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch (error) {
    console.error('[Middleware] Token validation error:', error)
    return false
  }
}

// ログインページにリダイレクト
function redirectToLogin(request: NextRequest, intendedPath?: string) {
  const loginUrl = new URL('/auth/login', request.url)
  
  if (intendedPath && intendedPath !== '/') {
    loginUrl.searchParams.set('redirect', intendedPath)
  }
  
  return NextResponse.redirect(loginUrl)
}

// エラーメッセージ付きリダイレクト
function redirectWithError(request: NextRequest, path: string, message: string) {
  const redirectUrl = new URL(path, request.url)
  redirectUrl.searchParams.set('error', message)
  
  return NextResponse.redirect(redirectUrl)
}

// APIルートの認証ヘルパー
export async function requireAuth(request: NextRequest): Promise<{ 
  isAuthenticated: boolean
  user?: { id: string, role: string, email: string }
  error?: string 
}> {
  const authToken = request.cookies.get('auth-token')?.value
  
  if (!authToken || !(await isValidToken(authToken))) {
    return { 
      isAuthenticated: false, 
      error: 'Authentication required' 
    }
  }

  try {
    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    )
    
    const { payload } = await jwtVerify(authToken, JWT_SECRET)
    
    const user = {
      id: payload.userId as string,
      role: payload.role as string,
      email: payload.email as string
    }

    return {
      isAuthenticated: true,
      user
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Invalid token'
    }
  }
}

// 管理者権限チェック
export async function requireAdmin(request: NextRequest) {
  const authResult = await requireAuth(request)
  
  if (!authResult.isAuthenticated) {
    return { ...authResult, isAdmin: false }
  }

  const isAdmin = authResult.user?.role === 'admin'
  
  return {
    ...authResult,
    isAdmin,
    error: !isAdmin ? 'Admin access required' : undefined
  }
}

// ミドルウェアを適用するパスの設定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 