'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, TrendingUp, X, ArrowRight, Hash, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface SearchSuggestion {
  id: string
  type: 'keyword' | 'tag' | 'user' | 'company'
  value: string
  label: string
  count?: number
  icon?: React.ReactNode
}

interface SearchBarProps {
  initialValue?: string
  placeholder?: string
  onSearch?: (query: string) => void
  showSuggestions?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SearchBar({
  initialValue = '',
  placeholder = 'キーワード、タグ、企業名で検索...',
  onSearch,
  showSuggestions = true,
  size = 'md',
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 人気検索キーワード・タグ
  const popularSearches = [
    { type: 'keyword' as const, value: '外資系コンサル', label: '外資系コンサル', count: 45 },
    { type: 'keyword' as const, value: 'IT転職', label: 'IT転職', count: 38 },
    { type: 'tag' as const, value: '面接対策', label: '#面接対策', count: 67 },
    { type: 'tag' as const, value: 'ES添削', label: '#ES添削', count: 52 },
    { type: 'company' as const, value: 'マッキンゼー', label: 'マッキンゼー・アンド・カンパニー', count: 23 },
    { type: 'company' as const, value: 'Google', label: 'Google Japan', count: 31 }
  ]

  // 検索履歴をローカルストレージから読み込み
  useEffect(() => {
    const history = localStorage.getItem('searchHistory')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // 検索候補を取得
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: 実際のAPI呼び出し
      // const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
      // const data = await response.json()

      // 模擬データ
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          type: 'keyword',
          value: `${searchQuery} 面接`,
          label: `${searchQuery} 面接`,
          count: 12,
          icon: <Search className="w-4 h-4" />
        },
        {
          id: '2',
          type: 'keyword',
          value: `${searchQuery} ES`,
          label: `${searchQuery} ES`,
          count: 8,
          icon: <Search className="w-4 h-4" />
        },
        {
          id: '3',
          type: 'tag',
          value: searchQuery,
          label: `#${searchQuery}`,
          count: 15,
          icon: <Hash className="w-4 h-4" />
        },
        {
          id: '4',
          type: 'company',
          value: `${searchQuery}株式会社`,
          label: `${searchQuery}株式会社`,
          count: 5,
          icon: <Building className="w-4 h-4" />
        }
      ].filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)

      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error('検索候補取得エラー:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 入力値変更時の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (showSuggestions) {
      fetchSuggestions(value)
      setIsOpen(true)
    }
  }

  // 検索実行
  const executeSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    // 検索履歴に追加
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))

    // 検索実行
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
    
    setIsOpen(false)
    inputRef.current?.blur()
  }, [searchHistory, onSearch, router])

  // フォーム送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch(query)
  }

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const totalItems = suggestions.length + (query ? 0 : Math.min(searchHistory.length, 5))

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          if (query && selectedIndex < suggestions.length) {
            executeSearch(suggestions[selectedIndex].value)
          } else if (!query && selectedIndex < searchHistory.length) {
            const historyQuery = searchHistory[selectedIndex]
            setQuery(historyQuery)
            executeSearch(historyQuery)
          }
        } else {
          executeSearch(query)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // 候補選択
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value)
    executeSearch(suggestion.value)
  }

  // 検索履歴選択
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    executeSearch(historyQuery)
  }

  // 検索履歴削除
  const removeFromHistory = (historyQuery: string) => {
    const newHistory = searchHistory.filter(h => h !== historyQuery)
    setSearchHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  // 人気検索選択
  const handlePopularClick = (popularSearch: SearchSuggestion) => {
    setQuery(popularSearch.value)
    executeSearch(popularSearch.value)
  }

  // フォーカス管理
  const handleFocus = () => {
    setIsOpen(true)
    if (!query && showSuggestions) {
      setSuggestions([])
    }
  }

  const handleBlur = () => {
    // 少し遅延してから閉じる（クリックイベントが実行されるように）
    setTimeout(() => setIsOpen(false), 200)
  }

  // ホットキー（Ctrl/Cmd + K）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // サイズクラス
  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-14 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className={`relative ${className}`}>
      {/* 検索フォーム */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${iconSizes[size]}`} />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`pl-10 pr-20 ${sizeClasses[size]} ${className}`}
            autoComplete="off"
          />
          
          {/* ホットキー表示 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">K</kbd>
            </div>
          </div>
        </div>
      </form>

      {/* 検索候補ドロップダウン */}
      {isOpen && showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* ローディング */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          )}

          {/* 検索候補 */}
          {!isLoading && query && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                検索候補
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 ${
                    selectedIndex === index ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {suggestion.icon}
                    <span>{suggestion.label}</span>
                    {suggestion.type === 'tag' && (
                      <Badge variant="secondary" size="sm">タグ</Badge>
                    )}
                    {suggestion.type === 'company' && (
                      <Badge variant="outline" size="sm">企業</Badge>
                    )}
                  </div>
                  {suggestion.count && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{suggestion.count}件</span>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* 検索履歴 */}
          {!query && searchHistory.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                最近の検索
              </div>
              {searchHistory.slice(0, 5).map((historyQuery, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 ${
                    selectedIndex === index ? 'bg-primary-50' : ''
                  }`}
                >
                  <button
                    onClick={() => handleHistoryClick(historyQuery)}
                    className="flex items-center space-x-3 text-left flex-1"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{historyQuery}</span>
                  </button>
                  <button
                    onClick={() => removeFromHistory(historyQuery)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 人気検索 */}
          {!query && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                人気検索
              </div>
              {popularSearches.map((popular, index) => (
                <button
                  key={popular.value}
                  onClick={() => handlePopularClick(popular)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {popular.type === 'tag' && <Hash className="w-4 h-4 text-gray-400" />}
                    {popular.type === 'company' && <Building className="w-4 h-4 text-gray-400" />}
                    {popular.type === 'keyword' && <Search className="w-4 h-4 text-gray-400" />}
                    <span className="text-gray-900">{popular.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{popular.count}件</span>
                </button>
              ))}
            </div>
          )}

          {/* 候補なし */}
          {!isLoading && query && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">候補が見つかりませんでした</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 