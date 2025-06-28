// Bookmarks Page
// TODO: Implement bookmarks page with saved posts management 

'use client'

import React, { useState, useEffect } from 'react'
import { Bookmark, Search, Filter, Calendar, User, Building, GraduationCap, Eye, Heart, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { formatTimeAgo, getCategoryDisplayName } from '@/lib/utils'
import Link from 'next/link'

interface BookmarkPost {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  view_count: number
  like_count: number
  category: string
  tags: string[]
  author: {
    id: string
    full_name: string
    avatar_url?: string
    company?: string
    graduation_year?: number
  }
}

interface BookmarkItem {
  id: string
  created_at: string
  post: BookmarkPost
}

interface BookmarksResponse {
  bookmarks: BookmarkItem[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })

  // ブックマーク一覧を取得
  const fetchBookmarks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookmarks?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      })
      const result = await response.json()

      if (result.status === 'success') {
        setBookmarks(result.data.bookmarks)
        setPagination(result.data.pagination)
      }
    } catch (error) {
      console.error('ブックマーク取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [currentPage])

  // ブックマーク削除
  const handleRemoveBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/bookmarks?post_id=${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      })

      if (response.ok) {
        // ブックマークリストから削除
        setBookmarks(prev => prev.filter(bookmark => bookmark.post.id !== postId))
        // 再取得して最新状態を反映
        fetchBookmarks()
      }
    } catch (error) {
      console.error('ブックマーク削除エラー:', error)
    }
  }

  // フィルタリング・検索
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchQuery === '' || 
      bookmark.post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.post.author.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || bookmark.post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // ソート
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'popular':
        return b.post.view_count - a.post.view_count
      default:
        return 0
    }
  })

  const categories = [
    { value: 'all', label: 'すべて' },
    { value: 'job_hunting', label: '就活全般' },
    { value: 'interview', label: '面接対策' },
    { value: 'es_writing', label: 'ES・履歴書' },
    { value: 'company_research', label: '企業研究' },
    { value: 'internship', label: 'インターン' },
    { value: 'career_advice', label: 'キャリア相談' },
    { value: 'industry_info', label: '業界情報' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bookmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ブックマーク</h1>
          </div>
          <p className="text-gray-600">
            保存した投稿を管理できます。合計 {pagination.total} 件のブックマーク
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* サイドバー - フィルタ */}
          <div className="lg:w-64 space-y-4">
            {/* 検索 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">検索</h3>
                </div>
                <Input
                  type="text"
                  placeholder="タイトル、内容、投稿者で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* カテゴリフィルタ */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">カテゴリ</h3>
                </div>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ソート */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">並び順</h3>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="newest">ブックマーク日時（新しい順）</option>
                  <option value="oldest">ブックマーク日時（古い順）</option>
                  <option value="popular">人気順（閲覧数）</option>
                </select>
              </CardContent>
            </Card>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1">
            {isLoading ? (
              // ローディング状態
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedBookmarks.length > 0 ? (
              // ブックマーク一覧
              <div className="space-y-4">
                {sortedBookmarks.map(bookmark => (
                  <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {bookmark.post.author.full_name}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {bookmark.post.author.company && (
                                <div className="flex items-center space-x-1">
                                  <Building className="w-3 h-3" />
                                  <span>{bookmark.post.author.company}</span>
                                </div>
                              )}
                              {bookmark.post.author.graduation_year && (
                                <div className="flex items-center space-x-1">
                                  <GraduationCap className="w-3 h-3" />
                                  <span>{bookmark.post.author.graduation_year}年卒</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBookmark(bookmark.post.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          削除
                        </Button>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {getCategoryDisplayName(bookmark.post.category)}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>ブックマーク: {formatTimeAgo(bookmark.created_at)}</span>
                          </div>
                        </div>
                        
                        <Link href={`/posts/${bookmark.post.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-2">
                            {bookmark.post.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 mb-3 line-clamp-3">
                          {bookmark.post.content}
                        </p>

                        {bookmark.post.tags && bookmark.post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {bookmark.post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{bookmark.post.view_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{bookmark.post.like_count}</span>
                            </div>
                          </div>
                          <span>投稿: {formatTimeAgo(bookmark.post.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* ページネーション */}
                {pagination.total_pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.total_pages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            ) : (
              // 空の状態
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || selectedCategory !== 'all' 
                      ? '該当するブックマークが見つかりません'
                      : 'まだブックマークはありません'
                    }
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || selectedCategory !== 'all'
                      ? '検索条件を変更して再度お試しください'
                      : '気になる投稿をブックマークして、後で読み返すことができます'
                    }
                  </p>
                  {(!searchQuery && selectedCategory === 'all') && (
                    <Link href="/posts">
                      <Button>投稿を探す</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 