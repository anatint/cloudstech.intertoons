import { getWixClient, resetWixClient } from './wix'
import { wixImage } from './wixImage'

/**
 * Wix-backed PayloadCMS compatibility facade.
 *
 * Pages ported from PayloadCMS call
 * `getPayload().find({ collection, where, sort, limit, depth })`. This shim
 * implements that surface over the Wix Headless CMS relational data model.
 *
 * The data model is fully relational (MULTI_REFERENCE everywhere). When
 * `depth >= 1` we expand the needed references with a single `.include()`-based
 * query (one round-trip — fast), then alias the new relational field names back
 * to the shapes the ported pages expect (e.g. `technologies[]` → `techStack[]`,
 * `testimonials[0]` → `testimonial`, `processFlow[]` → `processSteps[]`).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

const COLLECTION_MAP: Record<string, string> = {
  services: 'Services', projects: 'Projects', products: 'Products',
  'case-studies': 'CaseStudies', industries: 'Industries', technologies: 'Technologies',
  testimonials: 'Testimonials', 'team-members': 'TeamMembers', milestones: 'Milestones',
  platforms: 'Platforms', awards: 'Awards', pages: 'SitePages',
  'home-settings': 'Import1', 'services-page-settings': 'ServicesPage',
  'products-page-settings': 'ProductsPage', 'portfolio-page-settings': 'PortfolioPage',
  'case-studies-page-settings': 'CaseStudiesPage', 'contact-page-settings': 'ContactPage',
  blogs: 'Blogs', authors: 'Authors', 'blog-categories': 'BlogCategories', faqs: 'FAQs',
  'site-settings': 'SiteSettings',
  'rfq-project-types': 'RfqProjectTypes', 'rfq-features': 'RfqFeatures', 'budget-ranges': 'BudgetRanges',
  'product-features': 'ProductFeatures', 'product-pricing': 'ProductPricing',
  'result-metrics': 'ResultMetrics',
}

/** Reference fields expanded via `.include()` when `depth >= 1`. */
const INCLUDE_FIELDS: Record<string, string[]> = {
  services: ['processFlow', 'faqs', 'technologies', 'defaultTechnologies', 'industries'],
  projects: ['technologies', 'services', 'industries', 'caseStudies', 'testimonials', 'resultItems', 'products'],
  products: ['services', 'technologies', 'testimonials', 'industries', 'faqs', 'featureItems', 'processFlow', 'pricingTiers'],
  'case-studies': ['services', 'technologies', 'projects', 'industries', 'resultItems'],
  industries: ['services', 'projects', 'products', 'faqs', 'caseStudies', 'blogs'],
  blogs: ['authors', 'categories', 'industries'],
  testimonials: [],
}

const IMAGE_KEYS = new Set([
  'heroImage', 'logo', 'logoWhite', 'clientLogo', 'coverImage', 'thumbnailImage', 'featuredImage',
  'avatar', 'photo', 'seoImage', 'ogImage', 'image', 'icon',
])
/** `icon` is an IMAGE on some collections but a lucide text name on others. */
const ICON_IS_TEXT = new Set(['products', 'industries', 'case-studies', 'rfq-project-types', 'service-offerings', 'product-features', 'key-features'])

type Doc = any

interface FindArgs {
  collection: string
  where?: Record<string, { equals?: unknown; contains?: unknown; in?: unknown[] }>
  sort?: string
  limit?: number
  depth?: number
  select?: any; page?: number; pagination?: boolean
}

/** Recursively: alias `_id`→`id`, wrap media-string fields as `{ url }`. */
function normalize(value: unknown, imageKeys = IMAGE_KEYS): any {
  if (Array.isArray(value)) return value.map((v) => normalize(v, imageKeys))
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    if (typeof obj._id === 'string' && obj.id === undefined) out.id = obj._id
    for (const [k, v] of Object.entries(obj)) {
      if (imageKeys.has(k) && typeof v === 'string' && v) out[k] = { url: wixImage(v), alt: '' }
      else out[k] = normalize(v, imageKeys)
    }
    return out
  }
  return value
}

