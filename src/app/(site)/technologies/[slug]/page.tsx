import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Package, FolderOpen } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { generateMetadata as genMeta, buildBreadcrumbJsonLd } from '@/lib/seo'
import { lucideIcon } from '@/lib/icons'

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 0

export async function generateStaticParams() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'technologies', limit: 200 })
    return (docs as any[]).map((d) => ({ slug: d.slug })).filter((p) => p.slug)
  } catch { return [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { docs } = await (await getPayload()).find({ collection: 'technologies', where: { slug: { equals: slug }, status: { equals: 'published' } }, limit: 1 })
  if (!docs[0]) return { title: 'Technology Not Found' }
  const t = docs[0] as any
  return genMeta({ ...t, title: t.name }, `/technologies/${slug}`)
}

const hasRef = (arr: any[], slug: string) => (arr || []).some((x: any) => (typeof x === 'object' ? x.slug : x) === slug)

export default async function TechnologyDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()
  const { docs } = await payload.find({ collection: 'technologies', where: { slug: { equals: slug }, status: { equals: 'published' } }, limit: 1, depth: 1 })
  const tech = docs[0] as any
  if (!tech) notFound()

  const [{ docs: allProducts }, { docs: allProjects }] = await Promise.all([
    payload.find({ collection: 'products', where: { status: { equals: 'published' } }, depth: 1, limit: 100 }),
    payload.find({ collection: 'projects', where: { status: { equals: 'published' } }, depth: 1, limit: 100 }),
  ])
  const products = (allProducts as any[]).filter((p) => hasRef(p.technologies, slug))
  const projects = (allProjects as any[]).filter((p) => hasRef(p.technologies, slug))

  const Icon = lucideIcon(tech.icon2)
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Technologies', item: '/technologies' },
    { name: tech.name, item: `/technologies/${slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div>
        <section className="bg-[#050B2A] relative overflow-hidden pt-28 pb-14 sm:pt-32 lg:pt-36 lg:pb-20">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute left-1/3 -translate-x-1/2 top-0 h-[480px] w-[480px] rounded-full bg-gradient-to-b from-brand-600/25 to-transparent" />
          </div>
          <div className="container max-w-5xl relative z-10">
            <nav className="flex items-center gap-1.5 text-xs text-blue-200/60 mb-6">
              <Link href="/" className="hover:text-white">Home</Link><ChevronRight className="h-3.5 w-3.5" />
              <Link href="/technologies" className="hover:text-white">Technologies</Link><ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-200">{tech.name}</span>
            </nav>
            <div className="flex items-center gap-4">
              <span className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                {tech.logo?.url
                  ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={tech.logo.url} alt={tech.name} className="h-9 w-9 object-contain" />
                  : <Icon className="h-8 w-8 text-brand-400" />}
              </span>
              <div>
                {tech.category && <span className="text-brand-400 text-xs font-bold uppercase tracking-wider">{tech.category}</span>}
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{tech.name}</h1>
              </div>
            </div>
          </div>
        </section>

        <RelatedRow title="Products built with it" viewMore="/products" items={products.map((p) => ({ name: p.name, href: `/products/${p.slug}`, img: p.logo?.url }))} icon={<Package className="h-4 w-4" />} />
        <RelatedRow title="Projects using it" viewMore="/works" items={projects.map((p) => ({ name: p.title, href: `/works/${p.slug}`, img: p.coverImage?.url || '/images/portfolio-default.png' }))} icon={<FolderOpen className="h-4 w-4" />} dark />

        <section className="bg-brand-600 py-12">
          <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <h2 className="text-[38px] font-extrabold text-white">Build your next project with {tech.name}</h2>
            <Link href="/request-a-quote#quote-form" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-600 transition-colors">
              Request a Free Quote <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

function RelatedRow({ title, items, viewMore, icon, dark }: { title: string; items: { name: string; href: string; img?: string }[]; viewMore: string; icon: React.ReactNode; dark?: boolean }) {
  if (!items.length) return null
  return (
    <section className={dark ? 'py-12 bg-slate-50' : 'py-12 bg-white'}>
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">{icon}{title}</h2>
          <Link href={viewMore} className="text-sm font-semibold text-brand-600 hover:underline inline-flex items-center gap-1">View more <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="shrink-0 w-56 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-md transition-all overflow-hidden">
              <div className="h-28 bg-slate-100 flex items-center justify-center overflow-hidden">
                {it.img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.img} alt={it.name} className="w-full h-full object-cover" /> : <span className="text-slate-300 text-sm">{it.name}</span>}
              </div>
              <div className="p-3"><p className="text-sm font-semibold text-slate-800 leading-tight">{it.name}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
