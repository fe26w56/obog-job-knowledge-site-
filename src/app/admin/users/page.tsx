'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Shield,
  Clock,
  AlertTriangle,
  Mail,
  Calendar,
  Eye
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { getRoleDisplayName } from '@/lib/utils'

interface User {
  id: string
  email: string
  role: 'admin' | 'obog' | 'current' | 'pending'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
  profile?: {
    display_name: string
    avatar_url?: string
    university?: string
    department?: string
    graduation_year?: number
    company?: string
    position?: string
    bio?: string
  }
  stats?: {
    posts_count: number
    comments_count: number
    last_login?: string
  }
}

interface UserActionModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (action: string, data?: any) => void
  action: 'approve' | 'reject' | 'suspend' | 'activate' | 'change_role' | 'delete' | null
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  action
}) => {
  const [reason, setReason] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'obog' | 'current'>('current')

  const handleConfirm = () => {
    if (action === 'change_role') {
      onConfirm(action, { role: newRole, reason })
    } else {
      onConfirm(action!, { reason })
    }
    setReason('')
    onClose()
  }

  const getModalTitle = () => {
    switch (action) {
      case 'approve': return 'ユーザーを承認'
      case 'reject': return 'ユーザーを拒否'
      case 'suspend': return 'ユーザーを停止'
      case 'activate': return 'ユーザーを有効化'
      case 'change_role': return 'ロールを変更'
      case 'delete': return 'ユーザーを削除'
      default: return 'ユーザー操作'
    }
  }

  const getModalMessage = () => {
    switch (action) {
      case 'approve': 
        return `${user?.email} を承認しますか？承認後、ユーザーは全機能を利用できるようになります。`
      case 'reject': 
        return `${user?.email} を拒否しますか？拒否理由を入力してください。`
      case 'suspend': 
        return `${user?.email} を一時停止しますか？停止理由を入力してください。`
      case 'activate': 
        return `${user?.email} を有効化しますか？`
      case 'change_role': 
        return `${user?.email} のロールを変更しますか？`
      case 'delete': 
        return `${user?.email} を完全に削除しますか？この操作は取り消せません。`
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

        {action === 'change_role' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいロール
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'obog' | 'current')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current">現役生</option>
              <option value="obog">OBOG</option>
              <option value="admin">管理者</option>
            </select>
          </div>
        )}

        {(action === 'reject' || action === 'suspend' || action === 'change_role') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {action === 'reject' ? '拒否理由' : action === 'suspend' ? '停止理由' : '変更理由'}
              {action !== 'change_role' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`${action === 'reject' ? '拒否' : action === 'suspend' ? '停止' : '変更'}理由を入力してください`}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required={action !== 'change_role'}
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
              (action === 'reject' || action === 'suspend') && !reason.trim()
            }
            className={
              action === 'delete' || action === 'reject' || action === 'suspend'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : action === 'approve' || action === 'activate'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          >
            {action === 'approve' ? '承認' : 
             action === 'reject' ? '拒否' : 
             action === 'suspend' ? '停止' : 
             action === 'activate' ? '有効化' : 
             action === 'change_role' ? '変更' : 
             action === 'delete' ? '削除' : '実行'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'suspend' | 'activate' | 'change_role' | 'delete' | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

  // ユーザー一覧を取得
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      // TODO: 実際のAPI呼び出しに置き換え
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'pending1@example.com',
          role: 'pending',
          status: 'inactive',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          profile: {
            display_name: '田中太郎',
            university: '明治大学',
            department: '経営学部',
            graduation_year: 2025
          },
          stats: {
            posts_count: 0,
            comments_count: 0
          }
        },
        {
          id: '2',
          email: 'user1@example.com',
          role: 'current',
          status: 'active',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z',
          profile: {
            display_name: '佐藤花子',
            university: '明治大学',
            department: '法学部',
            graduation_year: 2024
          },
          stats: {
            posts_count: 5,
            comments_count: 12,
            last_login: '2024-01-25T15:30:00Z'
          }
        },
        {
          id: '3',
          email: 'obog1@example.com',
          role: 'obog',
          status: 'active',
          created_at: '2023-06-01T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z',
          profile: {
            display_name: '山田次郎',
            university: '明治大学',
            department: '商学部',
            graduation_year: 2023,
            company: '株式会社サンプル',
            position: 'エンジニア'
          },
          stats: {
            posts_count: 15,
            comments_count: 45,
            last_login: '2024-01-24T09:15:00Z'
          }
        },
        {
          id: '4',
          email: 'suspended@example.com',
          role: 'current',
          status: 'suspended',
          created_at: '2023-12-01T10:00:00Z',
          updated_at: '2024-01-22T10:00:00Z',
          profile: {
            display_name: '鈴木一郎',
            university: '明治大学',
            department: '政治経済学部',
            graduation_year: 2025
          },
          stats: {
            posts_count: 2,
            comments_count: 8,
            last_login: '2024-01-20T14:20:00Z'
          }
        }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングされたユーザー一覧
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // ユーザーアクション実行
  const handleUserAction = async (action: string, data?: any) => {
    if (!selectedUser) return

    try {
      console.log(`Executing ${action} for user ${selectedUser.id}`, data)
      
      // TODO: 実際のAPI呼び出しに置き換え
      switch (action) {
        case 'approve':
          setUsers(users.map(user => 
            user.id === selectedUser.id 
              ? { ...user, role: 'current', status: 'active' }
              : user
          ))
          break
        case 'reject':
          setUsers(users.filter(user => user.id !== selectedUser.id))
          break
        case 'suspend':
          setUsers(users.map(user => 
            user.id === selectedUser.id 
              ? { ...user, status: 'suspended' }
              : user
          ))
          break
        case 'activate':
          setUsers(users.map(user => 
            user.id === selectedUser.id 
              ? { ...user, status: 'active' }
              : user
          ))
          break
        case 'change_role':
          setUsers(users.map(user => 
            user.id === selectedUser.id 
              ? { ...user, role: data.role }
              : user
          ))
          break
        case 'delete':
          setUsers(users.filter(user => user.id !== selectedUser.id))
          break
      }
      
      alert(`${action}を実行しました`)
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
      alert(`${action}の実行に失敗しました`)
    }
  }

  const openActionModal = (user: User, action: 'approve' | 'reject' | 'suspend' | 'activate' | 'change_role' | 'delete') => {
    setSelectedUser(user)
    setCurrentAction(action)
    setActionModalOpen(true)
    setDropdownOpen(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">有効</Badge>
      case 'inactive':
        return <Badge variant="warning">無効</Badge>
      case 'suspended':
        return <Badge variant="danger">停止中</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="danger">管理者</Badge>
      case 'obog':
        return <Badge variant="primary">OBOG</Badge>
      case 'current':
        return <Badge variant="success">現役生</Badge>
      case 'pending':
        return <Badge variant="warning">承認待ち</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ユーザー情報を読み込み中...</p>
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
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                ユーザー管理
              </h1>
              <p className="mt-2 text-gray-600">
                ユーザーの承認、権限管理、アカウント状態の管理
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
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">承認待ち</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {users.filter(u => u.role === 'pending').length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">有効ユーザー</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">停止中</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 検索・フィルター */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="メールアドレスまたは名前で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべてのロール</option>
                <option value="pending">承認待ち</option>
                <option value="current">現役生</option>
                <option value="obog">OBOG</option>
                <option value="admin">管理者</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべてのステータス</option>
                <option value="active">有効</option>
                <option value="inactive">無効</option>
                <option value="suspended">停止中</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* ユーザー一覧 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ロール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      統計
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終ログイン
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={user.profile?.avatar_url}
                            name={user.profile?.display_name || user.email}
                            size="sm"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.profile?.display_name || 'ユーザー名未設定'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.profile?.university && (
                              <div className="text-xs text-gray-400">
                                {user.profile.university} {user.profile.department}
                                {user.profile.graduation_year && ` (${user.profile.graduation_year}年卒)`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>投稿: {user.stats?.posts_count || 0}</div>
                        <div>コメント: {user.stats?.comments_count || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.stats?.last_login ? formatDate(user.stats.last_login) : 'なし'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>

                          {dropdownOpen === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                {user.role === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => openActionModal(user, 'approve')}
                                      className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      承認
                                    </button>
                                    <button
                                      onClick={() => openActionModal(user, 'reject')}
                                      className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      拒否
                                    </button>
                                  </>
                                )}

                                {user.status === 'active' && user.role !== 'pending' && (
                                  <button
                                    onClick={() => openActionModal(user, 'suspend')}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    停止
                                  </button>
                                )}

                                {user.status === 'suspended' && (
                                  <button
                                    onClick={() => openActionModal(user, 'activate')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    有効化
                                  </button>
                                )}

                                {user.role !== 'admin' && (
                                  <button
                                    onClick={() => openActionModal(user, 'change_role')}
                                    className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                                  >
                                    <Shield className="w-4 h-4 mr-2" />
                                    ロール変更
                                  </button>
                                )}

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                  onClick={() => openActionModal(user, 'delete')}
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

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
                  <p className="text-gray-600">検索条件を変更してお試しください。</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ユーザーアクションモーダル */}
      <UserActionModal
        user={selectedUser}
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false)
          setSelectedUser(null)
          setCurrentAction(null)
        }}
        onConfirm={handleUserAction}
        action={currentAction}
      />
    </div>
  )
}