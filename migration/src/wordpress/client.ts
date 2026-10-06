/**
 * Minimal WordPress REST API client. Public endpoints only — no auth needed
 * for /wp/v2/pages on this site (verified: 234 pages, 3 pages @ per_page=100).
 */

import * as cheerio from 'cheerio'

const WP_BASE = 'https://intertoons.com/wp-json/wp/v2'
const UA = 'Mozilla/5.0 (compatible; IntertoonsMigrationBot/1.0)'

/** WP's title/excerpt "rendered" fields are HTML-entity-encoded plain text (e.g. "&#038;" for "&"). */
function decodeEntities(s: string): string {
  return cheerio.load(`<div>${s}</div>`)('div').text()
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Generating yoast_head_json (SEO title/description/schema) for 100 pages per
 * request is expensive on the WP server and occasionally times out with a
 * transient 500 under load — retry with backoff before giving up.
 */
async function wpFetch(path: string, attempt = 0): Promise<{ json: any; headers: Headers }> {
  const res = await fetch(`${WP_BASE}${path}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    if (res.status >= 500 && attempt < 3) {
      await sleep(2000 * (attempt + 1))
      return wpFetch(path, attempt + 1)
    }
    throw new Error(`WordPress API ${path} -> ${res.status}`)
  }
  return { json: await res.json(), headers: res.headers }
}

export interface WpPage {
  id: number
  slug: string
  status: string
  title: string
  content: string
  excerpt: string
  link: string
  parent: number
  modified: string
  featuredMediaId: number
  seoTitle?: string
  seoDescription?: string
  schemaMarkup?: string
}

function normalizePage(raw: any): WpPage {
  const yoast = raw.yoast_head_json
  return {
    id: raw.id,
    slug: raw.slug,
    status: raw.status,
    title: decodeEntities(raw.title?.rendered ?? ''),
    content: raw.content?.rendered ?? '',
    excerpt: raw.excerpt?.rendered ?? '',
    link: raw.link,
    parent: raw.parent ?? 0,
    modified: raw.modified,
    featuredMediaId: raw.featured_media ?? 0,
    seoTitle: yoast?.title || undefined,
    seoDescription: yoast?.description || undefined,
    schemaMarkup: yoast?.schema ? JSON.stringify(yoast.schema) : undefined,
  }
}

/** Fetch ALL published pages, following pagination via X-WP-TotalPages. */
export async function fetchAllPages(perPage = 50): Promise<WpPage[]> {
  const { json: firstPage, headers } = await wpFetch(`/pages?per_page=${perPage}&page=1&status=publish`)
  const totalPages = Number(headers.get('x-wp-totalpages') ?? '1')
  const all: any[] = [...firstPage]

  for (let page = 2; page <= totalPages; page++) {
    const { json } = await wpFetch(`/pages?per_page=${perPage}&page=${page}&status=publish`)
    all.push(...json)
    await sleep(300)
  }

  return all.map(normalizePage)
}

/** Fetch a single page by numeric WordPress ID (used for the 5-page POC). */
export async function fetchPageById(id: number): Promise<WpPage> {
  const { json } = await wpFetch(`/pages/${id}`)
  return normalizePage(json)
}

/** Fetch a single page by slug — convenience for picking POC candidates. */
export async function fetchPageBySlug(slug: string): Promise<WpPage | null> {
  const { json } = await wpFetch(`/pages?slug=${encodeURIComponent(slug)}`)
  return json[0] ? normalizePage(json[0]) : null
}