/** Map new relational field names back to the shapes the ported pages expect. */
function applyAliases(slug: string, d: Doc) {
  const byOrder = (a: any, b: any) => (a?.order || 0) - (b?.order || 0)
  // Included child docs inherit the parent's image-key handling, so a text `icon`
  // (lucide name) can arrive wrapped as `{ url, alt }`. Coerce it back to a string.
  const iconStr = (v: any): string => (typeof v === 'string' ? v : v && typeof v === 'object' ? v.url || '' : '')
  const techs = Array.isArray(d.technologies) ? d.technologies : []
  if (techs.length && (slug === 'products' || slug === 'projects' || slug === 'case-studies')) {
    d.techStack = techs.map((t: any) => ({ technology: t, role: t?.role || t?.category || '' }))
  }
  if (slug === 'products') {
    if (Array.isArray(d.testimonials)) d.testimonial = d.testimonials[0]
    d.relatedProjects = d.relatedProjects || []
    // CMS-managed blocks (fall back to legacy ARRAY fields while empty)
    if (Array.isArray(d.featureItems) && d.featureItems.length) d.features = [...d.featureItems].sort(byOrder).map((f: any) => ({ ...f, icon: iconStr(f.icon) }))
    if (Array.isArray(d.processFlow) && d.processFlow.length)
      d.steps = [...d.processFlow].sort((a: any, b: any) => (a.stepNumber || 0) - (b.stepNumber || 0)).map((s: any) => ({ num: s.stepNumber, title: s.title, description: s.description }))
    if (Array.isArray(d.pricingTiers) && d.pricingTiers.length)
      d.pricing = [...d.pricingTiers].sort(byOrder).map((t: any) => ({
        name: t.name, price: t.price, period: t.period, description: t.description,
        highlight: t.highlight, features: (t.planFeatures || []).map((x: string) => ({ text: x })),
      }))
    if (Array.isArray(d.statsList) && d.statsList.length) d.stats = d.statsList
    if (Array.isArray(d.highlightsList) && d.highlightsList.length) d.highlights = d.highlightsList
    if (d.seoTitle || d.seoDescription || d.seoImage) {
      d.seo = { metaTitle: d.seoTitle, metaDescription: d.seoDescription, ogImage: d.seoImage }
    }
  }
  if (slug === 'case-studies') {
    if (Array.isArray(d.projects)) d.project = d.projects[0]
    d.products = Array.isArray(d.products) ? d.products : []
    if (Array.isArray(d.resultItems) && d.resultItems.length) d.results = [...d.resultItems].sort(byOrder)
    if (Array.isArray(d.challengesList) && d.challengesList.length) d.challenges = d.challengesList
    if (Array.isArray(d.highlightsList) && d.highlightsList.length) d.highlights = d.highlightsList
    // keyFeatures is now an inline ARRAY_STRING field (titles) — already on d.keyFeatures
  }
  if (slug === 'projects') {
    if (Array.isArray(d.caseStudies)) d.caseStudy = d.caseStudies[0]
    if (Array.isArray(d.industries)) d.industry = d.industries[0]
    if (Array.isArray(d.resultItems) && d.resultItems.length) d.results = [...d.resultItems].sort(byOrder)
    if (Array.isArray(d.challengesList) && d.challengesList.length) d.challenges = d.challengesList
    if (Array.isArray(d.highlightsList) && d.highlightsList.length) d.highlights = d.highlightsList
  }
  if (slug === 'services') {
    const flow = Array.isArray(d.processFlow) ? d.processFlow : []
    if (flow.length) d.processSteps = [...flow].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
    d.faqs = Array.isArray(d.faqs) ? d.faqs : []
    if (Array.isArray(d.offeringsList) && d.offeringsList.length)
      d.subServices = [...d.offeringsList].sort(byOrder).map((o: any) => ({ icon: iconStr(o.icon), title: o.title, desc: o.description }))
  }
  if (slug === 'blogs') {
    if (Array.isArray(d.authors)) d.author = d.authors[0]
    d.content = d.content // RICH_TEXT string
  }
  return d
}

