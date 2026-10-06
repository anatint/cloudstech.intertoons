'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  Menu, X, ChevronDown, Bot, Zap, ShoppingBag, Globe, Smartphone, ChevronRight,
  Utensils, Car, MessageSquare, Plane, Briefcase, FolderOpen, BookOpen,
  ShoppingCart, Layout, Package, Users, Building2, HelpCircle, ArrowRight,
  ShieldCheck, Star, Rocket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ── Mega menu data ── */
const navItems = [
  { label: 'Home', href: '/' },

  /* SERVICES — mega */
  {
    label: 'Services',
    href: '/services',
    mega: true,
    columns: [
      {
        heading: 'AI & Automation',
        items: [
          { label: 'AI Development', href: '/ai-development', description: 'Custom AI solutions & LLM integrations', icon: Bot },
          { label: 'AI Automations', href: '/ai-automations', description: 'Automate workflows, reduce manual tasks', icon: Zap },
          { label: 'Mobile App Development', href: '/mobile-app-development', description: 'Android & iOS native apps', icon: Smartphone },
        ],
      },
      {
        heading: 'E-commerce',
        items: [
          { label: 'Shopify Developers Kerala', href: '/shopify-developers-kerala', description: 'High-converting Shopify stores & apps', icon: ShoppingBag },
          { label: 'E-commerce Development', href: '/ecommerce-development', description: 'Scalable, feature-rich online stores', icon: ShoppingCart },
        ],
      },
    ],
  },

  /* PRODUCTS — mega */
  {
    label: 'Products',
    href: '/products',
    mega: true,
    columns: [
      {
        heading: 'Food & Hospitality',
        items: [
          { label: 'Plattero — Food Delivery', href: '/products/food-delivery-app', description: 'White-label on-demand delivery platform', icon: Utensils },
          { label: 'Triptels — Travel Portal', href: '/products/travel-portal-saas', description: 'Complete travel booking SaaS solution', icon: Plane },
        ],
      },
      {
        heading: 'Fleet & AI',
        items: [
          { label: 'Car Rental System', href: '/products/car-rental-system', description: 'Fleet & rental management platform', icon: Car },
          { label: 'ConvoAI — AI Chatbots', href: '/products/ai-chatbots', description: 'Conversational AI for your business', icon: MessageSquare },
        ],
      },
    ],
  },

  /* PORTFOLIO — mega */
  {
    label: 'Portfolio',
    href: '/works',
    mega: true,
    columns: [
      {
        heading: 'By Category',
        items: [
          { label: 'E-commerce Projects', href: '/works?cat=ecommerce', description: 'Shopify & WooCommerce stores', icon: ShoppingBag },
          { label: 'Mobile App Projects', href: '/works?cat=mobile-app', description: 'Android & iOS native apps', icon: Smartphone },
          { label: 'Web Development', href: '/works?cat=web-development', description: 'Custom web apps & platforms', icon: Globe },
        ],
      },
      {
        heading: 'Explore',
        items: [
          { label: 'All Projects', href: '/works', description: '170+ completed projects', icon: FolderOpen },
          { label: 'Case Studies', href: '/case-studies', description: 'Deep-dive project breakdowns', icon: BookOpen },
          { label: 'About Us', href: '/about-us', description: 'Our story, team & mission', icon: Users },
        ],
      },
    ],
  },

  { label: 'Blog', href: '/blog' },
]

