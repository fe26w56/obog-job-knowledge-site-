'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, MapPin, Calendar, Building, Briefcase, Edit3, Camera, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthDev } from '@/hooks/useAuth'

// プロフィール型定義
interface UserProfile {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
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
  stats: {
    postsCount: number
    likesReceived: number
    commentsCount: number
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { getAuthToken, isAuthenticated } = useAuthDev()

  // プロフィール情報の取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      
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

  // ロール表示用
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: '管理者', variant: 'destructive' as const },
      obog: { label: 'OB/OG', variant: 'default' as const },
      current: { label: '現役生', variant: 'secondary' as const }
    }
    return roleConfig[role as keyof typeof roleConfig] || { label: role, variant: 'outline' as const }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                プロフィール取得エラー
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchProfile}>再試行</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/profile/edit')}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              編集
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
          </div>
        </div>

        {/* メインプロフィール */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* アバター */}
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* 基本情報 */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {profile.fullName}
                    </h2>
                    <Badge variant={getRoleBadge(profile.role).variant}>
                      {getRoleBadge(profile.role).label}
                    </Badge>
                  </div>
                  <div className="flex items-center text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {profile.email}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {profile.graduationYear}年卒
                    </div>
                  </div>
                </div>

                {/* 学歴・職歴 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.university} {profile.department}
                  </div>
                  {profile.company && (
                    <div className="flex items-center text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      {profile.company}
                    </div>
                  )}
                  {profile.position && (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {profile.position}
                    </div>
                  )}
                </div>

                {/* 自己紹介 */}
                {profile.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">自己紹介</h3>
                    <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {profile.stats.postsCount}
              </div>
              <div className="text-sm text-gray-600">投稿数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {profile.stats.likesReceived}
              </div>
              <div className="text-sm text-gray-600">いいね数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {profile.stats.commentsCount}
              </div>
              <div className="text-sm text-gray-600">コメント数</div>
            </CardContent>
          </Card>
        </div>

        {/* 連絡先情報 */}
        {profile.role === 'obog' && (
          <Card>
            <CardHeader>
              <CardTitle>連絡先情報</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.isContactPublic ? (
                <div className="space-y-3">
                  {profile.contactEmail && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{profile.contactEmail}</span>
                    </div>
                  )}
                  {profile.contactPhone && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-3 text-gray-400">📞</span>
                      <span>{profile.contactPhone}</span>
                    </div>
                  )}
                  {profile.snsLinks && (
                    <div className="flex space-x-4 mt-4">
                      {profile.snsLinks.twitter && (
                        <a href={`https://twitter.com/${profile.snsLinks.twitter}`} 
                           className="text-blue-500 hover:underline">
                          Twitter
                        </a>
                      )}
                      {profile.snsLinks.linkedin && (
                        <a href={`https://linkedin.com/in/${profile.snsLinks.linkedin}`}
                           className="text-blue-700 hover:underline">
                          LinkedIn
                        </a>
                      )}
                      {profile.snsLinks.github && (
                        <a href={`https://github.com/${profile.snsLinks.github}`}
                           className="text-gray-800 hover:underline">
                          GitHub
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    連絡先情報は非公開に設定されています
                  </p>
                  <Button variant="outline" size="sm">
                    連絡先を公開設定にする
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 