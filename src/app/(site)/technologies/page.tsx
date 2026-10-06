import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ArrowRight, Code2, Layers, Zap } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { getPage, field } from '@/lib/settings'
import { lucideIcon } from '@/lib/icons'

export const revalidate = 0

/* ── Category label + accent colour lookup ──────────────────── */
const CATEGORY_LABELS: Record<string, string> = {
  mobile:    'Mobile',
  framework: 'Frameworks',
  language:  'Languages',
  database:  'Databases',
  cloud:     'Cloud & Hosting',
  'ai-ml':   'AI & ML',
  other:     'Integrations & Tools',
}

const CATEGORY_ACCENT: Record<string, string> = {
  mobile:    'bg-sky-50 group-hover:bg-sky-100',
  framework: 'bg-indigo-50 group-hover:bg-indigo-100',
  language:  'bg-amber-50 group-hover:bg-amber-100',
  database:  'bg-emerald-50 group-hover:bg-emerald-100',
  cloud:     'bg-orange-50 group-hover:bg-orange-100',
  'ai-ml':   'bg-violet-50 group-hover:bg-violet-100',
  other:     'bg-slate-100 group-hover:bg-slate-200',
}

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('technologies')
  return {
    title: field(p, 'seoTitle', 'Technologies We Use'),
    description: field(p, 'seoDescription', 'Explore the technologies, frameworks and platforms Intertoons builds with.'),
    alternates: { canonical: '/technologies' },
  }
}

export default async function TechnologiesPage() {
  const payload = await getPayload()
  const pg = await getPage('technologies')
  const { docs: techs } = await payload.find({
    collection: 'technologies',
    where: { status: { equals: 'published' } },
    sort: 'order',
    limit: 200,
  })

  // group by category
  const groups = new Map<string, any[]>()
  for (const t of techs as any[]) {
    const cat = (t.category || 'Other').trim()
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(t)
  }

  return (
    <div>
      <section className="bg-[#050B2A] relative overflow-hidden pt-28 pb-14 sm:pt-32 lg:pt-40 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-b from-brand-600/25 to-transparent" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle,#3B73F6 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="container relative z-10 text-center max-w-3xl">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-brand-600/20 text-brand-400 text-xs font-bold uppercase tracking-widest border border-brand-500/30">
            {field(pg, 'heroBadge', 'Our Tech Stack')}
          </span>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-white leading-tight">
            {field(pg, 'heroTitle', 'Technologies We')}{' '}
            <span className="text-brand-400">{field(pg, 'heroTitleHighlight', 'Work With')}</span>
          </h1>
          <p className="mt-6 text-base font-inter text-blue-200 leading-relaxed max-w-2xl mx-auto">
            {field(pg, 'heroSubtitle', 'The frameworks, platforms and tools we use to build fast, reliable products.')}
          </p>
          <div className="mt-8 flex items-center gap-3 justify-center">
            <Link
              href={field(pg, 'heroPrimaryCtaLink')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-colors"
            >
              {field(pg, 'heroPrimaryCtaLabel')} <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href={field(pg, 'heroSecondaryCtaLink')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white font-medium text-base transition-colors"
            >
              {field(pg, 'heroSecondaryCtaLabel')}
            </Link>
          </div>
        </div>

        {/* Stats row inside hero */}
        <div className="container relative z-10 mt-16 hidden sm:block">
          <div className="grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            {[
              <Code2 className="h-5 w-5 text-brand-400" key="code" />,
              <Layers className="h-5 w-5 text-brand-400" key="layers" />,
              <Zap className="h-5 w-5 text-brand-400" key="zap" />,
            ].map((icon, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm px-6 py-5 flex flex-col items-center gap-1.5 text-center">
                {icon}
                <p className="text-2xl font-black text-white">{field(pg, `stat${i + 1}Value`)}</p>
                <p className="text-xs text-slate-400">{field(pg, `stat${i + 1}Label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-white">
        <div className="container max-w-6xl space-y-14">
          {[...groups.entries()].map(([cat, list]) => (
            <div key={cat}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 shrink-0">
                  {CATEGORY_LABELS[cat] ?? cat}
                </h2>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.map((t: any) => {
                  const Icon = lucideIcon(t.icon2)
                  const accent = CATEGORY_ACCENT[cat] ?? CATEGORY_ACCENT.other
                  return (
                    <Link key={t.slug || t.id} href={`/technologies/${t.slug}`}
                      className="group flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-300">
                      <span className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-colors ${accent}`}>
                        {t.logo?.url
                          ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.logo.url} alt={t.name} className="h-6 w-6 object-contain" />
                          : <Icon className="h-5 w-5 text-brand-600" />}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors leading-tight">{t.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
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
