'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

interface Props {
  children: React.ReactNode
  userEmail: string
  role: string
  generatorName?: string | null
}

export function DashboardShell({ children, userEmail, role, generatorName }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        userEmail={userEmail}
        role={role}
        generatorName={generatorName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="md:mr-72 flex flex-col min-h-screen">
        {/* Mobile top header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between md:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-xl">⚡</span>
            <span className="font-bold text-slate-800 text-sm">نظام المولدات</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
            aria-label="فتح القائمة"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
