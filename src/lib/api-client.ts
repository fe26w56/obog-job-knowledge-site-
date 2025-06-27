// API Client for Posts
import { Post, PostFormData, PostCategory } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error?: any
}

interface PostListResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

interface SearchResponse extends PostListResponse {
  search_info: {
    query: string
    keywords: string[]
    result_count: number
  }
}

// 投稿一覧取得
export async function fetchPosts(params: {
  page?: number
  limit?: number
  category?: PostCategory
  tag?: string
  sort?: string
  order?: 'asc' | 'desc'
}): Promise<PostListResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.category) searchParams.set('category', params.category)
  if (params.tag) searchParams.set('tag', params.tag)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.order) searchParams.set('order', params.order)

  const response = await fetch(`/api/posts?${searchParams.toString()}`)
  const result: ApiResponse<PostListResponse> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to fetch posts')
  }

  return result.data!
}

// 投稿詳細取得
export async function fetchPost(id: string): Promise<Post> {
  const response = await fetch(`/api/posts/${id}`)
  const result: ApiResponse<{ post: Post }> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to fetch post')
  }

  return result.data!.post
}

// 投稿作成
export async function createPost(data: PostFormData, token?: string): Promise<Post> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch('/api/posts', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })

  const result: ApiResponse<{ post: Post }> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to create post')
  }

  return result.data!.post
}

// 投稿更新
export async function updatePost(id: string, data: Partial<PostFormData>, token?: string): Promise<Post> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })

  const result: ApiResponse<{ post: Post }> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to update post')
  }

  return result.data!.post
}

// 投稿削除
export async function deletePost(id: string, token?: string): Promise<void> {
  const headers: HeadersInit = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/posts/${id}`, {
    method: 'DELETE',
    headers,
  })

  const result: ApiResponse = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to delete post')
  }
}

// 投稿検索
export async function searchPosts(params: {
  q: string
  page?: number
  limit?: number
  category?: PostCategory
  tag?: string
  sort?: string
  order?: 'asc' | 'desc'
}): Promise<SearchResponse> {
  const searchParams = new URLSearchParams()
  
  searchParams.set('q', params.q)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.category) searchParams.set('category', params.category)
  if (params.tag) searchParams.set('tag', params.tag)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.order) searchParams.set('order', params.order)

  const response = await fetch(`/api/posts/search?${searchParams.toString()}`)
  const result: ApiResponse<SearchResponse> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to search posts')
  }

  return result.data!
}

// 検索候補取得
export async function fetchSearchSuggestions(query: string): Promise<Array<{
  type: 'tag' | 'title'
  text: string
  display: string
}>> {
  const response = await fetch('/api/posts/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  const result: ApiResponse<{ suggestions: Array<{ type: 'tag' | 'title', text: string, display: string }> }> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to fetch suggestions')
  }

  return result.data!.suggestions
}

// いいね状態取得
export async function fetchLikeStatus(postId: string, token?: string): Promise<{
  liked: boolean
  like_count: number
}> {
  const headers: HeadersInit = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/posts/${postId}/like`, {
    headers,
  })

  const result: ApiResponse<{ liked: boolean, like_count: number }> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to fetch like status')
  }

  return result.data!
}

// いいね切り替え
export async function toggleLike(postId: string, token?: string): Promise<{
  liked: boolean
  like_count: number
}> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    headers,
  })

  const result: ApiResponse<{ liked: boolean, like_count: number }> = await response.json()

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to toggle like')
  }

  return result.data!
} 