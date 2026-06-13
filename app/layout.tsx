import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'نظام مشتركي المولدات',
  description: 'نظام إدارة اشتراكات المولدات الكهربائية الخاصة',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full bg-slate-50 antialiased">{children}</body>
    </html>
  )
}
