'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageCircle,
  Heart,
  Bookmark,
  Eye,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface AnalyticsData {
  overview: {
    total_users: number
    total_posts: number
    total_comments: number
    total_views: number
    total_likes: number
    total_bookmarks: number
  }
  user_growth: {
    period: string
    new_users: number
    active_users: number
  }[]
  post_stats: {
    period: string
    new_posts: number
    total_views: number
    total_likes: number
  }[]
  popular_posts: {
    id: string
    title: string
    author: string
    views: number
    likes: number
    comments: number
    created_at: string
  }[]
  user_activity: {
    role: 'admin' | 'obog' | 'current'
    count: number
    active_count: number
    posts_count: number
    comments_count: number
  }[]
  category_stats: {
    category: string
    posts_count: number
    views: number
    engagement_rate: number
  }[]
  engagement_metrics: {
    avg_session_duration: number
    bounce_rate: number
    pages_per_session: number
    return_visitor_rate: number
  }
}

const SimpleBarChart: React.FC<{
  data: { label: string; value: number }[]
  title: string
  color?: string
}> = ({ data, title, color = 'bg-blue-500' }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-16 text-xs text-gray-600 text-right">
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${color}`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <div className="w-12 text-xs text-gray-900 text-right">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // TODO: 実際のAPI呼び出しに置き換え
      const mockAnalytics: AnalyticsData = {
        overview: {
          total_users: 245,
          total_posts: 89,
          total_comments: 456,
          total_views: 12450,
          total_likes: 1234,
          total_bookmarks: 567
        },
        user_growth: [
          { period: '1月1週', new_users: 12, active_users: 45 },
          { period: '1月2週', new_users: 18, active_users: 52 },
          { period: '1月3週', new_users: 15, active_users: 48 },
          { period: '1月4週', new_users: 23, active_users: 67 },
          { period: '2月1週', new_users: 19, active_users: 59 }
        ],
        post_stats: [
          { period: '1月1週', new_posts: 8, total_views: 1200, total_likes: 89 },
          { period: '1月2週', new_posts: 12, total_views: 1850, total_likes: 145 },
          { period: '1月3週', new_posts: 9, total_views: 1456, total_likes: 112 },
          { period: '1月4週', new_posts: 15, total_views: 2340, total_likes: 198 },
          { period: '2月1週', new_posts: 11, total_views: 1789, total_likes: 156 }
        ],
        popular_posts: [
          {
            id: '1',
            title: '面接で聞かれた質問と回答のコツ',
            author: '山田太郎',
            views: 2456,
            likes: 189,
            comments: 45,
            created_at: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            title: 'IT業界の就活体験談',
            author: '佐藤花子',
            views: 1892,
            likes: 156,
            comments: 32,
            created_at: '2024-01-18T15:30:00Z'
          },
          {
            id: '3',
            title: 'エンジニア職の志望動機の書き方',
            author: '田中次郎',
            views: 1654,
            likes: 134,
            comments: 28,
            created_at: '2024-01-22T09:15:00Z'
          },
          {
            id: '4',
            title: 'プログラミングスキルの身につけ方',
            author: '鈴木一郎',
            views: 1423,
            likes: 98,
            comments: 21,
            created_at: '2024-01-15T14:20:00Z'
          }
        ],
        user_activity: [
          { role: 'admin', count: 5, active_count: 5, posts_count: 12, comments_count: 89 },
          { role: 'obog', count: 156, active_count: 89, posts_count: 67, comments_count: 234 },
          { role: 'current', count: 84, active_count: 45, posts_count: 10, comments_count: 133 }
        ],
        category_stats: [
          { category: '面接体験', posts_count: 23, views: 4567, engagement_rate: 78.5 },
          { category: '就活のコツ', posts_count: 19, views: 3892, engagement_rate: 72.3 },
          { category: '企業レビュー', posts_count: 15, views: 2145, engagement_rate: 65.8 },
          { category: 'キャリア相談', posts_count: 12, views: 1876, engagement_rate: 69.2 },
          { category: 'スキル開発', posts_count: 10, views: 1654, engagement_rate: 74.1 },
          { category: 'ネットワーキング', posts_count: 7, views: 987, engagement_rate: 61.4 },
          { category: '一般', posts_count: 3, views: 329, engagement_rate: 45.2 }
        ],
        engagement_metrics: {
          avg_session_duration: 8.5,
          bounce_rate: 23.4,
          pages_per_session: 4.2,
          return_visitor_rate: 67.8
        }
      }
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const handleExport = () => {
    // TODO: CSV/PDF エクスポート機能を実装
    alert('レポートをエクスポートします')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="danger">管理者</Badge>
      case 'obog':
        return <Badge variant="primary">OBOG</Badge>
      case 'current':
        return <Badge variant="success">現役生</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">統計データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">データを取得できませんでした</h3>
          <Button onClick={fetchAnalytics}>再試行</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
                統計・分析
              </h1>
              <p className="mt-2 text-gray-600">
                ユーザー活動、投稿パフォーマンス、エンゲージメント分析
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">過去7日</option>
                <option value="30d">過去30日</option>
                <option value="90d">過去90日</option>
                <option value="1y">過去1年</option>
              </select>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                更新
              </Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                エクスポート
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総投稿数</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_posts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総コメント数</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_comments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総閲覧数</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_views.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総いいね数</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_likes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総ブックマーク数</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.total_bookmarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* グラフとチャート */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ユーザー成長 */}
          <Card>
            <CardContent className="p-6">
              <SimpleBarChart
                data={analytics.user_growth.map(item => ({
                  label: item.period,
                  value: item.new_users
                }))}
                title="新規ユーザー数の推移"
                color="bg-blue-500"
              />
            </CardContent>
          </Card>

          {/* 投稿統計 */}
          <Card>
            <CardContent className="p-6">
              <SimpleBarChart
                data={analytics.post_stats.map(item => ({
                  label: item.period,
                  value: item.new_posts
                }))}
                title="新規投稿数の推移"
                color="bg-green-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* 人気投稿とユーザー活動 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 人気投稿 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">人気投稿</h3>
              <div className="space-y-4">
                {analytics.popular_posts.map((post, index) => (
                  <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {post.author} • {formatDate(post.created_at)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.views}
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {post.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {post.comments}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ユーザー活動 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ロール別ユーザー活動</h3>
              <div className="space-y-4">
                {analytics.user_activity.map((activity) => (
                  <div key={activity.role} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      {getRoleBadge(activity.role)}
                      <span className="text-sm text-gray-600">
                        {activity.count}名
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">アクティブ</p>
                        <p className="font-medium">{activity.active_count}名</p>
                      </div>
                      <div>
                        <p className="text-gray-600">投稿数</p>
                        <p className="font-medium">{activity.posts_count}件</p>
                      </div>
                      <div>
                        <p className="text-gray-600">コメント数</p>
                        <p className="font-medium">{activity.comments_count}件</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* カテゴリ統計とエンゲージメント */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* カテゴリ統計 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別統計</h3>
              <div className="space-y-3">
                {analytics.category_stats.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{category.category}</h4>
                      <p className="text-xs text-gray-600">
                        {category.posts_count}件 • {category.views}回閲覧
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {category.engagement_rate}%
                      </p>
                      <p className="text-xs text-gray-600">エンゲージメント率</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* エンゲージメント指標 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">エンゲージメント指標</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">平均セッション時間</h4>
                    <p className="text-xs text-gray-600">ユーザーの平均滞在時間</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {analytics.engagement_metrics.avg_session_duration}分
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">直帰率</h4>
                    <p className="text-xs text-gray-600">1ページのみ閲覧して離脱</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      {analytics.engagement_metrics.bounce_rate}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">平均ページビュー数</h4>
                    <p className="text-xs text-gray-600">セッションあたりのページ数</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {analytics.engagement_metrics.pages_per_session}ページ
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">リピーター率</h4>
                    <p className="text-xs text-gray-600">再訪問ユーザーの割合</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      {analytics.engagement_metrics.return_visitor_rate}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 