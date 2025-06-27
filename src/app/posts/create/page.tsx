'use client'

import { useRouter } from 'next/navigation'
import PostForm from '@/components/forms/PostForm'
import { Post } from '@/types'

export default function CreatePostPage() {
  const router = useRouter()

  const handleSuccess = (post: Post) => {
    // 作成成功時は投稿詳細ページにリダイレクト
    router.push(`/posts/${post.id}`)
  }

  const handleCancel = () => {
    // キャンセル時はホームページに戻る
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PostForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
} 