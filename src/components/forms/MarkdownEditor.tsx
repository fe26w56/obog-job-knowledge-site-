'use client'

import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Eye, EyeOff, FileText, Image, Link, Bold, Italic, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'

// MDEditorを動的インポート（SSR対応）
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
  className?: string
}

interface MarkdownHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

// マークダウンヘルプモーダル
const MarkdownHelpModal: React.FC<MarkdownHelpModalProps> = ({ isOpen, onClose }) => {
  const markdownExamples = [
    {
      title: '見出し',
      syntax: '# 見出し1\n## 見出し2\n### 見出し3',
      description: '#の数で見出しレベルを指定'
    },
    {
      title: '太字・斜体',
      syntax: '**太字** *斜体* ***太字斜体***',
      description: '*や**で文字を囲む'
    },
    {
      title: 'リスト',
      syntax: '- 項目1\n- 項目2\n  - サブ項目\n\n1. 番号付き項目1\n2. 番号付き項目2',
      description: '-や数字でリストを作成'
    },
    {
      title: 'リンク',
      syntax: '[リンクテキスト](https://example.com)',
      description: '[]内にテキスト、()内にURL'
    },
    {
      title: '画像',
      syntax: '![画像の説明](画像URL)',
      description: '![]で画像を挿入'
    },
    {
      title: '引用',
      syntax: '> これは引用文です\n> 複数行の引用も可能',
      description: '>で引用を表現'
    },
    {
      title: 'コード',
      syntax: '`インラインコード`\n\n```javascript\n// コードブロック\nconst hello = "world";\n```',
      description: '`や```でコードを表現'
    },
    {
      title: '表',
      syntax: '| 項目1 | 項目2 | 項目3 |\n|-------|-------|-------|\n| 値1   | 値2   | 値3   |',
      description: '|で区切って表を作成'
    }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <HelpCircle className="w-6 h-6 mr-2" />
            マークダウン記法ガイド
          </h2>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {markdownExamples.map((example, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{example.title}</CardTitle>
                <p className="text-sm text-gray-600">{example.description}</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {example.syntax}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• プレビューモードで実際の表示を確認できます</li>
            <li>• ツールバーのボタンで簡単に記法を挿入できます</li>
            <li>• Ctrl+Z（Cmd+Z）で元に戻すことができます</li>
            <li>• 画像はURLを指定するか、後でファイルアップロード機能を使用してください</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'マークダウン形式で入力してください...',
  height = 400,
  disabled = false,
  className = ''
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // プレビューモード切り替え
  const togglePreview = useCallback(() => {
    setIsPreviewMode(prev => !prev)
  }, [])

  // ヘルプモーダル開閉
  const toggleHelp = useCallback(() => {
    setIsHelpOpen(prev => !prev)
  }, [])

  // テキスト挿入ヘルパー
  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    if (disabled) return

    const textarea = document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = before + (selectedText || placeholder) + after

    const newValue = value.substring(0, start) + newText + value.substring(end)
    onChange(newValue)

    // カーソル位置を調整
    setTimeout(() => {
      const newCursorPos = start + before.length + (selectedText || placeholder).length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }, [value, onChange, disabled])

  // ツールバーボタンのハンドラー
  const toolbarActions = {
    bold: () => insertText('**', '**', '太字テキスト'),
    italic: () => insertText('*', '*', '斜体テキスト'),
    heading1: () => insertText('# ', '', '見出し1'),
    heading2: () => insertText('## ', '', '見出し2'),
    heading3: () => insertText('### ', '', '見出し3'),
    list: () => insertText('- ', '', 'リスト項目'),
    orderedList: () => insertText('1. ', '', '番号付きリスト項目'),
    quote: () => insertText('> ', '', '引用文'),
    code: () => insertText('`', '`', 'コード'),
    link: () => insertText('[', '](URL)', 'リンクテキスト'),
    image: () => insertText('![', '](画像URL)', '画像の説明')
  }

  return (
    <div className={`markdown-editor ${className}`}>
      {/* カスタムツールバー */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.bold}
              disabled={disabled}
              title="太字"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.italic}
              disabled={disabled}
              title="斜体"
            >
              <Italic className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.heading1}
              disabled={disabled}
              title="見出し1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.heading2}
              disabled={disabled}
              title="見出し2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.heading3}
              disabled={disabled}
              title="見出し3"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.list}
              disabled={disabled}
              title="リスト"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.orderedList}
              disabled={disabled}
              title="番号付きリスト"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.quote}
              disabled={disabled}
              title="引用"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.code}
              disabled={disabled}
              title="コード"
            >
              <Code className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.link}
              disabled={disabled}
              title="リンク"
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toolbarActions.image}
              disabled={disabled}
              title="画像"
            >
              <Image className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            title={isPreviewMode ? 'エディタモード' : 'プレビューモード'}
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreviewMode ? 'エディタ' : 'プレビュー'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleHelp}
            title="マークダウンヘルプ"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* メインエディタ */}
      <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview={isPreviewMode ? 'preview' : 'edit'}
          hideToolbar
          visibleDragBar={false}
          textareaProps={{
            placeholder,
            disabled,
            style: { fontSize: '14px', lineHeight: '1.5' }
          }}
          height={height}
          data-color-mode="light"
        />
      </div>

      {/* 文字数カウンター */}
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{value.length} 文字</span>
          {value.length > 10000 && (
            <span className="text-red-500">⚠ 推奨文字数（10,000文字）を超えています</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>マークダウン形式</span>
        </div>
      </div>

      {/* ヘルプモーダル */}
      <MarkdownHelpModal isOpen={isHelpOpen} onClose={toggleHelp} />
    </div>
  )
}

export default MarkdownEditor 