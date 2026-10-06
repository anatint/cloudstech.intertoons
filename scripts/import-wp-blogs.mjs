#!/usr/bin/env node
/**
 * Import WordPress blog posts into the Wix Headless CMS (Blogs / Authors / BlogCategories).
 *
 * Idempotent: upserts posts/categories by slug, caches imported images by source URL.
 * Re-running updates existing posts in place (no duplicates).
 *
 * Env:
 *   WIX_API_KEY   (required)  admin Wix API key
 *   WIX_SITE_ID   default 4ffcfcd6-cb3f-4af1-959b-85296102be43
 *   WP_BASE       default https://intertoons.com
 *   LIMIT         number of most-recent posts to import (0 = all). default 25
 *   DRY_RUN       "1" to fetch+clean only, no writes
 *
 * Usage:
 *   WIX_API_KEY=... LIMIT=25 node scripts/import-wp-blogs.mjs
 */

import fs from 'node:fs'

const API_KEY = process.env.WIX_API_KEY
const SITE_ID = process.env.WIX_SITE_ID || '4ffcfcd6-cb3f-4af1-959b-85296102be43'
const WP_BASE = (process.env.WP_BASE || 'https://intertoons.com').replace(/\/$/, '')
const LIMIT = parseInt(process.env.LIMIT || '25', 10)
const DRY_RUN = process.env.DRY_RUN === '1'
const AUTHOR_NAME = 'Intertoons Team'
const AUTHOR_SLUG = 'intertoons-team'

if (!API_KEY && !DRY_RUN) { console.error('WIX_API_KEY is required (or set DRY_RUN=1).'); process.exit(1) }

const WIX = 'https://www.wixapis.com'
const wixHeaders = { 'Content-Type': 'application/json', Authorization: API_KEY, 'wix-site-id': SITE_ID }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function wix(method, path, body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(WIX + path, { method, headers: wixHeaders, body: body ? JSON.stringify(body) : undefined })
    if (res.ok) return res.status === 204 ? {} : res.json()
    const txt = await res.text()
    if (res.status === 429 || res.status >= 500) { await sleep(500 * (attempt + 1)); continue }
    throw new Error(`Wix ${method} ${path} → ${res.status}: ${txt.slice(0, 300)}`)
  }
  throw new Error(`Wix ${method} ${path} failed after retries`)
}

async function wpGet(path) {
  const res = await fetch(WP_BASE + path, { headers: { 'User-Agent': 'IntertoonsMigrator/1.0' } })
  if (!res.ok) throw new Error(`WP GET ${path} → ${res.status}`)
  return { json: await res.json(), headers: res.headers }
}

/* ---------- HTML helpers ---------- */
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#39;': "'", '&#8217;': '’', '&#8216;': '‘', '&#8220;': '“', '&#8221;': '”', '&#8211;': '–', '&#8212;': '—', '&#8230;': '…', '&nbsp;': ' ', '&hellip;': '…' }
const decode = (s = '') => s.replace(/&#?\w+;/g, (m) => ENTITIES[m] ?? m)
const stripTags = (s = '') => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())

