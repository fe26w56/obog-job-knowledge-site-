import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { BookOpen, Users, MessageCircle, Star, TrendingUp, Clock } from 'lucide-react'

export default function HomePage() {
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
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600">登録メンバー</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">100+</div>
              <div className="text-gray-600">投稿数</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-accent-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">コメント数</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
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
              <Link href="/posts">すべて見る</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample Post Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 hover:shadow-medium transition-shadow">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                    面接体験談
                  </span>
                  <span className="text-gray-400 text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    2日前
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  大手IT企業の面接体験談 - エンジニア職
                </h3>
                <p className="text-gray-600 mb-4">
                  技術面接での質問内容や雰囲気について詳しく共有します。特に...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      24 views
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      5 comments
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    読む
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/register">メンバー登録する</Link>
          </Button>
        </div>
      </section>
    </div>
  )
} 