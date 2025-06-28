'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Heart, Reply, Flag, MoreHorizontal, User, Clock, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { formatTimeAgo } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    full_name: string
    avatar_url?: string
  }
  created_at: string
  updated_at?: string
  like_count: number
  parent_id?: string
  status: 'approved' | 'pending' | 'rejected'
  replies?: Comment[]
  user_reaction?: 'like' | null
}

interface CommentSectionProps {
  postId: string
  initialComments?: Comment[]
  currentUserId?: string
  canComment?: boolean
  className?: string
}

interface CommentFormProps {
  onSubmit: (content: string) => void
  onCancel?: () => void
  placeholder?: string
  isSubmitting?: boolean
  buttonText?: string
}

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: string) => void
  onReact: (commentId: string, reaction: 'like') => void
  onReport: (commentId: string) => void
  canReply?: boolean
  level?: number
  currentUserId?: string
}

// コメント投稿フォーム
const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'コメントを入力してください...',
  isSubmitting = false,
  buttonText = 'コメント投稿'
}) => {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isSubmitting}
        maxLength={1000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {content.length}/1000
        </span>
        <div className="flex space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? '投稿中...' : buttonText}
          </Button>
        </div>
      </div>
    </form>
  )
}

// 個別コメント表示
const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onReact,
  onReport,
  canReply = true,
  level = 0,
  currentUserId
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const handleReplySubmit = async (content: string) => {
    setIsSubmittingReply(true)
    try {
      // TODO: API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬遅延
      onReply(comment.id)
      setShowReplyForm(false)
    } catch (error) {
      console.error('返信エラー:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleReaction = (reaction: 'like') => {
    onReact(comment.id, reaction)
  }

  const isOwnComment = comment.author.id === currentUserId
  const maxLevel = 3 // 最大ネストレベル

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          {/* ヘッダー */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {comment.author.full_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(comment.created_at)}</span>
                  {comment.updated_at && comment.updated_at !== comment.created_at && (
                    <span>(編集済み)</span>
                  )}
                  {comment.status === 'pending' && (
                    <span className="text-yellow-600">(承認待ち)</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* メニューボタン */}
            <Button variant="ghost" size="sm" className="p-1">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* コンテンツ */}
          <div className="mb-3">
            <p className="text-gray-800 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* アクション */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* いいね */}
              <button
                onClick={() => handleReaction('like')}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  comment.user_reaction === 'like'
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${comment.user_reaction === 'like' ? 'fill-current' : ''}`} />
                <span>{comment.like_count}</span>
              </button>

              {/* 返信 */}
              {canReply && level < maxLevel && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>返信</span>
                </button>
              )}
            </div>

            {/* 通報 */}
            {!isOwnComment && (
              <button
                onClick={() => onReport(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-red-600 transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>通報</span>
              </button>
            )}
          </div>

          {/* 返信フォーム */}
          {showReplyForm && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`${comment.author.full_name}さんに返信...`}
                isSubmitting={isSubmittingReply}
                buttonText="返信"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 返信コメント */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onReact={onReact}
              onReport={onReport}
              canReply={canReply}
              level={level + 1}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// メインコメントセクション
export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialComments = [],
  currentUserId,
  canComment = true,
  className = ''
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest')

  // コメント読み込み
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      try {
        // 実際のAPI呼び出し
        const response = await fetch(`/api/posts/${postId}/comments?sort=${sortBy}`)
        const result = await response.json()
        
        if (result.status === 'success') {
          setComments(result.data.comments)
        }
      } catch (error) {
        console.error('コメント取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId, sortBy])

  // 新規コメント投稿
  const handleCommentSubmit = async (content: string) => {
    if (!currentUserId) return

    setIsSubmitting(true)
    try {
      // TODO: 実際のAPI呼び出し
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({ content })
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        // 新しいコメントを追加
        setComments(prev => [result.data.comment, ...prev])
      }
    } catch (error) {
      console.error('コメント投稿エラー:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 返信処理
  const handleReply = (commentId: string) => {
    // 返信後の処理（コメント再読み込みなど）
    console.log('返信処理:', commentId)
  }

  // リアクション処理
  const handleReaction = async (commentId: string, reaction: 'like') => {
    try {
      // TODO: 実際のAPI呼び出し
      const response = await fetch(`/api/comments/${commentId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({ reaction })
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        // コメントのリアクション状態を更新
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? {
            ...comment,
            like_count: result.data.like_count,
            user_reaction: result.data.user_reaction
          } : comment
        ))
      }
    } catch (error) {
      console.error('リアクションエラー:', error)
    }
  }

  // 通報処理
  const handleReport = async (commentId: string) => {
    try {
      // TODO: 実際のAPI呼び出し
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        }
      })

      if (response.ok) {
        alert('通報を受け付けました。管理者が確認いたします。')
      }
    } catch (error) {
      console.error('通報エラー:', error)
    }
  }

  const commentCount = comments.length

  return (
    <div className={`comment-section ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>コメント ({commentCount})</span>
        </h3>
        
        {/* ソート */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
          <option value="popular">人気順</option>
        </select>
      </div>

      {/* コメント投稿フォーム */}
      {canComment && currentUserId && (
        <div className="mb-6">
          <CommentForm
            onSubmit={handleCommentSubmit}
            isSubmitting={isSubmitting}
            buttonText="コメント投稿"
          />
        </div>
      )}

      {/* ログインが必要な場合 */}
      {canComment && !currentUserId && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">コメントするにはログインが必要です</p>
          <Button size="sm">ログイン</Button>
        </div>
      )}

      {/* コメント一覧 */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onReact={handleReaction}
              onReport={handleReport}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">まだコメントはありません</p>
          {canComment && currentUserId && (
            <p className="text-sm text-gray-400 mt-2">最初のコメントを投稿してみませんか？</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CommentSection 