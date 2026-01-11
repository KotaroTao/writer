import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dental SEO Generator - コンテンツSEO自動生成',
  description: '歯科医院向けのSEO・MEO・LLMO対策コンテンツを自動生成するツール',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
