import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// コメントリアクション (POST /api/comments/[id]/react)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
    const body = await request.json()
    const { reaction } = body // 'like' only

    if (!commentId) {
      return NextResponse.json(
        { status: 'error', message: 'コメントIDが指定されていません' },
        { status: 400 }
      )
    }

    if (!reaction || reaction !== 'like') {
      return NextResponse.json(
        { status: 'error', message: '無効なリアクションです' },
        { status: 400 }
      )
    }

    // 認証チェック（TODO: 実際の認証実装後に有効化）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    // TODO: JWTトークンからユーザーIDを取得
    const userId = 'dummy-user-id'

    const supabase = createServerClient()

    // コメントが存在するかチェック
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, like_count')
      .eq('id', commentId)
      .eq('status', 'approved')
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { status: 'error', message: 'コメントが見つかりません' },
        { status: 404 }
      )
    }

    // 既存のリアクションをチェック
    const { data: existingReaction, error: reactionError } = await supabase
      .from('comment_reactions')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    let newLikeCount = comment.like_count || 0
    let userReaction = reaction

    if (existingReaction) {
      // 既存のリアクションがある場合（いいねの取り消し）
      await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)

      newLikeCount = Math.max(0, newLikeCount - 1)
      userReaction = null
    } else {
      // 新しいリアクションを作成
      await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,
          user_id: userId,
          reaction_type: reaction,
          created_at: new Date().toISOString()
        })

      newLikeCount = newLikeCount + 1
    }

    // コメントのカウントを更新
    const { error: updateError } = await supabase
      .from('comments')
      .update({
        like_count: newLikeCount
      })
      .eq('id', commentId)

    if (updateError) {
      console.error('コメント更新エラー:', updateError)
      return NextResponse.json(
        { status: 'error', message: 'リアクションの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: {
        like_count: newLikeCount,
        user_reaction: userReaction
      },
      message: 'リアクションが更新されました'
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 