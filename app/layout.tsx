import { Analytics } from '@vercel/analytics/next'
import { Cairo } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })

export const metadata: Metadata = {
  title: 'QS Automate Manager | لوحة التحكم',
  description: 'لوحة تحكم وكالة الأتمتة الذكية للمطاعم والمقاهي والمستودعات.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#111827',
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl" className="bg-background"><body className={`${cairo.variable} antialiased`}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
