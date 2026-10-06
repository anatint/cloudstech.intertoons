import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2, ArrowRight, ChevronRight, ExternalLink,
  Quote, Rocket, Layers,
} from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { productTheme } from '@/lib/productThemes'
import { lucideIcon } from '@/lib/icons'
import type { Product, Technology, Testimonial } from '@/payload-types'

export const revalidate = 0

export async function generateStaticParams() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'products', where: { status: { equals: 'published' } }, limit: 100 })
    return (docs as any[]).map((d) => ({ slug: d.slug })).filter((p) => p.slug)
  } catch { return [] }
}

const TECH_CATEGORY_LABELS: Record<string, string> = {
  language: 'Language',
  framework: 'Framework',
  database: 'Database',
  cloud: 'Cloud',
  'ai-ml': 'AI / ML',
  'ecommerce-platform': 'E-commerce',
  mobile: 'Mobile',
  'design-tool': 'Design',
  devops: 'DevOps',
  other: 'Tech',
}

async function getProduct(slug: string): Promise<Product | null> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 2,
    limit: 1,
  })
  return (docs[0] as Product) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }
  const seo = product.seo
  return {
    title: seo?.metaTitle || `${product.name} — ${product.tagline ?? 'White-Label Platform'}`,
    description: seo?.metaDescription || product.shortDescription || product.description || undefined,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const theme = productTheme(product.colorTheme)
  const Icon = lucideIcon(product.icon)
  const stats = product.stats || []
  const features = product.features || []
  const steps = product.steps || []
  const pricing = product.pricing || []
  const techStack = product.techStack || []
  const testimonial = (product.testimonial && typeof product.testimonial === 'object'
    ? product.testimonial
    : null) as Testimonial | null

  return (
    <div>

      {/* ── Hero ── */}
      <section className={`bg-gradient-to-br ${theme.heroGradient} pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-28 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="container max-w-6xl relative z-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-10">
            <Link href="/" className="hover:text-white/90 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/products" className="hover:text-white/90 transition-colors">Products</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/90">{product.name}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1fr_auto] items-start">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                {product.badge && (
                  <span className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                {product.name}
              </h1>
              {product.tagline && <p className="mt-3 text-xl text-white/70 font-medium">{product.tagline}</p>}
              {product.description && (
                <p className="mt-5 text-white/60 text-base font-inter leading-relaxed max-w-2xl">
                  {product.description}
                </p>
              )}

              {product.services && product.services.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Services:</span>
                  {product.services.map((svc: any) => {
                    const title = typeof svc === 'object' && svc ? svc.title : ''
                    const slug = typeof svc === 'object' && svc ? svc.slug : ''
                    if (!title || !slug) return null
                    return (
                      <Link
                        key={slug}
                        href={`/${slug}`}
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors"
                      >
                        {title}
                      </Link>
                    )
                  })}
                </div>
              )}

              <div className="mt-8 flex items-center gap-3">
                <Link
                  href="/request-a-quote#quote-form"
                  className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-white/90 transition-colors shadow-lg whitespace-nowrap text-sm"
                >
                  Get a Demo <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
                {product.website && (
                  <a
                    href={product.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors whitespace-nowrap text-sm"
                  >
                    Visit Live Site <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                )}
              </div>
            </div>

            {/* Stat cards */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 gap-3 lg:w-64">
                {stats.map((s: any) => (
                  <div key={s.id || s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-white">{s.value}</div>
                    <div className="text-xs text-white/60 mt-1 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      {features.length > 0 && (
        <section className="bg-white py-20 lg:py-24">
          <div className="container max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-[15px] font-bold uppercase tracking-widest text-brand-600">Features</span>
              <h2 className="mt-2 text-[38px] font-extrabold text-slate-900">
                Everything You Need, Out of the Box
              </h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                No feature gating. Every tier gets the full platform.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f: any) => {
                const FeatureIcon = lucideIcon(f.icon)
                return (
                  <div key={f.id || f.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
                      <FeatureIcon className={`h-6 w-6 ${theme.featureIcon}`} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                    {f.description && <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      {steps.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="container max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-[15px] font-bold uppercase tracking-widest text-brand-600">Process</span>
              <h2 className="mt-2 text-[38px] font-extrabold text-slate-900">
                How We Get You Live
              </h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                A proven implementation process with your dedicated engineer.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((step: any) => (
                <div key={step.id || step.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-5xl font-black text-slate-100 select-none leading-none">
                    {step.num}
                  </div>
                  <div className="relative z-10">
                    <div className="text-2xl font-black text-brand-600 mb-3">{step.num}</div>
                    <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                    {step.description && <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonial ── */}
      {testimonial?.quote && (
        <section className="bg-white py-16">
          <div className="container max-w-3xl text-center">
            <Quote className="h-10 w-10 text-brand-200 mx-auto mb-6" />
            <blockquote className="text-xl font-medium text-slate-800 leading-relaxed italic">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div className="mt-6">
              <div className="font-bold text-slate-900">{testimonial.author}</div>
              {testimonial.company && <div className="text-sm text-slate-500">{testimonial.company}</div>}
            </div>
          </div>
        </section>
      )}

      {/* ── Pricing ── */}
      {pricing.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="container max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-[15px] font-bold uppercase tracking-widest text-brand-600">Pricing</span>
              <h2 className="mt-2 text-[38px] font-extrabold text-slate-900">
                Transparent Pricing
              </h2>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                Own the code. No monthly platform fees unless you choose managed hosting.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3 items-stretch">
              {pricing.map((tier: any) => (
                <div
                  key={tier.id || tier.name}
                  className={`rounded-2xl p-8 flex flex-col ${
                    tier.highlight
                      ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/25 ring-2 ring-brand-600 scale-[1.02]'
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}
                >
                  {tier.highlight && (
                    <div className="mb-3">
                      <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className={`text-sm font-semibold mb-2 ${tier.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
                    {tier.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl font-black ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className={`text-sm ${tier.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
                        {tier.period}
                      </span>
                    )}
                  </div>
                  {tier.description && (
                    <p className={`text-sm mb-6 ${tier.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                      {tier.description}
                    </p>
                  )}
                  <ul className="space-y-3 flex-1 mb-8">
                    {(tier.features || []).map((f: any) => (
                      <li key={f.id || f.text} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${tier.highlight ? 'text-blue-200' : 'text-emerald-500'}`} />
                        <span className={tier.highlight ? 'text-blue-50' : 'text-slate-700'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/request-a-quote#quote-form"
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                      tier.highlight
                        ? 'bg-white text-brand-600 hover:bg-blue-50'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {tier.cta || 'Get Started'} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related Projects ── */}
      {product.relatedProjects && product.relatedProjects.length > 0 && (
        <section className="bg-slate-50 py-16 border-t border-b border-slate-100">
          <div className="container max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-[38px] font-extrabold text-slate-900">Projects Built with {product.name}</h2>
              <p className="mt-2 text-slate-500 text-base">Real-world applications delivering impact for our clients.</p>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-600" />
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide [&>*]:shrink-0 [&>*]:w-[280px] sm:[&>*]:w-[320px]">
              {product.relatedProjects.map((p: any) => {
                const imgUrl = p.coverImage?.url ?? '/images/portfolio-default.png'
                const href = p.slug ? `/works/${p.slug}` : '#'
                return (
                  <Link
                    key={p.id}
                    href={href}
                    className="group rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-brand-200 transition-all bg-white flex flex-col"
                  >
                    <div className="relative h-48 bg-slate-100 shrink-0">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <Layers className="h-8 w-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {p.title}
                      </h3>
                      {p.excerpt && (
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                          {p.excerpt}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                        View Project
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Tech Stack ── */}
      {techStack.length > 0 && (
        <section className="bg-white py-16">
          <div className="container max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-[38px] font-extrabold text-slate-900">Technology Stack</h2>
              <p className="mt-2 text-slate-500 text-base">Modern, battle-tested technologies used in production.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((t: any, i: number) => {
                const tech = t.technology as Technology | string
                const name = typeof tech === 'object' && tech ? tech.name : ''
                const category =
                  t.role ||
                  (typeof tech === 'object' && tech?.category ? TECH_CATEGORY_LABELS[tech.category] ?? tech.category : 'Tech')
                if (!name) return null
                return (
                  <div key={t.id || `${name}-${i}`} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-sm font-bold text-slate-800">{name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{category}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ── */}
      <section className="bg-brand-600 py-14">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-[38px] font-extrabold text-white leading-tight">Ready to launch {product.name}?</h2>
                <p className="text-blue-100 text-base mt-0.5">
                  Book a free demo and see it running in under 30 minutes.
                </p>
              </div>
            </div>
            <Link
              href="/request-a-quote#quote-form"
              className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              Request a Free Demo <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
