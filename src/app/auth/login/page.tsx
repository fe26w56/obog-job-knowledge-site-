'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/forms/LoginForm'
import OTPForm from '@/components/forms/OTPForm'
import { useAuthDev } from '@/hooks/useAuth'

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { refreshAuth } = useAuthDev()

  // OTP送信成功時
  const handleOTPSent = (userEmail: string) => {
    setEmail(userEmail)
    setCurrentStep('otp')
    setError('')
  }

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
  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  // OTP再送信
  const handleResendOTP = () => {
    setCurrentStep('email')
    setError('')
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

        {/* フォーム表示 */}
        {currentStep === 'email' ? (
          <LoginForm
            onOTPSent={handleOTPSent}
            onError={handleError}
          />
        ) : (
          <OTPForm
            email={email}
            onVerifySuccess={handleVerifySuccess}
            onVerifyError={handleError}
            onResendOTP={handleResendOTP}
          />
        )}
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