import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OB</span>
              </div>
              <span className="font-bold text-xl text-white">就活ナレッジ</span>
            </div>
            <p className="text-gray-400 max-w-md">
              学生団体の現役生とOBOGが就活情報を安全に共有するプラットフォーム。
              先輩の経験を活かして、より良いキャリアを築きましょう。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">サービス</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/posts" className="hover:text-white transition-colors">
                  投稿一覧
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  検索
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-white transition-colors">
                  ブックマーク
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  ヘルプ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <p className="text-center text-gray-400">
            © 2024 学生団体OBOG就活ナレッジサイト. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 