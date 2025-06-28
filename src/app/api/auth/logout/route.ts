import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      status: 'success',
      message: 'ログアウトしました'
    })

    // 認証クッキーを削除
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // 即座に削除
    })

    response.cookies.set('user-role', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // 即座に削除
    })

    return response

  } catch (error) {
    console.error('ログアウトエラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
} 