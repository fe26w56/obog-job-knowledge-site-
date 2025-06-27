import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// いいね追加/削除 (POST /api/posts/[id]/like)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 認証チェック（後で実装）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    // TODO: JWTトークンから user_id を取得
    // 暫定的にダミーのuser_idを使用
    const user_id = 'temp-user-id'

    const supabase = createServerClient()

    // 投稿の存在確認
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, like_count')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { status: 'error', message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // 既存のいいねをチェック
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user_id)
      .single()

    if (existingLike) {
      // いいねを削除
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user_id)

      if (deleteError) {
        console.error('いいね削除エラー:', deleteError)
        return NextResponse.json(
          { status: 'error', message: 'いいねの削除に失敗しました' },
          { status: 500 }
        )
      }

      // 投稿のいいね数を減らす
      const { error: updateError } = await supabase
        .from('posts')
        .update({ like_count: Math.max(0, (post.like_count || 0) - 1) })
        .eq('id', id)

      if (updateError) {
        console.error('いいね数更新エラー:', updateError)
      }

      return NextResponse.json({
        status: 'success',
        data: { 
          liked: false, 
          like_count: Math.max(0, (post.like_count || 0) - 1)
        },
        message: 'いいねを削除しました'
      })

    } else {
      // いいねを追加
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({
          post_id: id,
          user_id
        })

      if (insertError) {
        console.error('いいね追加エラー:', insertError)
        return NextResponse.json(
          { status: 'error', message: 'いいねの追加に失敗しました' },
          { status: 500 }
        )
      }

      // 投稿のいいね数を増やす
      const { error: updateError } = await supabase
        .from('posts')
        .update({ like_count: (post.like_count || 0) + 1 })
        .eq('id', id)

      if (updateError) {
        console.error('いいね数更新エラー:', updateError)
      }

      return NextResponse.json({
        status: 'success',
        data: { 
          liked: true, 
          like_count: (post.like_count || 0) + 1
        },
        message: 'いいねしました'
      })
    }

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// いいね状態取得 (GET /api/posts/[id]/like)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 認証チェック（後で実装）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    // TODO: JWTトークンから user_id を取得
    const user_id = 'temp-user-id'

    const supabase = createServerClient()

    // 投稿の存在確認
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, like_count')
      .eq('id', id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { status: 'error', message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // ユーザーのいいね状態をチェック
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user_id)
      .single()

    return NextResponse.json({
      status: 'success',
      data: { 
        liked: !!existingLike,
        like_count: post.like_count || 0
      }
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 