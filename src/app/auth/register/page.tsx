'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RegisterForm from '@/components/forms/RegisterForm'

export default function RegisterPage() {
  const [invitationToken, setInvitationToken] = useState<string>()
  const [error, setError] = useState('')
  const [isValidToken, setIsValidToken] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // URLパラメータから招待トークンを取得
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setInvitationToken(token)
      // TODO: トークンの有効性を検証
      validateInvitationToken(token)
    }
  }, [searchParams])

  // 招待トークンの検証
  const validateInvitationToken = async (token: string) => {
    try {
      // TODO: 実際のトークン検証API呼び出し
      // const response = await validateToken(token)
      
      // 模擬的な検証（一時的）
      if (token.length < 10) {
        setIsValidToken(false)
        setError('無効な招待URLです。管理者にお問い合わせください。')
      }
    } catch (error) {
      setIsValidToken(false)
      setError('招待URLの検証に失敗しました。')
    }
  }

  // 登録成功時
  const handleRegisterSuccess = (email: string) => {
    // 登録完了後は特に何もしない（フォーム内で完了画面表示）
    console.log('Registration success for:', email)
  }

  // エラーハンドリング
  const handleRegisterError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // 無効なトークンの場合
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                無効な招待URL
              </h2>
              <p className="text-gray-600 mb-6">
                この招待URLは無効または期限切れです。
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                >
                  ホームページに戻る
                </button>
                <p className="text-sm text-gray-600">
                  招待URLが必要な場合は、管理者にお問い合わせください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">学生団体 OBOG</h1>
          <p className="mt-2 text-sm text-gray-600">就活ナレッジサイト</p>
        </div>
      </div>

      <div className="mt-8">
        {/* エラー表示 */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 登録フォーム */}
        <RegisterForm
          invitationToken={invitationToken}
          onRegisterSuccess={handleRegisterSuccess}
          onRegisterError={handleRegisterError}
        />
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