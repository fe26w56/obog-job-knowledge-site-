'use client'

import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  Search, 
  Plus, 
  Copy, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Link as LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'obog' | 'current'
  invited_by: string
  inviter?: {
    id: string
    display_name: string
    email: string
  }
  code: string
  expires_at: string
  used: boolean
  used_at?: string
  used_by?: {
    id: string
    display_name: string
    email: string
  }
  created_at: string
  invitation_url?: string
}

interface CreateInvitationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: CreateInvitationData) => void
}

interface CreateInvitationData {
  email: string
  role: 'admin' | 'obog' | 'current'
  expires_in_days: number
  message?: string
}

const CreateInvitationModal: React.FC<CreateInvitationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [formData, setFormData] = useState<CreateInvitationData>({
    email: '',
    role: 'current',
    expires_in_days: 7,
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(formData)
    setFormData({
      email: '',
      role: 'current',
      expires_in_days: 7,
      message: ''
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          新しい招待を作成
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              招待するメールアドレス <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@meiji-info.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ロール <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'obog' | 'current' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="current">現役生</option>
              <option value="obog">OBOG</option>
              <option value="admin">管理者</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              有効期限 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.expires_in_days}
              onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={1}>1日</option>
              <option value={3}>3日</option>
              <option value={7}>7日</option>
              <option value={14}>14日</option>
              <option value={30}>30日</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              招待メッセージ（任意）
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="招待メッセージを入力してください"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              招待を作成
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // 招待一覧を取得
  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      // TODO: 実際のAPI呼び出しに置き換え
      const mockInvitations: Invitation[] = [
        {
          id: '1',
          email: 'newuser1@example.com',
          role: 'current',
          invited_by: 'admin1',
          inviter: {
            id: 'admin1',
            display_name: '管理者太郎',
            email: 'admin@meiji-info.com'
          },
          code: 'inv_abc123def456',
          expires_at: '2024-02-05T10:00:00Z',
          used: false,
          created_at: '2024-01-29T10:00:00Z',
          invitation_url: 'https://meiji-info.com/auth/register?invitation=inv_abc123def456'
        },
        {
          id: '2',
          email: 'newobog@example.com',
          role: 'obog',
          invited_by: 'admin1',
          inviter: {
            id: 'admin1',
            display_name: '管理者太郎',
            email: 'admin@meiji-info.com'
          },
          code: 'inv_xyz789ghi012',
          expires_at: '2024-02-10T15:30:00Z',
          used: true,
          used_at: '2024-01-30T14:20:00Z',
          used_by: {
            id: 'user123',
            display_name: '新規ユーザー',
            email: 'newobog@example.com'
          },
          created_at: '2024-01-24T15:30:00Z',
          invitation_url: 'https://meiji-info.com/auth/register?invitation=inv_xyz789ghi012'
        },
        {
          id: '3',
          email: 'expired@example.com',
          role: 'current',
          invited_by: 'admin1',
          inviter: {
            id: 'admin1',
            display_name: '管理者太郎',
            email: 'admin@meiji-info.com'
          },
          code: 'inv_expired123',
          expires_at: '2024-01-25T10:00:00Z',
          used: false,
          created_at: '2024-01-18T10:00:00Z',
          invitation_url: 'https://meiji-info.com/auth/register?invitation=inv_expired123'
        }
      ]
      setInvitations(mockInvitations)
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングされた招待一覧
  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.inviter?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || invitation.role === filterRole
    
    let matchesStatus = true
    if (filterStatus === 'pending') {
      matchesStatus = !invitation.used && new Date(invitation.expires_at) > new Date()
    } else if (filterStatus === 'used') {
      matchesStatus = invitation.used
    } else if (filterStatus === 'expired') {
      matchesStatus = !invitation.used && new Date(invitation.expires_at) <= new Date()
    }
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // 招待作成
  const handleCreateInvitation = async (data: CreateInvitationData) => {
    try {
      console.log('Creating invitation:', data)
      
      // TODO: 実際のAPI呼び出しに置き換え
      const newInvitation: Invitation = {
        id: Date.now().toString(),
        email: data.email,
        role: data.role,
        invited_by: 'current_admin',
        inviter: {
          id: 'current_admin',
          display_name: '現在の管理者',
          email: 'admin@meiji-info.com'
        },
        code: `inv_${Math.random().toString(36).substring(2, 15)}`,
        expires_at: new Date(Date.now() + data.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
        used: false,
        created_at: new Date().toISOString(),
        invitation_url: `https://meiji-info.com/auth/register?invitation=inv_${Math.random().toString(36).substring(2, 15)}`
      }
      
      setInvitations([newInvitation, ...invitations])
      alert('招待を作成しました')
    } catch (error) {
      console.error('Failed to create invitation:', error)
      alert('招待の作成に失敗しました')
    }
  }

  // 招待無効化
  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      console.log('Revoking invitation:', invitationId)
      
      // TODO: 実際のAPI呼び出しに置き換え
      setInvitations(invitations.map(inv => 
        inv.id === invitationId 
          ? { ...inv, expires_at: new Date().toISOString() }
          : inv
      ))
      
      alert('招待を無効化しました')
    } catch (error) {
      console.error('Failed to revoke invitation:', error)
      alert('招待の無効化に失敗しました')
    }
  }

  // URL コピー
  const handleCopyUrl = async (invitation: Invitation) => {
    try {
      await navigator.clipboard.writeText(invitation.invitation_url || '')
      setCopiedId(invitation.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      alert('URLのコピーに失敗しました')
    }
  }

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.used) {
      return <Badge variant="success">使用済み</Badge>
    } else if (new Date(invitation.expires_at) <= new Date()) {
      return <Badge variant="danger">期限切れ</Badge>
    } else {
      return <Badge variant="warning">有効</Badge>
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

  const isExpired = (dateString: string) => {
    return new Date(dateString) <= new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">招待情報を読み込み中...</p>
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
                <Mail className="w-8 h-8 text-blue-600 mr-3" />
                招待管理
              </h1>
              <p className="mt-2 text-gray-600">
                ユーザー招待の作成、管理、無効化
              </p>
            </div>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              新しい招待を作成
            </Button>
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
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">総招待数</p>
                  <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">有効</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {invitations.filter(inv => !inv.used && new Date(inv.expires_at) > new Date()).length}
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
                  <p className="text-sm font-medium text-gray-600">使用済み</p>
                  <p className="text-2xl font-bold text-green-600">
                    {invitations.filter(inv => inv.used).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">期限切れ</p>
                  <p className="text-2xl font-bold text-red-600">
                    {invitations.filter(inv => !inv.used && new Date(inv.expires_at) <= new Date()).length}
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
                  placeholder="メールアドレスまたは招待者で検索"
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
                <option value="pending">有効</option>
                <option value="used">使用済み</option>
                <option value="expired">期限切れ</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 招待一覧 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      招待先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ロール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      招待者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      有効期限
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invitation.email}
                          </div>
                          {invitation.used_by && (
                            <div className="text-sm text-green-600">
                              使用者: {invitation.used_by.display_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(invitation.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invitation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">
                            {invitation.inviter?.display_name}
                          </div>
                          <div className="text-gray-500">
                            {invitation.inviter?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invitation.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className={isExpired(invitation.expires_at) ? 'text-red-600' : ''}>
                          {formatDate(invitation.expires_at)}
                        </div>
                        {invitation.used_at && (
                          <div className="text-green-600 text-xs">
                            使用: {formatDate(invitation.used_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!invitation.used && !isExpired(invitation.expires_at) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyUrl(invitation)}
                                className={copiedId === invitation.id ? 'bg-green-50 border-green-200' : ''}
                              >
                                {copiedId === invitation.id ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeInvitation(invitation.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredInvitations.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">招待が見つかりません</h3>
                  <p className="text-gray-600">検索条件を変更するか、新しい招待を作成してください。</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 招待作成モーダル */}
      <CreateInvitationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={handleCreateInvitation}
      />
    </div>
  )
} 