import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// コメント通報 (POST /api/comments/[id]/report)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
    const body = await request.json()
    const { reason, description } = body

    if (!commentId) {
      return NextResponse.json(
        { status: 'error', message: 'コメントIDが指定されていません' },
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
    const reporterId = 'dummy-user-id'

    const supabase = createServerClient()

    // コメントが存在するかチェック
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, author_id')
      .eq('id', commentId)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { status: 'error', message: 'コメントが見つかりません' },
        { status: 404 }
      )
    }

    // 自分のコメントは通報できない
    if (comment.author_id === reporterId) {
      return NextResponse.json(
        { status: 'error', message: '自分のコメントは通報できません' },
        { status: 400 }
      )
    }

    // 既に通報済みかチェック
    const { data: existingReport, error: reportCheckError } = await supabase
      .from('comment_reports')
      .select('id')
      .eq('comment_id', commentId)
      .eq('reporter_id', reporterId)
      .single()

    if (existingReport) {
      return NextResponse.json(
        { status: 'error', message: '既にこのコメントを通報済みです' },
        { status: 400 }
      )
    }

    // 通報を作成
    const { data: report, error: reportError } = await supabase
      .from('comment_reports')
      .insert({
        comment_id: commentId,
        reporter_id: reporterId,
        reason: reason || 'inappropriate',
        description: description || '',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (reportError) {
      console.error('通報作成エラー:', reportError)
      return NextResponse.json(
        { status: 'error', message: '通報の送信に失敗しました' },
        { status: 500 }
      )
    }

    // 通報数をカウントして、一定数を超えた場合は自動的にステータスを変更
    const { data: reportCount, error: countError } = await supabase
      .from('comment_reports')
      .select('id', { count: 'exact' })
      .eq('comment_id', commentId)
      .eq('status', 'pending')

    if (!countError && reportCount && reportCount.length >= 3) {
      // 3件以上の通報があった場合、コメントを一時的に非表示にする
      await supabase
        .from('comments')
        .update({ status: 'under_review' })
        .eq('id', commentId)
    }

    return NextResponse.json({
      status: 'success',
      data: { report_id: report.id },
      message: '通報を受け付けました。管理者が確認いたします。'
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 