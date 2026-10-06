'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, LayoutGrid, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/ai-assistant', label: 'AI Assistant', icon: Sparkles },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 bg-[#050B2A] flex flex-col min-h-screen">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-extrabold text-white text-sm leading-tight">Intertoons Admin</span>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-600/20 text-white border border-brand-500/30'
                  : 'text-blue-200/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-5 border-t border-white/10">
        {/* Plain <a>, not <Link> — this hits a mutating GET route, so it must never be prefetched. */}
        <a
          href="/api/admin/logout"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200/60 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" /> Log out
        </a>
      </div>
    </aside>
  )
}
