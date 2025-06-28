'use client'

import { useState, useEffect, createContext, useContext } from 'react'

interface User {
  id: string
  email: string
  role: 'admin' | 'obog' | 'current'
  fullName?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, otpCode: string) => Promise<void>
  logout: () => Promise<void>
  getAuthToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 実際の認証フック
export const useAuthReal = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 認証状態をチェック
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          if (result.status === 'success' && result.data?.user) {
            setUser({
              id: result.data.user.id,
              email: result.data.user.email,
              role: result.data.user.role,
              fullName: result.data.user.displayName
            })
          }
        }
      } catch (error) {
        console.error('認証チェックエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, otpCode: string) => {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp_code: otpCode,
        purpose: 'login'
      }),
      credentials: 'include'
    })

    const result = await response.json()

    if (!response.ok || result.status === 'error') {
      throw new Error(result.message || 'ログインに失敗しました')
    }

    if (result.data?.user) {
      setUser({
        id: result.data.user.id,
        email: result.data.user.email,
        role: result.data.user.role,
        fullName: result.data.user.displayName
      })
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('ログアウトエラー:', error)
    } finally {
      setUser(null)
    }
  }

  const getAuthToken = () => {
    // クッキーからトークンを取得する必要がある場合は実装
    return null
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    getAuthToken
  }
}

// 開発用の簡易認証フック
export const useAuthDev = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 開発環境での模擬認証チェック
    const checkAuth = async () => {
      try {
        // localStorage から認証情報を取得（開発用）
        const savedUser = localStorage.getItem('dev-user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
        // デフォルトユーザーの自動設定は削除 - 未ログイン状態から開始
      } catch (error) {
        console.error('認証チェックエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, otpCode: string) => {
    // 実際のOTP認証を使用
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp_code: otpCode,
        purpose: 'login'
      }),
      credentials: 'include'
    })

    const result = await response.json()

    if (!response.ok || result.status === 'error') {
      throw new Error(result.message || 'ログインに失敗しました')
    }

    if (result.data?.user) {
      const user: User = {
        id: result.data.user.id,
        email: result.data.user.email,
        role: result.data.user.role,
        fullName: result.data.user.displayName
      }
      setUser(user)
      localStorage.setItem('dev-user', JSON.stringify(user))
    }
  }

  // プロフィール更新時にユーザー情報を同期する関数
  const updateUserEmail = (newEmail: string) => {
    if (user) {
      const updatedUser = { ...user, email: newEmail }
      setUser(updatedUser)
      localStorage.setItem('dev-user', JSON.stringify(updatedUser))
    }
  }

  // 認証状態をリフレッシュする関数
  const refreshAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success' && result.data?.user) {
          const user: User = {
            id: result.data.user.id,
            email: result.data.user.email,
            role: result.data.user.role,
            fullName: result.data.user.displayName
          }
          setUser(user)
          localStorage.setItem('dev-user', JSON.stringify(user))
        }
      }
    } catch (error) {
      console.error('認証状態リフレッシュエラー:', error)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('ログアウトエラー:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('dev-user')
    }
  }

  const getAuthToken = () => {
    return user ? 'dummy-token' : null
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    getAuthToken,
    updateUserEmail, // email更新用の関数を追加
    refreshAuth // 認証状態リフレッシュ用の関数を追加
  }
} 