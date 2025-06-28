import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  className
}: PaginationProps) {
  if (totalPages <= 1) return null

  // ページ番号の配列を生成
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= maxVisiblePages) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 省略表示の計算
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let start = Math.max(1, currentPage - halfVisible)
      let end = Math.min(totalPages, currentPage + halfVisible)

      // 開始位置の調整
      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1)
        } else {
          start = Math.max(1, end - maxVisiblePages + 1)
        }
      }

      // 最初のページを追加
      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('ellipsis')
        }
      }

      // 中央のページを追加
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // 最後のページを追加
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'

  return (
    <nav 
      className={cn('flex items-center justify-center space-x-1', className)}
      aria-label="ページネーション"
    >
      {/* 最初のページボタン */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => onPageChange(1)}
          aria-label="最初のページ"
          className="hidden md:flex"
        >
          最初
        </Button>
      )}

      {/* 前のページボタン */}
      {showPrevNext && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="前のページ"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">前</span>
        </Button>
      )}

      {/* ページ番号ボタン */}
      {visiblePages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-10 h-10"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size={buttonSize}
            onClick={() => onPageChange(page)}
            aria-label={`ページ ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className="min-w-[40px]"
          >
            {page}
          </Button>
        )
      })}

      {/* 次のページボタン */}
      {showPrevNext && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="次のページ"
        >
          <span className="hidden sm:inline mr-1">次</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* 最後のページボタン */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => onPageChange(totalPages)}
          aria-label="最後のページ"
          className="hidden md:flex"
        >
          最後
        </Button>
      )}
    </nav>
  )
}

// ページ情報表示コンポーネント
interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={cn('text-sm text-gray-600', className)}>
      {totalItems > 0 ? (
        <span>
          {startItem}〜{endItem}件目 (全{totalItems}件中)
        </span>
      ) : (
        <span>0件</span>
      )}
    </div>
  )
}

// ページネーション付きコンテナコンポーネント
interface PaginatedContainerProps {
  children: React.ReactNode
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  showInfo?: boolean
  className?: string
}

export function PaginatedContainer({
  children,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  className
}: PaginatedContainerProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* コンテンツ */}
      <div>{children}</div>

      {/* ページネーション情報とコントロール */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {showInfo && (
            <PaginationInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
} 