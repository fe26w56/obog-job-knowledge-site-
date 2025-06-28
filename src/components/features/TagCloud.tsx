'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Hash, TrendingUp, Filter, Search, Clock, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Tag {
  id: string
  name: string
  count: number
  category?: string
  isPopular?: boolean
  isTrending?: boolean
  color?: string
  description?: string
}

interface TagCloudProps {
  variant?: 'cloud' | 'list' | 'category'
  maxTags?: number
  showCount?: boolean
  showFilter?: boolean
  onTagClick?: (tag: Tag) => void
  selectedTags?: string[]
  className?: string
}

// タグのカテゴリ別色分け
const TAG_COLORS = {
  '業界': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  '職種': 'bg-green-100 text-green-800 hover:bg-green-200',
  '選考': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'スキル': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  '企業': 'bg-red-100 text-red-800 hover:bg-red-200',
  'その他': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
}

export default function TagCloud({
  variant = 'cloud',
  maxTags = 50,
  showCount = true,
  showFilter = false,
  onTagClick,
  selectedTags = [],
  className = ''
}: TagCloudProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'recent'>('popularity')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // タグデータの取得
  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      
      // TODO: 実際のAPI呼び出し
      // const response = await fetch('/api/tags')
      // const data = await response.json()

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockTags: Tag[] = [
        { id: '1', name: '外資系', count: 145, category: '業界', isPopular: true, isTrending: true },
        { id: '2', name: 'IT', count: 132, category: '業界', isPopular: true },
        { id: '3', name: 'コンサル', count: 98, category: '業界', isPopular: true, isTrending: true },
        { id: '4', name: '面接対策', count: 87, category: '選考', isPopular: true },
        { id: '5', name: 'ES', count: 76, category: '選考', isPopular: true },
        { id: '6', name: 'エンジニア', count: 65, category: '職種', isPopular: true },
        { id: '7', name: '金融', count: 54, category: '業界' },
        { id: '8', name: '商社', count: 43, category: '業界' },
        { id: '9', name: 'ケース面接', count: 41, category: '選考', isTrending: true },
        { id: '10', name: 'マーケティング', count: 38, category: '職種' },
        { id: '11', name: 'GD', count: 35, category: '選考' },
        { id: '12', name: 'インターン', count: 34, category: 'その他', isTrending: true },
        { id: '13', name: 'Google', count: 32, category: '企業' },
        { id: '14', name: 'マッキンゼー', count: 28, category: '企業' },
        { id: '15', name: '営業', count: 26, category: '職種' },
        { id: '16', name: 'Python', count: 24, category: 'スキル' },
        { id: '17', name: 'React', count: 22, category: 'スキル' },
        { id: '18', name: '転職', count: 21, category: 'その他' },
        { id: '19', name: 'AWS', count: 19, category: 'スキル' },
        { id: '20', name: 'SQL', count: 18, category: 'スキル' },
        { id: '21', name: 'メーカー', count: 17, category: '業界' },
        { id: '22', name: 'ガクチカ', count: 16, category: '選考' },
        { id: '23', name: '自己PR', count: 15, category: '選考' },
        { id: '24', name: 'データ分析', count: 14, category: 'スキル' },
        { id: '25', name: 'UI/UX', count: 13, category: 'スキル' }
      ]

      setTags(mockTags)
      setFilteredTags(mockTags)
    } catch (error) {
      console.error('タグ取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // フィルタリングとソート
  useEffect(() => {
    let filtered = [...tags]

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tag => tag.category === selectedCategory)
    }

    // ソート
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.count - a.count)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'recent':
        // TODO: 作成日時でソート
        filtered.sort((a, b) => b.count - a.count)
        break
    }

    // 最大数制限
    filtered = filtered.slice(0, maxTags)

    setFilteredTags(filtered)
  }, [tags, selectedCategory, sortBy, maxTags])

  // タグクリック処理
  const handleTagClick = (tag: Tag) => {
    if (onTagClick) {
      onTagClick(tag)
    } else {
      router.push(`/search?tags=${encodeURIComponent(tag.name)}`)
    }
  }

  // タグサイズ計算（クラウド表示用）
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...filteredTags.map(t => t.count))
    const minCount = Math.min(...filteredTags.map(t => t.count))
    const range = maxCount - minCount || 1
    const ratio = (count - minCount) / range
    
    if (ratio > 0.8) return 'text-2xl'
    if (ratio > 0.6) return 'text-xl'
    if (ratio > 0.4) return 'text-lg'
    if (ratio > 0.2) return 'text-base'
    return 'text-sm'
  }

  // タグの色を取得
  const getTagColor = (tag: Tag) => {
    if (selectedTags.includes(tag.name)) {
      return 'bg-primary-100 text-primary-800 hover:bg-primary-200'
    }
    return TAG_COLORS[tag.category as keyof typeof TAG_COLORS] || TAG_COLORS['その他']
  }

  // カテゴリ一覧
  const categories = ['all', ...Array.from(new Set(tags.map(tag => tag.category).filter(Boolean)))]

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* フィルタ・ソートコントロール */}
      {showFilter && (
        <div className="mb-6 space-y-4">
          {/* カテゴリフィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'すべて' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* ソート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              並び順
            </label>
            <div className="flex space-x-2">
              {[
                { key: 'popularity', label: '人気順' },
                { key: 'alphabetical', label: 'あいうえお順' },
                { key: 'recent', label: '新着順' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(key as any)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* タグ表示 */}
      {variant === 'cloud' && (
        <div className="flex flex-wrap gap-2 items-center">
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag)}
              className={`inline-flex items-center px-3 py-1 rounded-full font-medium transition-colors ${getTagSize(tag.count)} ${getTagColor(tag)}`}
            >
              <Hash className="w-3 h-3 mr-1" />
              {tag.name}
              {showCount && (
                <span className="ml-1 text-xs opacity-75">
                  {tag.count}
                </span>
              )}
              {tag.isTrending && (
                <TrendingUp className="w-3 h-3 ml-1 text-orange-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-2">
          {filteredTags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <button
                onClick={() => handleTagClick(tag)}
                className="flex items-center space-x-3 flex-1 text-left"
              >
                <div className={`p-2 rounded-lg ${getTagColor(tag)}`}>
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{tag.name}</span>
                    {tag.isPopular && (
                      <Badge variant="secondary" size="sm">人気</Badge>
                    )}
                    {tag.isTrending && (
                      <Badge variant="warning" size="sm">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        トレンド
                      </Badge>
                    )}
                  </div>
                  {tag.category && (
                    <span className="text-sm text-gray-500">{tag.category}</span>
                  )}
                </div>
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{tag.count}件</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === 'category' && (
        <div className="space-y-6">
          {categories.filter(cat => cat !== 'all').map(category => {
            const categoryTags = filteredTags.filter(tag => tag.category === category)
            if (categoryTags.length === 0) return null

            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${TAG_COLORS[category as keyof typeof TAG_COLORS]}`}>
                      <Hash className="w-4 h-4" />
                    </div>
                    {category}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({categoryTags.length}個)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categoryTags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagClick(tag)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${getTagColor(tag)}`}
                      >
                        {tag.name}
                        {showCount && (
                          <span className="ml-1 text-xs opacity-75">
                            {tag.count}
                          </span>
                        )}
                        {tag.isTrending && (
                          <TrendingUp className="w-3 h-3 ml-1 text-orange-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* タグなし */}
      {filteredTags.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            タグが見つかりませんでした
          </h3>
          <p className="text-gray-600">
            {selectedCategory !== 'all' 
              ? 'フィルタ条件を変更してみてください。'
              : 'まだタグが登録されていません。'
            }
          </p>
        </div>
      )}
    </div>
  )
} 