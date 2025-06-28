import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// ファイルアップロード (POST /api/upload)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // 認証チェック（TODO: 実際の認証実装後に有効化）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    const uploadedFiles: any[] = []
    const errors: string[] = []

    // 各ファイルをアップロード
    for (const file of files) {
      try {
        // ファイル検証
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          errors.push(`${file.name}: ファイルサイズが5MBを超えています`)
          continue
        }

        // 許可されたファイルタイプ
        const allowedTypes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: サポートされていないファイル形式です`)
          continue
        }

        // ファイル名を生成（重複回避）
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 8)
        const fileExtension = file.name.split('.').pop()
        const fileName = `${timestamp}_${randomString}.${fileExtension}`
        
        // Supabase Storageにアップロード
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(`posts/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Supabaseアップロードエラー:', error)
          errors.push(`${file.name}: アップロードに失敗しました`)
          continue
        }

        // 公開URLを取得
        const { data: urlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(data.path)

        uploadedFiles.push({
          id: data.path,
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          path: data.path
        })

      } catch (fileError) {
        console.error(`ファイル処理エラー (${file.name}):`, fileError)
        errors.push(`${file.name}: 処理中にエラーが発生しました`)
      }
    }

    // 結果を返す
    const response: any = {
      status: 'success',
      data: {
        files: uploadedFiles,
        uploaded: uploadedFiles.length,
        total: files.length
      }
    }

    if (errors.length > 0) {
      response.status = uploadedFiles.length > 0 ? 'partial_success' : 'error'
      response.errors = errors
      response.message = uploadedFiles.length > 0 
        ? `${uploadedFiles.length}個のファイルがアップロードされました（${errors.length}個のエラー）`
        : 'ファイルのアップロードに失敗しました'
    } else {
      response.message = `${uploadedFiles.length}個のファイルがアップロードされました`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ファイル削除 (DELETE /api/upload)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    if (!filePath) {
      return NextResponse.json(
        { status: 'error', message: 'ファイルパスが指定されていません' },
        { status: 400 }
      )
    }

    // 認証チェック（TODO: 実際の認証実装後に有効化）
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { status: 'error', message: '認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Supabase Storageからファイルを削除
    const { error } = await supabase.storage
      .from('uploads')
      .remove([filePath])

    if (error) {
      console.error('Supabaseファイル削除エラー:', error)
      return NextResponse.json(
        { status: 'error', message: 'ファイルの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'ファイルが削除されました'
    })

  } catch (error) {
    console.error('予期せぬエラー:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 