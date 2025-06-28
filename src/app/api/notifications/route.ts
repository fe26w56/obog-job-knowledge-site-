import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// 通知一覧取得 (GET /api/notifications)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const offset = (page - 1) * limit

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        status: 'error',
        message: '認証が必要です'
      }, { status: 401 })
    }

    // TODO: JWTトークンからユーザーIDを取得
    const userId = 'dummy-user-id'

    const supabase = createServerClient()

    // 通知一覧を取得
    let query = supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        message,
        data,
        is_read,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // 未読のみフィルタ
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('通知取得エラー:', error)
      return NextResponse.json({
        status: 'error',
        message: '通知の取得に失敗しました'
      }, { status: 500 })
    }

    // 未読数を取得
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false)

    // 総数を取得
    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    return NextResponse.json({
      status: 'success',
      data: {
        notifications: notifications || [],
        unread_count: unreadCount || 0,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          total_pages: Math.ceil((totalCount || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}

// 通知作成 (POST /api/notifications)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, type, title, message, data } = body

    // 必須フィールドのチェック
    if (!user_id || !type || !title || !message) {
      return NextResponse.json({
        status: 'error',
        message: '必須フィールドが不足しています'
      }, { status: 400 })
    }

    // 通知タイプの検証
    const validTypes = ['comment', 'like', 'bookmark', 'follow', 'system', 'approval']
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        status: 'error',
        message: '無効な通知タイプです'
      }, { status: 400 })
    }

    const supabase = createServerClient()

    // 通知を作成
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        data: data || {},
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('通知作成エラー:', error)
      return NextResponse.json({
        status: 'error',
        message: '通知の作成に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      data: {
        notification
      },
      message: '通知を作成しました'
    }, { status: 201 })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}

// 通知の既読状態更新 (PUT /api/notifications)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notification_ids, mark_all_as_read } = body

    // 認証チェック
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({
        status: 'error',
        message: '認証が必要です'
      }, { status: 401 })
    }

    // TODO: JWTトークンからユーザーIDを取得
    const userId = 'dummy-user-id'

    const supabase = createServerClient()

    if (mark_all_as_read) {
      // 全ての通知を既読にする
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('通知一括既読エラー:', error)
        return NextResponse.json({
          status: 'error',
          message: '通知の既読処理に失敗しました'
        }, { status: 500 })
      }

      return NextResponse.json({
        status: 'success',
        message: '全ての通知を既読にしました'
      })
    }

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json({
        status: 'error',
        message: '通知IDが指定されていません'
      }, { status: 400 })
    }

    // 指定された通知を既読にする
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .in('id', notification_ids)

    if (error) {
      console.error('通知既読エラー:', error)
      return NextResponse.json({
        status: 'error',
        message: '通知の既読処理に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: '通知を既読にしました'
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
} 