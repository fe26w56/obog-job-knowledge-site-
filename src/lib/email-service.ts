/**
 * メール送信サービス - GAS連携
 */

interface EmailServiceConfig {
  gasWebAppUrl: string
  apiSecret: string
}

interface SendOTPEmailParams {
  email: string
  otpCode: string
  purpose: 'login' | 'register' | 'password_reset'
}

interface EmailServiceResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

class EmailService {
  private config: EmailServiceConfig

  constructor() {
    this.config = {
      gasWebAppUrl: process.env.GAS_WEBAPP_URL || '',
      apiSecret: process.env.GAS_API_SECRET || 'your-gas-api-secret-key-2024'
    }
  }

  /**
   * OTPメールを送信
   */
  async sendOTPEmail(params: SendOTPEmailParams): Promise<EmailServiceResponse> {
    try {
      // 開発環境では実際のメール送信をスキップ
      if (process.env.NODE_ENV === 'development' && !this.config.gasWebAppUrl) {
        console.log(`📧 [DEV] OTP Email would be sent to: ${params.email}`)
        console.log(`📧 [DEV] OTP Code: ${params.otpCode}`)
        console.log(`📧 [DEV] Purpose: ${params.purpose}`)
        return {
          success: true,
          message: 'Email sent successfully (development mode)',
          data: {
            email: params.email,
            sent_at: new Date().toISOString(),
            mode: 'development'
          }
        }
      }

      // 本番環境またはGAS URLが設定されている場合は実際に送信
      if (!this.config.gasWebAppUrl) {
        throw new Error('GAS WebApp URL is not configured')
      }

      const response = await fetch(this.config.gasWebAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: params.email,
          otp_code: params.otpCode,
          purpose: params.purpose,
          api_secret: this.config.apiSecret
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`)
      }

      return {
        success: true,
        message: result.message,
        data: result.data
      }

    } catch (error) {
      console.error('Email service error:', error)
      return {
        success: false,
        message: 'メール送信に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 設定確認
   */
  isConfigured(): boolean {
    return !!this.config.gasWebAppUrl || process.env.NODE_ENV === 'development'
  }

  /**
   * 設定情報を取得（デバッグ用）
   */
  getConfig(): Partial<EmailServiceConfig> {
    return {
      gasWebAppUrl: this.config.gasWebAppUrl ? '***configured***' : 'not configured',
      apiSecret: this.config.apiSecret ? '***configured***' : 'not configured'
    }
  }
}

// シングルトンインスタンス
export const emailService = new EmailService()

/**
 * OTPメール送信のヘルパー関数
 */
export async function sendOTPEmail(
  email: string, 
  otpCode: string, 
  purpose: 'login' | 'register' | 'password_reset' = 'login'
): Promise<EmailServiceResponse> {
  return emailService.sendOTPEmail({ email, otpCode, purpose })
}

/**
 * メール送信サービスの設定確認
 */
export function checkEmailServiceConfig(): {
  isConfigured: boolean
  config: Partial<EmailServiceConfig>
  mode: 'development' | 'production'
} {
  return {
    isConfigured: emailService.isConfigured(),
    config: emailService.getConfig(),
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production'
  }
} 