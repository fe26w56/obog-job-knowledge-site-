/**
 * Google Apps Script - OTPメール送信サービス
 * 学生団体OBOG就活ナレッジサイト用
 */

// 設定値
const CONFIG = {
  FROM_EMAIL: 'noreply@meiji-info.com', // 送信元メールアドレス
  FROM_NAME: '明治大学情報局 OBOG就活ナレッジサイト',
  RATE_LIMIT_PER_HOUR: 100, // 1時間あたりの送信制限
  API_SECRET: 'your-gas-api-secret-key-2024' // APIアクセス用シークレット
}

/**
 * メイン関数 - Webhookエンドポイント
 */
function doPost(e) {
  try {
    // リクエストボディを解析
    const requestBody = JSON.parse(e.postData.contents)
    const { email, otp_code, purpose, api_secret } = requestBody

    // API認証チェック
    if (api_secret !== CONFIG.API_SECRET) {
      return createResponse(401, 'Unauthorized')
    }

    // 必須パラメータチェック
    if (!email || !otp_code || !purpose) {
      return createResponse(400, 'Missing required parameters')
    }

    // メールアドレス形式チェック
    if (!isValidEmail(email)) {
      return createResponse(400, 'Invalid email format')
    }

    // レート制限チェック
    if (!checkRateLimit(email)) {
      return createResponse(429, 'Rate limit exceeded')
    }

    // OTP送信
    const result = sendOTPEmail(email, otp_code, purpose)
    
    if (result.success) {
      // 送信ログを記録
      logEmailSent(email, purpose)
      return createResponse(200, 'Email sent successfully', { 
        email, 
        sent_at: new Date().toISOString() 
      })
    } else {
      return createResponse(500, result.error)
    }

  } catch (error) {
    console.error('GAS Email Service Error:', error)
    return createResponse(500, 'Internal server error')
  }
}

/**
 * OTPメール送信
 */
function sendOTPEmail(email, otpCode, purpose) {
  try {
    const subject = getEmailSubject(purpose)
    const htmlBody = getEmailTemplate(otpCode, purpose)
    
    // メール送信
    GmailApp.sendEmail(
      email,
      subject,
      '', // プレーンテキスト版（空文字）
      {
        htmlBody: htmlBody,
        name: CONFIG.FROM_NAME,
        replyTo: CONFIG.FROM_EMAIL
      }
    )

    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error: error.toString() }
  }
}

/**
 * メール件名を取得
 */
function getEmailSubject(purpose) {
  const subjects = {
    'login': '【明治情報局】ログイン認証コード',
    'register': '【明治情報局】アカウント登録認証コード',
    'password_reset': '【明治情報局】パスワードリセット認証コード'
  }
  return subjects[purpose] || '【明治情報局】認証コード'
}

/**
 * HTMLメールテンプレート
 */
function getEmailTemplate(otpCode, purpose) {
  const purposeText = {
    'login': 'ログイン',
    'register': 'アカウント登録',
    'password_reset': 'パスワードリセット'
  }

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>認証コード</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #007bff; }
        .otp-box { background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 10px 0; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎓 明治大学情報局</div>
            <p>OBOG就活ナレッジサイト</p>
        </div>
        
        <h2>認証コードのお知らせ</h2>
        
        <p>いつもお世話になっております。<br>
        ${purposeText[purpose] || '認証'}のための認証コードをお送りします。</p>
        
        <div class="otp-box">
            <p><strong>認証コード</strong></p>
            <div class="otp-code">${otpCode}</div>
            <p>上記の6桁のコードを入力してください</p>
        </div>
        
        <div class="warning">
            <strong>⚠️ 重要な注意事項</strong>
            <ul>
                <li>この認証コードの有効期限は<strong>10分間</strong>です</li>
                <li>認証コードは他の人に教えないでください</li>
                <li>心当たりのない場合は、このメールを無視してください</li>
                <li>5回連続で間違えると新しいコードの発行が必要になります</li>
            </ul>
        </div>
        
        <p>もしこのメールに心当たりがない場合は、お手数ですが管理者までご連絡ください。</p>
        
        <div class="footer">
            <p>このメールは自動送信されています。返信はできません。</p>
            <p>お問い合わせ: admin@meiji-info.com</p>
            <p>© 2024 明治大学情報局 OBOG就活ナレッジサイト</p>
        </div>
    </div>
</body>
</html>
  `
}

/**
 * メールアドレス形式チェック
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * レート制限チェック
 */
function checkRateLimit(email) {
  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    // PropertiesServiceを使用してレート制限を管理
    const properties = PropertiesService.getScriptProperties()
    const key = `rate_limit_${email}_${now.getHours()}`
    const count = parseInt(properties.getProperty(key) || '0')
    
    if (count >= CONFIG.RATE_LIMIT_PER_HOUR) {
      return false
    }
    
    // カウンターを更新
    properties.setProperty(key, (count + 1).toString())
    
    return true
  } catch (error) {
    console.error('Rate limit check error:', error)
    return true // エラー時は送信を許可
  }
}

/**
 * 送信ログを記録
 */
function logEmailSent(email, purpose) {
  try {
    const sheet = getLogSheet()
    if (sheet) {
      sheet.appendRow([
        new Date(),
        email,
        purpose,
        'sent',
        ''
      ])
    }
  } catch (error) {
    console.error('Logging error:', error)
  }
}

/**
 * ログ用スプレッドシートを取得/作成
 */
function getLogSheet() {
  try {
    let spreadsheet
    const properties = PropertiesService.getScriptProperties()
    const spreadsheetId = properties.getProperty('LOG_SPREADSHEET_ID')
    
    if (spreadsheetId) {
      spreadsheet = SpreadsheetApp.openById(spreadsheetId)
    } else {
      // 新しいスプレッドシートを作成
      spreadsheet = SpreadsheetApp.create('OTP Email Logs')
      properties.setProperty('LOG_SPREADSHEET_ID', spreadsheet.getId())
    }
    
    let sheet = spreadsheet.getSheetByName('EmailLogs')
    if (!sheet) {
      sheet = spreadsheet.insertSheet('EmailLogs')
      // ヘッダーを追加
      sheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Email', 'Purpose', 'Status', 'Error']
      ])
    }
    
    return sheet
  } catch (error) {
    console.error('Sheet creation error:', error)
    return null
  }
}

/**
 * レスポンス作成
 */
function createResponse(status, message, data = null) {
  const response = {
    status: status === 200 ? 'success' : 'error',
    message: message
  }
  
  if (data) {
    response.data = data
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
}

/**
 * テスト関数（開発用）
 */
function testSendEmail() {
  const testResult = sendOTPEmail(
    'test@example.com', 
    '123456', 
    'login'
  )
  console.log('Test result:', testResult)
}

/**
 * 設定確認関数（開発用）
 */
function checkConfiguration() {
  console.log('Current configuration:')
  console.log('FROM_EMAIL:', CONFIG.FROM_EMAIL)
  console.log('FROM_NAME:', CONFIG.FROM_NAME)
  console.log('RATE_LIMIT_PER_HOUR:', CONFIG.RATE_LIMIT_PER_HOUR)
  
  const properties = PropertiesService.getScriptProperties()
  console.log('LOG_SPREADSHEET_ID:', properties.getProperty('LOG_SPREADSHEET_ID'))
} 