'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface Props {
  children: React.ReactNode
  userEmail: string
  role: string
  generatorName?: string | null
}

export function DashboardShell({ children, userEmail, role, generatorName }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar — desktop only (hidden on mobile via Sidebar's own classes) */}
      <Sidebar
        userEmail={userEmail}
        role={role}
        generatorName={generatorName}
      />

      {/* Main area */}
      <div className="md:mr-72 flex flex-col min-h-screen">
        {/*
          Mobile top header.
          We use statusBarStyle="black-translucent" which lets the app extend
          behind the iOS status bar. To stop the header *content* being hidden
          under it, we add padding-top: env(safe-area-inset-top).
          The background colour (bg-white) already fills the safe area visually.
        */}
        <header
          className="sticky top-0 z-20 bg-white border-b border-slate-200 md:hidden shadow-sm"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">نظام المولدات</p>
                {generatorName && (
                  <p className="text-xs text-slate-400 leading-tight">{generatorName}</p>
                )}
              </div>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              role === 'super_admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {role === 'super_admin' ? 'مشرف عام' : 'مشرف مولدة'}
            </span>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile to clear the bottom nav */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav role={role} />
    </div>
  )
}
