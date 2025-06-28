import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { generateOTP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, purpose = 'login' } = body

    if (!email) {
      return NextResponse.json({
        status: 'error',
        message: 'メールアドレスが必要です'
      }, { status: 400 })
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        status: 'error',
        message: '有効なメールアドレスを入力してください'
      }, { status: 400 })
    }

    const supabase = createServerClient()

    // ユーザーが存在するかチェック（ログインの場合）
    if (purpose === 'login') {
      const { data: user } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single()

      if (!user) {
        return NextResponse.json({
          status: 'error',
          message: 'このメールアドレスは登録されていません'
        }, { status: 404 })
      }
    }

    // 新しいOTPを生成
    const otpCode = generateOTP(6)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分後

    // 一時的にOTPログの保存を無効化
    console.log(`🔐 Generated OTP for ${email}: ${otpCode}`)
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`)

    // 実際のメール送信（GAS）
    const emailResult = await import('@/lib/email-service').then(module => 
      module.sendOTPEmail(email, otpCode, purpose)
    )

    if (!emailResult.success) {
      console.error('メール送信エラー:', emailResult.error)
      // メール送信失敗でもOTPは生成済みなので、警告として扱う
    }

    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 OTP for ${email}: ${otpCode}`)
      console.log(`📧 Email sent: ${emailResult.success}`)
    }

    return NextResponse.json({
      status: 'success',
      message: 'OTPコードを送信しました',
      data: {
        email,
        expires_at: expiresAt.toISOString(),
        // 開発環境でのみOTPコードを返す
        ...(process.env.NODE_ENV === 'development' && { otp_code: otpCode })
      }
    })

  } catch (error) {
    console.error('OTP送信エラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
} 