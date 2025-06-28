import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // usersテーブルのデータを確認
    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })

    // profilesテーブルのデータを確認
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    // OTPログを取得
    const { data: otpLogs, error: otpError, count: otpCount } = await supabase
      .from('otp_logs')
      .select('*', { count: 'exact' })

    return NextResponse.json({
      status: 'success',
      data: {
        users: {
          count: usersCount,
          data: users || [],
          error: usersError
        },
        profiles: {
          count: profilesCount,
          data: profiles || [],
          error: profilesError
        },
        otp_logs: {
          count: otpCount,
          data: otpLogs || [],
          error: otpError
        },
        environment: {
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 