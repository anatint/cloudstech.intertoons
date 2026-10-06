import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { generateMetadata as genMeta, buildBreadcrumbJsonLd } from '@/lib/seo'
import { BlockRenderer } from '@/components/BlockRenderer'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Props { params: Promise<{ slug: string }> }
export const revalidate = 0

export async function generateStaticParams() {
  try {
    const payload = await getPayload()
    const { docs } = await payload.find({
      collection: 'industries',
      where: { status: { equals: 'published' } },
      limit: 200,
      select: { slug: true },
    })
    return (docs as any[]).map((d) => ({ slug: d.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'industries',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  if (!docs[0]) return { title: 'Industry Not Found' }
  return genMeta(docs[0] as any, `/industries/${slug}`)
}

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()

  const { docs } = await payload.find({
    collection: 'industries',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })

  const industry = docs[0] as any
  if (!industry) notFound()

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Industries', item: '/industries' },
    { name: industry.name, item: `/industries/${slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div>
        {/* Hero */}
        <section className="pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-20 bg-gradient-to-br from-slate-900 to-brand-700 text-white">
          <div className="container max-w-4xl">
            <nav className="flex items-center gap-2 text-xs text-blue-300 mb-8">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <span className="text-white">Industries</span>
              <span>/</span>
              <span className="text-white">{industry.name}</span>
            </nav>
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div>
                <h1 className="text-4xl font-extrabold sm:text-5xl">{industry.name}</h1>
                {industry.description && (
                  <p className="mt-5 text-base font-inter text-blue-100">{industry.description}</p>
                )}
                <Button size="lg" variant="white" className="mt-8" asChild>
                  <Link href="/request-a-quote#quote-form">Start a Project →</Link>
                </Button>
              </div>
              {industry.coverImage?.url && (
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image src={industry.coverImage.url} alt={industry.name} fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Custom layout blocks */}
        {industry.layout?.length > 0 && <BlockRenderer blocks={industry.layout} />}
      </div>
    </>
  )
}
