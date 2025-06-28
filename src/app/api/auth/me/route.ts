import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function GET(request: NextRequest) {
  try {
    // クッキーからJWTトークンを取得
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json({
        status: 'error',
        message: '認証が必要です'
      }, { status: 401 })
    }

    // JWTトークンを検証
    const { payload } = await jwtVerify(authToken, JWT_SECRET)

    // Supabaseからユーザー情報を取得
    const supabase = createServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', payload.userId as string)
      .single()

    return NextResponse.json({
      status: 'success',
      data: {
        user: {
          id: payload.userId as string,
          email: payload.email as string,
          role: payload.role as string,
          displayName: profile?.display_name || (payload.displayName as string)
        }
      }
    })

  } catch (error) {
    console.error('認証状態チェックエラー:', error)
    return NextResponse.json({
      status: 'error',
      message: '認証エラーが発生しました'
    }, { status: 401 })
  }
} 