// ユーザー関連の型定義
export interface User {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  avatar_url?: string
  graduation_year?: number
  department?: string
  industry?: string
  company?: string
  job_title?: string
  bio?: string
  contact_visible: boolean
  linkedin_url?: string
  twitter_url?: string
  created_at: string
  updated_at: string
}

export type UserRole = 'admin' | 'obog' | 'current' | 'pending'
export type UserStatus = 'active' | 'inactive' | 'suspended'

// 投稿関連の型定義
export interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  category: PostCategory
  tags: string[]
  author_id: string
  author?: UserProfile
  status: PostStatus
  view_count: number
  like_count: number
  comment_count: number
  bookmark_count: number
  created_at: string
  updated_at: string
  published_at?: string
}

export type PostCategory = 
  | 'job_hunting_tips'
  | 'interview_experience'
  | 'company_review'
  | 'career_advice'
  | 'skill_development'
  | 'networking'
  | 'general'

export type PostStatus = 'draft' | 'published' | 'archived'

// コメント関連の型定義
export interface Comment {
  id: string
  post_id: string
  author_id: string
  author?: UserProfile
  content: string
  parent_id?: string
  replies?: Comment[]
  like_count: number
  status: CommentStatus
  created_at: string
  updated_at: string
}

export type CommentStatus = 'published' | 'pending' | 'rejected'

// ブックマーク関連の型定義
export interface Bookmark {
  id: string
  user_id: string
  post_id: string
  post?: Post
  created_at: string
}

// 通知関連の型定義
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
}

export type NotificationType = 
  | 'new_post'
  | 'new_comment'
  | 'comment_reply'
  | 'post_liked'
  | 'comment_liked'
  | 'user_approved'
  | 'system_announcement'

// 連絡先許可関連の型定義
export interface ContactPermission {
  id: string
  requester_id: string
  target_id: string
  requester?: UserProfile
  target?: UserProfile
  status: PermissionStatus
  message?: string
  created_at: string
  updated_at: string
}

export type PermissionStatus = 'pending' | 'approved' | 'rejected'

// 招待関連の型定義
export interface Invitation {
  id: string
  email: string
  role: UserRole
  invited_by: string
  inviter?: UserProfile
  code: string
  expires_at: string
  used: boolean
  used_at?: string
  created_at: string
}

// OTP関連の型定義
export interface OTPLog {
  id: string
  email: string
  otp_code: string
  purpose: OTPPurpose
  expires_at: string
  verified: boolean
  verified_at?: string
  attempts: number
  created_at: string
}

export type OTPPurpose = 'login' | 'register' | 'password_reset'

// API関連の型定義
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

export interface SearchParams {
  query?: string
  category?: PostCategory
  tags?: string[]
  author_id?: string
  sort_by?: 'created_at' | 'updated_at' | 'view_count' | 'like_count'
  sort_order?: 'asc' | 'desc'
}

// フォーム関連の型定義
export interface LoginFormData {
  email: string
  password?: string
  otp?: string
}

export interface RegisterFormData {
  email: string
  display_name: string
  graduation_year?: number
  department?: string
  invitation_code?: string
}

export interface PostFormData {
  title: string
  content: string
  category: PostCategory
  tags: string[]
  status: PostStatus
}

export interface ProfileFormData {
  display_name: string
  avatar_url?: string
  graduation_year?: number
  department?: string
  industry?: string
  company?: string
  job_title?: string
  bio?: string
  contact_visible: boolean
  linkedin_url?: string
  twitter_url?: string
}

// 活動ログ関連の型定義
export interface ActivityLog {
  id: string
  user_id: string
  action: ActivityAction
  resource_type: ResourceType
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export type ActivityAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'approve'
  | 'reject'

export type ResourceType = 
  | 'user'
  | 'post'
  | 'comment'
  | 'bookmark'
  | 'notification'
  | 'permission'
  | 'invitation' 