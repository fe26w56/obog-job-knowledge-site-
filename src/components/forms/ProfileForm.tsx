'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { User, Save, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

// バリデーションスキーマ
const profileSchema = z.object({
  fullName: z.string()
    .min(1, '氏名は必須です')
    .min(2, '氏名は2文字以上で入力してください')
    .max(50, '氏名は50文字以内で入力してください'),
  university: z.string()
    .min(1, '大学名は必須です')
    .max(100, '大学名は100文字以内で入力してください'),
  department: z.string()
    .min(1, '学部・学科は必須です')
    .max(100, '学部・学科は100文字以内で入力してください'),
  graduationYear: z.number()
    .min(2020, '卒業年度は2020年以降で入力してください')
    .max(2030, '卒業年度は2030年以前で入力してください'),
  company: z.string().max(100, '会社名は100文字以内で入力してください').optional(),
  position: z.string().max(100, '職種・役職は100文字以内で入力してください').optional(),
  bio: z.string().max(1000, '自己紹介は1000文字以内で入力してください').optional(),
  contactEmail: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
  contactPhone: z.string().max(20, '電話番号は20文字以内で入力してください').optional(),
  snsLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional()
  }).optional(),
  isContactPublic: z.boolean()
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData?: Partial<ProfileFormValues>
  userRole?: 'current' | 'obog' | 'admin'
  onSubmit?: (data: ProfileFormValues) => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function ProfileForm({ 
  initialData, 
  userRole = 'current',
  onSubmit, 
  onCancel,
  isLoading = false 
}: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [showContactPreview, setShowContactPreview] = useState(false)

  const currentYear = new Date().getFullYear()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      graduationYear: currentYear + 1,
      isContactPublic: false,
      snsLinks: {
        twitter: '',
        linkedin: '',
        github: ''
      },
      ...initialData
    }
  })

  const watchedValues = watch()
  const isContactPublic = watch('isContactPublic')

  // 初期データが変更された時にフォームをリセット
  useEffect(() => {
    if (initialData) {
      reset({
        graduationYear: currentYear + 1,
        isContactPublic: false,
        snsLinks: { twitter: '', linkedin: '', github: '' },
        ...initialData
      })
    }
  }, [initialData, reset, currentYear])

  // フォーム送信処理
  const handleFormSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true)
      setSaveStatus('saving')
      
      // 空文字列のSNSリンクを除去
      const cleanedSnsLinks = Object.fromEntries(
        Object.entries(data.snsLinks || {}).filter(([_, value]) => value && value.trim() !== '')
      )
      
      const submitData = {
        ...data,
        snsLinks: Object.keys(cleanedSnsLinks).length > 0 ? cleanedSnsLinks : undefined
      }
      
      await onSubmit?.(submitData)
      setSaveStatus('success')
      
      // 成功メッセージを2秒後にリセット
      setTimeout(() => setSaveStatus('idle'), 2000)
      
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  // 卒業年度の選択肢生成
  const generateYearOptions = () => {
    const years = []
    for (let year = currentYear + 4; year >= currentYear - 10; year--) {
      years.push(year)
    }
    return years
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
            <p className="text-gray-600">あなたの基本情報を入力してください</p>
          </div>
        </div>
        
        {/* 保存状況表示 */}
        {saveStatus !== 'idle' && (
          <div className="flex items-center space-x-2">
            {saveStatus === 'saving' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm text-gray-600">保存中...</span>
              </>
            )}
            {saveStatus === 'success' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">保存しました</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">保存に失敗しました</span>
              </>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="山田太郎"
                  error={errors.fullName?.message}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                  大学名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="university"
                  {...register('university')}
                  placeholder="○○大学"
                  error={errors.university?.message}
                  disabled={isSaving}
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  学部・学科 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="department"
                  {...register('department')}
                  placeholder="経済学部"
                  error={errors.department?.message}
                  disabled={isSaving}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                  卒業年度 <span className="text-red-500">*</span>
                </label>
                <select
                  id="graduationYear"
                  {...register('graduationYear', { valueAsNumber: true })}
                  disabled={isSaving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
                {errors.graduationYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.graduationYear.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OB/OG専用情報 */}
        {userRole === 'obog' && (
          <Card>
            <CardHeader>
              <CardTitle>就職先情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    会社名
                  </label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="株式会社○○"
                    error={errors.company?.message}
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    職種・役職
                  </label>
                  <Input
                    id="position"
                    {...register('position')}
                    placeholder="エンジニア"
                    error={errors.position?.message}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 自己紹介 */}
        <Card>
          <CardHeader>
            <CardTitle>自己紹介</CardTitle>
          </CardHeader>
          <CardContent>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              自己紹介文 <span className="text-gray-500">(任意)</span>
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={4}
              placeholder="学生時代の活動や現在の仕事について簡単に紹介してください..."
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 resize-vertical"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
            <div className="mt-1 text-right">
              <span className="text-xs text-gray-500">
                {watchedValues.bio?.length || 0}/1000文字
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 連絡先情報 */}
        {userRole === 'obog' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>連絡先情報</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContactPreview(!showContactPreview)}
                >
                  {showContactPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  プレビュー
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 公開設定 */}
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-md">
                <input
                  type="checkbox"
                  id="isContactPublic"
                  {...register('isContactPublic')}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isSaving}
                />
                <label htmlFor="isContactPublic" className="text-sm font-medium text-gray-900">
                  連絡先情報を現役生に公開する
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    連絡先メールアドレス
                    <span className="text-xs text-gray-500 ml-2">（ログイン用と同じ）</span>
                  </label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="contact@example.com"
                    error={errors.contactEmail?.message}
                    disabled={isSaving}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    このメールアドレスはログイン認証にも使用されます
                  </p>
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号
                  </label>
                  <Input
                    id="contactPhone"
                    {...register('contactPhone')}
                    placeholder="090-1234-5678"
                    error={errors.contactPhone?.message}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* SNSリンク */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">SNSリンク</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <Input
                      id="twitter"
                      {...register('snsLinks.twitter')}
                      placeholder="@username"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <Input
                      id="linkedin"
                      {...register('snsLinks.linkedin')}
                      placeholder="username"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub
                    </label>
                    <Input
                      id="github"
                      {...register('snsLinks.github')}
                      placeholder="username"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>

              {/* 連絡先プレビュー */}
              {showContactPreview && isContactPublic && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">現役生向け表示プレビュー</h4>
                  <div className="space-y-2 text-sm">
                    {watchedValues.contactEmail && (
                      <div>📧 {watchedValues.contactEmail}</div>
                    )}
                    {watchedValues.contactPhone && (
                      <div>📞 {watchedValues.contactPhone}</div>
                    )}
                    {(watchedValues.snsLinks?.twitter || watchedValues.snsLinks?.linkedin || watchedValues.snsLinks?.github) && (
                      <div className="flex space-x-3 mt-2">
                        {watchedValues.snsLinks?.twitter && (
                          <span className="text-blue-500">Twitter</span>
                        )}
                        {watchedValues.snsLinks?.linkedin && (
                          <span className="text-blue-700">LinkedIn</span>
                        )}
                        {watchedValues.snsLinks?.github && (
                          <span className="text-gray-800">GitHub</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* フォームアクション */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            キャンセル
          </Button>

          <div className="flex items-center space-x-3">
            {isDirty && (
              <span className="text-sm text-amber-600">未保存の変更があります</span>
            )}
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存する
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 