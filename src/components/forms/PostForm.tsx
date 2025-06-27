'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PostCategory, PostStatus, PostFormData, Post } from '@/types'
import { createPost, updatePost } from '@/lib/api-client'
import { Eye, EyeOff, Save, Send, X, Plus } from 'lucide-react'

// バリデーションスキーマ
const postSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以下にしてください'),
  content: z.string()
    .min(1, '内容は必須です')
    .max(10000, '内容は10,000文字以下にしてください'),
  category: z.enum(['job_hunting_tips', 'interview_experience', 'company_review', 'career_advice', 'skill_development', 'networking', 'general']),
  tags: z.array(z.string()).max(10, 'タグは10個以下にしてください'),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
})

type PostFormValues = z.infer<typeof postSchema>

interface PostFormProps {
  post?: Post // 編集時は既存の投稿データ
  onSuccess?: (post: Post) => void
  onCancel?: () => void
}

// カテゴリ選択肢
const categoryOptions: { value: PostCategory; label: string; description: string }[] = [
  { value: 'job_hunting_tips', label: '就活Tips', description: '就職活動全般のアドバイス' },
  { value: 'interview_experience', label: '面接体験', description: '面接の体験談・対策' },
  { value: 'company_review', label: '企業レビュー', description: '企業の詳細情報・評価' },
  { value: 'career_advice', label: 'キャリア相談', description: 'キャリア形成のアドバイス' },
  { value: 'skill_development', label: 'スキル開発', description: '技術・ビジネススキル向上' },
  { value: 'networking', label: 'ネットワーキング', description: '人脈形成・交流会情報' },
  { value: 'general', label: '一般', description: 'その他の話題' }
]

export default function PostForm({ post, onSuccess, onCancel }: PostFormProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || '',
      content: post?.content || '',
      category: post?.category || 'general',
      tags: post?.tags || [],
      status: post?.status || 'draft'
    }
  })

  const watchedValues = watch()
  const currentTags = watch('tags') || []

  // タグ追加
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !currentTags.includes(trimmedTag) && currentTags.length < 10) {
      setValue('tags', [...currentTags, trimmedTag], { shouldDirty: true })
      setTagInput('')
    }
  }

  // タグ削除
  const removeTag = (tagToRemove: string) => {
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove), { shouldDirty: true })
  }

  // タグ入力のEnterキー処理
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && currentTags.length > 0) {
      removeTag(currentTags[currentTags.length - 1])
    }
  }

  // フォーム送信
  const onSubmit = async (data: PostFormValues) => {
    try {
      setIsSubmitting(true)
      
      // TODO: 認証トークンを取得
      const token = 'dummy-token'
      
      let result: Post
      
      if (post) {
        // 更新
        result = await updatePost(post.id, data, token)
      } else {
        // 新規作成
        result = await createPost(data, token)
      }
      
      onSuccess?.(result)
    } catch (error) {
      console.error('投稿エラー:', error)
      // TODO: エラー通知を表示
    } finally {
      setIsSubmitting(false)
    }
  }

  // 下書き保存
  const saveDraft = () => {
    setValue('status', 'draft')
    handleSubmit(onSubmit)()
  }

  // 公開
  const publish = () => {
    setValue('status', 'published')
    handleSubmit(onSubmit)()
  }

  // マークダウンプレビュー（簡易版）
  const renderPreview = (content: string) => {
    // 簡易的なマークダウン変換
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/gim, '<br>')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {post ? '投稿を編集' : '新しい投稿を作成'}
          </h1>
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center space-x-2"
            >
              {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isPreview ? 'エディタ' : 'プレビュー'}</span>
            </Button>
          </div>
        </div>

        {/* タイトル */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            {...register('title')}
            placeholder="投稿のタイトルを入力してください"
            error={errors.title?.message}
            className="text-lg"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            {...register('category')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タグ（最大10個）
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {currentTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="タグを入力してEnterキーで追加"
              className="flex-1"
              disabled={currentTags.length >= 10}
            />
            <Button
              type="button"
              onClick={() => addTag(tagInput)}
              variant="outline"
              size="sm"
              disabled={!tagInput.trim() || currentTags.length >= 10}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {errors.tags && (
            <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
          )}
        </div>

        {/* コンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* エディタ */}
          {!isPreview && (
            <div className="lg:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                内容 <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">
                  (Markdown記法が使用できます)
                </span>
              </label>
              <textarea
                id="content"
                {...register('content')}
                rows={16}
                placeholder="## 見出し
                
**太字** や *斜体* を使って、体験談や Tips を書いてください。

```
コードブロックも使用できます
```

- リスト項目1
- リスト項目2

[リンク](https://example.com) も追加できます。"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
              <div className="text-right text-sm text-gray-500 mt-1">
                {watchedValues.content?.length || 0} / 10,000 文字
              </div>
            </div>
          )}

          {/* プレビュー */}
          {isPreview && (
            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h3>
              <div className="border border-gray-300 rounded-md p-4 bg-white min-h-[400px]">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderPreview(watchedValues.content || '') 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>下書き保存</span>
            </Button>
            
            <Button
              type="button"
              onClick={publish}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{post ? '更新して公開' : '投稿を公開'}</span>
            </Button>
          </div>
        </div>

        {/* 変更未保存の警告 */}
        {isDirty && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-800 text-sm">
              未保存の変更があります。ページを離れる前に保存してください。
            </p>
          </div>
        )}
      </form>
    </div>
  )
} 