export function Header({ navData, services, products, projects, caseStudies, settings, contactHref = '/contact-us' }: { navData?: any; services?: any[]; products?: any[]; projects?: any[]; caseStudies?: any[]; settings?: any; contactHref?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  // Mega menu is now centered on the viewport instead of under its trigger, so the
  // cursor crosses empty space on the way there — a short close delay (cancelled by
  // re-entering either the trigger or the panel) keeps it open during that crossing.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 200)
  }
  // Clicking a link inside the mega menu should close it immediately — otherwise
  // it stays open on the destination page until the cursor happens to move away.
  const closeMenu = () => {
    cancelClose()
    setActiveDropdown(null)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => () => cancelClose(), [])

  // Transparent overlay header on pages with a dark hero (white text/logo); solid
  // white once scrolled. Catch-all CMS pages (/[...slug]) keep the solid header
  // since their hero can be light.
  const pathname = usePathname()
  const OVERLAY_EXACT = new Set(['/case-studies', '/industries', '/technologies', '/careers'])
  const OVERLAY_PREFIX = ['/products/', '/case-studies/', '/industries/', '/technologies/']
  const isDarkHero = OVERLAY_EXACT.has(pathname) || OVERLAY_PREFIX.some((p) => pathname.startsWith(p))
  const overlay = isDarkHero && !scrolled
  // These listing pages all got the light-gradient hero redesign, so their
  // header floats transparent too (until scrolled), keeping the normal dark
  // text/logo — unlike the white-on-dark overlay used on the dark-hero pages.
  // Service detail pages live at root-level slugs (e.g. /shopify-development, no
  // /services/ prefix), so they're matched against the live services list instead
  // of a path prefix — they got the same light-gradient hero treatment.
  const isServiceSlugPath = (services ?? []).some((s: any) => s?.slug && pathname === `/${s.slug}`)
  const LIGHT_HERO_EXACT = new Set(['/', '/services', '/works', '/products', '/blog', '/request-a-quote', '/about-us', '/team', contactHref])
  // Portfolio detail pages (/works/<slug>) also got the light-gradient hero.
  const LIGHT_HERO_PREFIX = ['/works/']
  const isLightHero = LIGHT_HERO_EXACT.has(pathname) || isServiceSlugPath || LIGHT_HERO_PREFIX.some((p) => pathname.startsWith(p))
  const transparentLight = isLightHero && !scrolled
  const transparent = overlay || transparentLight

  /* Build every mega-menu dynamically from its CMS collection so new entries
     appear automatically. Each menu falls back to its hardcoded list if empty. */
  const mkChildren = (list: any[] | undefined, base: string, icon: any) =>
    (list ?? [])
      .filter((x) => x && x.slug && (x.title || x.name))
      .map((x) => ({
        label: (x.title || x.name) as string,
        href: `${base}/${x.slug}`,
        description: x.shortDescription || x.tagline || x.excerpt || '',
        icon,
      }))
  const twoCol = (children: any[], h1: string, h2: string) =>
    [
      { heading: h1, items: children.slice(0, Math.ceil(children.length / 2)) },
      { heading: h2, items: children.slice(Math.ceil(children.length / 2)) },
    ].filter((c) => c.items.length)

  /* Services menu is grouped by each item's own `category` field (whatever
     value is set in Wix — no fixed list), so new categories show up
     automatically without a code change. Falls back to "More Services" for
     items with no category set. */
  const CATEGORY_ICONS: Record<string, any> = {
    Shopify: ShoppingBag,
    'E-commerce': ShoppingCart,
    'Mobile App': Smartphone,
    'AI Development': Bot,
    'AI & Automation': Zap,
    'Software Development': Layout,
  }
  const CATEGORY_ORDER = ['Shopify', 'Mobile App', 'AI Development', 'AI & Automation', 'Software Development', 'E-commerce']
  const TRUST_STATS = [
    { icon: ShieldCheck, value: 'Trusted by 100+ Clients', label: 'Across 15+ countries' },
    { icon: Star, value: '10+ Years of Experience', label: 'Delivering excellence' },
    { icon: Users, value: 'Dedicated Support', label: "We're here to help" },
  ]
  // Rotating pastel palette for column-header and item-icon badges, purely
  // cosmetic (no per-service icon/color data exists in the CMS).
  const BADGE_COLORS = [
    'bg-violet-100 text-violet-600',
    'bg-emerald-100 text-emerald-600',
    'bg-blue-100 text-blue-600',
    'bg-cyan-100 text-cyan-600',
    'bg-pink-100 text-pink-600',
    'bg-amber-100 text-amber-600',
  ]
  // Left intro panel content for every mega menu — same gradient-panel
  // treatment the Services menu got, applied to Products/Portfolio/Case
  // Studies too instead of just Services.
  const MEGA_INTRO: Record<string, {
    eyebrow: string; line1: string; line2: string; desc: string
    icons: any[]; viewAllHref: string; viewAllLabel: string
  }> = {
    Services: {
      eyebrow: 'Our Services', line1: 'Digital Solutions', line2: 'That Drive Growth',
      desc: 'Explore our wide range of services and products designed to build, automate and scale your business.',
      icons: [ShoppingCart, Bot, Smartphone], viewAllHref: '/services', viewAllLabel: 'View All Services',
    },
    Products: {
      eyebrow: 'Our Products', line1: 'Ready-Made', line2: 'Digital Products',
      desc: 'White-label SaaS products built to help you launch your own business faster.',
      icons: [Utensils, MessageSquare, Car], viewAllHref: '/products', viewAllLabel: 'View All Products',
    },
    Portfolio: {
      eyebrow: 'Our Work', line1: '170+ Projects,', line2: 'Delivered with Pride',
      desc: 'Real e-commerce, mobile and web projects we’ve shipped for clients worldwide.',
      icons: [FolderOpen, Globe, Smartphone], viewAllHref: '/works', viewAllLabel: 'View All Projects',
    },
  }
  // Case/whitespace-insensitive so slightly different data entry (e.g. "shopify"
  // vs "Shopify") still merges into one column instead of splitting the menu.
  const normalizeCategory = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ')
  const CANONICAL_BY_NORMALIZED: Record<string, string> = Object.fromEntries(
    [...CATEGORY_ORDER, ...Object.keys(CATEGORY_ICONS)].map((c) => [normalizeCategory(c), c]),
  )
  const groupByCategory = (list: any[] | undefined, base: string) => {
    const withCategory = (list ?? [])
      .filter((x) => x && x.slug && (x.title || x.name))
      .map((x) => {
        const raw = (x.category || '').trim()
        const norm = normalizeCategory(raw)
        const heading = raw ? (CANONICAL_BY_NORMALIZED[norm] || raw) : 'More Services'
        return {
          label: (x.title || x.name) as string,
          href: `${base}/${x.slug}`,
          description: x.shortDescription || x.tagline || x.excerpt || '',
          heading,
        }
      })
    const groups = new Map<string, any[]>()
    for (const item of withCategory) {
      if (!groups.has(item.heading)) groups.set(item.heading, [])
      groups.get(item.heading)!.push({ ...item, icon: CATEGORY_ICONS[item.heading] || Layout })
    }
    const orderedKeys = [
      ...CATEGORY_ORDER.filter((k) => groups.has(k)),
      ...[...groups.keys()].filter((k) => k !== 'More Services' && !CATEGORY_ORDER.includes(k)),
      ...(groups.has('More Services') ? ['More Services'] : []),
    ]
    // Show only 3 category columns, each capped at 10 rows. Categories beyond
    // the 3rd aren't dropped — their services are merged into the last shown
    // column (still capped at 10) so every service stays reachable.
    const shownKeys = orderedKeys.slice(0, 3)
    const overflowKeys = orderedKeys.slice(3)
    return shownKeys.map((heading, idx) => {
      const own = groups.get(heading)!
      const isLastColumn = idx === shownKeys.length - 1
      const items = isLastColumn && overflowKeys.length
        ? [...own, ...overflowKeys.flatMap((k) => groups.get(k)!)]
        : own
      return { heading, items: items.slice(0, 10) }
    })
  }

  const dynamic: Record<string, any[]> = {
    Products: mkChildren(products, '/products', Package),
    Portfolio: mkChildren(projects, '/works', FolderOpen),
  }
  const servicesColumns = groupByCategory(services, '')
  const items = [
    ...navItems.map((it) => {
      if (it.label === 'Services') return servicesColumns.length ? { ...it, columns: servicesColumns } : it
      const ch = dynamic[it.label]
      return it.mega && ch && ch.length ? { ...it, columns: twoCol(ch, it.label, `More ${it.label}`) } : it
    }),
    // Plain nav item, not the old separate dropdown-with-Careers off to the
    // side — sits in the same evenly-spaced row as Home/Services/.../Blog.
    { label: 'Contact', href: `${contactHref}#contact-form` },
  ]

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 transition-all duration-300',
        // The floating "Request a Call Back" widget renders as a page-level
        // sibling at z-[60] and is always mounted — on small screens it sits
        // fixed at the bottom of the viewport and, at the header's usual
        // z-50, physically overlaps (and swallows taps on) the bottom rows
        // of the open mobile menu. Lift the header above it only while the
        // mobile menu is open, so links stay clickable underneath.
        mobileOpen ? 'z-[70]' : 'z-50',
        transparent ? 'bg-transparent' : scrolled ? 'bg-white shadow-md' : 'bg-white shadow-sm',
      )}
    >
      <div className="container flex h-16 sm:h-20 lg:h-[100px] items-center justify-between max-w-7xl">
        {/* Logo — same fixed height as the nav row and CTA buttons below (not
            just vertically centered within the taller header bar) so all
            three groups share one common top/bottom edge instead of each
            centering around its own, differently-sized box. */}
        <Link href="/" className="flex h-7 sm:h-9 lg:h-11 items-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={overlay ? (settings?.logoWhite || '/logo-white.png') : (settings?.logo || '/logo.png')}
            alt={settings?.siteName || 'Intertoons'}
            className="h-full w-auto object-contain max-w-[130px] sm:max-w-[150px] lg:max-w-[165px]"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex h-11 items-center gap-1">
          {items.map((item) => {
            // The current page's own nav item keeps the hover look applied
            // permanently, not just while the cursor is over it — Services
            // also counts as active from a root-level service-detail slug
            // (e.g. /shopify-development), since those pages live outside
            // the /services/ path.
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.label === 'Services' && isServiceSlugPath)
            return (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => { if (item.mega) { cancelClose(); setActiveDropdown(item.label) } }}
              onMouseLeave={scheduleClose}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-2 text-base font-medium transition-colors rounded-lg whitespace-nowrap',
                  overlay
                    ? (isActive ? 'text-white bg-white/10' : 'text-white/90 hover:text-white hover:bg-white/10')
                    : (isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600 hover:bg-brand-50'),
                )}
              >
                {item.label}
                {item.mega && (
                  <ChevronDown className={cn('h-3.5 w-3.5 mt-px', overlay ? 'text-white/70' : 'text-slate-400')} />
                )}
              </Link>

              {/* Mega menu — centered on the viewport (not under the trigger), so it
                  reads as centered on the page regardless of where the trigger sits
                  in the nav row. `cancelClose`/`scheduleClose` (not instant close)
                  keep it open while the cursor crosses the gap to reach it. */}
              {item.mega && activeDropdown === item.label && (
                <div
                  className="fixed top-16 sm:top-20 lg:top-[100px] left-1/2 -translate-x-1/2 pt-1 z-50"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <div
                    className="rounded-3xl shadow-2xl border border-slate-100 overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50"
                    style={{
                      width: `min(calc(100vw - 2rem), ${280 + Math.max(560, (item.columns?.length || 2) * 280)}px)`,
                    }}
                  >
                    <div className="grid grid-cols-[280px_1fr] gap-8 p-8">
                      {/* Left intro panel — same treatment for every mega menu */}
                      {(() => {
                        const intro = MEGA_INTRO[item.label]
                        if (!intro) return <div />
                        return (
                          <div className="flex flex-col">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500 mb-3">{intro.eyebrow}</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 leading-snug">
                              {intro.line1}<br />
                              <span className="bg-clip-text text-transparent animate-gradient-text">{intro.line2}</span>
                            </h3>
                            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                              {intro.desc}
                            </p>
                            <div className="mt-6 flex-1 flex items-center justify-center">
                              <div className="flex items-end justify-center gap-2">
                                {(() => {
                                  const [IconA, IconB, IconC] = intro.icons
                                  return (
                                    <>
                                      <div className="h-16 w-14 rounded-xl bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center">
                                        <IconA className="h-6 w-6 text-brand-500" />
                                      </div>
                                      <div className="h-24 w-14 rounded-xl bg-gradient-to-b from-violet-100 to-blue-50 flex items-center justify-center">
                                        <IconB className="h-7 w-7 text-violet-600" />
                                      </div>
                                      <div className="h-20 w-14 rounded-xl bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center">
                                        <IconC className="h-6 w-6 text-brand-500" />
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                            <div className="mt-5 rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-3 shadow-sm">
                              <span className="h-8 w-8 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                                <HelpCircle className="h-4 w-4 text-violet-600" />
                              </span>
                              <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">Need something custom?</p>
                                <Link href="/request-a-quote#quote-form" onClick={closeMenu} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700">
                                  Request a Free Quote <ArrowRight className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                      <div>
                        <div
                          className="grid gap-6 max-h-[65vh] overflow-y-auto pr-1 scrollbar-hide"
                          style={{ gridTemplateColumns: `repeat(${item.columns?.length || 2}, minmax(0, 1fr))` }}
                        >
                          {item.columns?.map((col, colIdx) => {
                            return (
                              <div
                                key={col.heading}
                                className={cn(colIdx > 0 && 'border-l border-slate-200/60 pl-6')}
                              >
                                <div className="space-y-1">
                                  {col.items.map((child, childIdx) => {
                                    const itemColor = BADGE_COLORS[childIdx % BADGE_COLORS.length]
                                    return (
                                      <Link
                                        key={child.href}
                                        href={child.href}
                                        onClick={closeMenu}
                                        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-white transition-colors group"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors', itemColor)}>
                                            <child.icon className="h-4 w-4" />
                                          </span>
                                          <div className="min-w-0">
                                            <div className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors leading-tight truncate">
                                              {child.label}
                                            </div>
                                            {child.description && (
                                              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{child.description}</div>
                                            )}
                                          </div>
                                        </div>
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-500 shrink-0" />
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom bar — trust stats + a "View All {Section}" CTA sharing the same row, on every mega menu */}
                    <div className="border-t border-slate-200/60 bg-white/60 px-6 py-4 grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center">
                      {TRUST_STATS.map((s, i) => (
                        <div key={s.value} className={cn('flex items-center gap-2.5', i > 0 && 'border-l border-slate-200 pl-4')}>
                          <span className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <s.icon className="h-4 w-4 text-brand-600" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-tight truncate">{s.value}</p>
                            <p className="text-[11px] text-slate-400 leading-tight truncate">{s.label}</p>
                          </div>
                        </div>
                      ))}
                      <Link
                        href={MEGA_INTRO[item.label]?.viewAllHref ?? item.href}
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-brand-600 text-white text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
                      >
                        {MEGA_INTRO[item.label]?.viewAllLabel ?? `View All ${item.label}`} <ArrowRight className="h-4 w-4 shrink-0" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </nav>

        {/* CTA + Mobile Toggle */}
        <div className="flex h-7 sm:h-9 lg:h-11 items-center gap-3">
          <Button asChild size="sm" variant="outline" className="hidden lg:inline-flex text-base whitespace-nowrap">
            <a href="https://tools.intertoons.com/" target="_blank" rel="noopener noreferrer">Free Tools</a>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex bg-brand-600 hover:bg-brand-700 text-base whitespace-nowrap">
            <Link href="/request-a-quote#quote-form">Request a Quote →</Link>
          </Button>
          <button
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              overlay ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100',
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white max-h-[80vh] overflow-y-auto">
          <nav className="container py-4 flex flex-col gap-0.5">
            {items.map((item) => (
              <div key={item.label}>
                {item.mega ? (
                  <>
                    {/* Split into two tap targets: the label itself navigates
                        straight to the section's main page, while a separate
                        chevron button expands the submenu — previously the
                        whole row was one button that only ever toggled the
                        submenu, so the main page (e.g. /services) could
                        never be reached directly from mobile. */}
                    <div className="w-full flex items-center justify-between rounded-xl hover:bg-brand-50 transition-colors">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
                      >
                        {item.label}
                      </Link>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                        aria-label={`Toggle ${item.label} submenu`}
                        className="px-4 py-3 text-slate-400 hover:text-brand-600 shrink-0"
                      >
                        <ChevronDown className={cn('h-4 w-4 transition-transform', mobileExpanded === item.label && 'rotate-180')} />
                      </button>
                    </div>
                    {mobileExpanded === item.label && (
                      <div className="ml-4 mb-2 space-y-0.5">
                        {item.columns?.flatMap((col) => col.items).map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <child.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-3 pb-1 flex flex-col gap-2">
              <Link
                href={`${contactHref}#contact-form`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/careers"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
              >
                <Briefcase className="h-4 w-4 text-brand-600 shrink-0" />
                Careers
              </Link>
              <Button asChild variant="outline" className="w-full">
                <a href="https://tools.intertoons.com/" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
                  Free Tools
                </a>
              </Button>
              <Button asChild className="w-full bg-brand-600 hover:bg-brand-700">
                <Link href="/request-a-quote#quote-form" onClick={() => setMobileOpen(false)}>
                  Request a Quote →
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
