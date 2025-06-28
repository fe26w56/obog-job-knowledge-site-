'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Filter, Check, CheckCheck, MessageCircle, Heart, Bookmark, UserPlus, AlertCircle, Settings, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { formatTimeAgo } from '@/lib/utils'

interface Notification {
  id: string
  type: 'comment' | 'like' | 'bookmark' | 'follow' | 'system' | 'approval'
  title: string
  message: string
  data?: any
  is_read: boolean
  created_at: string
  updated_at?: string
}

interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  })

  // 通知一覧を取得
  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const unreadOnly = filter === 'unread'
      const response = await fetch(
        `/api/notifications?page=${currentPage}&limit=20&unread_only=${unreadOnly}`,
        {
          headers: {
            'Authorization': 'Bearer dummy-token'
          }
        }
      )
      const result = await response.json()

      if (result.status === 'success') {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.unread_count)
        setPagination(result.data.pagination)
      }
    } catch (error) {
      console.error('通知取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [currentPage, filter])

  // 通知を既読にする
  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({ notification_ids: notificationIds })
      })

      if (response.ok) {
        // ローカル状態を更新
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, is_read: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
      }
    } catch (error) {
      console.error('既読処理エラー:', error)
    }
  }

  // 全て既読にする
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({ mark_all_as_read: true })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        )
        setUnreadCount(0)
        // 未読フィルタの場合は再取得
        if (filter === 'unread') {
          fetchNotifications()
        }
      }
    } catch (error) {
      console.error('一括既読処理エラー:', error)
    }
  }

  // 通知タイプに応じたアイコンを取得
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'bookmark':
        return <Bookmark className="w-5 h-5 text-yellow-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />
      case 'approval':
        return <CheckCheck className="w-5 h-5 text-purple-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  // 通知タイプに応じた背景色を取得
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-50 border-blue-200'
      case 'like':
        return 'bg-red-50 border-red-200'
      case 'bookmark':
        return 'bg-yellow-50 border-yellow-200'
      case 'follow':
        return 'bg-green-50 border-green-200'
      case 'system':
        return 'bg-gray-50 border-gray-200'
      case 'approval':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  // 通知タイプのラベルを取得
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'comment':
        return 'コメント'
      case 'like':
        return 'いいね'
      case 'bookmark':
        return 'ブックマーク'
      case 'follow':
        return 'フォロー'
      case 'system':
        return 'システム'
      case 'approval':
        return '承認'
      default:
        return '通知'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">通知</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : '未読通知はありません'}
                </p>
              </div>
            </div>
            
            {/* 一括操作 */}
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="flex items-center space-x-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span>全て既読</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* フィルタ */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">表示:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              すべて ({pagination.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              未読 ({unreadCount})
            </button>
          </div>
        </div>

        {/* 通知一覧 */}
        {isLoading ? (
          // ローディング状態
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map(notification => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.is_read 
                    ? `border-l-4 ${getNotificationBgColor(notification.type)}` 
                    : 'hover:bg-gray-50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* アイコン */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationBgColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getNotificationBgColor(notification.type)}`}>
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          
                          <h3 className={`text-lg ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'} mb-2`}>
                            {notification.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-3">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                          </div>
                        </div>

                        {/* アクション */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.is_read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead([notification.id])}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              既読
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* ページネーション */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.total_pages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        ) : (
          // 空の状態
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? '未読通知はありません' : '通知はありません'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'すべての通知が既読になっています'
                  : '新しい活動があると、ここに通知が表示されます'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 