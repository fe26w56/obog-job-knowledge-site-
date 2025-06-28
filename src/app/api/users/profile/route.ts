import { NextRequest, NextResponse } from 'next/server'

// 認証チェック用ヘルパー関数
function requireAuth(request: NextRequest): { 
  isAuthenticated: boolean
  user?: { id: string, role: string, email: string }
  error?: string 
} {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      isAuthenticated: false, 
      error: 'Authorization header required' 
    }
  }

  const token = authHeader.replace('Bearer ', '')
  
  if (!token || token === 'undefined' || token === 'dummy-token') {
    // 開発環境での簡易実装
    const mockUser = {
      id: 'user_123',
      role: 'obog', // デフォルトでOBOGとして設定
      email: 'user@example.com'
    }

    return {
      isAuthenticated: true,
      user: mockUser
    }
  }

  // TODO: 実際のJWT検証
  // const decoded = jwt.verify(token, process.env.JWT_SECRET)
  // return { isAuthenticated: true, user: decoded }

  return { 
    isAuthenticated: false, 
    error: 'Invalid token' 
  }
}

// プロフィール情報の取得
export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request)
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const userId = authResult.user?.id

    // TODO: Supabaseからユーザー情報を取得
    // const { data: profile, error } = await supabase
    //   .from('profiles')
    //   .select(`
    //     *,
    //     users!inner(email, role, created_at)
    //   `)
    //   .eq('user_id', userId)
    //   .single()

    // if (error) {
    //   throw new Error(error.message)
    // }

    // 模擬データ（開発用）
    const mockProfile = {
      id: userId,
      fullName: '田中太郎',
      email: authResult.user?.email || 'user@example.com',
      avatarUrl: null,
      university: '東京大学',
      department: '経済学部',
      graduationYear: 2024,
      role: authResult.user?.role || 'current',
      company: authResult.user?.role === 'obog' ? '株式会社サンプル' : null,
      position: authResult.user?.role === 'obog' ? 'ソフトウェアエンジニア' : null,
      bio: '学生時代は学生団体で活動し、後輩の就活支援に取り組んでいます。',
      // ログイン用emailと同じものをコンタクト用にも使用
      contactEmail: authResult.user?.email || 'user@example.com',
      contactPhone: '090-1234-5678',
      snsLinks: {
        twitter: 'user_twitter',
        linkedin: 'user-linkedin',
        github: 'user-github'
      },
      isContactPublic: false,
      stats: {
        postsCount: 12,
        likesReceived: 89,
        commentsCount: 34
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockProfile
    })

  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    return NextResponse.json(
      { error: 'プロフィール情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// プロフィール情報の更新
export async function PUT(request: NextRequest) {
  try {
    const authResult = requireAuth(request)
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const userId = authResult.user?.id
    const body = await request.json()

    // バリデーション
    const allowedFields = [
      'fullName',
      'university',
      'department', 
      'graduationYear',
      'company',
      'position',
      'bio',
      'contactEmail',
      'contactPhone',
      'snsLinks',
      'isContactPublic'
    ]

    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // contactEmailが更新された場合、ログイン用emailも同期
    if (updateData.contactEmail) {
      updateData.email = updateData.contactEmail
    }

    // 入力値検証
    if (updateData.fullName && (typeof updateData.fullName !== 'string' || updateData.fullName.length < 1)) {
      return NextResponse.json(
        { error: '氏名は必須です' },
        { status: 400 }
      )
    }

    if (updateData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.contactEmail)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      )
    }

    if (updateData.graduationYear && (typeof updateData.graduationYear !== 'number' || updateData.graduationYear < 2020 || updateData.graduationYear > 2030)) {
      return NextResponse.json(
        { error: '卒業年度は2020-2030年の範囲で入力してください' },
        { status: 400 }
      )
    }

    // TODO: Supabaseでプロフィールを更新
    // const { data: updatedProfile, error } = await supabase
    //   .from('profiles')
    //   .update({
    //     ...updateData,
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('user_id', userId)
    //   .select()
    //   .single()

    // if (error) {
    //   throw new Error(error.message)
    // }

    // 模擬レスポンス
    const updatedProfile = {
      id: userId,
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'プロフィールを更新しました'
    })

  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    return NextResponse.json(
      { error: 'プロフィール情報の更新に失敗しました' },
      { status: 500 }
    )
  }
} 