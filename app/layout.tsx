import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { IOSInstallBanner } from '@/components/pwa/IOSInstallBanner'

// ── SEO + PWA metadata ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'نظام مشتركي المولدات',
  description: 'نظام إدارة اشتراكات المولدات الكهربائية الخاصة',
  manifest: '/manifest.json',

  // iOS "Add to Home Screen" behaviour.
  // NOTE: `capable: true` is intentionally omitted here — Next.js 15+ changed
  // it to emit `mobile-web-app-capable` (the standard tag) instead of the
  // Apple-specific `apple-mobile-web-app-capable`.  iOS Safari STILL requires
  // the Apple tag for splash screens to work (see Next.js issue #74524).
  // We inject it manually in <head> below.
  appleWebApp: {
    title: 'المولدات',
    // black-translucent lets content extend behind the iOS status bar.
    // The mobile header compensates with env(safe-area-inset-top) padding.
    statusBarStyle: 'black-translucent',
  },

  // Icons
  icons: {
    icon: [{ url: '/icon', type: 'image/png' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },

  // Prevent search engines indexing the private app
  robots: { index: false, follow: false },
}

// ── Viewport (separate from metadata in Next.js 14+) ─────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Cover means content fills the safe-area (notch, home indicator)
  viewportFit: 'cover',
  themeColor: '#2563EB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        {/*
          apple-mobile-web-app-capable MUST be injected manually.
          Next.js 15+ emits `mobile-web-app-capable` (the web standard) from
          `appleWebApp.capable`, but iOS Safari still requires the Apple-specific
          tag for splash screens and reliable standalone-mode activation.
          (Next.js issue #74524 — unresolved as of 2025)
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Standard equivalent for Chrome/Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Prevents iOS from auto-linking phone numbers / emails / dates */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body className="min-h-full bg-slate-50 antialiased">
        {children}

        {/* PWA infrastructure — rendered in body so they don't block HTML */}
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <IOSInstallBanner />
      </body>
    </html>
  )
}
