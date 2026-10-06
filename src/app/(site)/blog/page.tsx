import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ArrowRight, Calendar, Clock, ChevronRight, FileText, Users, Layers, Newspaper, TrendingUp } from 'lucide-react'
import { getPayload, getExactCount } from '@/lib/payload'
import { getPage, field } from '@/lib/settings'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('blog')
  const title = field(p, 'seoTitle') || 'Intertoons Official Blog - Intertoons Internet Services Pvt.Ltd.'
  const description =
    field(p, 'seoDescription') ||
    'Read Updates from Intertoons, Leading ECommerce & Software development team kochi since 2007. Offices in India, Malaysia'
  return {
    // Matches the WordPress site's <title> tag exactly — bypasses the
    // site-wide " | Intertoons" template, which WP's own title doesn't use here.
    title: { absolute: title },
    description,
    alternates: { canonical: '/blog' },
    openGraph: { title, description },
  }
}

function fmtDate(d?: string) {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const POSTS_PER_PAGE = 24

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ cat?: string; page?: string }> }) {
  const { cat, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const payload = await getPayload()

  const catsRes = await payload.find({ collection: 'blog-categories', limit: 50, depth: 0 })
  const categories = catsRes.docs as any[]
  // When filtered by a category, the hero shows that category's title/description (from the CMS).
  const activeCat = cat ? categories.find((c) => c.slug === cat) : null

  // Filter server-side (by category reference id) so pagination totals stay
  // correct for the filtered set, not just whatever lands on the current page.
  const baseWhere: Record<string, { equals?: unknown; contains?: unknown }> = { status: { equals: 'published' } }
  if (activeCat) baseWhere.categories = { contains: activeCat.id }

  const [postsRes, pg, exactCount] = await Promise.all([
    payload.find({ collection: 'blogs', where: baseWhere, sort: '-publishDate', limit: POSTS_PER_PAGE, depth: 1, page }),
    getPage('blog'),
    getExactCount('blogs', baseWhere),
  ])
  const posts = postsRes.docs as any[]
  const totalPages = typeof exactCount === 'number' ? Math.max(1, Math.ceil(exactCount / POSTS_PER_PAGE)) : null
  // Prefer the exact-count-derived total when available — the SDK's own
  // `hasNext()` can't tell "exactly a full last page" from "more exists"
  // without an extra fetch, so it optimistically returns true right on the
  // last page whenever the total happens to be an exact multiple of the page
  // size (confirmed live: it kept advertising a page 26 that had 0 posts).
  const hasNextPage = totalPages !== null ? page < totalPages : postsRes.hasNextPage
  const heroBadge = activeCat ? 'Category' : field(pg, 'heroBadge')
  const heroTitle = activeCat ? activeCat.title : field(pg, 'heroTitle')
  const heroHighlight = activeCat ? '' : field(pg, 'heroTitleHighlight')
  const heroSubtitle = activeCat
    ? (activeCat.description || `Articles and guides in ${activeCat.title}.`)
    : field(pg, 'heroSubtitle')

  return (
    <div>
      {/* Hero (light theme, matches the services/service-detail hero redesign) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
        {/* Full-bleed desk photo behind the whole hero, not just a small
            illustration under the text — covers the section edge-to-edge. */}
        <div className="absolute inset-0 w-full pointer-events-none hidden md:block">
          <Image src="/images/blog-hero.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="container relative z-10 text-center max-w-3xl">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold">
            <FileText className="h-4 w-4" />
            {heroBadge}
          </span>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-slate-900 leading-tight">
            {heroTitle}{' '}
            {heroHighlight && <span className="bg-clip-text text-transparent animate-gradient-text">{heroHighlight}</span>}
          </h1>
          <p className="mt-6 text-base font-inter text-slate-500 leading-relaxed max-w-2xl mx-auto">{heroSubtitle}</p>
          {!activeCat && (
            <div className="mt-8 flex items-center gap-3 justify-center">
              <Link
                href={field(pg, 'heroPrimaryCtaLink')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 hover:opacity-90 text-white font-semibold text-base transition-opacity"
              >
                {field(pg, 'heroPrimaryCtaLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href={field(pg, 'heroSecondaryCtaLink')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-medium text-base transition-colors"
              >
                {field(pg, 'heroSecondaryCtaLabel')}
              </Link>
            </div>
          )}
        </div>

        {/* Two floating "article preview" cards echoing the mockup supplied
            for this redesign, positioned against the full-bleed photo rather
            than the (narrower, centered) text column above. */}
        <div className="hero-float-icon absolute left-[4%] top-[16%] [animation-delay:0s] z-10 hidden lg:flex w-48 rounded-2xl bg-white shadow-xl border border-slate-100 p-3 items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
            <Newspaper className="h-4 w-4 text-violet-600" />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold text-slate-900 truncate">Latest Articles</p>
            <p className="text-[11px] text-slate-400 truncate">Fresh this week</p>
          </div>
          <span className="absolute -bottom-2.5 -right-2.5 h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center shadow-md shrink-0">
            <ArrowRight className="h-3.5 w-3.5 text-white" />
          </span>
        </div>

        <div className="hero-float-icon absolute right-[4%] top-[22%] [animation-delay:0.7s] z-10 hidden lg:flex w-48 rounded-2xl bg-white shadow-xl border border-slate-100 p-3 items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold text-slate-900 truncate">Trending Now</p>
            <p className="text-[11px] text-slate-400 truncate">Most read posts</p>
          </div>
          <span className="absolute -bottom-2.5 -right-2.5 h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center shadow-md shrink-0">
            <ArrowRight className="h-3.5 w-3.5 text-white" />
          </span>
        </div>

        {/* Stats row inside hero */}
        {!activeCat && (
          <div className="container relative z-10 mt-10 hidden sm:block">
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg shadow-slate-200/50 px-6 py-5 max-w-2xl mx-auto">
              {[
                <FileText className="h-5 w-5 text-brand-600 mx-auto" key="filetext" />,
                <Users className="h-5 w-5 text-brand-600 mx-auto" key="users" />,
                <Layers className="h-5 w-5 text-brand-600 mx-auto" key="layers" />,
              ].map((icon, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                  {icon}
                  <p className="text-xl font-black text-slate-900">
                    {field(pg, `stat${i + 1}Value`)}
                  </p>
                  <p className="text-sm text-slate-500">{field(pg, `stat${i + 1}Label`)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="container max-w-6xl">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link href="/blog" className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${!cat ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>All Posts</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/blog?cat=${c.slug}`} className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${cat === c.slug ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>{c.title}</Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-slate-500 py-16">No posts found{cat ? ' in this category' : ''}.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => {
                const category = (p.categories || [])[0]
                const author = p.author || (p.authors || [])[0]
                const categoryLabel = category ? (typeof category === 'object' ? category.title : category) : null
                const hasImage = !!p.featuredImage?.url
                const meta = (
                  <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
                    {author?.name && <span className="font-semibold text-slate-600">{author.name}</span>}
                    {p.publishDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(p.publishDate)}</span>}
                    {p.readingTime ? <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.readingTime} min</span> : null}
                  </div>
                )
                return (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="group rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    {hasImage ? (
                      <>
                        <div className="relative h-48 overflow-hidden">
                          <Image src={p.featuredImage.url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          {categoryLabel && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-brand-600 text-xs font-semibold uppercase tracking-wide">{categoryLabel}</span>}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h2 className="font-bold text-slate-900 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">{p.title}</h2>
                          <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-3 flex-1">{p.excerpt}</p>
                          {meta}
                        </div>
                      </>
                    ) : (
                      // No featuredImage — rather than a placeholder graphic sitting
                      // above a cramped, clamped excerpt, let the title and
                      // description fill the whole card (same as the space an
                      // image + text card takes together) on a soft gradient tile.
                      <div className="relative flex flex-col flex-1 p-6 bg-gradient-to-br from-violet-50 via-white to-blue-50">
                        {categoryLabel && <span className="inline-block self-start mb-3 px-2.5 py-1 rounded-full bg-white/90 text-brand-600 text-xs font-semibold uppercase tracking-wide">{categoryLabel}</span>}
                        <h2 className="font-bold text-slate-900 text-xl leading-snug mb-3 line-clamp-3 group-hover:text-brand-600 transition-colors">{p.title}</h2>
                        <p className="text-slate-500 text-[15px] leading-relaxed line-clamp-6 flex-1">{p.excerpt}</p>
                        {meta}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination. `totalPages` comes from a direct REST count call
              (bypassing the @wix/data SDK, which stops returning an exact
              total once a collection is large) — when it's available we show
              the full numbered pager so any page is jumpable. If that count
              call ever fails, fall back to a windowed pager built only from
              what's actually confirmed (pages visited, plus one ahead when
              `hasNextPage` says it's really there). */}
          {(page > 1 || hasNextPage) && (() => {
            const pageHref = (p: number) => `/blog?${new URLSearchParams({ ...(cat ? { cat } : {}), page: String(p) }).toString()}`
            const numberBtn = (p: number) =>
              p === page ? (
                <span key={p} className="h-9 min-w-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold border bg-brand-600 text-white border-brand-600">
                  {p}
                </span>
              ) : (
                <Link key={p} href={pageHref(p)} className="h-9 min-w-9 px-2 flex items-center justify-center rounded-lg text-sm font-semibold border bg-white text-slate-600 border-slate-200 hover:border-brand-300 transition-colors">
                  {p}
                </Link>
              )
            const ellipsis = (key: string) => <span key={key} className="px-1 text-slate-300">…</span>

            let middle: ReactNode[]
            if (totalPages) {
              const windowStart = Math.max(2, page - 1)
              const windowEnd = Math.min(totalPages - 1, page + 1)
              middle = [numberBtn(1)]
              if (windowStart > 2) middle.push(ellipsis('l'))
              for (let p = windowStart; p <= windowEnd; p++) if (p > 1 && p < totalPages) middle.push(numberBtn(p))
              if (windowEnd < totalPages - 1) middle.push(ellipsis('r'))
              if (totalPages > 1) middle.push(numberBtn(totalPages))
            } else {
              const windowStart = Math.max(1, page - 2)
              const numbers: number[] = []
              for (let p = windowStart; p <= page; p++) numbers.push(p)
              if (hasNextPage) numbers.push(page + 1)
              middle = []
              if (windowStart > 1) { middle.push(numberBtn(1)); middle.push(ellipsis('l')) }
              middle.push(...numbers.map(numberBtn))
              if (numbers[numbers.length - 1] > page && hasNextPage) middle.push(ellipsis('r'))
            }

            return (
              <nav className="flex items-center justify-center gap-2 mt-12 flex-wrap" aria-label="Blog pagination">
                {page > 1 ? (
                  <Link href={pageHref(page - 1)} className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-slate-600 border-slate-200 hover:border-brand-300 transition-colors">
                    ← Prev
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg text-sm font-semibold border bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed">← Prev</span>
                )}

                {middle}

                {hasNextPage ? (
                  <Link href={pageHref(page + 1)} className="px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-slate-600 border-slate-200 hover:border-brand-300 transition-colors">
                    Next →
                  </Link>
                ) : (
                  <span className="px-4 py-2 rounded-lg text-sm font-semibold border bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed">Next →</span>
                )}
              </nav>
            )
          })()}
        </div>
      </section>

      <section className="bg-brand-600 py-12">
        <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <h2 className="text-[38px] font-extrabold text-white">{field(pg, 'ctaBannerTitle')}</h2>
          <Link href={field(pg, 'ctaBannerButtonLink')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-600 transition-colors">
            {field(pg, 'ctaBannerButtonLabel')} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
