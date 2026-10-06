import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: 'E-commerce',
  'mobile-app': 'Mobile Apps',
  'web-development': 'Web Dev',
  travel: 'Travel',
  'food-delivery': 'Food Delivery',
  'real-estate': 'Real Estate',
  healthcare: 'Healthcare',
  ai: 'AI',
  other: 'Other',
}

type CaseStudy = {
  id: string
  slug: string
  title: string
  client?: string
  category?: string
  excerpt?: string
  coverImage?: { url: string } | null
  results?: Array<{ metric: string; label: string }>
}

interface CaseStudiesRendererProps {
  eyebrow?: string
  heading?: string
  caseStudies: CaseStudy[]
  showViewAll?: boolean
  viewAllLabel?: string
  layout?: string
}

export function CaseStudiesRenderer({ eyebrow, heading, caseStudies, showViewAll, viewAllLabel, layout }: CaseStudiesRendererProps) {
  if (!caseStudies?.length) return null
  const cols = layout === 'grid-4' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl">
        {(eyebrow || heading) && (
          <div className="text-center mb-12">
            {eyebrow && <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">{eyebrow}</p>}
            {heading && <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>}
          </div>
        )}
        <div className={`grid gap-6 sm:grid-cols-2 ${cols}`}>
          {caseStudies.map((c) => (
            <Link
              key={c.id}
              href={`/case-studies/${c.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 bg-white"
            >
              <div className="relative h-52 bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden shrink-0">
                {c.coverImage?.url ? (
                  <Image
                    src={c.coverImage.url}
                    alt={c.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-4xl font-black text-brand-200">
                    {c.title.charAt(0)}
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wide">
                    Case Study
                  </span>
                </div>
                {c.category && (
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 text-[10px] font-semibold border border-slate-200">
                    {CATEGORY_LABELS[c.category] ?? c.category}
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                  {c.title}
                </h3>
                {c.client && (
                  <p className="text-xs text-slate-400 mt-1">Client: <span className="font-semibold text-slate-500">{c.client}</span></p>
                )}
                {c.excerpt && (
                  <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">{c.excerpt}</p>
                )}
                {c.results && c.results.length > 0 && (
                  <div className="mt-4 flex gap-4 pt-4 border-t border-slate-100">
                    {c.results.slice(0, 2).map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                        <span className="text-sm font-black text-brand-600">{r.metric}</span>
                        <span className="text-[11px] text-slate-400 leading-tight">{r.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                  Read Case Study <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {showViewAll && (
          <div className="mt-10 text-center">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              {viewAllLabel || 'View All Case Studies'} <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
