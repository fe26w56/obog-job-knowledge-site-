'use client'

import Link from 'next/link'
import { Bell, Search, Menu, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthDev } from '@/hooks/useAuth'
import { useState, useEffect, useRef } from 'react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthDev()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  // ユーザーメニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OB</span>
              </div>
              <span className="font-bold text-xl text-gray-900">就活ナレッジ</span>
            </Link>
          </div>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/posts" className="text-gray-600 hover:text-gray-900 transition-colors">
                投稿一覧
              </Link>
              <Link href="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                検索
              </Link>
              <Link href="/bookmarks" className="text-gray-600 hover:text-gray-900 transition-colors">
                ブックマーク
              </Link>
              <Link href="/notifications" className="text-gray-600 hover:text-gray-900 transition-colors">
                通知
              </Link>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Search */}
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <Link href="/notifications">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="h-5 w-5" />
                  </Button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user?.fullName || user?.email}</div>
                        <div className="text-xs text-gray-500">
                          {user?.role === 'admin' ? '管理者' : 
                           user?.role === 'obog' ? 'OB/OG' : '現役生'}
                        </div>
                      </div>
                      <Link href="/profile" onClick={() => setShowUserMenu(false)}>
                        <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          プロフィール
                        </div>
                      </Link>
                      <Link href="/profile/edit" onClick={() => setShowUserMenu(false)}>
                        <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          プロフィール編集
                        </div>
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setShowUserMenu(false)}>
                          <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            管理画面
                          </div>
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="w-4 h-4 mr-2" />
                          ログアウト
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu */}
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline">ログイン</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>新規登録</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 