import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronRight, ArrowRight,
  Zap, Shield, Users, Globe, Smartphone, BarChart3,
  CheckCircle2, Star, Package, Clock, Layers,
} from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { field, getContactHref, withQuoteAnchor, withContactAnchor } from '@/lib/settings'
import { productTheme } from '@/lib/productThemes'
import { lucideIcon } from '@/lib/icons'
import type { Product, Technology } from '@/payload-types'

export const revalidate = 0

// Products page copy lives in its own dedicated collection (`ProductsPage`),
// separate from the shared `SitePages` collection used by other listing pages.
async function getProductsPage() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'products-page-settings', limit: 1 })
    return docs[0] ?? {}
  } catch {
    return {}
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProductsPage()
  return {
    title: field(p, 'seoTitle') || undefined,
    description: field(p, 'seoDescription') || undefined,
  }
}

const WHY_CHOOSE_ICONS = [
  <Zap className="h-6 w-6 text-brand-600" key="zap" />,
  <Shield className="h-6 w-6 text-brand-600" key="shield" />,
  <Globe className="h-6 w-6 text-brand-600" key="globe" />,
  <Users className="h-6 w-6 text-brand-600" key="users" />,
  <Smartphone className="h-6 w-6 text-brand-600" key="smartphone" />,
  <BarChart3 className="h-6 w-6 text-brand-600" key="barchart" />,
]

function techNames(product: Product): string[] {
  return (product.techStack || [])
    .map((t: any) => {
      const tech = t.technology as Technology | string
      return typeof tech === 'object' && tech ? tech.name : ''
    })
    .filter(Boolean)
}

