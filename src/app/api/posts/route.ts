import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { PostCategory, PostStatus } from '@/types'

// 投稿一覧取得 (GET /api/posts)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const category = url.searchParams.get('category') as PostCategory | null
    const tag = url.searchParams.get('tag')
    const sort = url.searchParams.get('sort') || 'created_at'
    const order = url.searchParams.get('order') || 'desc'

    const supabase = createServerClient()

    // クエリ構築 - まずはシンプルに投稿データのみ取得
    let query = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')

    // フィルタ条件
    if (category) {
      query = query.eq('category', category)
    }
    if (tag) {
      query = query.contains('tags', [tag])
    }

    // ソート・ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(sort, { ascending: order === 'asc' })
      .range(from, to)

    if (error) {
      console.error('投稿取得エラー:', error)
      return NextResponse.json(
        { status: 'error', message: '投稿の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: {
        posts: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
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

// 投稿作成 (POST /api/posts)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, category, tags, status } = body

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

    // TODO: JWTトークンから user_id を取得
    // 暫定的にダミーのuser_idを使用
    const author_id = 'temp-user-id'

    const supabase = createServerClient()

    // 投稿作成
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        excerpt: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
        category,
        tags: tags || [],
        author_id,
        status: status || 'published',
        published_at: status === 'published' ? new Date().toISOString() : null
      })
      .select('*')
      .single()

    if (error) {
      console.error('投稿作成エラー:', error)
      return NextResponse.json(
        { status: 'error', message: '投稿の作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      data: { post: data },
      message: '投稿が作成されました'
    }, { status: 201 })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 