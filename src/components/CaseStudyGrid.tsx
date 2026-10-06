'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  all:               'All Studies',
  ecommerce:         'E-commerce',
  'mobile-app':      'Mobile Apps',
  'web-development': 'Web Dev',
  travel:            'Travel',
  'food-delivery':   'Food Delivery',
  'real-estate':     'Real Estate',
  healthcare:        'Healthcare',
  ai:                'AI',
  other:             'Other',
}

interface Project {
  id: string
  slug: string
  title: string
  client?: string
  category?: string
  excerpt?: string
  coverImage?: { url: string } | null
  results?: Array<{ metric: string; label: string }>
  services?: Array<{ title: string; slug: string } | string>
}

export default function CaseStudyGrid({
  projects, noCaseStudiesMessage, featuredBadgeLabel, caseStudyBadgeLabel, clientLabelPrefix, readCaseStudyLabel,
}: {
  projects: Project[]
  noCaseStudiesMessage?: string
  featuredBadgeLabel?: string
  caseStudyBadgeLabel?: string
  clientLabelPrefix?: string
  readCaseStudyLabel?: string
}) {
  const categories = [
    'all',
    ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean) as string[])),
  ]

  const [active, setActive] = useState('all')
  const filtered = active === 'all' ? projects : projects.filter((p) => p.category === active)

  const featured  = filtered[0] ?? null
  const rest      = filtered.slice(1)

  return (
    <div>
      {/* ── Filter tabs ── */}
      <div className="border-b border-slate-100 bg-white sticky top-[100px] z-20 shadow-sm">
        <div className="container max-w-6xl py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      <section className="py-16 lg:py-20 bg-white">
        <div className="container max-w-6xl">
          {filtered.length === 0 ? (
            <p className="text-center py-24 text-slate-500">{noCaseStudiesMessage ?? 'No case studies in this category.'}</p>
          ) : (
            <>
              {/* ── Featured card (first result) ── */}
              {featured && (
                <Link
                  href={`/case-studies/${featured.slug}`}
                  className="group mb-10 grid lg:grid-cols-[1.4fr_1fr] gap-0 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-brand-200 transition-all duration-300 bg-white flex"
                >
                  {/* Image */}
                  <div className="relative h-64 lg:h-auto bg-gradient-to-br from-blue-50 to-slate-100 min-h-[280px]">
                    {featured.coverImage?.url ? (
                      <Image
                        src={featured.coverImage.url}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-6xl font-black text-brand-200">
                        {featured.title.charAt(0)}
                      </div>
                    )}
                    {/* Featured badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {featuredBadgeLabel ?? 'Featured'}
                      </span>
                      {featured.category && (
                        <span className="px-3 py-1 rounded-full bg-white/90 text-slate-700 text-[10px] font-semibold border border-slate-200 shadow-sm">
                          {CATEGORY_LABELS[featured.category] ?? featured.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-2">
                      {caseStudyBadgeLabel ?? 'Case Study'}
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                      {featured.title}
                    </h2>
                    {featured.client && (
                      <p className="text-sm text-slate-400 mt-1">{clientLabelPrefix ?? 'Client:'} <span className="font-semibold text-slate-600">{featured.client}</span></p>
                    )}
                    {featured.excerpt && (
                      <p className="mt-4 text-slate-500 text-sm leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    )}

                    {/* Results metrics */}
                    {featured.results && featured.results.length > 0 && (
                      <div className="mt-6 grid grid-cols-3 gap-4 py-5 border-t border-slate-100">
                        {featured.results.slice(0, 3).map((r, i) => (
                          <div key={i} className="text-center">
                            <p className="text-xl font-black text-brand-600">{r.metric}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{r.label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:gap-3 transition-all">
                      {readCaseStudyLabel ?? 'Read Case Study'} <ArrowRight className="h-4 w-4 shrink-0" />
                    </div>
                  </div>
                </Link>
              )}

              {/* ── Grid of remaining ── */}
              {rest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <Link
                      key={p.id}
                      href={`/case-studies/${p.slug}`}
                      className="group flex flex-col rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 bg-white"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-52 bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden shrink-0">
                        {p.coverImage?.url ? (
                          <Image
                            src={p.coverImage.url}
                            alt={p.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-4xl font-black text-brand-200">
                            {p.title.charAt(0)}
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wide">
                            {caseStudyBadgeLabel ?? 'Case Study'}
                          </span>
                        </div>
                        {p.category && (
                          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 text-[10px] font-semibold border border-slate-200">
                            {CATEGORY_LABELS[p.category] ?? p.category}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                        {p.client && (
                          <p className="text-xs text-slate-400 mt-1">{clientLabelPrefix ?? 'Client:'} <span className="font-semibold text-slate-500">{p.client}</span></p>
                        )}
                        {p.excerpt && (
                          <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">{p.excerpt}</p>
                        )}

                        {/* Results */}
                        {p.results && p.results.length > 0 && (
                          <div className="mt-4 flex gap-4 pt-4 border-t border-slate-100">
                            {p.results.slice(0, 2).map((r, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                                <span className="text-sm font-black text-brand-600">{r.metric}</span>
                                <span className="text-[11px] text-slate-400 leading-tight">{r.label}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                          {readCaseStudyLabel ?? 'Read Case Study'} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
