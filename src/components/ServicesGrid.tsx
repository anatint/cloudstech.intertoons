'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Bot, Zap, ShoppingBag, ShoppingCart, Smartphone, Globe, ChevronRight, ChevronLeft,
  Layout, Palette, Rocket, Code2, Layers, Wrench, Cloud, Sparkles,
} from 'lucide-react'

const PAGE_SIZE = 9

/* ── Category icon map ──────────────────────────────── */
const CAT_ICON: Record<string, React.ReactNode> = {
  'ai-development':    <Bot className="h-6 w-6" />,
  'ai-automations':    <Zap className="h-6 w-6" />,
  'shopify':           <ShoppingBag className="h-6 w-6" />,
  'ecommerce':         <ShoppingCart className="h-6 w-6" />,
  'mobile':            <Smartphone className="h-6 w-6" />,
  'web':               <Globe className="h-6 w-6" />,
  'other':             <Globe className="h-6 w-6" />,
}
const CAT_GRADIENT: Record<string, string> = {
  'ai-development':    'from-indigo-500 to-blue-600',
  'ai-automations':    'from-violet-500 to-purple-600',
  'shopify':           'from-emerald-500 to-teal-600',
  'ecommerce':         'from-orange-500 to-amber-500',
  'mobile':            'from-sky-500 to-blue-500',
  'web':               'from-slate-500 to-slate-700',
  'other':             'from-slate-500 to-slate-700',
}
const CAT_BG: Record<string, string> = {
  'ai-development':    'bg-indigo-50',
  'ai-automations':    'bg-violet-50',
  'shopify':           'bg-emerald-50',
  'ecommerce':         'bg-orange-50',
  'mobile':            'bg-sky-50',
  'web':               'bg-slate-50',
  'other':             'bg-slate-50',
}
const CAT_TEXT: Record<string, string> = {
  'ai-development':    'text-indigo-600',
  'ai-automations':    'text-violet-600',
  'shopify':           'text-emerald-600',
  'ecommerce':         'text-orange-600',
  'mobile':            'text-sky-600',
  'web':               'text-slate-600',
  'other':             'text-slate-600',
}
const CAT_LABEL: Record<string, string> = {
  'ai-development':    'AI Development',
  'ai-automations':    'AI Automations',
  'shopify':           'Shopify',
  'ecommerce':         'E-commerce',
  'mobile':            'Mobile Apps',
  'web':               'Web Development',
  'design':            'Design',
  'cloud':             'Cloud & DevOps',
  'other':             'Other Services',
}
const KNOWN_CATEGORIES = new Set(Object.keys(CAT_ICON).filter((k) => k !== 'other'))

/* Services whose category isn't one of the few known ones above (mostly the
   migrated WordPress pages, which never carried a matching category) all
   fell back to the same slate/globe look. Give each of those a varied
   icon+color combo instead — picked deterministically from the slug so it's
   stable across server/client renders (no hydration mismatch) rather than
   truly random. */
