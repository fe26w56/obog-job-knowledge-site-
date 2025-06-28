'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image as ImageIcon, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  onFileRemove?: (fileId: string) => void
  acceptedTypes?: string[]
  maxFileSize?: number // MB
  maxFiles?: number
  uploadedFiles?: any[]
  disabled?: boolean
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxFileSize = 5, // 5MB
  maxFiles = 5,
  uploadedFiles = [],
  disabled = false,
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ファイル検証
  const validateFile = useCallback((file: File): string | null => {
    // ファイルサイズチェック
    if (file.size > maxFileSize * 1024 * 1024) {
      return `ファイルサイズが${maxFileSize}MBを超えています`
    }

    // ファイルタイプチェック
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      } else if (type.includes('/*')) {
        const mimeType = type.replace('/*', '')
        return file.type.startsWith(mimeType)
      } else {
        return file.type === type
      }
    })

    if (!isValidType) {
      return `対応していないファイル形式です（対応形式: ${acceptedTypes.join(', ')}）`
    }

    return null
  }, [acceptedTypes, maxFileSize])

  // ファイル選択処理
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || disabled) return

    const fileArray = Array.from(files)
    const newErrors: string[] = []
    const validFiles: File[] = []

    // ファイル数チェック
    const totalFiles = selectedFiles.length + uploadedFiles.length + fileArray.length
    if (totalFiles > maxFiles) {
      newErrors.push(`ファイル数が上限（${maxFiles}個）を超えています`)
      setErrors(newErrors)
      return
    }

    // 各ファイルを検証
    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(`${file.name}: ${error}`)
      } else {
        // 重複チェック
        const isDuplicate = [...selectedFiles, ...uploadedFiles].some(
          existingFile => existingFile.name === file.name && existingFile.size === file.size
        )
        if (!isDuplicate) {
          validFiles.push(file)
        } else {
          newErrors.push(`${file.name}: 同じファイルが既に選択されています`)
        }
      }
    })

    setErrors(newErrors)
    
    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles]
      setSelectedFiles(newFiles)
      onFileSelect(validFiles)
    }
  }, [selectedFiles, uploadedFiles, maxFiles, validateFile, onFileSelect, disabled])

  // ドラッグ&ドロップハンドラー
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect, disabled])

  // ファイル削除
  const handleFileRemove = useCallback((index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
  }, [selectedFiles])

  // ファイル選択ボタンクリック
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const totalFiles = selectedFiles.length + uploadedFiles.length
  const canAddMore = totalFiles < maxFiles && !disabled

  return (
    <div className={`file-upload ${className}`}>
      {/* ドラッグ&ドロップエリア */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : canAddMore 
              ? 'border-gray-300 hover:border-gray-400' 
              : 'border-gray-200 bg-gray-50'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={canAddMore ? handleButtonClick : undefined}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${
          canAddMore ? 'text-gray-400' : 'text-gray-300'
        }`} />
        
        {canAddMore ? (
          <>
            <p className="text-sm font-medium text-gray-700 mb-1">
              ファイルをドラッグ&ドロップまたはクリックして選択
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.join(', ')} / 最大{maxFileSize}MB / {maxFiles}個まで
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            ファイル上限に達しました（{totalFiles}/{maxFiles}）
          </p>
        )}
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* エラー表示 */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">アップロードエラー</p>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ファイル一覧 */}
      {(selectedFiles.length > 0 || uploadedFiles.length > 0) && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            選択されたファイル ({totalFiles}/{maxFiles})
          </h4>
          
          {/* 新規選択ファイル */}
          {selectedFiles.map((file, index) => (
            <Card key={`${file.name}-${index}`} className="relative">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      ) : (
                        <File className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileRemove(index)}
                    className="flex-shrink-0 p-1 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ファイル選択ボタン（代替） */}
      {canAddMore && (
        <div className="mt-3 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            disabled={disabled}
            className="text-xs"
          >
            <Upload className="w-3 h-3 mr-1" />
            ファイルを選択
          </Button>
        </div>
      )}
    </div>
  )
}

export default FileUpload 