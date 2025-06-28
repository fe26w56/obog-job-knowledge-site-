import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// ブックマーク一覧取得 (GET /api/bookmarks)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
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

    // ユーザーのブックマーク一覧を取得
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        posts (
          id,
          title,
          content,
          created_at,
          updated_at,
          view_count,
          like_count,
          category,
          tags,
          profiles:author_id (
            id,
            display_name,
            avatar_url,
            company,
            graduation_year
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('ブックマーク取得エラー:', error)
      return NextResponse.json({
        status: 'error',
        message: 'ブックマークの取得に失敗しました'
      }, { status: 500 })
    }

    // 総数を取得
    const { count } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // データを整形
    const formattedBookmarks = bookmarks?.map(bookmark => ({
      id: bookmark.id,
      created_at: bookmark.created_at,
      post: {
        id: (bookmark.posts as any)?.id,
        title: (bookmark.posts as any)?.title,
        content: (bookmark.posts as any)?.content?.substring(0, 200) + '...',
        created_at: (bookmark.posts as any)?.created_at,
        updated_at: (bookmark.posts as any)?.updated_at,
        view_count: (bookmark.posts as any)?.view_count || 0,
        like_count: (bookmark.posts as any)?.like_count || 0,
        category: (bookmark.posts as any)?.category,
        tags: (bookmark.posts as any)?.tags || [],
        author: {
          id: (bookmark.posts as any)?.profiles?.id,
          full_name: (bookmark.posts as any)?.profiles?.display_name,
          avatar_url: (bookmark.posts as any)?.profiles?.avatar_url,
          company: (bookmark.posts as any)?.profiles?.company,
          graduation_year: (bookmark.posts as any)?.profiles?.graduation_year
        }
      }
    })) || []

    return NextResponse.json({
      status: 'success',
      data: {
        bookmarks: formattedBookmarks,
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
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}

// ブックマーク追加 (POST /api/bookmarks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post_id } = body

    if (!post_id) {
      return NextResponse.json({
        status: 'error',
        message: '投稿IDが指定されていません'
      }, { status: 400 })
    }

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

    // 投稿が存在するかチェック
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single()

    if (postError || !post) {
      return NextResponse.json({
        status: 'error',
        message: '投稿が見つかりません'
      }, { status: 404 })
    }

    // 既にブックマークされているかチェック
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', post_id)
      .single()

    if (existingBookmark) {
      return NextResponse.json({
        status: 'error',
        message: '既にブックマークされています'
      }, { status: 409 })
    }

    // ブックマークを追加
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        post_id: post_id,
        created_at: new Date().toISOString()
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('ブックマーク追加エラー:', error)
      return NextResponse.json({
        status: 'error',
        message: 'ブックマークの追加に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      data: {
        bookmark
      },
      message: 'ブックマークに追加しました'
    }, { status: 201 })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}

// ブックマーク削除 (DELETE /api/bookmarks)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get('post_id')

    if (!post_id) {
      return NextResponse.json({
        status: 'error',
        message: '投稿IDが指定されていません'
      }, { status: 400 })
    }

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

    // ブックマークを削除
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', post_id)

    if (error) {
      console.error('ブックマーク削除エラー:', error)
      return NextResponse.json({
        status: 'error',
        message: 'ブックマークの削除に失敗しました'
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'ブックマークを削除しました'
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
} 