export default async function ProductsPage() {
  const payload = await getPayload()
  const [pg, contactHref] = await Promise.all([getProductsPage(), getContactHref()])
  const { docs: products } = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    depth: 1,
    limit: 50,
    sort: 'order',
  })

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-28 pb-14 sm:pt-32 lg:pt-40 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/product-hero-background.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container max-w-6xl relative z-10 text-center">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 text-brand-600 text-xs font-bold uppercase tracking-widest border border-blue-100">
            {field(pg, 'heroBadge')}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[70px] font-black text-slate-900 leading-tight">
            {field(pg, 'heroTitle')}<br />
            <span className="text-brand-600">{field(pg, 'heroTitleHighlight')}</span>
          </h1>
          <p className="mt-6 text-base font-inter text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {field(pg, 'heroSubtitle')}
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center">
            <Link
              href={withContactAnchor(withQuoteAnchor(field(pg, 'heroPrimaryCtaLink')), contactHref)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-colors"
            >
              {field(pg, 'heroPrimaryCtaLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href={withContactAnchor(withQuoteAnchor(field(pg, 'heroSecondaryCtaLink')), contactHref)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-medium text-base transition-colors"
            >
              {field(pg, 'heroSecondaryCtaLabel')}
            </Link>
          </div>

          {/* Product pill nav */}
          <div className="mt-12 hidden sm:flex flex-wrap gap-3 justify-center">
            {products.map((p: any) => {
              const theme = productTheme(p.colorTheme)
              const Icon = lucideIcon(p.icon)
              return (
                <Link
                  key={p.slug}
                  href={`#${p.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-700 text-xs font-semibold transition-colors"
                >
                  <span className={`h-5 w-5 rounded-full ${theme.iconBg} flex items-center justify-center text-white shrink-0`}>
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  {p.name}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRODUCT CARDS ─────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-24">
        <div className="container max-w-6xl space-y-14">

          {products.map((p: any, idx: number) => {
            const theme = productTheme(p.colorTheme)
            const Icon = lucideIcon(p.icon)
            const highlights = (p.highlights || []).filter(Boolean)
            const tech = techNames(p)
            return (
              <div
                key={p.slug}
                id={p.slug ?? undefined}
                className={`group grid gap-0 lg:grid-cols-[1fr_1.1fr] rounded-3xl overflow-hidden border ${theme.borderColor} shadow-sm hover:shadow-2xl transition-all duration-300 ${idx % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}
              >
                {/* ── Left: visual panel ── */}
                <div className={`${theme.bgLight} px-8 lg:px-10 py-10 flex flex-col justify-between [direction:ltr]`}>
                  <div>
                    {/* Icon + badge row */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className={`h-16 w-16 rounded-2xl ${theme.iconBg} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      {p.badge && (
                        <span className={`px-3 py-1.5 rounded-full bg-white text-xs font-semibold ${theme.textColor} border ${theme.borderColor}`}>
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-3xl font-black text-slate-900">{p.name}</h3>
                    {p.tagline && <p className={`text-base font-semibold ${theme.textColor} mt-1`}>{p.tagline}</p>}
                    {(p.shortDescription || p.description) && (
                      <p className="mt-4 text-slate-600 text-[15px] leading-relaxed">{p.shortDescription || p.description}</p>
                    )}
                  </div>

                  {/* Stats row */}
                  {p.stats && p.stats.length > 0 && (
                    <div className="mt-8 grid grid-cols-3 gap-3">
                      {p.stats.map((s: any) => (
                        <div key={s.id || s.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                          <p className="text-xl font-black text-slate-900">{s.value}</p>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Right: features + CTA ── */}
                <div className="bg-white px-8 lg:px-10 py-10 flex flex-col justify-between [direction:ltr]">
                  <div>
                    {highlights.length > 0 && (
                      <>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Key Features</p>
                        <ul className="space-y-3">
                          {highlights.map((h: any) => (
                            <li key={h} className="flex items-start gap-3 text-[15px] text-slate-700">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Tech stack */}
                    {tech.length > 0 && (
                      <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                          {tech.map((t: any) => (
                            <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-8 flex items-center gap-3">
                    <Link
                      href={`/products/${p.slug}`}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${theme.gradient} text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm`}
                    >
                      {field(pg, 'productsExploreLabel')} {p.name}
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </Link>
                    {p.website && (
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        {field(pg, 'productsLiveSiteLabel')}
                      </a>
                    )}
                    <Link
                      href="/request-a-quote#quote-form"
                      className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      {field(pg, 'productsGetDemoLabel')}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}

        </div>
      </section>

      {/* ── COMPARISON STRIP ─────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-[38px] font-extrabold text-slate-900">
              {field(pg, 'comparisonTitle')}
            </h2>
            <p className="mt-2 text-slate-500 text-base">{field(pg, 'comparisonSubtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p: any) => {
              const theme = productTheme(p.colorTheme)
              const Icon = lucideIcon(p.icon)
              return (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className={`group rounded-2xl border ${theme.borderColor} bg-white p-6 hover:shadow-lg transition-all duration-200`}
                >
                  <div className={`h-12 w-12 rounded-xl ${theme.iconBg} flex items-center justify-center text-white mb-4 shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {p.badge && <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textColor} mb-1`}>{p.badge}</p>}
                  <h3 className="font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">{p.name}</h3>
                  {p.tagline && <p className="text-[15px] text-slate-500 mt-1 line-clamp-2">{p.tagline}</p>}
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
                    {field(pg, 'comparisonLearnMoreLabel')} <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ────────────────────────────────────── */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="container max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-3">{field(pg, 'whyEyebrow')}</p>
            <h2 className="text-[38px] font-extrabold text-slate-900">{field(pg, 'whyTitle')}</h2>
            <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">
              {field(pg, 'whySubtitle')}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE_ICONS.map((icon, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-brand-200 transition-all">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-base">{field(pg, `whyPoint${i + 1}Title`)}</h3>
                <p className="text-[15px] text-slate-500 leading-relaxed">{field(pg, `whyPoint${i + 1}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST + TIMELINE ──────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-3">{field(pg, 'timelineEyebrow')}</p>
              <h2 className="text-[38px] font-extrabold text-slate-900 leading-tight">
                {field(pg, 'timelineTitle')} <span className="text-brand-600">{field(pg, 'timelineTitleHighlight')}</span>
              </h2>
              <p className="mt-4 text-slate-500 text-base leading-relaxed">
                {field(pg, 'timelineParagraph')}
              </p>
              <div className="mt-8 space-y-4">
                {['01', '02', '03'].map((n, i) => (
                  <div key={n} className="flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {n}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">{field(pg, `timelineStep${i + 1}Title`)}</p>
                      <p className="text-[15px] text-slate-500 mt-0.5 leading-relaxed">{field(pg, `timelineStep${i + 1}Desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Package className="h-5 w-5 text-brand-600" />, value: `${products.length}`, labelKey: 'timelineStat1Label', subKey: 'timelineStat1Sub' },
                { icon: <Users className="h-5 w-5 text-brand-600" />,   valueKey: 'timelineStat2Value', labelKey: 'timelineStat2Label', subKey: 'timelineStat2Sub' },
                { icon: <Clock className="h-5 w-5 text-brand-600" />,   valueKey: 'timelineStat3Value', labelKey: 'timelineStat3Label', subKey: 'timelineStat3Sub' },
                { icon: <Layers className="h-5 w-5 text-brand-600" />,  valueKey: 'timelineStat4Value', labelKey: 'timelineStat4Label', subKey: 'timelineStat4Sub' },
              ].map((s: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 text-center">
                  <div className="flex justify-center mb-2">{s.icon}</div>
                  <p className="text-2xl font-black text-brand-600">{s.value ?? field(pg, s.valueKey)}</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{field(pg, s.labelKey)}</p>
                  <p className="text-[15px] text-slate-400 mt-0.5">{field(pg, s.subKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="bg-brand-600 py-14">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-[38px] font-extrabold text-white leading-tight">{field(pg, 'ctaBannerTitle')}</h2>
                <p className="text-blue-100 text-base mt-0.5">
                  {field(pg, 'ctaBannerSubtitle')}
                </p>
              </div>
            </div>
            <Link
              href={withContactAnchor(withQuoteAnchor(field(pg, 'ctaBannerButtonLink', '/request-a-quote')), contactHref)}
              className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              {field(pg, 'ctaBannerButtonLabel')}
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
