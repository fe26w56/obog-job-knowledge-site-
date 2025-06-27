import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { PostCategory } from '@/types'

// 投稿検索 (GET /api/posts/search)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const category = url.searchParams.get('category') as PostCategory | null
    const tag = url.searchParams.get('tag')
    const sort = url.searchParams.get('sort') || 'created_at'
    const order = url.searchParams.get('order') || 'desc'

    if (!query.trim()) {
      return NextResponse.json(
        { status: 'error', message: '検索キーワードを入力してください' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 基本クエリ
    let dbQuery = supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          display_name,
          avatar_url,
          university,
          company
        )
      `)
      .eq('status', 'published')

    // 全文検索（タイトルと内容）
    const searchKeywords = query.trim().split(/\s+/)
    
    // PostgreSQLのfull-text searchまたはilike検索
    // 複数キーワードの場合はOR検索
    if (searchKeywords.length === 1) {
      dbQuery = dbQuery.or(`title.ilike.%${searchKeywords[0]}%,content.ilike.%${searchKeywords[0]}%`)
    } else {
      const titleConditions = searchKeywords.map(keyword => `title.ilike.%${keyword}%`).join(',')
      const contentConditions = searchKeywords.map(keyword => `content.ilike.%${keyword}%`).join(',')
      dbQuery = dbQuery.or(`${titleConditions},${contentConditions}`)
    }

    // フィルタ条件
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }
    if (tag) {
      dbQuery = dbQuery.contains('tags', [tag])
    }

    // ソート・ページネーション
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await dbQuery
      .order(sort, { ascending: order === 'asc' })
      .range(from, to)

    if (error) {
      console.error('検索エラー:', error)
      return NextResponse.json(
        { status: 'error', message: '検索に失敗しました' },
        { status: 500 }
      )
    }

    // 検索キーワードをハイライト（簡易版）
    const postsWithHighlight = data?.map(post => {
      let highlightedTitle = post.title
      let highlightedExcerpt = post.excerpt || ''

      searchKeywords.forEach(keyword => {
        const regex = new RegExp(`(${keyword})`, 'gi')
        highlightedTitle = highlightedTitle.replace(regex, '<mark>$1</mark>')
        highlightedExcerpt = highlightedExcerpt.replace(regex, '<mark>$1</mark>')
      })

      return {
        ...post,
        highlighted_title: highlightedTitle,
        highlighted_excerpt: highlightedExcerpt
      }
    })

    return NextResponse.json({
      status: 'success',
      data: {
        posts: postsWithHighlight || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        },
        search_info: {
          query,
          keywords: searchKeywords,
          result_count: count || 0
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

// 検索候補取得 (POST /api/posts/search)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || query.length < 2) {
      return NextResponse.json({
        status: 'success',
        data: { suggestions: [] }
      })
    }

    const supabase = createServerClient()

    // タグからの候補
    const { data: tagSuggestions } = await supabase
      .from('posts')
      .select('tags')
      .eq('status', 'published')
      .limit(100)

    // タイトルからの候補
    const { data: titleSuggestions } = await supabase
      .from('posts')
      .select('title')
      .ilike('title', `%${query}%`)
      .eq('status', 'published')
      .limit(10)

    // タグ候補の処理
    const allTags = new Set<string>()
    tagSuggestions?.forEach(post => {
      post.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          allTags.add(tag)
        }
      })
    })

    const suggestions = [
      ...Array.from(allTags).slice(0, 5).map(tag => ({
        type: 'tag',
        text: tag,
        display: `#${tag}`
      })),
      ...titleSuggestions?.slice(0, 5).map(post => ({
        type: 'title',
        text: post.title,
        display: post.title
      })) || []
    ]

    return NextResponse.json({
      status: 'success',
      data: { suggestions }
    })

  } catch (error) {
    console.error('検索候補取得エラー:', error)
    return NextResponse.json(
      { status: 'error', message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
} 