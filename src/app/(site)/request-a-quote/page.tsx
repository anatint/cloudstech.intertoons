import type { Metadata } from 'next'
import { getPage, field, getSiteSettings, getContactHref } from '@/lib/settings'
import { getPayload } from '@/lib/payload'
import RequestQuoteForm, { type RfqContent } from '@/components/RequestQuoteForm'

export const revalidate = 0

const FALLBACK = {
  heroBadge: "Let's Build Something Amazing",
  heroTitle: 'Request a',
  heroTitleHighlight: 'Quote',
  heroSubtitle:
    'Tell us about your project and our experts will get back to you with a tailored proposal within 24 hours.',
  // Matches the WordPress site's <title>/description exactly (the template
  // in the root layout appends " | Intertoons" the same way WP's own title
  // already ends, so this string doesn't repeat that suffix itself).
  seoTitle: 'Request a Quote – Free Estimate',
  seoDescription: 'Get a free no-obligation quote from Intertoons. We reply within 24 hours.',
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('request-a-quote')
  const title = field(page, 'seoTitle', FALLBACK.seoTitle)
  const description = field(page, 'seoDescription', FALLBACK.seoDescription)
  return { title, description, openGraph: { title, description }, alternates: { canonical: '/request-a-quote' } }
}

async function fetchList(collection: string, sort = 'order') {
  try {
    const payload = await getPayload()
    const { docs } = await payload.find({ collection, where: { status: { equals: 'published' } }, sort, limit: 50 })
    return docs as any[]
  } catch {
    return []
  }
}

export default async function RequestQuotePage() {
  const [page, s, contactHref, typeDocs, featDocs, budgetDocs] = await Promise.all([
    getPage('request-a-quote'),
    getSiteSettings(),
    getContactHref(),
    fetchList('rfq-project-types'),
    fetchList('rfq-features'),
    fetchList('budget-ranges', 'number'),
  ])

  const projectTypeOptions = typeDocs
    .map((d) => ({ label: String(d.title || '').trim(), icon: typeof d.icon === 'string' ? d.icon : '' }))
    .filter((o) => o.label)
  const featureOptions = featDocs.map((d) => String(d.title || '').trim()).filter(Boolean)
  const budgetOptions = budgetDocs.map((d) => String(d.title || '').trim()).filter(Boolean)

  const phone = s.phoneWhatsapp || s.phone || ''
  const content: RfqContent = {
    heroBadge: field(page, 'heroBadge', FALLBACK.heroBadge),
    heroTitle: field(page, 'heroTitle', FALLBACK.heroTitle),
    heroTitleHighlight: field(page, 'heroTitleHighlight', FALLBACK.heroTitleHighlight),
    heroSubtitle: field(page, 'heroSubtitle', FALLBACK.heroSubtitle),
    phone,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, '')}`,
    email: s.email || '',
    address: s.addressLine || '',
  }

  return <RequestQuoteForm content={content} contactHref={contactHref} projectTypeOptions={projectTypeOptions} featureOptions={featureOptions} budgetOptions={budgetOptions} />
}
