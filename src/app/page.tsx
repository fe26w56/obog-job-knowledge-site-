'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import PostCard, { PostCardSkeleton } from '@/components/features/PostCard'
import { BookOpen, Users, MessageCircle, Star, TrendingUp, Clock, ArrowRight, Plus, Search } from 'lucide-react'
import { Post } from '@/types'

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  averageRating: number
}

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)

  // 最新投稿とサイト統計を取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // 実際のAPI呼び出し
        const [postsResponse, statsResponse] = await Promise.all([
          fetch('/api/posts?limit=3&sort=created_at&order=desc'),
          // TODO: 統計APIが実装されたら置き換え
          // fetch('/api/dashboard/stats')
          Promise.resolve({ json: () => Promise.resolve({ 
            data: { 
              totalUsers: 67, 
              totalPosts: 142, 
              totalComments: 387, 
              averageRating: 4.7 
            } 
          }) })
        ])

        const postsResult = await postsResponse.json()
        const statsResult = await statsResponse.json()

        if (postsResponse.ok && postsResult.status === 'success') {
          // データの変換（APIレスポンスをPost型に合わせる）
          const posts = postsResult.data.posts.map((post: any) => ({
            ...post,
            // プロフィール情報がない場合はダミーデータを設定
            author: post.profiles || {
              id: post.author_id,
              user_id: post.author_id,
              display_name: 'ユーザー',
              avatar_url: undefined,
              company: undefined,
              graduation_year: undefined,
              contact_visible: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            profiles: undefined    // 重複を避けるため削除
          }))
          setRecentPosts(posts)
        } else {
          console.error('投稿取得エラー:', postsResult.message)
          // エラーの場合は空配列を設定
          setRecentPosts([])
        }

        // 統計データ（暫定的にモックデータを使用）
        setStats(statsResult.data || {
          totalUsers: 67,
          totalPosts: 142,
          totalComments: 387,
          averageRating: 4.7
        })

      } catch (error) {
        console.error('ダッシュボードデータ取得エラー:', error)
        // エラーの場合は空のデータを設定
        setRecentPosts([])
        setStats({
          totalUsers: 0,
          totalPosts: 0,
          totalComments: 0,
          averageRating: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              学生団体
              <span className="text-primary-600">OBOG</span>
              <br />
              就活ナレッジサイト
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              現役生とOBOGが就活情報を安全に共有するプラットフォーム。
              先輩の経験を活かして、より良いキャリアを築きましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">今すぐ始める</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/posts">投稿を見る</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" size="lg" asChild className="h-16">
              <Link href="/search" className="flex items-center space-x-3">
                <Search className="w-5 h-5" />
                <span>投稿を検索</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-16">
              <Link href="/posts/create" className="flex items-center space-x-3">
                <Plus className="w-5 h-5" />
                <span>投稿を作成</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-16">
              <Link href="/bookmarks" className="flex items-center space-x-3">
                <Star className="w-5 h-5" />
                <span>ブックマーク</span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-16">
              <Link href="/profile" className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>プロフィール</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              サービスの特徴
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              学生団体専用のクローズドなプラットフォームで、安全に就活情報を共有できます
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-soft border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                クローズドコミュニティ
              </h3>
              <p className="text-gray-600">
                学生団体メンバー限定のプラットフォームで、安心して情報共有ができます。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-soft border border-gray-100">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                豊富な就活情報
              </h3>
              <p className="text-gray-600">
                面接体験談、企業レビュー、キャリアアドバイスなど多様な情報が充実。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-soft border border-gray-100">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                活発なディスカッション
              </h3>
              <p className="text-gray-600">
                コメント機能でOBOGや仲間と活発に情報交換ができます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              みんなで作る就活データベース
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <div className="h-9 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                ) : (
                  `${stats.totalUsers}+`
                )}
              </div>
              <div className="text-gray-600">登録メンバー</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <div className="h-9 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                ) : (
                  `${stats.totalPosts}+`
                )}
              </div>
              <div className="text-gray-600">投稿数</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-accent-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <div className="h-9 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                ) : (
                  `${stats.totalComments}+`
                )}
              </div>
              <div className="text-gray-600">コメント数</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <div className="h-9 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                ) : (
                  stats.averageRating.toFixed(1)
                )}
              </div>
              <div className="text-gray-600">ユーザー満足度</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                最新の投稿
              </h2>
              <p className="text-lg text-gray-600">
                最新の就活情報をチェックしましょう
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/posts" className="flex items-center space-x-2">
                <span>すべて見る</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            ) : (
              recentPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  showAuthorInfo={true}
                  showExcerpt={true}
                />
              ))
            )}
          </div>

          {!loading && recentPosts.length === 0 && (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだ投稿がありません
                </h3>
                <p className="text-gray-600 mb-6">
                  最初の投稿を作成して、コミュニティを盛り上げましょう！
                </p>
                <Button asChild>
                  <Link href="/posts/create">
                    <Plus className="w-4 h-4 mr-2" />
                    投稿を作成
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            今すぐ参加して就活を有利に進めよう
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            先輩の経験と知識を活用して、理想のキャリアを実現しましょう
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">メンバー登録する</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
              <Link href="/posts">投稿を見る</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 