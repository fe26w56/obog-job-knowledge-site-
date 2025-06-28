'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'

// バリデーションスキーマ
const loginSchema = z.object({
  email: z.string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください')
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onOTPSent?: (email: string) => void
  onError?: (error: string) => void
}

export default function LoginForm({ onOTPSent, onError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOTPSent, setIsOTPSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  // OTP送信処理
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      
      // 実際のOTP送信API呼び出し
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          purpose: 'login'
        })
      })

      const result = await response.json()

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'OTP送信に失敗しました')
      }
      
      setIsOTPSent(true)
      onOTPSent?.(data.email)
      
    } catch (error) {
      console.error('OTP送信エラー:', error)
      const errorMessage = error instanceof Error ? error.message : 'OTP送信に失敗しました。もう一度お試しください。'
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // OTP再送信
  const handleResendOTP = async () => {
    const email = getValues('email')
    if (!email) return
    
    try {
      setIsLoading(true)
      
      // OTP再送信API呼び出し
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          purpose: 'login'
        })
      })

      const result = await response.json()

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'OTP再送信に失敗しました')
      }
      
      onError?.('新しいOTPコードを送信しました。')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP再送信に失敗しました。'
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isOTPSent ? 'メールを確認してください' : 'ログイン'}
          </h2>
          <p className="text-gray-600">
            {isOTPSent 
              ? `${getValues('email')} に認証コードを送信しました`
              : 'プロフィールの連絡先メールアドレスを入力して認証コードを受け取ってください'
            }
          </p>
        </div>

        {!isOTPSent ? (
          /* メール入力フォーム */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
                <span className="text-xs text-gray-500 ml-2">（プロフィールの連絡先と同じ）</span>
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="your.email@example.com"
                error={errors.email?.message}
                disabled={isLoading}
                className="text-center"
              />
              <p className="mt-1 text-xs text-gray-500 text-center">
                プロフィールに登録された連絡先メールアドレスを入力してください
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  認証コードを送信中...
                </>
              ) : (
                <>
                  認証コードを送信
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない場合は{' '}
                <a href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  こちらから登録
                </a>
              </p>
            </div>
          </form>
        ) : (
          /* OTP送信完了 */
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 text-sm">
                認証コードを送信しました。メールボックスを確認してください。
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>

              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    再送信中...
                  </>
                ) : (
                  '認証コードを再送信'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsOTPSent(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  メールアドレスを変更する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* セキュリティ注意事項 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs text-gray-600 text-center">
              🔒 このサイトは学生団体メンバー限定です。<br />
              認証コードは10分間有効です。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 