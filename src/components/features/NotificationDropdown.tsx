'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, X, MessageCircle, Heart, Bookmark, UserPlus, AlertCircle, Settings, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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

interface NotificationDropdownProps {
  className?: string
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = ''
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 通知一覧を取得
  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=10', {
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      })
      const result = await response.json()

      if (result.status === 'success') {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.unread_count)
      }
    } catch (error) {
      console.error('通知取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初期読み込み
  useEffect(() => {
    fetchNotifications()
  }, [])

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      }
    } catch (error) {
      console.error('一括既読処理エラー:', error)
    }
  }

  // 通知タイプに応じたアイコンを取得
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />
      case 'bookmark':
        return <Bookmark className="w-4 h-4 text-yellow-500" />
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />
      case 'approval':
        return <CheckCheck className="w-4 h-4 text-purple-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  // 通知タイプに応じた背景色を取得
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-50'
      case 'like':
        return 'bg-red-50'
      case 'bookmark':
        return 'bg-yellow-50'
      case 'follow':
        return 'bg-green-50'
      case 'system':
        return 'bg-gray-50'
      case 'approval':
        return 'bg-purple-50'
      default:
        return 'bg-gray-50'
    }
  }

  // ドロップダウンを開く
  const handleToggleDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      fetchNotifications() // 開く時に最新の通知を取得
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 通知ベルアイコン */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">通知</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  全て既読
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 通知リスト */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              // ローディング状態
              <div className="p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-3 p-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.is_read && markAsRead([notification.id])}
                  >
                    <div className="flex space-x-3">
                      {/* アイコン */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationBgColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                          </div>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead([notification.id])
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 空の状態
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">通知はありません</p>
              </div>
            )}
          </div>

          {/* フッター */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  // 通知ページに遷移
                  window.location.href = '/notifications'
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                すべての通知を見る
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown 