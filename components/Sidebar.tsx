'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'

interface SidebarProps {
  userEmail: string
  role: string
  generatorName?: string | null
}

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: '◉' },
  { href: '/subscribers', label: 'المشتركون', icon: '◈' },
  { href: '/payments', label: 'الدفعات الشهرية', icon: '◎' },
]

export function Sidebar({ userEmail, role, generatorName }: SidebarProps) {
  const pathname = usePathname()

  const links = role === 'super_admin'
    ? [...navItems, { href: '/admin/users', label: 'إدارة المستخدمين', icon: '◐' }]
    : navItems

  return (
    <aside className="fixed inset-y-0 right-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl text-blue-400">⚡</span>
          <h1 className="text-base font-bold leading-tight">نظام المولدات</h1>
        </div>
        {generatorName && (
          <p className="text-xs text-slate-400 mt-1 truncate">{generatorName}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-slate-700/60">
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-0.5">الحساب</p>
          <p className="text-sm text-slate-300 truncate">{userEmail}</p>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
            {role === 'super_admin' ? 'مشرف عام' : 'مشرف مولدة'}
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-red-600/80 text-slate-200 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span>↩</span>
            تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  )
}
