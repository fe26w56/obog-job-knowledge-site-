import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { PostCategory, PostStatus } from '@/types'

// 投稿詳細取得 (GET /api/posts/[id])
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          display_name,
          avatar_url,
          university,
          graduation_year,
          company,
          position
        ),
        comments (
          id,
          content,
          like_count,
          status,
          created_at,
          profiles:author_id (
            display_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('投稿取得エラー:', error)
      return NextResponse.json(
        { status: 'error', message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // 閲覧数を1増やす
    await supabase
      .from('posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id)

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
    const { id } = params
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

    const supabase = createServerClient()

    // 投稿の存在と権限チェック
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { status: 'error', message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // TODO: ユーザーIDの検証（現在はスキップ）

    // 投稿更新
    const updateData: any = {
      title,
      content,
      excerpt: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
      category,
      tags: tags || [],
      updated_at: new Date().toISOString()
    }

    // ステータスが公開に変更された場合、公開日を設定
    if (status === 'published' && existingPost.status !== 'published') {
      updateData.published_at = new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        profiles:author_id (
          display_name,
          avatar_url,
          university,
          company
        )
      `)
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
    const { id } = params

    // 認証チェック（後で実装）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // 投稿の存在と権限チェック
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, title')
      .eq('id', id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { status: 'error', message: '投稿が見つかりません' },
        { status: 404 }
      )
    }

    // TODO: ユーザーIDの検証（現在はスキップ）

    // 論理削除：ステータスを'archived'に変更
    const { error } = await supabase
      .from('posts')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('投稿削除エラー:', error)
      return NextResponse.json(
        { status: 'error', message: '投稿の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
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