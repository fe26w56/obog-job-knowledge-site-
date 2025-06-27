import type { Metadata } from 'next'
import { Noto_Sans_JP, Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  variable: '--font-noto-sans-jp'
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: '学生団体OBOG就活ナレッジサイト',
  description: '学生団体の現役生とOBOGが就活情報を安全に共有するプラットフォーム',
  keywords: ['就活', 'OBOG', '学生団体', 'キャリア'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
} 