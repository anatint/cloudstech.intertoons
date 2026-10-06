'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 12

const CATEGORY_LABELS: Record<string, string> = {
  all:               'All Projects',
  ecommerce:         'E-commerce',
  'mobile-app':      'Mobile Apps',
  'web-development': 'Web Dev',
  travel:            'Travel',
  'food-delivery':   'Food Delivery',
  'real-estate':     'Real Estate',
  healthcare:        'Healthcare',
  other:             'Other',
}

interface Project {
  id: string
  slug: string
  title: string
  client?: string
  category?: string
  excerpt?: string
  platform?: string
  caseStudies?: { docs?: Array<{ slug: string } | string> } | null
  coverImage?: { url: string } | null
  thumbnailImage?: { url: string } | null
  results?: Array<{ metric: string; label: string }>
}

export default function PortfolioGrid({
  projects, noProjectsMessage, featuredBadgeLabel, clientLabelPrefix, viewProjectLabel,
}: {
  projects: Project[]
  noProjectsMessage?: string
  featuredBadgeLabel?: string
  clientLabelPrefix?: string
  viewProjectLabel?: string
}) {
  const categories = [
    'all',
    ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean) as string[])),
  ]

  const [active, setActive] = useState('all')
  const [page, setPage] = useState(1)
  const filtered = active === 'all' ? projects : projects.filter((p) => p.category === active)
  // The featured hero card is a one-time showcase for page 1 only — excluded
  // from the paginated grid entirely so it isn't shown twice.
  const featured = page === 1 ? (filtered[0] ?? null) : null
  const rest = filtered.slice(1)
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE))
  const pageStart = (page - 1) * PAGE_SIZE
  const pagedRest = rest.slice(pageStart, pageStart + PAGE_SIZE)

  const changeCategory = (cat: string) => {
    setActive(cat)
    setPage(1)
  }
  const goToPage = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Every card now always opens the project's own portfolio detail page —
  // this used to branch to a `/case-studies/<slug>` page when one existed,
  // but that whole section/feature has been retired site-wide.
  const hrefFor = (p: Project) => `/works/${p.slug}`

  return (
    <div>
      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[100px] z-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl py-3 flex items-center gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => changeCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active === cat
                    ? 'bg-gradient-to-r from-violet-600 to-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
          <span className="shrink-0 text-xs text-slate-400 font-medium hidden sm:block">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Projects grid ── */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container max-w-6xl">
          {filtered.length === 0 ? (
            <p className="text-center py-24 text-slate-500">{noProjectsMessage ?? 'No projects found in this category.'}</p>
          ) : (
            <>
              {/* ── Featured card (first result) ── */}
              {featured && (() => {
                const imgUrl = featured.coverImage?.url ?? featured.thumbnailImage?.url ?? '/images/portfolio-default.png'
                const href = hrefFor(featured)
                return (
                  <Link
                    href={href}
                    className="group mb-10 grid lg:grid-cols-[1.4fr_1fr] gap-0 rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:border-brand-200 transition-all duration-300 bg-white flex"
                  >
                    <div className="relative h-64 lg:h-auto bg-gradient-to-br from-blue-50 to-slate-100 min-h-[280px]">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={featured.title || ''}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-6xl font-black text-brand-200">
                          {(featured.title || '?').charAt(0)}
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-brand-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {featuredBadgeLabel ?? 'Featured'}
                        </span>
                        {featured.category && (
                          <span className="px-3 py-1 rounded-full bg-white/90 text-slate-700 text-[10px] font-semibold border border-slate-200 shadow-sm">
                            {CATEGORY_LABELS[featured.category] ?? featured.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
                        {featured.title || 'Untitled Project'}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        {featured.client && (
                          <p className="text-sm text-slate-400">{clientLabelPrefix ?? 'Client:'} <span className="font-semibold text-slate-600">{featured.client}</span></p>
                        )}
                        {featured.platform && (
                          <>
                            {featured.client && <span className="text-slate-200 text-sm">·</span>}
                            <p className="text-sm text-slate-400">{featured.platform}</p>
                          </>
                        )}
                      </div>
                      {featured.excerpt && (
                        <p className="mt-4 text-slate-500 text-[15px] leading-relaxed line-clamp-3">{featured.excerpt}</p>
                      )}

                      {/* Results metrics */}
                      {featured.results && featured.results.length > 0 && (
                        <div className="mt-6 grid grid-cols-3 gap-4 py-5 border-t border-slate-100">
                          {featured.results.slice(0, 3).map((r, i) => (
                            <div key={i} className="text-center">
                              <p className="text-xl font-black text-violet-600">{r.metric}</p>
                              <p className="text-[15px] text-slate-500 mt-0.5 leading-tight">{r.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 group-hover:gap-3 transition-all">
                        {viewProjectLabel ?? 'View Project'} <ArrowRight className="h-4 w-4 shrink-0" />
                      </div>
                    </div>
                  </Link>
                )
              })()}

              {/* ── Grid of remaining ── */}
              {pagedRest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedRest.map((p) => {
                    const imgUrl = p.coverImage?.url ?? p.thumbnailImage?.url ?? '/images/portfolio-default.png'
                    const href = hrefFor(p)

                    return (
                      <Link
                        key={p.id}
                        href={href}
                        className="group flex flex-col rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 bg-white"
                      >
                        {/* Image area */}
                        <div className="relative h-52 bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden shrink-0">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={p.title || ''}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center text-4xl font-black text-brand-200">
                              {(p.title || '?').charAt(0)}
                            </div>
                          )}

                          {/* Browser chrome top bar */}
                          <div className="absolute inset-x-0 top-0 h-6 bg-white/90 backdrop-blur-sm flex items-center gap-1 px-2.5">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            <div className="h-2 w-2 rounded-full bg-yellow-400" />
                            <div className="h-2 w-2 rounded-full bg-green-400" />
                          </div>

                          {/* Badges */}
                          <div className="absolute bottom-3 left-3 flex gap-1.5">
                            {p.category && (
                              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 text-[10px] font-semibold border border-slate-200 shadow-sm">
                                {CATEGORY_LABELS[p.category] ?? p.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Text body */}
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-violet-600 transition-colors">
                            {p.title || 'Untitled Project'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {p.client && (
                              <p className="text-xs text-slate-400">{p.client}</p>
                            )}
                            {p.platform && (
                              <>
                                {p.client && <span className="text-slate-200 text-xs">·</span>}
                                <p className="text-xs text-slate-400">{p.platform}</p>
                              </>
                            )}
                          </div>
                          {p.excerpt && (
                            <p className="mt-2 text-[15px] text-slate-500 line-clamp-2 leading-relaxed flex-1">
                              {p.excerpt}
                            </p>
                          )}

                          {/* Results */}
                          {p.results && p.results.length > 0 && (
                            <div className="mt-4 flex gap-4 pt-4 border-t border-slate-100">
                              {p.results.slice(0, 2).map((r, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <TrendingUp className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                                  <span className="text-sm font-black text-violet-600">{r.metric}</span>
                                  <span className="text-[15px] text-slate-400 leading-tight">{r.label}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-violet-600 group-hover:gap-2 transition-all">
                            {viewProjectLabel ?? 'View Project'}
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* ── Pagination ── */}
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
                          ? 'bg-gradient-to-r from-violet-600 to-brand-600 text-white shadow-sm'
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
            </>
          )}
        </div>
      </section>
    </div>
  )
}
