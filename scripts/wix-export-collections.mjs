#!/usr/bin/env node
/**
 * Exports every CMS collection on the Wix site (schema + all items, with
 * multi-reference fields as arrays of referenced item IDs) to JSON.
 * Read-only; no Wix writes. Uses WIX_API_KEY / WIX_SITE_ID from .env.local.
 *
 * Writes <outDir>/<collectionId>.json per collection plus <outDir>/_index.json.
 *
 * Usage: node scripts/wix-export-collections.mjs [outDir]   (default: data/wix-export)
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

try {
  process.loadEnvFile(new URL('../.env.local', import.meta.url))
} catch {}

const API_KEY = process.env.WIX_API_KEY
const SITE_ID = process.env.WIX_SITE_ID
if (!API_KEY || !SITE_ID) {
  console.error('WIX_API_KEY and WIX_SITE_ID must be set (in .env.local)')
  process.exit(1)
}

const OUT_DIR = resolve(process.argv[2] || 'data/wix-export')
const PAGE = 1000

async function wix(path, body) {
  const res = await fetch(`https://www.wixapis.com${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: API_KEY, 'wix-site-id': SITE_ID },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`)
  return res.json()
}

async function listCollections() {
  const all = []
  let offset = 0
  for (;;) {
    const data = await wix(`/wix-data/v2/collections?paging.limit=100&paging.offset=${offset}`)
    const batch = data.collections || []
    all.push(...batch)
    if (batch.length < 100) return all
    offset += batch.length
  }
}

// Multi-reference links aren't returned with items by default; inline them and
// keep only the referenced IDs so the import can recreate the links.
const REF_LIMIT = 100

async function listItems(collection) {
  const refFields = collection.fields.filter((f) => f.type === 'MULTI_REFERENCE').map((f) => f.key)
  const referencedItemOptions = refFields.map((fieldName) => ({ fieldName, limit: REF_LIMIT }))
  const pageSize = refFields.length ? 100 : PAGE
  const items = []
  let cursor
  for (;;) {
    const query = cursor ? { cursorPaging: { limit: pageSize, cursor } } : { cursorPaging: { limit: pageSize } }
    const body = { dataCollectionId: collection.id, query }
    if (refFields.length) body.referencedItemOptions = referencedItemOptions
    const data = await wix('/wix-data/v2/items/query', body)
    for (const { data: item } of data.dataItems || []) {
      for (const key of refFields) {
        if (Array.isArray(item[key])) {
          item[key] = item[key].map((r) => (typeof r === 'string' ? r : r._id))
          if (item[key].length >= REF_LIMIT) console.warn(`  ! ${collection.id}.${key} on ${item._id} may be truncated at ${REF_LIMIT}`)
        }
      }
      items.push(item)
    }
    cursor = data.pagingMetadata?.cursors?.next
    if (!cursor) return items
  }
}

const collections = await listCollections()
// Only the site's own CMS collections; Wix app collections (Stores, Members, …) are skipped.
const native = collections.filter((c) => c.collectionType === 'NATIVE')

await mkdir(OUT_DIR, { recursive: true })
const index = []
for (const c of native) {
  try {
    const items = await listItems(c)
    await writeFile(resolve(OUT_DIR, `${c.id}.json`), JSON.stringify({ collection: c, items }, null, 2))
    index.push({ id: c.id, displayName: c.displayName, items: items.length })
    console.log(`✓ ${c.id} — ${items.length} items`)
  } catch (err) {
    index.push({ id: c.id, displayName: c.displayName, error: err.message })
    console.error(`✗ ${c.id} — ${err.message}`)
  }
}

await writeFile(
  resolve(OUT_DIR, '_index.json'),
  JSON.stringify(
    {
      siteId: SITE_ID,
      exportedAt: new Date().toISOString(),
      collections: index,
      skipped: collections.filter((c) => c.collectionType !== 'NATIVE').map((c) => c.id),
    },
    null,
    2,
  ),
)
console.log(`\n${index.length} collections → ${OUT_DIR}`)
