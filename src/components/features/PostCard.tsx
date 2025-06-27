'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Post, UserProfile } from '@/types'
import { formatDateToJST, formatTimeAgo } from '@/lib/utils'
import { Heart, MessageCircle, Bookmark, Eye, User, Building, Calendar, ArrowRight } from 'lucide-react'
import { toggleLike, fetchLikeStatus } from '@/lib/api-client'

interface PostCardProps {
  post: Post
  showAuthorInfo?: boolean
  showExcerpt?: boolean
  onLikeToggle?: (postId: string, liked: boolean, likeCount: number) => void
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void
}

// カテゴリの日本語表示とカラー
const categoryConfig = {
  job_hunting_tips: { label: '就活Tips', color: 'bg-blue-100 text-blue-800' },
  interview_experience: { label: '面接体験', color: 'bg-green-100 text-green-800' },
  company_review: { label: '企業レビュー', color: 'bg-purple-100 text-purple-800' },
  career_advice: { label: 'キャリア相談', color: 'bg-orange-100 text-orange-800' },
  skill_development: { label: 'スキル開発', color: 'bg-indigo-100 text-indigo-800' },
  networking: { label: 'ネットワーキング', color: 'bg-pink-100 text-pink-800' },
  general: { label: '一般', color: 'bg-gray-100 text-gray-800' }
}

export default function PostCard({ 
  post, 
  showAuthorInfo = true, 
  showExcerpt = true,
  onLikeToggle,
  onBookmarkToggle 
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.like_count || 0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  // いいねボタンの処理
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLiking) return
    
    try {
      setIsLiking(true)
      // TODO: 認証トークンを取得
      const token = 'dummy-token'
      
      const result = await toggleLike(post.id, token)
      setIsLiked(result.liked)
      setLikeCount(result.like_count)
      
      onLikeToggle?.(post.id, result.liked, result.like_count)
    } catch (error) {
      console.error('いいねエラー:', error)
    } finally {
      setIsLiking(false)
    }
  }

  // ブックマークボタンの処理
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // TODO: ブックマークAPI実装後に処理を追加
    const newBookmarked = !isBookmarked
    setIsBookmarked(newBookmarked)
    onBookmarkToggle?.(post.id, newBookmarked)
  }

  const categoryInfo = categoryConfig[post.category]
  const author = post.author || post.profiles

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <Link href={`/posts/${post.id}`} className="block">
        <div className="p-6">
          {/* ヘッダー：カテゴリとメタ情報 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                {categoryInfo.label}
              </span>
              <div className="flex items-center text-gray-500 text-sm space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.view_count || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comment_count || 0}</span>
                </span>
              </div>
            </div>
            <time className="text-gray-500 text-sm" dateTime={post.created_at}>
              {formatTimeAgo(post.created_at)}
            </time>
          </div>

          {/* タイトル */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-primary-600 transition-colors overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {post.title}
          </h2>

          {/* 抜粋 */}
          {showExcerpt && post.excerpt && (
            <p className="text-gray-600 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              {post.excerpt}
            </p>
          )}

          {/* タグ */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.slice(0, 5).map(tag => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 5 && (
                <span className="text-gray-500 text-xs">
                  +{post.tags.length - 5}個
                </span>
              )}
            </div>
          )}

          {/* 作者情報 */}
          {showAuthorInfo && author && (
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.display_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {author.display_name}
                </p>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  {author.company && (
                    <span className="flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>{author.company}</span>
                    </span>
                  )}
                  {author.graduation_year && (
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{author.graduation_year}年卒</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* フッター：エンゲージメント */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {/* いいねボタン */}
              <button
                onClick={handleLikeClick}
                disabled={isLiking}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isLiked
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-500 hover:text-red-600'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </button>

              {/* ブックマークボタン */}
              <button
                onClick={handleBookmarkClick}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isBookmarked
                    ? 'text-yellow-600 hover:text-yellow-700'
                    : 'text-gray-500 hover:text-yellow-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span className="sr-only">ブックマーク</span>
              </button>
            </div>

            {/* 続きを読むリンク */}
            <div className="flex items-center space-x-1 text-primary-600 text-sm hover:text-primary-700 transition-colors">
              <span>続きを読む</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// グリッドレイアウト用のコンテナコンポーネント
export function PostCardGrid({ 
  posts, 
  loading = false, 
  onLikeToggle, 
  onBookmarkToggle 
}: {
  posts: Post[]
  loading?: boolean
  onLikeToggle?: (postId: string, liked: boolean, likeCount: number) => void
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void
}) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">投稿が見つかりません</h3>
        <p className="text-gray-500">
          検索条件を変更するか、新しい投稿を作成してください。
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLikeToggle={onLikeToggle}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  )
}

// スケルトンローディング
export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3">
          <div className="bg-gray-200 rounded-full h-6 w-20"></div>
          <div className="bg-gray-200 rounded h-4 w-16"></div>
        </div>
        
        {/* タイトル */}
        <div className="space-y-2 mb-3">
          <div className="bg-gray-200 rounded h-6 w-full"></div>
          <div className="bg-gray-200 rounded h-6 w-3/4"></div>
        </div>
        
        {/* 抜粋 */}
        <div className="space-y-2 mb-4">
          <div className="bg-gray-200 rounded h-4 w-full"></div>
          <div className="bg-gray-200 rounded h-4 w-full"></div>
          <div className="bg-gray-200 rounded h-4 w-1/2"></div>
        </div>
        
        {/* タグ */}
        <div className="flex space-x-2 mb-4">
          <div className="bg-gray-200 rounded h-6 w-16"></div>
          <div className="bg-gray-200 rounded h-6 w-20"></div>
          <div className="bg-gray-200 rounded h-6 w-14"></div>
        </div>
        
        {/* 作者情報 */}
        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="bg-gray-200 rounded-full h-10 w-10"></div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded h-4 w-24 mb-1"></div>
            <div className="bg-gray-200 rounded h-3 w-32"></div>
          </div>
        </div>
        
        {/* フッター */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-4">
            <div className="bg-gray-200 rounded h-4 w-8"></div>
            <div className="bg-gray-200 rounded h-4 w-4"></div>
          </div>
          <div className="bg-gray-200 rounded h-4 w-20"></div>
        </div>
      </div>
    </div>
  )
} 