import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// コメント一覧取得 (GET /api/posts/[id]/comments)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!postId) {
      return NextResponse.json(
        { status: 'error', message: '投稿IDが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // ソート条件を設定
    let orderBy = 'created_at'
    let ascending = false
    
    switch (sort) {
      case 'oldest':
        ascending = true
        break
      case 'popular':
        orderBy = 'like_count'
        break
      case 'newest':
      default:
        ascending = false
        break
    }

    // コメント一覧を取得（承認済みのみ）
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        like_count,
        parent_id,
        status,
        profiles:author_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('コメント取得エラー:', error)
      return NextResponse.json({ 
        status: 'error',
        message: 'コメント取得に失敗しました' 
      }, { status: 500 })
    }

    // コメントデータを整形
    const formattedComments = comments?.map(comment => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      like_count: comment.like_count || 0,
      parent_id: comment.parent_id,
      status: comment.status,
      author: {
        id: (comment.profiles as any)?.id || '',
        full_name: (comment.profiles as any)?.full_name || '匿名ユーザー',
        avatar_url: (comment.profiles as any)?.avatar_url
      },
      user_reaction: null // TODO: 実際のユーザーリアクション取得
    })) || []

    // 階層構造を構築
    const buildCommentTree = (comments: any[], parentId: string | null = null): any[] => {
      return comments
        .filter(comment => comment.parent_id === parentId)
        .map(comment => ({
          ...comment,
          replies: buildCommentTree(comments, comment.id)
        }))
    }

    const commentTree = buildCommentTree(formattedComments)

    return NextResponse.json({
      status: 'success',
      data: {
        comments: commentTree,
        total: formattedComments.length
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

// コメント投稿 (POST /api/posts/[id]/comments)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const body = await request.json()
    const { content, parent_id } = body

    if (!postId) {
      return NextResponse.json(
        { status: 'error', message: '投稿IDが指定されていません' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { status: 'error', message: 'コメントは1000文字以下にしてください' },
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
    const authorId = 'dummy-user-id'

    const supabase = createServerClient()

    // 投稿が存在するかチェック
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .eq('status', 'published')
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { status: 'error', message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // 親コメントが指定されている場合、存在チェック
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parent_id)
        .eq('post_id', postId)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json(
          { status: 'error', message: '親コメントが見つかりません' },
          { status: 404 }
        )
      }
    }

    // コメントを作成
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        author_id: authorId,
        content: content.trim(),
        parent_id: parent_id || null,
        status: 'approved', // TODO: 承認制の場合は 'pending' に変更
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        like_count,
        parent_id,
        status,
        profiles:author_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('コメント作成エラー:', error)
      return NextResponse.json({
        status: 'error',
        message: 'コメントの作成に失敗しました'
      }, { status: 500 })
    }

    // レスポンスデータを整形
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      like_count: comment.like_count || 0,
      parent_id: comment.parent_id,
      status: comment.status,
      author: {
        id: (comment.profiles as any)?.id || '',
        full_name: (comment.profiles as any)?.full_name || '匿名ユーザー',
        avatar_url: (comment.profiles as any)?.avatar_url
      },
      user_reaction: null
    }

    return NextResponse.json({
      status: 'success',
      data: {
        comment: formattedComment
      }
    }, { status: 201 })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 