'use client'

import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp, Filter, Tag, Building, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

// フィルタ型定義
interface SearchFilters {
  category?: string
  tags?: string[]
  author?: string
  company?: string
  graduationYear?: number
  sortBy?: 'relevance' | 'date' | 'likes' | 'views'
  sortOrder?: 'asc' | 'desc'
}

interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClose?: () => void
}

// 定数
const CATEGORIES = [
  'ES・履歴書',
  '面接対策', 
  'インターン',
  '転職・キャリア',
  '業界研究',
  '企業分析',
  'ガクチカ・自己PR'
]

const POPULAR_TAGS = [
  '外資系', 'IT', 'コンサル', '金融', '商社', 'メーカー',
  '面接', 'ES', '転職', 'ケース面接', 'GD', 'インターン',
  '就活', '選考', 'エンジニア', 'マーケティング', '営業'
]

const GRADUATION_YEARS = Array.from(
  { length: 11 }, 
  (_, i) => new Date().getFullYear() + 4 - i
)

export default function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  // フィルタパネルの表示状態
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    tags: true,
    author: false,
    company: false,
    year: false
  })

  // 新しいタグ入力
  const [newTag, setNewTag] = useState('')

  // セクション展開/折りたたみ
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // フィルタ更新関数
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
  }

  // カテゴリ選択
  const handleCategorySelect = (category: string) => {
    const newCategory = filters.category === category ? undefined : category
    updateFilter('category', newCategory)
  }

  // タグ追加
  const handleAddTag = (tag: string) => {
    const currentTags = filters.tags || []
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag]
      updateFilter('tags', newTags)
    }
    setNewTag('')
  }

  // タグ削除
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.filter(tag => tag !== tagToRemove)
    updateFilter('tags', newTags.length > 0 ? newTags : undefined)
  }

  // カスタムタグ追加
  const handleCustomTagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim()) {
      handleAddTag(newTag.trim())
    }
  }

  // フィルタクリア
  const clearFilters = () => {
    onFiltersChange({
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    })
  }

  // 適用中のフィルタ数を計算
  const activeFiltersCount = [
    filters.category,
    filters.tags?.length,
    filters.author,
    filters.company,
    filters.graduationYear
  ].filter(Boolean).length

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Filter className="w-5 h-5 mr-2" />
          フィルタ
          {activeFiltersCount > 0 && (
            <Badge variant="default" size="sm" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              クリア
            </Button>
          )}
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* カテゴリフィルタ */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              カテゴリ
            </span>
            {expandedSections.category ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>
          
          {expandedSections.category && (
            <div className="space-y-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    filters.category === category
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* タグフィルタ */}
        <div>
          <button
            onClick={() => toggleSection('tags')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              タグ
            </span>
            {expandedSections.tags ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>

          {expandedSections.tags && (
            <div className="space-y-3">
              {/* 選択中のタグ */}
              {filters.tags && filters.tags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">選択中のタグ:</p>
                  <div className="flex flex-wrap gap-1">
                    {filters.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="default"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-white hover:text-gray-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 人気タグ */}
              <div>
                <p className="text-xs text-gray-600 mb-2">人気タグ:</p>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_TAGS.map(tag => {
                    const isSelected = filters.tags?.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => isSelected ? handleRemoveTag(tag) : handleAddTag(tag)}
                        className={`px-2 py-1 rounded-md text-xs transition-colors ${
                          isSelected
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* カスタムタグ追加 */}
              <form onSubmit={handleCustomTagSubmit}>
                <Input
                  type="text"
                  placeholder="カスタムタグを追加..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  size="sm"
                />
              </form>
            </div>
          )}
        </div>

        {/* 作者フィルタ */}
        <div>
          <button
            onClick={() => toggleSection('author')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              作者
            </span>
            {expandedSections.author ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>

          {expandedSections.author && (
            <Input
              type="text"
              placeholder="作者名で検索..."
              value={filters.author || ''}
              onChange={(e) => updateFilter('author', e.target.value || undefined)}
              size="sm"
            />
          )}
        </div>

        {/* 企業フィルタ */}
        <div>
          <button
            onClick={() => toggleSection('company')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span className="flex items-center">
              <Building className="w-4 h-4 mr-2" />
              企業
            </span>
            {expandedSections.company ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>

          {expandedSections.company && (
            <Input
              type="text"
              placeholder="企業名で検索..."
              value={filters.company || ''}
              onChange={(e) => updateFilter('company', e.target.value || undefined)}
              size="sm"
            />
          )}
        </div>

        {/* 卒業年度フィルタ */}
        <div>
          <button
            onClick={() => toggleSection('year')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              卒業年度
            </span>
            {expandedSections.year ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>

          {expandedSections.year && (
            <div className="space-y-2">
              <button
                onClick={() => updateFilter('graduationYear', undefined)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  !filters.graduationYear
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                すべて
              </button>
              {GRADUATION_YEARS.map(year => (
                <button
                  key={year}
                  onClick={() => updateFilter('graduationYear', year)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    filters.graduationYear === year
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {year}年卒
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
// FilterPanel Component
// TODO: Implement filter panel for industry, company, graduation year, and tags 