const imageCache = new Map()
async function importImage(srcUrl) {
  if (!srcUrl || !/^https?:\/\//i.test(srcUrl)) return srcUrl
  if (imageCache.has(srcUrl)) return imageCache.get(srcUrl)
  if (DRY_RUN) { imageCache.set(srcUrl, srcUrl); return srcUrl }
  try {
    const name = decodeURIComponent((srcUrl.split('/').pop() || 'image.jpg').split('?')[0])
    const r = await wix('POST', '/site-media/v1/files/import', { url: srcUrl, displayName: name, mediaType: 'IMAGE' })
    const url = r?.file?.url || srcUrl
    imageCache.set(srcUrl, url)
    return url
  } catch (e) {
    console.warn(`   ! image import failed (${srcUrl}letting WP URL stand): ${e.message.slice(0, 80)}`)
    imageCache.set(srcUrl, srcUrl)
    return srcUrl // fall back to the WordPress URL so it still displays
  }
}

async function cleanContent(html) {
  let c = html || ''
  c = c.replace(/<script[\s\S]*?<\/script>/gi, '')
  c = c.replace(/<style[\s\S]*?<\/style>/gi, '')
  c = c.replace(/<!--[\s\S]*?-->/g, '')
  c = c.replace(/<\/?div[^>]*>/gi, '')      // flatten wrapper / editor-chrome divs
  c = c.replace(/<h1[\s\S]*?<\/h1>/i, '')   // drop the first H1 (page renders the title separately)

  // Re-host inline images and clean their attributes.
  const srcs = [...c.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1])
  for (const src of [...new Set(srcs)]) {
    const newUrl = await importImage(src)
    if (newUrl !== src) c = c.split(src).join(newUrl)
  }
  c = c.replace(/\s(srcset|sizes|loading|decoding|fetchpriority)=["'][^"']*["']/gi, '')
  c = c.replace(/\sclass=["']wp-[^"']*["']/gi, '')
  c = c.replace(/(\s*<p>\s*(&nbsp;|\s)*<\/p>\s*)/gi, '\n') // drop empty paragraphs
  return c.replace(/\n{3,}/g, '\n\n').trim()
}

/* ---------- Upserts ---------- */
async function queryBySlug(collection, slug) {
  const r = await wix('POST', '/wix-data/v2/items/query', { dataCollectionId: collection, query: { filter: { slug }, paging: { limit: 1 } } })
  return r.dataItems?.[0]?.data || null
}

async function ensureAuthor() {
  if (DRY_RUN) return 'dry-author'
  const found = await queryBySlug('Authors', AUTHOR_SLUG)
  if (found) return found._id
  const r = await wix('POST', '/wix-data/v2/items', { dataCollectionId: 'Authors', dataItem: { data: { name: AUTHOR_NAME, slug: AUTHOR_SLUG, designation: 'Intertoons', bio: 'Articles from the Intertoons team.' } } })
  return r.dataItem.id
}

const catCache = new Map()
async function ensureCategory(name, slug, description) {
  if (!slug || slug === 'uncategorized') return null
  if (catCache.has(slug)) return catCache.get(slug)
  if (DRY_RUN) { catCache.set(slug, 'dry-cat'); return 'dry-cat' }
  let id
  const found = await queryBySlug('BlogCategories', slug)
  if (found) id = found._id
  else {
    const r = await wix('POST', '/wix-data/v2/items', { dataCollectionId: 'BlogCategories', dataItem: { data: { title: name, slug, description: description || '' } } })
    id = r.dataItem.id
  }
  catCache.set(slug, id)
  return id
}

async function upsertBlog(data) {
  if (DRY_RUN) return { id: 'dry', isNew: true }
  const found = await queryBySlug('Blogs', data.slug)
  if (found) {
    const merged = { ...found, ...data }
    await wix('PUT', `/wix-data/v2/items/${found._id}`, { dataCollectionId: 'Blogs', dataItem: { data: merged } })
    return { id: found._id, isNew: false }
  }
  const r = await wix('POST', '/wix-data/v2/items', { dataCollectionId: 'Blogs', dataItem: { data } })
  return { id: r.dataItem.id, isNew: true }
}

async function setReferences(blogId, authorId, catIds) {
  const refs = []
  if (authorId) refs.push({ referringItemFieldName: 'authors', referringItemId: blogId, referencedItemId: authorId })
  for (const c of catIds) refs.push({ referringItemFieldName: 'categories', referringItemId: blogId, referencedItemId: c })
  if (!refs.length) return
  try {
    await wix('POST', '/wix-data/v2/bulk/items/insert-references', { dataCollectionId: 'Blogs', dataItemReferences: refs })
  } catch (e) {
    console.warn(`   ! references failed: ${e.message.slice(0, 100)}`)
  }
}