const VARIANT_POOL: { icon: React.ReactNode; gradient: string; bg: string; text: string }[] = [
  { icon: <Globe className="h-6 w-6" />,   gradient: 'from-slate-500 to-slate-700',   bg: 'bg-slate-50',   text: 'text-slate-600' },
  { icon: <Layout className="h-6 w-6" />,  gradient: 'from-cyan-500 to-blue-600',     bg: 'bg-cyan-50',    text: 'text-cyan-600' },
  { icon: <Palette className="h-6 w-6" />, gradient: 'from-pink-500 to-rose-600',     bg: 'bg-pink-50',    text: 'text-pink-600' },
  { icon: <Rocket className="h-6 w-6" />,  gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50',   text: 'text-amber-600' },
  { icon: <Code2 className="h-6 w-6" />,   gradient: 'from-teal-500 to-emerald-600', bg: 'bg-teal-50',    text: 'text-teal-600' },
  { icon: <Layers className="h-6 w-6" />,  gradient: 'from-fuchsia-500 to-purple-600', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
  { icon: <Wrench className="h-6 w-6" />,  gradient: 'from-lime-500 to-green-600',   bg: 'bg-lime-50',    text: 'text-lime-600' },
  { icon: <Cloud className="h-6 w-6" />,   gradient: 'from-sky-500 to-indigo-600',   bg: 'bg-sky-50',     text: 'text-sky-600' },
  { icon: <Sparkles className="h-6 w-6" />, gradient: 'from-violet-500 to-fuchsia-600', bg: 'bg-violet-50', text: 'text-violet-600' },
]
function pickVariant(slug: string) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  return VARIANT_POOL[hash % VARIANT_POOL.length]
}

/* ── Slug → rich sub-bullets (inline fallback data, used when a service
   record has neither subServices nor whyChoose set) ── */
const SERVICE_BULLETS: Record<string, string[]> = {
  'shopify-developers-kerala': ['Custom Shopify stores', 'Theme customisation', 'Shopify app dev', 'Platform migration', 'Speed optimisation'],
  'ai-development':            ['Custom LLM integrations', 'Predictive analytics', 'AI chatbot development', 'AI infrastructure', 'AI consulting'],
  'ai-automations':            ['Workflow automation', 'RPA solutions', 'API integrations', 'Web scraping & ETL', '24/7 monitoring'],
  'ecommerce-development':     ['Custom e-commerce stores', 'UX/UI design', 'Payment integrations', 'Platform migration', 'Performance & SEO'],
  'mobile-app-development':    ['Native iOS (Swift)', 'Native Android (Kotlin)', 'Cross-platform Flutter', 'App Store publishing', 'Ongoing maintenance'],
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ServicesGridProps {
  services: any[]
  learnMoreLabel?: string
}

export default function ServicesGrid({ services, learnMoreLabel }: ServicesGridProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE))
  const pageStart = (page - 1) * PAGE_SIZE
  const paged = services.slice(pageStart, pageStart + PAGE_SIZE)

  const goToPage = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paged.map((s: any) => (
          <ServiceCard
            key={s.id ?? s.slug}
            slug={s.slug}
            title={s.title}
            category={s.category ?? 'other'}
            shortDescription={s.shortDescription}
            bullets={
              (s.subServices?.length ? s.subServices.map((sub: any) => sub.title) : null)
              ?? (s.whyChoose?.length ? s.whyChoose.slice(0, 5) : null)
              ?? SERVICE_BULLETS[s.slug]
              ?? []
            }
            learnMoreLabel={learnMoreLabel}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`h-9 min-w-9 px-3 rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Service Card component ───────────────────────── */
function ServiceCard({
  slug, title, category, shortDescription, bullets, learnMoreLabel,
}: {
  slug: string
  title: string
  category: string
  shortDescription?: string
  bullets?: string[]
  learnMoreLabel?: string
}) {
  const isKnown  = KNOWN_CATEGORIES.has(category)
  const variant  = isKnown ? null : pickVariant(slug)
  const gradient = isKnown ? CAT_GRADIENT[category] : variant!.gradient
  const bg       = isKnown ? CAT_BG[category]       : variant!.bg
  const textCol  = isKnown ? CAT_TEXT[category]     : variant!.text
  const icon     = isKnown ? CAT_ICON[category]     : variant!.icon
  const catLabel = CAT_LABEL[category] ?? category

  return (
    <Link
      href={`/${slug}`}
      className="group flex flex-col rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden"
    >
      {/* Card header strip */}
      <div className={`${bg} px-6 pt-6 pb-5`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm`}>
            {icon}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${textCol} mt-1`}>
            {catLabel}
          </span>
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors">
          {title}
        </h3>
      </div>

      {/* Card body */}
      <div className="px-6 py-5 flex flex-col flex-1">
        {shortDescription && (
          <p className="text-[15px] text-slate-500 leading-relaxed line-clamp-2 mb-4">
            {shortDescription}
          </p>
        )}

        {bullets && bullets.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {bullets.slice(0, 4).map((b) => (
              <li key={b} className="flex items-center gap-2 text-[15px] text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
          {learnMoreLabel ?? 'Learn more'} <ChevronRight className="h-4 w-4 shrink-0" />
        </div>
      </div>
    </Link>
  )
}
