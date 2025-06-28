'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Bookmark,
  Flag
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  excerpt: string
  category: 'job_hunting_tips' | 'interview_experience' | 'company_review' | 'career_advice' | 'skill_development' | 'networking' | 'general'
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  author: {
    id: string
    display_name: string
    email: string
    role: 'admin' | 'obog' | 'current'
    avatar_url?: string
  }
  created_at: string
  updated_at: string
  published_at?: string
  stats: {
    views: number
    likes: number
    comments: number
    bookmarks: number
  }
  reports?: {
    count: number
    reasons: string[]
  }
}

interface PostActionModalProps {
  post: Post | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (action: string, data?: any) => void
  action: 'approve' | 'reject' | 'archive' | 'publish' | 'delete' | 'report' | null
}

const PostActionModal: React.FC<PostActionModalProps> = ({
  post,
  isOpen,
  onClose,
  onConfirm,
  action
}) => {
  const [reason, setReason] = useState('')
  const [newStatus, setNewStatus] = useState<'draft' | 'published' | 'archived'>('published')

  const handleConfirm = () => {
    if (action === 'approve' || action === 'publish') {
      onConfirm(action, { status: 'published', reason })
    } else {
      onConfirm(action!, { reason, status: newStatus })
    }
    setReason('')
    onClose()
  }

  const getModalTitle = () => {
    switch (action) {
      case 'approve': return '投稿を承認'
      case 'reject': return '投稿を拒否'
      case 'archive': return '投稿をアーカイブ'
      case 'publish': return '投稿を公開'
      case 'delete': return '投稿を削除'
      case 'report': return '投稿を報告'
      default: return '投稿操作'
    }
  }

  const getModalMessage = () => {
    switch (action) {
      case 'approve': 
        return `「${post?.title}」を承認して公開しますか？`
      case 'reject': 
        return `「${post?.title}」を拒否しますか？拒否理由を入力してください。`
      case 'archive': 
        return `「${post?.title}」をアーカイブしますか？アーカイブされた投稿は非公開になります。`
      case 'publish': 
        return `「${post?.title}」を公開しますか？`
      case 'delete': 
        return `「${post?.title}」を完全に削除しますか？この操作は取り消せません。`
      case 'report': 
        return `「${post?.title}」を不適切な投稿として報告しますか？`
      default: return ''
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {getModalTitle()}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {getModalMessage()}
        </p>

        {(action === 'reject' || action === 'archive' || action === 'report') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {action === 'reject' ? '拒否理由' : action === 'archive' ? 'アーカイブ理由' : '報告理由'}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`${action === 'reject' ? '拒否' : action === 'archive' ? 'アーカイブ' : '報告'}理由を入力してください`}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              (action === 'reject' || action === 'archive' || action === 'report') && !reason.trim()
            }
            className={
              action === 'delete' || action === 'reject' || action === 'report'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : action === 'approve' || action === 'publish'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          >
            {action === 'approve' ? '承認' : 
             action === 'reject' ? '拒否' : 
             action === 'archive' ? 'アーカイブ' : 
             action === 'publish' ? '公開' : 
             action === 'delete' ? '削除' : 
             action === 'report' ? '報告' : '実行'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'archive' | 'publish' | 'delete' | 'report' | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  // 投稿一覧を取得
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      // TODO: 実際のAPI呼び出しに置き換え
      const mockPosts: Post[] = [
        {
          id: '1',
          title: '面接で聞かれた質問と回答のコツ',
          content: '面接でよく聞かれる質問とその対策について詳しく解説します...',
          excerpt: '面接でよく聞かれる質問とその対策について',
          category: 'interview_experience',
          status: 'published',
          tags: ['面接', '就活', 'コツ'],
          author: {
            id: '1',
            display_name: '山田太郎',
            email: 'yamada@example.com',
            role: 'obog'
          },
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
          published_at: '2024-01-20T10:00:00Z',
          stats: {
            views: 156,
            likes: 23,
            comments: 8,
            bookmarks: 12
          }
        },
        {
          id: '2',
          title: 'エンジニア職の志望動機の書き方',
          content: 'エンジニア職を志望する際の効果的な志望動機の書き方を説明します...',
          excerpt: 'エンジニア職を志望する際の効果的な志望動機の書き方',
          category: 'job_hunting_tips',
          status: 'draft',
          tags: ['エンジニア', '志望動機', '書類選考'],
          author: {
            id: '2',
            display_name: '佐藤花子',
            email: 'sato@example.com',
            role: 'current'
          },
          created_at: '2024-01-25T15:30:00Z',
          updated_at: '2024-01-25T15:30:00Z',
          stats: {
            views: 0,
            likes: 0,
            comments: 0,
            bookmarks: 0
          }
        },
        {
          id: '3',
          title: 'A社の選考体験記',
          content: 'A社の選考を受けた体験談をシェアします...',
          excerpt: 'A社の選考を受けた体験談',
          category: 'company_review',
          status: 'published',
          tags: ['選考体験', '企業研究'],
          author: {
            id: '3',
            display_name: '田中次郎',
            email: 'tanaka@example.com',
            role: 'obog'
          },
          created_at: '2024-01-22T14:20:00Z',
          updated_at: '2024-01-22T14:20:00Z',
          published_at: '2024-01-22T14:20:00Z',
          stats: {
            views: 89,
            likes: 15,
            comments: 5,
            bookmarks: 8
          },
          reports: {
            count: 2,
            reasons: ['不適切な内容', '企業情報の漏洩']
          }
        },
        {
          id: '4',
          title: 'プログラミングスキルの身につけ方',
          content: '効率的なプログラミング学習方法について...',
          excerpt: '効率的なプログラミング学習方法',
          category: 'skill_development',
          status: 'archived',
          tags: ['プログラミング', 'スキル', '学習'],
          author: {
            id: '4',
            display_name: '鈴木一郎',
            email: 'suzuki@example.com',
            role: 'obog'
          },
          created_at: '2024-01-18T09:15:00Z',
          updated_at: '2024-01-23T16:45:00Z',
          stats: {
            views: 234,
            likes: 45,
            comments: 12,
            bookmarks: 28
          }
        }
      ]
      setPosts(mockPosts)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングされた投稿一覧
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    const matchesAuthor = filterAuthor === 'all' || post.author.role === filterAuthor
    
    return matchesSearch && matchesCategory && matchesStatus && matchesAuthor
  })

  // 投稿アクション実行
  const handlePostAction = async (action: string, data?: any) => {
    if (!selectedPost) return

    try {
      console.log(`Executing ${action} for post ${selectedPost.id}`, data)
      
      // TODO: 実際のAPI呼び出しに置き換え
      switch (action) {
        case 'approve':
        case 'publish':
          setPosts(posts.map(post => 
            post.id === selectedPost.id 
              ? { ...post, status: 'published', published_at: new Date().toISOString() }
              : post
          ))
          break
        case 'reject':
          setPosts(posts.map(post => 
            post.id === selectedPost.id 
              ? { ...post, status: 'draft' }
              : post
          ))
          break
        case 'archive':
          setPosts(posts.map(post => 
            post.id === selectedPost.id 
              ? { ...post, status: 'archived' }
              : post
          ))
          break
        case 'delete':
          setPosts(posts.filter(post => post.id !== selectedPost.id))
          break
        case 'report':
          setPosts(posts.map(post => 
            post.id === selectedPost.id 
              ? { 
                  ...post, 
                  reports: { 
                    count: (post.reports?.count || 0) + 1,
                    reasons: [...(post.reports?.reasons || []), data.reason]
                  }
                }
              : post
          ))
          break
      }
      
      alert(`${action}を実行しました`)
    } catch (error) {
      console.error(`Failed to ${action} post:`, error)
      alert(`${action}の実行に失敗しました`)
    }
  }

  const openActionModal = (post: Post, action: 'approve' | 'reject' | 'archive' | 'publish' | 'delete' | 'report') => {
    setSelectedPost(post)
    setCurrentAction(action)
    setActionModalOpen(true)
    setDropdownOpen(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">公開中</Badge>
      case 'draft':
        return <Badge variant="warning">下書き</Badge>
      case 'archived':
        return <Badge variant="secondary">アーカイブ</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: Record<string, string> = {
      job_hunting_tips: '就活のコツ',
      interview_experience: '面接体験',
      company_review: '企業レビュー',
      career_advice: 'キャリア相談',
      skill_development: 'スキル開発',
      networking: 'ネットワーキング',
      general: '一般'
    }
    return categoryNames[category] || category
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="danger">管理者</Badge>
      case 'obog':
        return <Badge variant="primary">OBOG</Badge>
      case 'current':
        return <Badge variant="success">現役生</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">投稿情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                投稿管理
              </h1>
              <p className="mt-2 text-gray-600">
                投稿の承認、編集、削除、モデレーション
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総投稿数</p>
                  <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">公開中</p>
                  <p className="text-2xl font-bold text-green-600">
                    {posts.filter(p => p.status === 'published').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">下書き</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {posts.filter(p => p.status === 'draft').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">報告済み</p>
                  <p className="text-2xl font-bold text-red-600">
                    {posts.filter(p => p.reports && p.reports.count > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 検索・フィルター */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="タイトル、内容、著者で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべてのカテゴリ</option>
                <option value="job_hunting_tips">就活のコツ</option>
                <option value="interview_experience">面接体験</option>
                <option value="company_review">企業レビュー</option>
                <option value="career_advice">キャリア相談</option>
                <option value="skill_development">スキル開発</option>
                <option value="networking">ネットワーキング</option>
                <option value="general">一般</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべてのステータス</option>
                <option value="published">公開中</option>
                <option value="draft">下書き</option>
                <option value="archived">アーカイブ</option>
              </select>

              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべての著者</option>
                <option value="admin">管理者</option>
                <option value="obog">OBOG</option>
                <option value="current">現役生</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 投稿一覧 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      投稿
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      著者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      統計
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {post.title}
                              </h3>
                              {post.reports && post.reports.count > 0 && (
                                <Flag className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {post.excerpt}
                            </p>
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={post.author.avatar_url}
                            name={post.author.display_name}
                            size="sm"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {post.author.display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getRoleBadge(post.author.role)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">
                          {getCategoryDisplayName(post.category)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.stats.views}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{post.stats.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{post.stats.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Bookmark className="w-3 h-3" />
                              <span>{post.stats.bookmarks}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(post.created_at)}</div>
                        {post.published_at && post.status === 'published' && (
                          <div className="text-xs text-green-600">
                            公開: {formatDate(post.published_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDropdownOpen(dropdownOpen === post.id ? null : post.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {dropdownOpen === post.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <Link
                                  href={`/posts/${post.id}`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  表示
                                </Link>

                                <Link
                                  href={`/posts/${post.id}/edit`}
                                  className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  編集
                                </Link>

                                {post.status === 'draft' && (
                                  <button
                                    onClick={() => openActionModal(post, 'publish')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    公開
                                  </button>
                                )}

                                {post.status === 'published' && (
                                  <button
                                    onClick={() => openActionModal(post, 'archive')}
                                    className="flex items-center px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 w-full text-left"
                                  >
                                    <Clock className="w-4 h-4 mr-2" />
                                    アーカイブ
                                  </button>
                                )}

                                {post.status === 'archived' && (
                                  <button
                                    onClick={() => openActionModal(post, 'publish')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    再公開
                                  </button>
                                )}

                                <button
                                  onClick={() => openActionModal(post, 'report')}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                  <Flag className="w-4 h-4 mr-2" />
                                  報告
                                </button>

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                  onClick={() => openActionModal(post, 'delete')}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  削除
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">投稿が見つかりません</h3>
                  <p className="text-gray-600">検索条件を変更してお試しください。</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 投稿アクションモーダル */}
      <PostActionModal
        post={selectedPost}
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false)
          setSelectedPost(null)
          setCurrentAction(null)
        }}
        onConfirm={handlePostAction}
        action={currentAction}
      />
    </div>
  )
} 