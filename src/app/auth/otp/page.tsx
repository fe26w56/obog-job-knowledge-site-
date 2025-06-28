'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OTPForm from '@/components/forms/OTPForm'
import { useAuthDev } from '@/hooks/useAuth'

export default function OTPPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshAuth } = useAuthDev()

  // URLパラメータからメールアドレスを取得
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    } else {
      // メールアドレスがない場合はログインページにリダイレクト
      router.push('/auth/login')
    }
  }, [searchParams, router])

  // OTP認証成功時
  const handleVerifySuccess = async () => {
    try {
      // 認証状態をリフレッシュ
      await refreshAuth()
    } catch (error) {
      console.error('認証状態リフレッシュエラー:', error)
    }
    // ホームページにリダイレクト
    router.push('/')
  }

  // エラーハンドリング
  const handleVerifyError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // OTP再送信
  const handleResendOTP = async () => {
    try {
      // TODO: OTP再送信API呼び出し
      // await resendOTP(email)
      
      setError('新しい認証コードを送信しました。')
    } catch (error) {
      setError('認証コードの再送信に失敗しました。')
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">学生団体 OBOG</h1>
          <p className="mt-2 text-sm text-gray-600">就活ナレッジサイト</p>
        </div>
      </div>

      <div className="mt-8">
        {/* エラー表示 */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* OTPフォーム */}
        <OTPForm
          email={email}
          onVerifySuccess={handleVerifySuccess}
          onVerifyError={handleVerifyError}
          onResendOTP={handleResendOTP}
        />
      </div>

      {/* 戻るリンク */}
      <div className="mt-8 text-center">
        <button
          onClick={() => router.push('/auth/login')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← ログインページに戻る
        </button>
      </div>

      {/* フッター */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2024 学生団体 OBOG就活ナレッジサイト. All rights reserved.
        </p>
      </div>
    </div>
  )
} 