'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Bookmark, Share2, Eye, MessageCircle, User, Building, Calendar, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Post } from '@/types'
import { formatTimeAgo, getCategoryDisplayName } from '@/lib/utils'
import dynamic from 'next/dynamic'
import CommentSection from '@/components/features/CommentSection'

// MarkdownPreviewを動的インポート（SSR対応）
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
)

interface PostDetailPageState {
  post: Post | null
  loading: boolean
  error: string | null
  isLiked: boolean
  isBookmarked: boolean
  likeCount: number
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [state, setState] = useState<PostDetailPageState>({
    post: null,
    loading: true,
    error: null,
    isLiked: false,
    isBookmarked: false,
    likeCount: 0
  })

  // 投稿データを取得
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const response = await fetch(`/api/posts/${postId}`)
        const result = await response.json()

        if (!response.ok || result.status === 'error') {
          throw new Error(result.message || '投稿の取得に失敗しました')
        }

        // データの変換
        const post = {
          ...result.data.post,
          author: result.data.post.profiles || {
            id: result.data.post.author_id,
            user_id: result.data.post.author_id,
            display_name: 'ユーザー',
            avatar_url: undefined,
            company: undefined,
            graduation_year: undefined,
            contact_visible: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }

        setState(prev => ({
          ...prev,
          post,
          loading: false,
          likeCount: post.like_count || 0
        }))

        // 閲覧数を増加（TODO: 実際のAPI実装後に有効化）
        // await fetch(`/api/posts/${postId}/view`, { method: 'POST' })

      } catch (error) {
        console.error('投稿取得エラー:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '投稿の取得に失敗しました'
        }))
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  // いいねボタンの処理
  const handleLikeToggle = async () => {
    if (!state.post) return

    try {
      // TODO: 実際のAPI実装
      const newLiked = !state.isLiked
      const newCount = newLiked ? state.likeCount + 1 : state.likeCount - 1

      setState(prev => ({
        ...prev,
        isLiked: newLiked,
        likeCount: newCount
      }))

    } catch (error) {
      console.error('いいねエラー:', error)
    }
  }

  // ブックマークボタンの処理
  const handleBookmarkToggle = async () => {
    if (!state.post) return

    try {
      // TODO: 実際のAPI実装
      setState(prev => ({
        ...prev,
        isBookmarked: !prev.isBookmarked
      }))

    } catch (error) {
      console.error('ブックマークエラー:', error)
    }
  }

  // 共有ボタンの処理
  const handleShare = async () => {
    if (!state.post) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: state.post.title,
          text: state.post.excerpt || state.post.title,
          url: window.location.href
        })
      } else {
        // フォールバック: クリップボードにコピー
        await navigator.clipboard.writeText(window.location.href)
        alert('URLをクリップボードにコピーしました')
      }
    } catch (error) {
      console.error('共有エラー:', error)
    }
  }

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ローディングスケルトン */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state.error || !state.post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold text-red-800 mb-4">
                {state.error || '投稿が見つかりません'}
              </h1>
              <p className="text-red-600 mb-6">
                投稿が削除されたか、URLが正しくない可能性があります。
              </p>
              <Button asChild>
                <Link href="/posts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  投稿一覧に戻る
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const categoryInfo = getCategoryDisplayName(state.post.category)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/posts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              投稿一覧に戻る
            </Link>
          </Button>
        </div>

        {/* メインコンテンツ */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* ヘッダー */}
          <header className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-sm">
                {categoryInfo}
              </Badge>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{state.post.view_count || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{state.post.comment_count || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(state.post.created_at)}</span>
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {state.post.title}
            </h1>

            {/* タグ */}
            {state.post.tags && state.post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {state.post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* 作者情報 */}
            {state.post.author && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {state.post.author.avatar_url ? (
                    <img
                      src={state.post.author.avatar_url}
                      alt={state.post.author.display_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {state.post.author.display_name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {state.post.author.company && (
                      <span className="flex items-center space-x-1">
                        <Building className="w-3 h-3" />
                        <span>{state.post.author.company}</span>
                      </span>
                    )}
                    {state.post.author.graduation_year && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{state.post.author.graduation_year}年卒</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* コンテンツ */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none">
              <MarkdownPreview
                source={state.post.content}
                data-color-mode="light"
                style={{ backgroundColor: 'transparent' }}
                wrapperElement={{
                  'data-color-mode': 'light'
                }}
              />
            </div>
          </div>

          {/* フッター：アクション */}
          <footer className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* いいねボタン */}
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    state.isLiked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${state.isLiked ? 'fill-current' : ''}`} />
                  <span>{state.likeCount}</span>
                </button>

                {/* ブックマークボタン */}
                <button
                  onClick={handleBookmarkToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    state.isBookmarked
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${state.isBookmarked ? 'fill-current' : ''}`} />
                  <span>ブックマーク</span>
                </button>

                {/* 共有ボタン */}
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>共有</span>
                </button>
              </div>

              {/* コメントセクションへのリンク */}
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                コメント ({state.post.comment_count || 0})
              </Button>
            </div>
          </footer>
        </article>

        {/* コメントセクション */}
        <div className="mt-8">
          <CommentSection
            postId={state.post.id}
            currentUserId="dummy-user-id" // TODO: 実際のユーザーIDに置き換え
            canComment={true}
          />
        </div>

        {/* 関連投稿 (TODO: 後で実装) */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <h3 className="text-lg font-semibold mb-4">関連投稿</h3>
              <p>関連投稿機能は近日実装予定です</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 