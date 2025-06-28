import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/middleware'
import { checkEmailServiceConfig } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    const authResult = await requireAdmin(request)
    
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json({
        status: 'error',
        message: '管理者権限が必要です'
      }, { status: 403 })
    }

    // メール送信サービスの設定確認
    const emailConfig = checkEmailServiceConfig()

    return NextResponse.json({
      status: 'success',
      data: {
        email_service: emailConfig,
        environment: {
          node_env: process.env.NODE_ENV,
          gas_webapp_url_configured: !!process.env.GAS_WEBAPP_URL,
          gas_api_secret_configured: !!process.env.GAS_API_SECRET,
          jwt_secret_configured: !!process.env.JWT_SECRET
        },
        recommendations: getRecommendations(emailConfig)
      }
    })

  } catch (error) {
    console.error('メール設定確認エラー:', error)
    return NextResponse.json({
      status: 'error',
      message: 'サーバーエラーが発生しました'
    }, { status: 500 })
  }
}

function getRecommendations(emailConfig: ReturnType<typeof checkEmailServiceConfig>) {
  const recommendations = []

  if (!emailConfig.isConfigured && emailConfig.mode === 'production') {
    recommendations.push({
      type: 'warning',
      message: '本番環境でメール送信サービスが設定されていません',
      action: 'GAS_WEBAPP_URLとGAS_API_SECRETを環境変数に設定してください'
    })
  }

  if (emailConfig.mode === 'development') {
    recommendations.push({
      type: 'info',
      message: '開発環境ではメールはコンソールに出力されます',
      action: '実際のメール送信をテストする場合はGAS設定を完了してください'
    })
  }

  if (emailConfig.isConfigured && emailConfig.mode === 'production') {
    recommendations.push({
      type: 'success',
      message: 'メール送信サービスが正常に設定されています',
      action: '定期的にGASログを確認して送信状況を監視してください'
    })
  }

  return recommendations
} 