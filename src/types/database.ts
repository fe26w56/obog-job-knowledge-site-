// Supabaseのデータベース型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'obog' | 'current' | 'pending'
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'obog' | 'current' | 'pending'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'obog' | 'current' | 'pending'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          avatar_url: string | null
          graduation_year: number | null
          department: string | null
          industry: string | null
          company: string | null
          job_title: string | null
          bio: string | null
          contact_visible: boolean
          linkedin_url: string | null
          twitter_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          avatar_url?: string | null
          graduation_year?: number | null
          department?: string | null
          industry?: string | null
          company?: string | null
          job_title?: string | null
          bio?: string | null
          contact_visible?: boolean
          linkedin_url?: string | null
          twitter_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          avatar_url?: string | null
          graduation_year?: number | null
          department?: string | null
          industry?: string | null
          company?: string | null
          job_title?: string | null
          bio?: string | null
          contact_visible?: boolean
          linkedin_url?: string | null
          twitter_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          category: 'job_hunting_tips' | 'interview_experience' | 'company_review' | 'career_advice' | 'skill_development' | 'networking' | 'general'
          tags: string[]
          author_id: string
          status: 'draft' | 'published' | 'archived'
          view_count: number
          like_count: number
          comment_count: number
          bookmark_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          category: 'job_hunting_tips' | 'interview_experience' | 'company_review' | 'career_advice' | 'skill_development' | 'networking' | 'general'
          tags?: string[]
          author_id: string
          status?: 'draft' | 'published' | 'archived'
          view_count?: number
          like_count?: number
          comment_count?: number
          bookmark_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          category?: 'job_hunting_tips' | 'interview_experience' | 'company_review' | 'career_advice' | 'skill_development' | 'networking' | 'general'
          tags?: string[]
          author_id?: string
          status?: 'draft' | 'published' | 'archived'
          view_count?: number
          like_count?: number
          comment_count?: number
          bookmark_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          parent_id: string | null
          like_count: number
          status: 'published' | 'pending' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          parent_id?: string | null
          like_count?: number
          status?: 'published' | 'pending' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          parent_id?: string | null
          like_count?: number
          status?: 'published' | 'pending' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'new_post' | 'new_comment' | 'comment_reply' | 'post_liked' | 'comment_liked' | 'user_approved' | 'system_announcement'
          title: string
          message: string
          data: any | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'new_post' | 'new_comment' | 'comment_reply' | 'post_liked' | 'comment_liked' | 'user_approved' | 'system_announcement'
          title: string
          message: string
          data?: any | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'new_post' | 'new_comment' | 'comment_reply' | 'post_liked' | 'comment_liked' | 'user_approved' | 'system_announcement'
          title?: string
          message?: string
          data?: any | null
          read?: boolean
          created_at?: string
        }
      }
      contact_permissions: {
        Row: {
          id: string
          requester_id: string
          target_id: string
          status: 'pending' | 'approved' | 'rejected'
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          target_id: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          target_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'obog' | 'current' | 'pending'
          invited_by: string
          code: string
          expires_at: string
          used: boolean
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'obog' | 'current' | 'pending'
          invited_by: string
          code: string
          expires_at: string
          used?: boolean
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'obog' | 'current' | 'pending'
          invited_by?: string
          code?: string
          expires_at?: string
          used?: boolean
          used_at?: string | null
          created_at?: string
        }
      }
      otp_logs: {
        Row: {
          id: string
          email: string
          otp_code: string
          purpose: 'login' | 'register' | 'password_reset'
          expires_at: string
          verified: boolean
          verified_at: string | null
          attempts: number
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          otp_code: string
          purpose: 'login' | 'register' | 'password_reset'
          expires_at: string
          verified?: boolean
          verified_at?: string | null
          attempts?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          otp_code?: string
          purpose?: 'login' | 'register' | 'password_reset'
          expires_at?: string
          verified?: boolean
          verified_at?: string | null
          attempts?: number
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject'
          resource_type: 'user' | 'post' | 'comment' | 'bookmark' | 'notification' | 'permission' | 'invitation'
          resource_id: string | null
          details: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject'
          resource_type: 'user' | 'post' | 'comment' | 'bookmark' | 'notification' | 'permission' | 'invitation'
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject'
          resource_type?: 'user' | 'post' | 'comment' | 'bookmark' | 'notification' | 'permission' | 'invitation'
          resource_id?: string | null
          details?: any | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'obog' | 'current' | 'pending'
      user_status: 'active' | 'inactive' | 'suspended'
      post_category: 'job_hunting_tips' | 'interview_experience' | 'company_review' | 'career_advice' | 'skill_development' | 'networking' | 'general'
      post_status: 'draft' | 'published' | 'archived'
      comment_status: 'published' | 'pending' | 'rejected'
      notification_type: 'new_post' | 'new_comment' | 'comment_reply' | 'post_liked' | 'comment_liked' | 'user_approved' | 'system_announcement'
      permission_status: 'pending' | 'approved' | 'rejected'
      otp_purpose: 'login' | 'register' | 'password_reset'
      activity_action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject'
      resource_type: 'user' | 'post' | 'comment' | 'bookmark' | 'notification' | 'permission' | 'invitation'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 