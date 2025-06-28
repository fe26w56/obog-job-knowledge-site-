import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { PostCategory, PostStatus } from '@/types'

// 投稿詳細取得 (GET /api/posts/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json(
        { status: 'error', message: '投稿IDが指定されていません' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 投稿詳細を取得
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('投稿取得エラー:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { status: 'error', message: '投稿が見つかりません' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { status: 'error', message: '投稿の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: { post: data }
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 投稿更新 (PUT /api/posts/[id])
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const body = await request.json()
    const { title, content, category, tags, status } = body

    if (!postId) {
      return NextResponse.json(
        { status: 'error', message: '投稿IDが指定されていません' },
        { status: 400 }
      )
    }

    // バリデーション
    if (!title || !content || !category) {
      return NextResponse.json(
        { status: 'error', message: 'タイトル、内容、カテゴリは必須です' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { status: 'error', message: 'タイトルは200文字以下にしてください' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { status: 'error', message: '投稿内容は10,000文字以下にしてください' },
        { status: 400 }
      )
    }

    if (tags && Array.isArray(tags) && tags.length > 10) {
      return NextResponse.json(
        { status: 'error', message: 'タグは10個以下にしてください' },
        { status: 400 }
      )
    }

    // 認証チェック（後で実装）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // 投稿を更新
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        excerpt: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
        category,
        tags: tags || [],
        status: status || 'published',
        updated_at: new Date().toISOString(),
        published_at: status === 'published' ? new Date().toISOString() : null
      })
      .eq('id', postId)
      .select('*')
      .single()

    if (error) {
      console.error('投稿更新エラー:', error)
      return NextResponse.json(
        { status: 'error', message: '投稿の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: { post: data },
      message: '投稿が更新されました'
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 投稿削除 (DELETE /api/posts/[id])
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json(
        { status: 'error', message: '投稿IDが指定されていません' },
        { status: 400 }
      )
    }

    // 認証チェック（後で実装）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // 投稿を削除（論理削除）
    const { data, error } = await supabase
      .from('posts')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select('*')
      .single()

    if (error) {
      console.error('投稿削除エラー:', error)
      return NextResponse.json(
        { status: 'error', message: '投稿の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: { post: data },
      message: '投稿が削除されました'
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 