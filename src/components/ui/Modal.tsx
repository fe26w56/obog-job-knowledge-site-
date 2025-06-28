'use client'

import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  children: React.ReactNode
}

interface ModalHeaderProps {
  title?: string
  description?: string
  onClose?: () => void
  closable?: boolean
}

interface ModalContentProps {
  children: React.ReactNode
  className?: string
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

// モーダルのメインコンポーネント
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closable = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children
}: ModalProps) {
  // ESCキーでの閉じる処理
  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // ボディのスクロールを無効化
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  // オーバーレイクリック処理
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  // サイズのクラス定義
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4'
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      />
      
      {/* モーダルコンテンツ */}
      <div
        className={cn(
          'relative w-full bg-white rounded-lg shadow-xl transform transition-all',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* ヘッダー */}
        {(title || description || closable) && (
          <ModalHeader
            title={title}
            description={description}
            onClose={closable ? onClose : undefined}
            closable={closable}
          />
        )}

        {/* コンテンツ */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )

  // ポータルを使用してbodyにレンダリング
  return ReactDOM.createPortal(modalContent, document.body)
}

// モーダルヘッダーコンポーネント
const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  onClose,
  closable
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div className="flex-1">
        {title && (
          <h3 
            id="modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h3>
        )}
        {description && (
          <p 
            id="modal-description"
            className="mt-1 text-sm text-gray-600"
          >
            {description}
          </p>
        )}
      </div>
      
      {closable && onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="ml-4 p-2 hover:bg-gray-100 rounded-full"
          aria-label="モーダルを閉じる"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

// モーダルコンテンツコンポーネント
const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}

// モーダルフッターコンポーネント
const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      'flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50',
      className
    )}>
      {children}
    </div>
  )
}

// 確認ダイアログ用のカスタムフック
export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
    dangerous?: boolean
  }>({
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const confirm = (options: typeof config) => {
    setConfig(options)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    config.onCancel?.()
  }

  const handleConfirm = () => {
    setIsOpen(false)
    config.onConfirm()
  }

  const ConfirmModal = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={config.title}
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-gray-600">{config.message}</p>
        
        <div className="flex space-x-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            {config.cancelText || 'キャンセル'}
          </Button>
          <Button
            variant={config.dangerous ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {config.confirmText || '確認'}
          </Button>
        </div>
      </div>
    </Modal>
  )

  return { confirm, ConfirmModal }
}

// エクスポート
export { ModalContent, ModalFooter } 