/** Retry a Wix call a few times — the API occasionally times out under workerd,
 *  which otherwise blanks a page (empty results get cached by ISR). */
async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (i < attempts - 1) {
        resetWixClient() // rebuild client + fresh visitor token on next attempt
        await new Promise((r) => setTimeout(r, 150 * (i + 1)))
      }
    }
  }
  throw lastErr
}

/**
 * Exact row count via a direct REST call (`returnTotalCount: true`), bypassing
 * the `@wix/data` SDK client — which never returns `.totalCount` once a
 * collection passes a few hundred rows, even though the raw REST endpoint
 * still returns it fine (confirmed empirically against the 601-row Blogs
 * collection). Used only where an exact page count is needed for numbered
 * pagination; returns `null` on any failure so callers can fall back.
 */
export async function getExactCount(
  collection: string,
  where?: Record<string, { equals?: unknown; contains?: unknown }>
): Promise<number | null> {
  const wixId = COLLECTION_MAP[collection]
  const apiKey = process.env.WIX_API_KEY
  const siteId = process.env.WIX_SITE_ID
  if (!wixId || !apiKey || !siteId) return null
  // Unlike `find()`, `status` is NOT skipped here — an exact count that
  // includes non-published items (drafts, etc.) while the actual listing
  // filters to `status: 'published'` produces a page-count that's too high,
  // leaving the last "page" empty (confirmed live on /blog: one non-published
  // post inflated the count by 1, past what a full last page of 24 needed).
  const filter: Record<string, unknown> = {}
  for (const [field, cond] of Object.entries(where ?? {})) {
    if (cond.contains !== undefined) filter[field] = { $hasSome: [cond.contains] }
    else if (cond.equals !== undefined) filter[field] = cond.equals
  }
  try {
    const res = await fetch('https://www.wixapis.com/wix-data/v2/items/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: apiKey, 'wix-site-id': siteId },
      body: JSON.stringify({
        dataCollectionId: wixId,
        query: { filter: Object.keys(filter).length ? filter : undefined, paging: { offset: 0, limit: 1 } },
        returnTotalCount: true,
      }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { pagingMetadata?: { total?: number; tooManyToCount?: boolean } }
    if (json.pagingMetadata?.tooManyToCount) return null
    return typeof json.pagingMetadata?.total === 'number' ? json.pagingMetadata.total : null
  } catch {
    return null
  }
}

export async function getPayload() {
  return {
    async find(args: FindArgs) {
      const { collection, where, sort, limit = 100, depth = 0, page } = args
      const wixId = COLLECTION_MAP[collection]
      if (!wixId) return { docs: [], totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false }
      const imageKeys = ICON_IS_TEXT.has(collection)
        ? new Set([...IMAGE_KEYS].filter((k) => k !== 'icon'))
        : IMAGE_KEYS
      // `status` is a free-text field, so editors may type "Published" / "published".
      // Match it case-insensitively in JS instead of an exact server-side filter.
      const statusWanted =
        typeof where?.status?.equals === 'string' ? (where.status.equals as string).toLowerCase() : null
      const needsStatusFilter = statusWanted !== null
      // Explicit pagination (`page` provided) uses a real server-side skip/limit —
      // incompatible with the over-fetch-then-slice trick below, so status
      // filtering just trims stragglers instead of re-slicing to `limit`.
      const isPaginated = typeof page === 'number' && page >= 1
      const skip = isPaginated ? (page - 1) * limit : 0
      // A single-item lookup (detail page). An empty result here is almost always a
      // transient visitor-token/include glitch — not a genuinely missing item.
      const isUnique = where?.slug?.equals !== undefined || where?.id?.equals !== undefined
      const buildQuery = (withIncludes: boolean) => {
        const client = getWixClient()
        let q = client.items.query(wixId)
        for (const [field, cond] of Object.entries(where ?? {})) {
          if (field === 'status') continue // handled case-insensitively below
          const f = field === 'id' ? '_id' : field
          if (cond.equals !== undefined) q = q.eq(f, cond.equals)
          else if (cond.contains !== undefined) q = q.hasSome(f, [cond.contains] as string[])
          else if (cond.in !== undefined) q = q.hasSome(f, cond.in as string[])
        }
        if (sort) q = sort.startsWith('-') ? q.descending(sort.slice(1)) : q.ascending(sort)
        // When filtering by status client-side (see above), we must over-fetch
        // BEFORE that filter is applied — sorted by `order`, which is unset on
        // most rows, so ties fall back to Wix's own internal ordering with no
        // guarantee published rows land in the first N fetched. A collection
        // that's mostly non-published rows (e.g. many drafts pending review)
        // can silently starve out real published items if the ceiling here is
        // too close to `limit` — seen in practice once Services grew from ~40
        // items to 200+ after a bulk draft import. 1000 comfortably covers any
        // collection size this site is realistically expected to reach.
        q = q.limit(needsStatusFilter && !isPaginated ? Math.max(limit, 1000) : limit)
        if (isPaginated) q = q.skip(skip)
        if (withIncludes && depth >= 1) for (const ref of INCLUDE_FIELDS[collection] ?? []) q = q.include(ref)
        return q
      }
      const run = async (withIncludes: boolean) => {
        let res = await withRetry(() => buildQuery(withIncludes).find())
        // Retry an unexpectedly-empty unique lookup with a fresh client (handles the
        // case where the query returns 0 items WITHOUT throwing — which `withRetry`
        // can't catch — and would otherwise cache a bogus 404).
        for (let i = 0; isUnique && (res.items?.length ?? 0) === 0 && i < 3; i++) {
          resetWixClient()
          await new Promise((r) => setTimeout(r, 150 * (i + 1)))
          res = await buildQuery(withIncludes).find()
        }
        let docs = (res.items as unknown[]).map((it) => normalize(it, imageKeys)) as Doc[]
        if (needsStatusFilter) {
          docs = docs.filter((d) => String(d.status ?? '').toLowerCase() === statusWanted)
          if (!isPaginated) docs = docs.slice(0, limit)
        }
        if (depth >= 1) for (const d of docs) applyAliases(collection, d)
        // Wix's exact total-row count (`.totalCount`) goes undefined once a
        // collection is large enough to hit its `tooManyToCount` cutoff (seen
        // at 600 rows), so pagination can't rely on an exact page count.
        // `.hasNext()` is cheap and reliable regardless of collection size.
        const rawTotalCount = (res as any).totalCount
        const totalDocs = typeof rawTotalCount === 'number' ? rawTotalCount : docs.length
        const totalPages = isPaginated && typeof rawTotalCount === 'number' ? Math.max(1, Math.ceil(totalDocs / limit)) : 1
        const hasNextPage = isPaginated ? Boolean((res as any).hasNext?.()) : false
        return { docs, totalDocs, totalPages, page: isPaginated ? page : 1, hasNextPage }
      }
      try {
        const r = await run(true)
        // Unique lookup still empty after retries → try the lighter (no-include) query,
        // which is more reliable, before surfacing a 404.
        if (!r.docs.length && isUnique) {
          try { const base = await run(false); if (base.docs.length) return base } catch { /* keep r */ }
        }
        return r
      } catch {
        // Includes may fail (limits/permissions) — fall back to base data so the page still renders.
        try { return await run(false) } catch { return { docs: [], totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false } }
      }
    },
    async findGlobal(_args: { slug: string }) { return null },
    async findByID(args: { collection: string; id: string }) {
      const res = await this.find({ collection: args.collection, where: { id: { equals: args.id } }, depth: 1 })
      return res.docs[0] ?? null
    },
  }
}
