'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  MessageCircle, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  Settings,
  BarChart3
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface AdminStats {
  users: {
    total: number
    pending: number
    active: number
    this_month: number
  }
  posts: {
    total: number
    published: number
    draft: number
    this_month: number
  }
  comments: {
    total: number
    pending: number
    approved: number
    this_month: number
  }
  activity: {
    total_views: number
    total_likes: number
    total_bookmarks: number
    active_users_today: number
  }
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'post_created' | 'comment_posted' | 'user_approved'
  title: string
  description: string
  created_at: string
  user?: {
    id: string
    name: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 統計データを取得
  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // TODO: 実際のAPI呼び出し
      // const response = await fetch('/api/admin/stats')
      // const result = await response.json()

      // サンプルデータ
      const sampleStats: AdminStats = {
        users: {
          total: 48,
          pending: 3,
          active: 45,
          this_month: 8
        },
        posts: {
          total: 127,
          published: 119,
          draft: 8,
          this_month: 15
        },
        comments: {
          total: 342,
          pending: 5,
          approved: 337,
          this_month: 28
        },
        activity: {
          total_views: 2847,
          total_likes: 456,
          total_bookmarks: 234,
          active_users_today: 12
        }
      }

      const sampleActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registered',
          title: '新規ユーザー登録',
          description: '田中太郎さんが新規登録しました',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          user: { id: '1', name: '田中太郎' }
        },
        {
          id: '2',
          type: 'post_created',
          title: '新規投稿',
          description: '「外資系コンサル面接対策」が投稿されました',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: { id: '2', name: '佐藤花子' }
        },
        {
          id: '3',
          type: 'comment_posted',
          title: '新規コメント',
          description: '投稿にコメントが追加されました',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: { id: '3', name: '山田次郎' }
        },
        {
          id: '4',
          type: 'user_approved',
          title: 'ユーザー承認',
          description: '鈴木三郎さんのアカウントが承認されました',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user: { id: '4', name: '鈴木三郎' }
        }
      ]

      setStats(sampleStats)
      setRecentActivity(sampleActivity)
    } catch (error) {
      console.error('統計取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // アクティビティタイプに応じたアイコンを取得
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'post_created':
        return <FileText className="w-4 h-4 text-green-500" />
      case 'comment_posted':
        return <MessageCircle className="w-4 h-4 text-purple-500" />
      case 'user_approved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  // 時間差を計算
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}時間前`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}日前`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">管理ダッシュボード</h1>
                <p className="text-gray-600">システム全体の状況を確認できます</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                設定
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                詳細分析
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ユーザー統計 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.users.total}</p>
                  <p className="text-sm text-green-600">今月 +{stats?.users.this_month}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 承認待ちユーザー */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">承認待ち</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.users.pending}</p>
                  <p className="text-sm text-gray-500">要対応</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 投稿統計 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総投稿数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.posts.total}</p>
                  <p className="text-sm text-green-600">今月 +{stats?.posts.this_month}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* アクティブユーザー */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">今日のアクティブ</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activity.active_users_today}</p>
                  <p className="text-sm text-gray-500">ユーザー</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 総閲覧数 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総閲覧数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activity.total_views.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">累計</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* コメント統計 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">総コメント数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.comments.total}</p>
                  <p className="text-sm text-green-600">今月 +{stats?.comments.this_month}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 承認待ちコメント */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">コメント承認待ち</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.comments.pending}</p>
                  <p className="text-sm text-gray-500">要確認</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* エンゲージメント */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">エンゲージメント</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats?.activity.total_likes || 0) + (stats?.activity.total_bookmarks || 0)}
                  </p>
                  <p className="text-sm text-purple-600">いいね・ブックマーク</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最近のアクティビティ */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">最近のアクティビティ</h3>
                <Button variant="outline" size="sm">
                  すべて見る
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* クイックアクション */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">ユーザー管理</span>
                      </div>
                      <p className="text-sm text-gray-600">承認・削除・権限変更</p>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/posts">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">投稿管理</span>
                      </div>
                      <p className="text-sm text-gray-600">投稿の確認・削除</p>
                    </div>
                  </Button>
                </Link>

                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium">コメント管理</span>
                    </div>
                    <p className="text-sm text-gray-600">承認・削除・モデレーション</p>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="flex items-center space-x-2 mb-1">
                      <BarChart3 className="w-4 h-4" />
                      <span className="font-medium">統計・分析</span>
                    </div>
                    <p className="text-sm text-gray-600">詳細レポート・分析</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 要注意事項 */}
        {((stats?.users.pending || 0) > 0 || (stats?.comments.pending || 0) > 0) && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-900 mb-2">要対応事項</h3>
                  <ul className="space-y-1 text-sm text-orange-800">
                    {(stats?.users.pending || 0) > 0 && (
                      <li>• {stats?.users.pending}件のユーザー承認が待機中です</li>
                    )}
                    {(stats?.comments.pending || 0) > 0 && (
                      <li>• {stats?.comments.pending}件のコメント承認が待機中です</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 