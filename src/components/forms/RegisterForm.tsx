'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { UserPlus, ArrowRight, Loader2, CheckCircle, Users } from 'lucide-react'

// バリデーションスキーマ
const registerSchema = z.object({
  fullName: z.string()
    .min(1, '氏名は必須です')
    .min(2, '氏名は2文字以上で入力してください')
    .max(50, '氏名は50文字以内で入力してください'),
  email: z.string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  university: z.string()
    .min(1, '大学名は必須です')
    .max(100, '大学名は100文字以内で入力してください'),
  department: z.string()
    .min(1, '学部・学科は必須です')
    .max(100, '学部・学科は100文字以内で入力してください'),
  graduationYear: z.number()
    .min(2020, '卒業年度は2020年以降で入力してください')
    .max(2030, '卒業年度は2030年以前で入力してください'),
  role: z.enum(['current', 'obog'] as const, {
    errorMap: () => ({ message: '学年を選択してください' })
  }),
  company: z.string().optional(),
  position: z.string().optional()
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
  invitationToken?: string
  onRegisterSuccess?: (email: string) => void
  onRegisterError?: (error: string) => void
}

export default function RegisterForm({ 
  invitationToken, 
  onRegisterSuccess, 
  onRegisterError 
}: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const currentYear = new Date().getFullYear()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      graduationYear: currentYear + 1,
      role: 'current'
    }
  })

  const watchedRole = watch('role')

  // 登録処理
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true)
      
      // TODO: 実際の登録API呼び出し
      // const response = await registerUser({
      //   ...data,
      //   invitationToken
      // })
      
      // 模擬的な処理（3秒待機）
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setIsSubmitted(true)
      onRegisterSuccess?.(data.email)
      
    } catch (error) {
      console.error('登録エラー:', error)
      onRegisterError?.('登録に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  // 卒業年度の選択肢生成
  const generateYearOptions = () => {
    const years = []
    for (let year = currentYear + 4; year >= currentYear - 5; year--) {
      years.push(year)
    }
    return years
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSubmitted ? 'bg-green-100' : 'bg-primary-100'
          }`}>
            {isSubmitted ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <UserPlus className="w-8 h-8 text-primary-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSubmitted ? '登録申請完了' : 'アカウント登録'}
          </h2>
          <p className="text-gray-600">
            {isSubmitted 
              ? '管理者による承認をお待ちください'
              : '学生団体OBOG就活ナレッジサイトへようこそ'
            }
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 招待情報 */}
            {invitationToken && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-blue-800 text-sm font-medium">
                    招待URLからの登録です
                  </p>
                </div>
              </div>
            )}

            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="山田太郎"
                  error={errors.fullName?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="your.email@example.com"
                  error={errors.email?.message}
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-2">
                  卒業年度 <span className="text-red-500">*</span>
                </label>
                <select
                  id="graduationYear"
                  {...register('graduationYear', { valueAsNumber: true })}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  学年 <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  {...register('role')}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="current">現役生</option>
                  <option value="obog">OB/OG</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>

            {/* OB/OG専用情報 */}
            {watchedRole === 'obog' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-md">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">就職先情報</h3>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    会社名
                  </label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="株式会社○○"
                    error={errors.company?.message}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* 利用規約 */}
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">利用について</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• このサイトは学生団体メンバー限定のプラットフォームです</li>
                <li>• 登録後、管理者による承認が完了するまでサイトをご利用いただけません</li>
                <li>• 個人情報は適切に管理され、団体外に共有されることはありません</li>
                <li>• 投稿内容は団体の品位を保つよう心がけてください</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  登録申請中...
                </>
              ) : (
                <>
                  登録申請を送信
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                既にアカウントをお持ちの場合は{' '}
                <a href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  こちらからログイン
                </a>
              </p>
            </div>
          </form>
        ) : (
          /* 登録完了 */
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-6">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                登録申請を受け付けました
              </h3>
              <p className="text-green-800 text-sm mb-4">
                {getValues('email')} に確認メールを送信しました
              </p>
              <div className="text-left text-sm text-green-700 space-y-2">
                <p><strong>次のステップ：</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>メールアドレスの認証</li>
                  <li>管理者による承認</li>
                  <li>承認完了後、サイト利用開始</li>
                </ol>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                承認には通常1-3営業日かかります
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                ホームページに戻る
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 