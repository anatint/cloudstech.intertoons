export const revalidate = 0
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'
import { BlockRenderer } from '@/components/BlockRenderer'
import { generateMetadata as genMeta } from '@/lib/seo'
import { findServiceBySlug, generateServiceMetadata, ServiceDetailContent } from '@/components/ServiceDetailPage'
import { getContactPage, field } from '@/lib/settings'
import ContactPageContent, { getContactPageMetadata } from '@/components/ContactPageContent'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const path = '/' + slug.join('/')
  const slugLast = slug[slug.length - 1]

  const payload = await getPayload()

  // Try customPath match first, then slug match
  let doc: any = null
  try {
    const byPath = await payload.find({
      collection: 'pages',
      where: { customPath: { equals: path }, status: { equals: 'published' } },
      limit: 1,
    })
    doc = byPath.docs[0] ?? null
  } catch { /* */ }

  if (!doc) {
    try {
      const bySlug = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slugLast }, status: { equals: 'published' } },
        limit: 1,
      })
      doc = bySlug.docs[0] ?? null
    } catch { /* */ }
  }

  if (doc) return genMeta(doc, path)

  // Contact page — its URL is editor-controlled via `contact-page-settings.slug`.
  if (slug.length === 1) {
    const contact = await getContactPage()
    if (field(contact, 'slug') === slugLast) return getContactPageMetadata()
  }

  // Fall back to a Service — this is what gives service detail pages their
  // WordPress-matching root-level URL (e.g. /shopify-development, no /services/ prefix).
  if (slug.length === 1) {
    return generateServiceMetadata(slugLast)
  }

  return { title: 'Page Not Found' }
}

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params
  const path = '/' + slug.join('/')
  const slugLast = slug[slug.length - 1]

  const payload = await getPayload()

  let page: any = null

  try {
    const byPath = await payload.find({
      collection: 'pages',
      where: { customPath: { equals: path }, status: { equals: 'published' } },
      limit: 1,
    })
    page = byPath.docs[0] ?? null
  } catch { /* */ }

  if (!page) {
    try {
      const bySlug = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slugLast }, status: { equals: 'published' } },
        limit: 1,
      })
      page = bySlug.docs[0] ?? null
    } catch { /* */ }
  }

  if (page) {
    return (
      <div className="pt-16">
        {page.layout?.length ? (
          <BlockRenderer blocks={page.layout} />
        ) : (
          <div className="container py-24 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900">{page.title}</h1>
          </div>
        )}
      </div>
    )
  }

  // Contact page — its URL is editor-controlled via `contact-page-settings.slug`.
  if (slug.length === 1) {
    const contact = await getContactPage()
    if (field(contact, 'slug') === slugLast) return <ContactPageContent />
  }

  // Fall back to a Service — single-segment paths only (e.g. /shopify-development).
  if (slug.length === 1) {
    const service = await findServiceBySlug(slugLast)
    if (service) return <ServiceDetailContent slug={slugLast} />
  }

  notFound()
}
