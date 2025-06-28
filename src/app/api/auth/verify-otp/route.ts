import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp_code, purpose = 'login' } = body

    if (!email || !otp_code) {
      return NextResponse.json({
        status: 'error',
        message: 'メールアドレスとOTPコードが必要です'
      }, { status: 400 })
    }

    const supabase = createServerClient()

    // 開発環境では固定OTPコード（123456）を許可
    if (process.env.NODE_ENV === 'development' && otp_code === '123456') {
      console.log(`🔐 Development OTP verification for ${email}`)
    } else {
      // 本番環境では実際のOTPログをチェック（一時的に無効化）
      return NextResponse.json({
        status: 'error',
        message: '現在OTP検証は開発用コード（123456）のみ利用可能です'
      }, { status: 400 })
    }

    // ユーザー情報を取得
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        status
      `)
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        status: 'error',
        message: 'ユーザー情報が見つかりません'
      }, { status: 404 })
    }

    // ユーザーが有効かチェック
    if (user.status !== 'active') {
      return NextResponse.json({
        status: 'error',
        message: 'アカウントが無効です。管理者にお問い合わせください'
      }, { status: 403 })
    }

    // プロフィール情報も取得（あれば）
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .single()

    // JWTトークンを生成
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      displayName: profile?.display_name || user.email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    // レスポンスを作成
    const response = NextResponse.json({
      status: 'success',
      message: '認証が完了しました',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName: profile?.display_name || user.email,
          avatarUrl: profile?.avatar_url || null
        },
        token
      }
    })

    // HTTPOnlyクッキーにトークンを設定
    const isProduction = process.env.NODE_ENV === 'production'
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 // 24時間
    })

    response.cookies.set('user-role', user.role, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 // 24時間
    })

    return response

  } catch (error) {
    console.error('OTP検証エラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
} 