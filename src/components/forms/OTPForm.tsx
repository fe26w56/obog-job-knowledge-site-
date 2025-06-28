'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Shield, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface OTPFormProps {
  email?: string
  onVerifySuccess?: () => void
  onVerifyError?: (error: string) => void
  onResendOTP?: () => void
}

export default function OTPForm({ 
  email, 
  onVerifySuccess, 
  onVerifyError, 
  onResendOTP 
}: OTPFormProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10分 = 600秒
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // タイマー
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  // OTP入力処理
  const handleOTPChange = (index: number, value: string) => {
    // 数字のみ許可
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // 自動フォーカス移動
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // 6桁入力完了時に自動検証
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''))
    }
  }

  // キーボード操作
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // ペースト処理
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      handleVerifyOTP(pastedData)
    }
  }

  // OTP検証
  const handleVerifyOTP = async (otpCode: string) => {
    try {
      setIsLoading(true)
      setError('')
      
      // 実際のOTP検証API呼び出し
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          purpose: 'login'
        })
      })

      const result = await response.json()

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || '認証に失敗しました')
      }

      // 認証成功
      setIsVerified(true)
      setTimeout(() => {
        onVerifySuccess?.()
      }, 1500)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '認証に失敗しました'
      setError(errorMessage)
      onVerifyError?.(errorMessage)
      // OTPをクリア
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  // 手動検証
  const handleManualVerify = () => {
    const otpCode = otp.join('')
    if (otpCode.length === 6) {
      handleVerifyOTP(otpCode)
    }
  }

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isVerified ? 'bg-green-100' : 'bg-primary-100'
          }`}>
            {isVerified ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <Shield className="w-8 h-8 text-primary-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isVerified ? '認証完了' : '認証コードを入力'}
          </h2>
          <p className="text-gray-600">
            {isVerified 
              ? 'ログインが完了しました'
              : email 
                ? `${email} に送信された6桁のコードを入力してください`
                : '送信された6桁のコードを入力してください'
            }
          </p>
        </div>

        {!isVerified ? (
          <>
            {/* OTP入力フィールド */}
            <div className="space-y-6">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOTPChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                      error 
                        ? 'border-red-300 bg-red-50' 
                        : digit 
                          ? 'border-primary-300 bg-primary-50' 
                          : 'border-gray-300 bg-white'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                ))}
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* 検証ボタン */}
              <Button
                onClick={handleManualVerify}
                disabled={otp.join('').length !== 6 || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    認証中...
                  </>
                ) : (
                  <>
                    認証する
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* タイマーと再送信 */}
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  コードの有効期限: {formatTime(timeLeft)}
                </p>
                
                {timeLeft > 0 ? (
                  <p className="text-xs text-gray-500">
                    メールが届かない場合は、迷惑メールフォルダもご確認ください
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">認証コードの有効期限が切れました</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResendOTP}
                      className="w-full"
                    >
                      新しいコードを送信
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* 認証成功 */
          <div className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800 text-sm">
                認証が完了しました。ダッシュボードに移動しています...
              </p>
            </div>
          </div>
        )}

        {/* デバッグ情報（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-xs text-yellow-800 text-center">
                🧪 開発モード: 実際のOTPがコンソールに表示されます<br/>
                または管理者用テストコード「123456」も使用できます
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 