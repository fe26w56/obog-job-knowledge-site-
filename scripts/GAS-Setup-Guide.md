# Google Apps Script メール送信サービス セットアップガイド

## 📋 概要

このガイドでは、学生団体OBOG就活ナレッジサイト用のOTPメール送信機能をGoogle Apps Script（GAS）で設定する方法を説明します。

## 🚀 セットアップ手順

### 1. Google Apps Scriptプロジェクトの作成

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「OBOG-Email-Service」などに変更

### 2. スクリプトのデプロイ

1. `scripts/gas-email-service.js` の内容をコピー
2. GASエディタの `Code.gs` にペースト
3. 設定値を編集：

```javascript
const CONFIG = {
  FROM_EMAIL: 'noreply@meiji-info.com', // 実際の送信元メールアドレス
  FROM_NAME: '明治大学情報局 OBOG就活ナレッジサイト',
  RATE_LIMIT_PER_HOUR: 100,
  API_SECRET: 'your-unique-secret-key-here' // 強力なシークレットキーに変更
}
```

### 3. 権限の設定

1. 「実行」→「testSendEmail」を選択して実行
2. 権限の承認を求められたら「承認」をクリック
3. Gmailの送信権限を許可

### 4. Webアプリとしてデプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 「種類」で「ウェブアプリ」を選択
3. 設定：
   - **説明**: `OBOG Email Service v1.0`
   - **実行者**: `自分`
   - **アクセスできるユーザー**: `全員`
4. 「デプロイ」をクリック
5. **WebアプリURL**をコピー（後で使用）

### 5. 環境変数の設定

Next.jsプロジェクトの `.env.local` に以下を追加：

```bash
# GAS メール送信サービス
GAS_WEBAPP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GAS_API_SECRET=your-unique-secret-key-here
```

## 🧪 テスト方法

### GAS側でのテスト

1. GASエディタで `testSendEmail` 関数を実行
2. 実行ログでエラーがないことを確認

### Next.js側でのテスト

1. 開発サーバーを起動: `npm run dev`
2. ログインページでメールアドレスを入力
3. コンソールログでOTPとメール送信結果を確認

## 📊 ログとモニタリング

### 送信ログの確認

1. GASプロジェクトで自動作成される「OTP Email Logs」スプレッドシートを確認
2. 送信履歴、エラーログが記録されます

### レート制限の確認

- 1時間あたり100通の制限
- PropertiesServiceで管理
- 制限に達した場合は429エラーを返す

## 🔧 カスタマイズ

### メールテンプレートの変更

`getEmailTemplate` 関数内のHTMLを編集してデザインをカスタマイズできます。

### 送信制限の変更

```javascript
const CONFIG = {
  // ...
  RATE_LIMIT_PER_HOUR: 200, // 制限数を変更
  // ...
}
```

### 送信元メールアドレスの変更

```javascript
const CONFIG = {
  FROM_EMAIL: 'your-email@your-domain.com',
  FROM_NAME: 'あなたのサービス名',
  // ...
}
```

## ⚠️ 重要な注意事項

### セキュリティ

1. **API_SECRET**は強力なランダム文字列を使用
2. WebアプリURLは外部に漏らさない
3. 定期的にシークレットキーを更新

### Gmail制限

1. Gmailの1日の送信制限: 100通/日（無料アカウント）
2. Google Workspace: 2,000通/日
3. 大量送信が必要な場合はSendGridなどの専用サービスを検討

### エラーハンドリング

- メール送信失敗時もOTPは有効
- ログで送信状況を確認
- 必要に応じて手動でOTPを通知

## 🔄 更新手順

スクリプトを更新する場合：

1. GASエディタでコードを更新
2. 「デプロイ」→「デプロイを管理」
3. 新しいバージョンとして「デプロイ」

## 📞 トラブルシューティング

### よくある問題

1. **メールが送信されない**
   - Gmail権限を再確認
   - 送信制限に達していないか確認
   - API_SECRETが正しいか確認

2. **OTPが届かない**
   - 迷惑メールフォルダを確認
   - メールアドレスの入力ミスがないか確認

3. **レート制限エラー**
   - 1時間待つか、制限値を増やす
   - PropertiesServiceのデータをリセット

### ログの確認方法

1. GAS実行ログ: GASエディタの「実行数」タブ
2. 送信ログ: 自動作成されるスプレッドシート
3. Next.jsログ: 開発者コンソール

## 📈 本番運用のための推奨事項

1. **監視設定**
   - 送信失敗率の監視
   - レート制限到達の通知

2. **バックアップ**
   - 定期的なスクリプトのバックアップ
   - 設定値の記録

3. **スケーリング**
   - 大量送信が必要な場合はSendGrid等への移行を検討
   - 複数のGASプロジェクトでの負荷分散

---

## 🎯 完了チェックリスト

- [ ] GASプロジェクト作成
- [ ] スクリプトのデプロイ
- [ ] 権限の設定
- [ ] WebアプリURL取得
- [ ] 環境変数設定
- [ ] テスト実行
- [ ] 本番環境での動作確認

このセットアップが完了すると、ユーザーは実際のメールでOTPを受け取れるようになります！ 