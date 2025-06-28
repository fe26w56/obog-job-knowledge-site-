'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/forms/ProfileForm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, ArrowLeft, User } from 'lucide-react'
import { useAuthDev } from '@/hooks/useAuth'

interface UserProfile {
  id: string
  fullName: string
  email: string
  university: string
  department: string
  graduationYear: number
  role: 'current' | 'obog' | 'admin'
  company?: string
  position?: string
  bio?: string
  contactEmail?: string
  contactPhone?: string
  snsLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  isContactPublic: boolean
}

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updateError, setUpdateError] = useState('')
  const router = useRouter()
  const { getAuthToken, isAuthenticated, updateUserEmail } = useAuthDev()

  // プロフィール情報の取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const token = getAuthToken()
      if (!token) {
        throw new Error('認証が必要です')
      }
      
      // 実際のAPI呼び出し
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('プロフィール情報の取得に失敗しました')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setProfile(result.data)
      } else {
        throw new Error(result.error || 'プロフィール情報の取得に失敗しました')
      }
    } catch (error: any) {
      console.error('プロフィール取得エラー:', error)
      setError(error.message || 'プロフィール情報の取得に失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }

  // プロフィール更新処理
  const handleProfileUpdate = async (formData: any) => {
    try {
      setUpdateError('')
      
      const token = getAuthToken()
      if (!token) {
        throw new Error('認証が必要です')
      }
      
      // 実際のAPI呼び出し
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'プロフィール更新に失敗しました')
      }
      
      const result = await response.json()
      
      if (result.success) {
        // プロフィール情報を更新
        if (profile) {
          setProfile({
            ...profile,
            ...formData
          })
        }
        
        // contactEmailが更新された場合、認証情報も同期
        if (formData.contactEmail) {
          updateUserEmail(formData.contactEmail)
        }
        
        // 成功時はプロフィール画面に戻る
        setTimeout(() => {
          router.push('/profile')
        }, 500)
      } else {
        throw new Error(result.error || 'プロフィール更新に失敗しました')
      }
      
    } catch (error: any) {
      console.error('プロフィール更新エラー:', error)
      setUpdateError(error.message || 'プロフィールの更新に失敗しました。')
      throw error // ProfileFormにエラーを通知
    }
  }

  // キャンセル処理
  const handleCancel = () => {
    router.push('/profile')
  }

  // ローディング状態
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // エラー状態
  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                プロフィール取得エラー
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
                <Button onClick={fetchProfile}>
                  再試行
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずナビ */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button
          onClick={() => router.push('/profile')}
          className="hover:text-primary-600 transition-colors"
        >
          プロフィール
        </button>
        <span>/</span>
        <span className="text-gray-900">編集</span>
      </nav>

      {/* 更新エラー表示 */}
      {updateError && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  更新エラー
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {updateError}
                </div>
              </div>
              <button
                onClick={() => setUpdateError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プロフィール編集フォーム */}
      <ProfileForm
        initialData={{
          fullName: profile.fullName,
          university: profile.university,
          department: profile.department,
          graduationYear: profile.graduationYear,
          company: profile.company || '',
          position: profile.position || '',
          bio: profile.bio || '',
          contactEmail: profile.contactEmail || '',
          contactPhone: profile.contactPhone || '',
          snsLinks: {
            twitter: profile.snsLinks?.twitter || '',
            linkedin: profile.snsLinks?.linkedin || '',
            github: profile.snsLinks?.github || ''
          },
          isContactPublic: profile.isContactPublic
        }}
        userRole={profile.role}
        onSubmit={handleProfileUpdate}
        onCancel={handleCancel}
      />
    </div>
  )
} 