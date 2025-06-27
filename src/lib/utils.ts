import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind CSSクラスを結合するユーティリティ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日付フォーマット関数
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  
  return new Intl.DateTimeFormat('ja-JP', defaultOptions).format(dateObj)
}

// 相対時間フォーマット関数
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'たった今'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}時間前`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}日前`
  } else {
    return formatDate(dateObj)
  }
}

// テキスト切り詰め関数
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}

// URL バリデーション
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// メールアドレス バリデーション
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// スラッグ生成関数
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ランダム文字列生成
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// OTP生成関数
export function generateOTP(length: number = 6): string {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length))
  }
  return otp
}

// 招待コード生成関数
export function generateInvitationCode(): string {
  return generateRandomString(8).toUpperCase()
}

// ファイルサイズフォーマット
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// カテゴリー表示名変換
export function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    job_hunting_tips: '就活のコツ',
    interview_experience: '面接体験談',
    company_review: '企業レビュー',
    career_advice: 'キャリアアドバイス',
    skill_development: 'スキル開発',
    networking: 'ネットワーキング',
    general: '一般',
  }
  
  return categoryNames[category] || category
}

// ロール表示名変換
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: '管理者',
    obog: 'OBOG',
    current: '現役生',
    pending: '承認待ち',
  }
  
  return roleNames[role] || role
}

// ステータス表示名変換
export function getStatusDisplayName(status: string): string {
  const statusNames: Record<string, string> = {
    active: 'アクティブ',
    inactive: '非アクティブ',
    suspended: '停止中',
    published: '公開中',
    draft: '下書き',
    archived: 'アーカイブ済み',
    pending: '承認待ち',
    approved: '承認済み',
    rejected: '拒否済み',
  }
  
  return statusNames[status] || status
}

// URLパラメータからオブジェクトを作成
export function searchParamsToObject(searchParams: URLSearchParams): Record<string, string> {
  const object: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    object[key] = value
  })
  return object
}

// オブジェクトからURLSearchParamsを作成
export function objectToSearchParams(object: Record<string, string | number | boolean>): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(object).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  return params
}

// 配列をページネーション
export function paginateArray<T>(array: T[], page: number, limit: number): {
  items: T[]
  total: number
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrev: boolean
} {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const items = array.slice(startIndex, endIndex)
  const total = array.length
  const totalPages = Math.ceil(total / limit)
  
  return {
    items,
    total,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// デバウンス関数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// スロットル関数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
} 