/* ---------- Fetch WP posts (paged) ---------- */
async function fetchPosts() {
  const perPage = 100
  const out = []
  let page = 1
  while (true) {
    const need = LIMIT > 0 ? Math.min(perPage, LIMIT - out.length) : perPage
    if (need <= 0) break
    const { json } = await wpGet(`/wp-json/wp/v2/posts?per_page=${need}&page=${page}&_embed&status=publish&orderby=date&order=desc`)
    if (!json.length) break
    out.push(...json)
    if (json.length < need) break
    page++
    if (LIMIT > 0 && out.length >= LIMIT) break
  }
  return out
}

/* ---------- Main ---------- */
async function main() {
  console.log(`WP → Wix blog import  |  source=${WP_BASE}  limit=${LIMIT || 'ALL'}  dryRun=${DRY_RUN}`)
  const posts = await fetchPosts()
  console.log(`Fetched ${posts.length} posts.`)

  const authorId = await ensureAuthor()
  const redirects = []
  let created = 0, updated = 0, failed = 0

  for (const [i, p] of posts.entries()) {
    const slug = p.slug
    try {
      const emb = p._embedded || {}
      const terms = (emb['wp:term'] || []).flat()
      const cats = terms.filter((t) => t?.taxonomy === 'category')
      const tags = terms.filter((t) => t?.taxonomy === 'post_tag').map((t) => decode(t.name))

      // Cover image: featured media, else Yoast OG image.
      const fm = (emb['wp:featuredmedia'] || [])[0]
      const y = p.yoast_head_json || {}
      const coverSrc = fm?.source_url || y.og_image?.[0]?.url || ''
      const coverUrl = coverSrc ? await importImage(coverSrc) : ''

      const content = await cleanContent(p.content?.rendered || '')
      const wordCount = stripTags(content).split(/\s+/).filter(Boolean).length

      const catIds = []
      for (const c of cats) {
        const id = await ensureCategory(decode(c.name), c.slug, stripTags(c.description))
        if (id) catIds.push(id)
      }

      const data = {
        title: decode(p.title?.rendered || slug),
        slug,
        content,
        excerpt: stripTags(p.excerpt?.rendered || '').replace(/\s*\[…\]\s*$/, '').slice(0, 500),
        publishDate: p.date_gmt ? new Date(p.date_gmt + 'Z').toISOString() : undefined,
        featuredImage: coverUrl || undefined,
        seoTitle: (y.title || '').slice(0, 70) || undefined,
        seoDescription: (y.description || '').slice(0, 200) || undefined,
        seoKeywords: tags.length ? tags : undefined,
        readingTime: Math.max(1, Math.ceil(wordCount / 200)),
        featured: false,
        status: 'published',
      }
      for (const k of Object.keys(data)) if (data[k] === undefined || data[k] === '') delete data[k]

      const { id, isNew } = await upsertBlog(data)
      if (isNew) await setReferences(id, authorId, catIds)
      isNew ? created++ : updated++

      // old WP permalink → new blog path
      const oldPath = new URL(p.link).pathname
      redirects.push({ from: oldPath, to: `/blog/${slug}` })

      console.log(`[${i + 1}/${posts.length}] ${isNew ? 'NEW ' : 'upd '} ${slug}  (${catIds.length} cats, cover:${coverUrl ? 'y' : 'n'})`)
    } catch (e) {
      failed++
      console.error(`[${i + 1}/${posts.length}] FAILED ${slug}: ${e.message.slice(0, 150)}`)
    }
  }

  fs.writeFileSync(new URL('./wp-redirects.json', import.meta.url), JSON.stringify(redirects, null, 2))
  console.log(`\nDone. created=${created} updated=${updated} failed=${failed}. Redirects written to scripts/wp-redirects.json (${redirects.length}).`)
}

main().catch((e) => { console.error(e); process.exit(1) })
