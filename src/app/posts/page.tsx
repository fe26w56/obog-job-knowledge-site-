'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Filter, SortAsc, SortDesc, Grid, List, TrendingUp, Clock, Eye, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination, PaginatedContainer } from '@/components/ui/Pagination'
import PostCard, { PostCardGrid, PostCardSkeleton } from '@/components/features/PostCard'
import FilterPanel from '@/components/features/FilterPanel'
import SearchBar from '@/components/features/SearchBar'
import TagCloud from '@/components/features/TagCloud'
import { Post } from '@/types'

interface PostsPageState {
  posts: Post[]
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  filters: {
    category?: string
    tags?: string[]
    author?: string
    company?: string
    graduationYear?: number
    sortBy: 'created_at' | 'view_count' | 'like_count' | 'comment_count'
    sortOrder: 'asc' | 'desc'
  }
  view: 'grid' | 'list'
  showFilters: boolean
}

export default function PostsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [state, setState] = useState<PostsPageState>({
    posts: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 12
    },
    filters: {
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    view: 'grid',
    showFilters: false
  })

  // URLパラメータから状態を復元
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined
    const sortBy = (searchParams.get('sortBy') as any) || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc'
    const view = (searchParams.get('view') as 'grid' | 'list') || 'grid'

    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page },
      filters: {
        ...prev.filters,
        category,
        tags,
        sortBy,
        sortOrder
      },
      view
    }))
  }, [searchParams])

  // 投稿データを取得
  const fetchPosts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // URLパラメータを構築
      const params = new URLSearchParams()
      params.set('page', state.pagination.currentPage.toString())
      params.set('limit', state.pagination.itemsPerPage.toString())
      
      if (state.filters.category) params.set('category', state.filters.category)
      if (state.filters.tags?.length) params.set('tags', state.filters.tags.join(','))
      params.set('sort', state.filters.sortBy)
      params.set('order', state.filters.sortOrder)

      // 実際のAPI呼び出し
      const response = await fetch(`/api/posts?${params.toString()}`)
      const result = await response.json()

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || '投稿の取得に失敗しました')
      }

      // データの変換（APIレスポンスをPost型に合わせる）
      const posts = result.data.posts.map((post: any) => ({
        ...post,
        // プロフィール情報がない場合はダミーデータを設定
        author: post.profiles || {
          id: post.author_id,
          user_id: post.author_id,
          display_name: 'ユーザー',
          avatar_url: undefined,
          company: undefined,
          graduation_year: undefined,
          contact_visible: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        profiles: undefined    // 重複を避けるため削除
      }))

      setState(prev => ({
        ...prev,
        posts,
        loading: false,
        pagination: {
          ...prev.pagination,
          totalItems: result.data.pagination.total,
          totalPages: result.data.pagination.total_pages
        }
      }))

    } catch (error) {
      console.error('投稿取得エラー:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '投稿の取得に失敗しました'
      }))
    }
  }, [state.pagination.currentPage, state.pagination.itemsPerPage, state.filters])

  // 初期データ取得
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // フィルタ変更時の処理
  const handleFiltersChange = (newFilters: any) => {
    const updatedFilters = { ...state.filters, ...newFilters }
    setState(prev => ({
      ...prev,
      filters: updatedFilters,
      pagination: { ...prev.pagination, currentPage: 1 }
    }))

    // URLを更新
    const params = new URLSearchParams()
    if (updatedFilters.category) params.set('category', updatedFilters.category)
    if (updatedFilters.tags?.length) params.set('tags', updatedFilters.tags.join(','))
    params.set('sortBy', updatedFilters.sortBy)
    params.set('sortOrder', updatedFilters.sortOrder)
    params.set('view', state.view)
    params.set('page', '1')

    router.push(`/posts?${params.toString()}`, { scroll: false })
  }

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page }
    }))

    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/posts?${params.toString()}`, { scroll: false })
  }

  // ソート変更
  const handleSortChange = (sortBy: string) => {
    const newSortOrder = state.filters.sortBy === sortBy && state.filters.sortOrder === 'desc' ? 'asc' : 'desc'
    handleFiltersChange({ sortBy, sortOrder: newSortOrder })
  }

  // 表示形式変更
  const handleViewChange = (view: 'grid' | 'list') => {
    setState(prev => ({ ...prev, view }))
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`/posts?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">投稿一覧</h1>
            <p className="text-gray-600">
              OBOGの皆さんの就活体験談やアドバイスをチェックしましょう
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            >
              <Filter className="w-4 h-4 mr-2" />
              フィルタ
            </Button>

            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button
                variant={state.view === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('grid')}
                className="rounded-r-none border-r"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={state.view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button asChild>
              <Link href="/posts/create">
                <Plus className="w-4 h-4 mr-2" />
                投稿作成
              </Link>
            </Button>
          </div>
        </div>

        {/* 検索バー */}
        <div className="mb-6">
          <SearchBar
            placeholder="投稿を検索..."
            onSearch={(query) => router.push(`/search?q=${encodeURIComponent(query)}`)}
            size="lg"
          />
        </div>

        <div className="flex gap-8">
          {/* フィルタパネル */}
          {state.showFilters && (
            <div className="w-80 shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>フィルタ</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, showFilters: false }))}
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterPanel
                    filters={state.filters}
                    onFiltersChange={handleFiltersChange}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="flex-1">
            {/* ソート・統計情報 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                {state.loading ? (
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                ) : (
                  <span>{state.pagination.totalItems}件の投稿</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">並び順:</span>
                <div className="flex space-x-1">
                  {[
                    { key: 'created_at', label: '投稿日', icon: Clock },
                    { key: 'like_count', label: 'いいね', icon: Star },
                    { key: 'view_count', label: '閲覧数', icon: Eye },
                    { key: 'comment_count', label: 'コメント', icon: TrendingUp }
                  ].map(({ key, label, icon: Icon }) => (
                    <Button
                      key={key}
                      variant={state.filters.sortBy === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSortChange(key)}
                      className="flex items-center space-x-1"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                      {state.filters.sortBy === key && (
                        state.filters.sortOrder === 'desc' ? 
                        <SortDesc className="w-3 h-3" /> : 
                        <SortAsc className="w-3 h-3" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* エラー表示 */}
            {state.error && (
              <Card className="border-red-200 bg-red-50 mb-6">
                <CardContent className="pt-6">
                  <p className="text-red-800">{state.error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPosts}
                    className="mt-3"
                  >
                    再試行
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 投稿一覧 */}
            <PaginatedContainer
              currentPage={state.pagination.currentPage}
              totalPages={state.pagination.totalPages}
              totalItems={state.pagination.totalItems}
              itemsPerPage={state.pagination.itemsPerPage}
              onPageChange={handlePageChange}
            >
              {state.loading ? (
                <div className={state.view === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-6'}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              ) : state.posts.length > 0 ? (
                <PostCardGrid
                  posts={state.posts}
                  onLikeToggle={(postId, liked, likeCount) => {
                    setState(prev => ({
                      ...prev,
                      posts: prev.posts.map(post =>
                        post.id === postId ? { ...post, like_count: likeCount } : post
                      )
                    }))
                  }}
                />
              ) : (
                <Card className="text-center py-12">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Grid className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      投稿が見つかりません
                    </h3>
                    <p className="text-gray-600 mb-6">
                      フィルタを調整するか、新しい投稿を作成してください。
                    </p>
                    <Button asChild>
                      <Link href="/posts/create">
                        <Plus className="w-4 h-4 mr-2" />
                        最初の投稿を作成
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </PaginatedContainer>
          </div>
        </div>

        {/* 人気タグ */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>人気のタグ</CardTitle>
          </CardHeader>
          <CardContent>
            <TagCloud
              variant="cloud"
              maxTags={20}
              showCount={true}
              onTagClick={(tag) => {
                handleFiltersChange({ tags: [tag.name] })
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 