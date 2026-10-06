import Link from 'next/link'

const NAV = [
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/works', label: 'Portfolio' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/industries', label: 'Industries' },
  { href: '/team', label: 'Team' },
]

/** Minimal fixed header (scaffold). Replace with the ported itwebsite Header. */
export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[72px] bg-[#050B2A]/95 backdrop-blur border-b border-white/10">
      <div className="container max-w-6xl h-full flex items-center justify-between">
        <Link href="/" className="text-white font-black text-lg tracking-tight">
          Inter<span className="text-brand-400">toons</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/request-a-quote"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
        >
          Get a Quote
        </Link>
      </div>
    </header>
  )
}
