#!/bin/bash

# ===========================================
# 環境変数統合スクリプト
# ===========================================

echo "🔧 環境変数ファイルを統合しています..."

# 1. バックアップ作成
echo "📦 現在のファイルをバックアップ中..."
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ .env をバックアップしました"
fi

if [ -f .env.local ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ .env.local をバックアップしました"
fi

# 2. 現在の値を取得
echo "📝 現在の設定値を読み込み中..."

# .envから値を取得
if [ -f .env ]; then
    source .env
    CURRENT_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
    CURRENT_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
    CURRENT_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
    CURRENT_APP_URL=$NEXT_PUBLIC_APP_URL
    CURRENT_GA_ID=$NEXT_PUBLIC_GA_ID
    CURRENT_SENTRY_DSN=$SENTRY_DSN
fi

# .env.localから値を取得
if [ -f .env.local ]; then
    source .env.local
    CURRENT_JWT_SECRET=$JWT_SECRET
    CURRENT_GAS_WEBAPP_URL=$GAS_WEBAPP_URL
    CURRENT_GAS_API_SECRET=$GAS_API_SECRET
fi

# 3. 新しい統合ファイルを作成
echo "🚀 新しい統合 .env ファイルを作成中..."

cat > .env << EOF
# ===========================================
# 学生団体OBOG就活ナレッジサイト - 環境変数設定
# ===========================================

# -----------------------------------------
# Next.js 基本設定
# -----------------------------------------
NEXT_PUBLIC_APP_URL=${CURRENT_APP_URL:-http://localhost:3000}
NODE_ENV=development

# -----------------------------------------
# 認証・セキュリティ
# -----------------------------------------
JWT_SECRET=${CURRENT_JWT_SECRET:-your-super-secret-jwt-key-for-obog-site-2024}

# -----------------------------------------
# Supabase データベース
# -----------------------------------------
NEXT_PUBLIC_SUPABASE_URL=${CURRENT_SUPABASE_URL:-https://pubepjjlzczkkiuhdgei.supabase.co}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${CURRENT_SUPABASE_ANON_KEY:-your_supabase_anon_key}
SUPABASE_SERVICE_ROLE_KEY=${CURRENT_SERVICE_ROLE_KEY:-your_supabase_service_role_key}

# -----------------------------------------
# メール送信サービス (Google Apps Script)
# -----------------------------------------
# GAS WebアプリのURL（デプロイ後に取得）
GAS_WEBAPP_URL=${CURRENT_GAS_WEBAPP_URL:-https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec}

# GAS API認証用シークレットキー（GAS側のCONFIG.API_SECRETと同じ値）
GAS_API_SECRET=${CURRENT_GAS_API_SECRET:-your-gas-api-secret-key-2024}

# -----------------------------------------
# 外部サービス連携
# -----------------------------------------
# Google Analytics
NEXT_PUBLIC_GA_ID=${CURRENT_GA_ID:-your_google_analytics_id}

# エラー監視 (Sentry)
SENTRY_DSN=${CURRENT_SENTRY_DSN:-your_sentry_dsn}

# -----------------------------------------
# 開発用設定
# -----------------------------------------
# デバッグモード (true/false)
DEBUG_MODE=true

# ログレベル (error, warn, info, debug)
LOG_LEVEL=debug

# -----------------------------------------
# 本番用設定（本番環境でのみ設定）
# -----------------------------------------
# NEXT_PUBLIC_APP_URL=https://your-domain.com
# NODE_ENV=production
# DEBUG_MODE=false
# LOG_LEVEL=error
EOF

# 4. 古いファイルを削除
echo "🗑️  古いファイルを削除中..."
if [ -f .env.local ]; then
    rm .env.local
    echo "✅ .env.local を削除しました"
fi

# 5. 完了メッセージ
echo ""
echo "🎉 環境変数の統合が完了しました！"
echo ""
echo "📋 変更内容:"
echo "  ✅ すべての環境変数を .env に統合"
echo "  ✅ カテゴリ別に整理"
echo "  ✅ 本番用設定例を追加"
echo "  ✅ 古いファイルをバックアップ"
echo ""
echo "🧪 次のステップ:"
echo "  1. npm run dev で動作確認"
echo "  2. ログインページでOTP送信テスト"
echo "  3. 必要に応じて設定値を調整"
echo ""
echo "📁 バックアップファイル:"
ls -la *.backup.* 2>/dev/null || echo "  なし"
echo ""
EOF 