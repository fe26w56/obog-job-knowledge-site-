'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Home, Search, Bookmark, Bell, Settings, Users } from 'lucide-react'
import { useAuthDev } from '@/hooks/useAuth'

const Navigation = () => {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthDev()

  const navigationItems = [
    {
      name: 'ホーム',
      href: '/',
      icon: Home,
      show: true
    },
    {
      name: '投稿一覧',
      href: '/posts',
      icon: Search,
      show: isAuthenticated
    },
    {
      name: 'ブックマーク',
      href: '/bookmarks',
      icon: Bookmark,
      show: isAuthenticated
    },
    {
      name: '通知',
      href: '/notifications',
      icon: Bell,
      show: isAuthenticated
    },
    {
      name: 'プロフィール',
      href: '/profile',
      icon: User,
      show: isAuthenticated
    },
    {
      name: '管理画面',
      href: '/admin',
      icon: Users,
      show: isAuthenticated && user?.role === 'admin'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">就</span>
            </div>
            <span className="font-semibold text-gray-900">就活ナレッジ</span>
          </Link>

          {/* ナビゲーションメニュー */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems
              .filter(item => item.show)
              .map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
          </div>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user.fullName || user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.role === 'admin' ? '管理者' : 
                     user.role === 'obog' ? 'OB/OG' : '現役生'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems
              .filter(item => item.show)
              .map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 