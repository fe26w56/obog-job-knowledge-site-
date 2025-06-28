// Search Results Page
// TODO: Implement search results page with filters and sorting 

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, SortAsc, SortDesc, Clock, X, Tag, Users, Calendar, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import PostCard from '@/components/features/PostCard'
import FilterPanel from '@/components/features/FilterPanel'
import SearchBar from '@/components/features/SearchBar'
import TagCloud from '@/components/features/TagCloud'

// 検索関連の型定義
interface SearchFilters {
  category?: string
  tags?: string[]
  author?: string
  company?: string
  graduationYear?: number
  sortBy?: 'relevance' | 'date' | 'likes' | 'views'
  sortOrder?: 'asc' | 'desc'
}

interface SearchResults {
  posts: any[]
  totalCount: number
  hasMore: boolean
  searchQuery: string
  filters: SearchFilters
  suggestions?: string[]
  relatedTags?: string[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 状態管理
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState('')

  // URLパラメータから初期値を設定
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const sortBy = (searchParams.get('sortBy') as any) || 'relevance'
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc'
    
    setSearchQuery(q)
    setFilters({
      category: category || undefined,
      tags: tags.length > 0 ? tags : undefined,
      sortBy,
      sortOrder
    })
    
    if (q) {
      performSearch(q, {
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        sortBy,
        sortOrder
      })
    }
  }, [searchParams])

  // 検索履歴をローカルストレージから取得
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // 検索実行
  const performSearch = useCallback(async (query: string, searchFilters: SearchFilters, page = 1) => {
    if (!query.trim()) return

    try {
      setIsLoading(true)
      setError('')
      
      // URLパラメータを更新
      const params = new URLSearchParams()
      params.set('q', query)
      if (searchFilters.category) params.set('category', searchFilters.category)
      if (searchFilters.tags && searchFilters.tags.length > 0) params.set('tags', searchFilters.tags.join(','))
      if (searchFilters.sortBy) params.set('sortBy', searchFilters.sortBy)
      if (searchFilters.sortOrder) params.set('sortOrder', searchFilters.sortOrder)
      if (page > 1) params.set('page', page.toString())
      
      router.push(`/search?${params.toString()}`, { scroll: false })

      // TODO: 実際のAPI呼び出し
      // const response = await fetch(`/api/posts/search?${params.toString()}`)
      // const data = await response.json()

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockResults: SearchResults = {
        posts: [
          {
            id: '1',
            title: '外資系コンサルの面接対策【完全版】',
            content: '外資系コンサルティングファームの面接で重要なポイントについて...',
            author: {
              id: 'author1',
              name: '田中太郎',
              company: 'マッキンゼー・アンド・カンパニー',
              graduationYear: 2023,
              avatarUrl: null
            },
            category: '面接対策',
            tags: ['外資系', 'コンサル', '面接', 'ケース面接'],
            stats: {
              viewCount: 245,
              likeCount: 18,
              commentCount: 7
            },
            createdAt: '2024-01-15T10:00:00Z',
            isLiked: false,
            isBookmarked: true
          },
          {
            id: '2',
            title: 'IT業界への転職体験談',
            content: '未経験からエンジニアとして転職した経験について...',
            author: {
              id: 'author2',
              name: '山田花子',
              company: 'Google Japan',
              graduationYear: 2022,
              avatarUrl: null
            },
            category: '転職・キャリア',
            tags: ['IT', 'エンジニア', '転職', '未経験'],
            stats: {
              viewCount: 189,
              likeCount: 23,
              commentCount: 12
            },
            createdAt: '2024-01-10T14:30:00Z',
            isLiked: true,
            isBookmarked: false
          },
          {
            id: '3',
            title: 'ES添削のポイント',
            content: 'エントリーシートを書く際のポイントと添削の重要性について...',
            author: {
              id: 'author3',
              name: '佐藤一郎',
              company: '三菱商事',
              graduationYear: 2021,
              avatarUrl: null
            },
            category: 'ES・履歴書',
            tags: ['ES', '添削', '就活', '書類選考'],
            stats: {
              viewCount: 156,
              likeCount: 15,
              commentCount: 5
            },
            createdAt: '2024-01-08T09:15:00Z',
            isLiked: false,
            isBookmarked: true
          }
        ],
        totalCount: 27,
        hasMore: true,
        searchQuery: query,
        filters: searchFilters,
        suggestions: ['外資系金融', 'コンサル面接', 'ES添削'],
        relatedTags: ['面接対策', '外資系', 'ES', 'コンサル', 'IT']
      }

      // フィルタ適用（模擬）
      let filteredPosts = mockResults.posts
      if (searchFilters.category) {
        filteredPosts = filteredPosts.filter(post => post.category === searchFilters.category)
      }
      if (searchFilters.tags && searchFilters.tags.length > 0) {
        filteredPosts = filteredPosts.filter(post => 
          searchFilters.tags!.some(tag => post.tags.includes(tag))
        )
      }

      setSearchResults({
        ...mockResults,
        posts: filteredPosts
      })
      
      // 検索履歴に追加
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))

    } catch (error) {
      console.error('検索エラー:', error)
      setError('検索に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }, [router, searchHistory])



  // フィルタ変更
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    if (searchQuery) {
      performSearch(searchQuery, newFilters, 1)
      setCurrentPage(1)
    }
  }

  // ソート変更
  const handleSortChange = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    const newFilters = { 
      ...filters, 
      sortBy: sortBy as 'relevance' | 'date' | 'likes' | 'views', 
      sortOrder: newSortOrder as 'asc' | 'desc'
    }
    handleFilterChange(newFilters)
  }

  // タグクリック
  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
    performSearch(tag, filters, 1)
  }

  // 検索履歴クリック
  const handleHistoryClick = (historyQuery: string) => {
    setSearchQuery(historyQuery)
    performSearch(historyQuery, filters, 1)
  }

  // 検索履歴削除
  const removeFromHistory = (historyQuery: string) => {
    const newHistory = searchHistory.filter(h => h !== historyQuery)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 検索ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">投稿検索</h1>
          
          {/* 検索フォーム */}
          <div className="flex space-x-3 mb-6">
            <div className="flex-1">
              <SearchBar
                initialValue={searchQuery}
                placeholder="キーワード、タグ、企業名で検索..."
                onSearch={(query) => performSearch(query, filters)}
                size="lg"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="w-5 h-5 mr-2" />
              フィルタ
            </Button>
          </div>

          {/* 検索履歴 */}
          {searchHistory.length > 0 && !searchResults && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4 mr-2" />
                  最近の検索
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 8).map((historyQuery, index) => (
                    <div key={index} className="flex items-center">
                      <button
                        onClick={() => handleHistoryClick(historyQuery)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                      >
                        {historyQuery}
                      </button>
                      <button
                        onClick={() => removeFromHistory(historyQuery)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex gap-8">
          {/* フィルタパネル */}
          {showFilters && (
            <div className="w-80 shrink-0">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* 検索結果エリア */}
          <div className="flex-1">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {searchResults && (
              <>
                {/* 検索結果情報 */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      「{searchResults.searchQuery}」の検索結果
                    </h2>
                    <p className="text-sm text-gray-600">
                      {searchResults.totalCount}件の投稿が見つかりました
                    </p>
                  </div>

                  {/* ソートボタン */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">並び順:</span>
                    <div className="flex space-x-1">
                      {[
                        { key: 'relevance', label: '関連度' },
                        { key: 'date', label: '投稿日' },
                        { key: 'likes', label: 'いいね' },
                        { key: 'views', label: '閲覧数' }
                      ].map(({ key, label }) => (
                        <Button
                          key={key}
                          variant={filters.sortBy === key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSortChange(key)}
                          className="flex items-center space-x-1"
                        >
                          <span>{label}</span>
                          {filters.sortBy === key && (
                            filters.sortOrder === 'desc' ? 
                            <SortDesc className="w-3 h-3" /> : 
                            <SortAsc className="w-3 h-3" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 適用中のフィルタ */}
                {(filters.category || filters.tags?.length || filters.author) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">適用中のフィルタ:</h3>
                    <div className="flex flex-wrap gap-2">
                      {filters.category && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>カテゴリ: {filters.category}</span>
                          <button
                            onClick={() => handleFilterChange({ ...filters, category: undefined })}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                      {filters.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                          <span>#{tag}</span>
                          <button
                            onClick={() => handleFilterChange({ 
                              ...filters, 
                              tags: filters.tags?.filter(t => t !== tag) 
                            })}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 検索結果リスト */}
                {searchResults.posts.length > 0 ? (
                  <div className="space-y-6">
                    {searchResults.posts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                      />
                    ))}

                    {/* ページネーション */}
                    {searchResults.totalCount > 10 && (
                      <div className="mt-8">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={Math.ceil(searchResults.totalCount / 10)}
                          onPageChange={(newPage) => {
                            performSearch(searchQuery, filters, newPage)
                            setCurrentPage(newPage)
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      検索結果が見つかりませんでした
                    </h3>
                    <p className="text-gray-600 mb-6">
                      別のキーワードで検索するか、フィルタを調整してみてください。
                    </p>
                    
                    {/* 検索提案 */}
                    {searchResults.suggestions && searchResults.suggestions.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-3">こちらの検索キーワードも試してみてください:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {searchResults.suggestions.map(suggestion => (
                            <button
                              key={suggestion}
                              onClick={() => handleTagClick(suggestion)}
                              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md text-sm hover:bg-primary-200"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 関連タグ */}
                {searchResults.relatedTags && searchResults.relatedTags.length > 0 && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle className="flex items-center text-sm font-medium text-gray-700">
                        <Tag className="w-4 h-4 mr-2" />
                        関連タグ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TagCloud
                        variant="cloud"
                        maxTags={20}
                        showCount={false}
                        onTagClick={(tag) => handleTagClick(tag.name)}
                        selectedTags={filters.tags}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* ローディング状態 */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 