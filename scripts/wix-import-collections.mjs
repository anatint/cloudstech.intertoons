#!/usr/bin/env node
/**
 * Copies a Wix CMS export (from wix-export-collections.mjs) into another Wix site:
 * creates missing collections, adds missing fields, upserts every item keeping its
 * original _id, then recreates multi-reference links.
 *
 * Target credentials (from .env.local):
 *   WIX_TARGET_API_KEY  — API key with access to the target site (falls back to WIX_API_KEY)
 *   WIX_TARGET_SITE_ID  — target site id (defaults to the "Cloudstech headless" site)
 *
 * Dry run by default; pass --apply to write.
 *
 * Usage: node scripts/wix-import-collections.mjs [--apply] [--only=Blogs,FAQs] [exportDir]
 */
import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

try {
  process.loadEnvFile(new URL('../.env.local', import.meta.url))
} catch {}

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const ONLY = args.find((a) => a.startsWith('--only='))?.slice(7).split(',')
const EXPORT_DIR = resolve(args.find((a) => !a.startsWith('--')) || 'data/wix-export')

const API_KEY = process.env.WIX_TARGET_API_KEY || process.env.WIX_API_KEY
const SITE_ID = process.env.WIX_TARGET_SITE_ID || '71f4ac93-4176-4894-bff5-79a6d8f00a71'
if (!API_KEY) {
  console.error('WIX_TARGET_API_KEY (or WIX_API_KEY) must be set in .env.local')
  process.exit(1)
}

const REF_TYPES = new Set(['REFERENCE', 'MULTI_REFERENCE'])
const MAX_BATCH_ITEMS = 100
const MAX_BATCH_BYTES = 1_500_000

async function wix(method, path, body) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://www.wixapis.com${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: API_KEY, 'wix-site-id': SITE_ID },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 429 && attempt < 5) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
      continue
    }
    const text = await res.text()
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 500)}`)
    return text ? JSON.parse(text) : {}
  }
}

// Strip read-only bits (capabilities, systemField, …) so a field can be sent back to Wix.
function cleanTypeMetadata(tm) {
  if (!tm) return undefined
  if (tm.object) {
    return { object: { fields: tm.object.fields.map(({ key, displayName, type, typeMetadata }) => ({ key, displayName, type, typeMetadata: cleanTypeMetadata(typeMetadata) })) } }
  }
  if (tm.array) return { array: { elementType: tm.array.elementType, typeMetadata: cleanTypeMetadata(tm.array.typeMetadata) } }
  return tm
}

function cleanField(f) {
  const out = { key: f.key, displayName: f.displayName, type: f.type }
  const tm = cleanTypeMetadata(f.typeMetadata)
  if (tm) out.typeMetadata = tm
  if (f.description) out.description = f.description
  return out
}

function cleanPlugins(plugins = [], { creating }) {
  return plugins.filter((p) => !['SHARED', 'GRIDAPPLESS'].includes(p.type) && (creating || p.type !== 'SINGLE_ITEM'))
}

async function getTargetCollections() {
  const all = new Map()
  let offset = 0
  for (;;) {
    const data = await wix('GET', `/wix-data/v2/collections?paging.limit=100&paging.offset=${offset}`)
    for (const c of data.collections || []) all.set(c.id, c)
    if ((data.collections || []).length < 100) return all
    offset += 100
  }
}

async function updateCollection(current, extraFields) {
  const keep = current.fields.filter((f) => !f.systemField).map(cleanField)
  const collection = {
    id: current.id,
    displayName: current.displayName,
    displayField: current.displayField,
    permissions: current.permissions,
    plugins: cleanPlugins(current.plugins, { creating: false }),
    revision: current.revision,
    fields: [...keep, ...extraFields],
  }
  return (await wix('PUT', '/wix-data/v2/collections', { collection })).collection
}

function batches(items) {
  const out = []
  let cur = []
  let size = 0
  for (const it of items) {
    const s = JSON.stringify(it).length
    if (cur.length && (cur.length >= MAX_BATCH_ITEMS || size + s > MAX_BATCH_BYTES)) {
      out.push(cur)
      cur = []
      size = 0
    }
    cur.push(it)
    size += s
  }
  if (cur.length) out.push(cur)
  return out
}

// ---------- load export ----------
const files = (await readdir(EXPORT_DIR)).filter((f) => f.endsWith('.json') && !f.startsWith('_'))
const exported = []
for (const f of files) {
  const data = JSON.parse(await readFile(resolve(EXPORT_DIR, f), 'utf8'))
  if (!ONLY || ONLY.includes(data.collection.id)) exported.push(data)
}
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} → site ${SITE_ID}, ${exported.length} collections from ${EXPORT_DIR}\n`)

let target = await getTargetCollections()

// ---------- 1. collections + plain fields ----------
console.log('1) Collections and fields')
for (const { collection: src } of exported) {
  const plain = src.fields.filter((f) => !f.systemField && !REF_TYPES.has(f.type)).map(cleanField)
  const existing = target.get(src.id)
  if (!existing) {
    console.log(`  + create ${src.id} (${plain.length} fields)`)
    if (APPLY) {
      const collection = {
        id: src.id,
        displayName: src.displayName,
        displayField: src.displayField,
        permissions: src.permissions,
        plugins: cleanPlugins(src.plugins, { creating: true }),
        fields: plain,
      }
      const created = (await wix('POST', '/wix-data/v2/collections', { collection })).collection
      target.set(created.id, created)
    }
    continue
  }
  const have = new Map(existing.fields.map((f) => [f.key, f]))
  const missing = plain.filter((f) => !have.has(f.key))
  const mismatched = plain.filter((f) => have.has(f.key) && have.get(f.key).type !== f.type)
  if (!missing.length && !mismatched.length) {
    console.log(`  = ${src.id} up to date`)
    continue
  }
  console.log(`  ~ ${src.id}: +${missing.length} fields${mismatched.length ? `, retype ${mismatched.map((f) => `${f.key} ${have.get(f.key).type}→${f.type}`).join(', ')}` : ''}`)
  if (APPLY) {
    const retyped = new Map(mismatched.map((f) => [f.key, f]))
    const current = { ...existing, fields: existing.fields.filter((f) => !retyped.has(f.key)) }
    target.set(src.id, await updateCollection(current, [...mismatched, ...missing]))
  }
}

// ---------- 2. reference fields (all collections exist now) ----------
console.log('\n2) Reference fields')
if (APPLY) target = await getTargetCollections()
for (const { collection: src } of exported) {
  const refs = src.fields.filter((f) => !f.systemField && REF_TYPES.has(f.type))
  if (!refs.length) continue
  const existing = target.get(src.id)
  const have = new Map((existing?.fields || []).map((f) => [f.key, f.type]))
  // Missing, or present with the wrong type (e.g. a CSV import created it as TEXT).
  const missing = refs.filter((f) => have.get(f.key) !== f.type).map(cleanField)
  if (!missing.length) {
    console.log(`  = ${src.id} references up to date`)
    continue
  }
  console.log(`  ~ ${src.id}: ${missing.map((f) => (have.has(f.key) ? `retype ${f.key} ${have.get(f.key)}→${f.type}` : `+${f.key}`)).join(', ')}`)
  if (APPLY) {
    // Re-read: adding a two-way reference elsewhere may have created some of these already.
    const fresh = (await wix('GET', `/wix-data/v2/collections/${encodeURIComponent(src.id)}`)).collection
    const freshTypes = new Map(fresh.fields.map((f) => [f.key, f.type]))
    const stillMissing = missing.filter((f) => freshTypes.get(f.key) !== f.type)
    if (stillMissing.length) {
      const replace = new Set(stillMissing.map((f) => f.key))
      const current = { ...fresh, fields: fresh.fields.filter((f) => !replace.has(f.key)) }
      target.set(src.id, await updateCollection(current, stillMissing))
    }
  }
}

// ---------- 3. items ----------
console.log('\n3) Items')
let itemFailures = 0
for (const { collection: src, items } of exported) {
  if (!items.length) {
    console.log(`  - ${src.id}: no items`)
    continue
  }
  const multiRefKeys = new Set(src.fields.filter((f) => f.type === 'MULTI_REFERENCE').map((f) => f.key))
  const dataItems = items.map(({ _owner, _createdDate, _updatedDate, ...rest }) => {
    for (const k of multiRefKeys) delete rest[k]
    return { id: rest._id, data: rest }
  })
  const chunks = batches(dataItems)
  console.log(`  ↑ ${src.id}: ${dataItems.length} items in ${chunks.length} batch(es)`)
  if (!APPLY) continue
  for (const chunk of chunks) {
    const res = await wix('POST', '/wix-data/v2/bulk/items/save', { dataCollectionId: src.id, dataItems: chunk })
    const failed = (res.results || []).filter((r) => r.itemMetadata && r.itemMetadata.success === false)
    itemFailures += failed.length
    for (const f of failed.slice(0, 3)) console.error(`    ✗ ${f.itemMetadata.id}: ${JSON.stringify(f.itemMetadata.error)}`)
  }
}

// ---------- 4. multi-reference links ----------
// A two-way link appears on both sides (Projects.services ↔ Services.projects); insert it
// once, from whichever side carries more links (the other side may be truncated).
console.log('\n4) Multi-reference links')
const byId = new Map(exported.map((e) => [e.collection.id, e]))
const sides = []
for (const { collection: src, items } of exported) {
  for (const f of src.fields.filter((x) => x.type === 'MULTI_REFERENCE')) {
    const refs = []
    for (const it of items) for (const id of it[f.key] || []) refs.push({ referringItemFieldName: f.key, referringItemId: it._id, referencedItemId: id })
    const other = f.typeMetadata.multiReference
    const pair = [`${src.id}.${f.key}`, `${other.referencedCollectionId}.${other.referencingFieldKey}`].sort().join(' ↔ ')
    sides.push({ pair, collectionId: src.id, field: f.key, refs })
  }
}
const chosen = new Map()
for (const s of sides) {
  const cur = chosen.get(s.pair)
  if (!cur || s.refs.length > cur.refs.length) chosen.set(s.pair, s)
}
let refFailures = 0
for (const s of chosen.values()) {
  if (!s.refs.length) continue
  console.log(`  ↔ ${s.collectionId}.${s.field}: ${s.refs.length} links`)
  if (!APPLY || !byId.has(s.collectionId)) continue
  for (let i = 0; i < s.refs.length; i += 1000) {
    try {
      const res = await wix('POST', '/wix-data/v2/bulk/items/insert-references', {
        dataCollectionId: s.collectionId,
        dataItemReferences: s.refs.slice(i, i + 1000),
      })
      refFailures += res.bulkActionMetadata?.totalFailures || 0
    } catch (err) {
      refFailures += Math.min(1000, s.refs.length - i)
      console.error(`    ✗ ${err.message}`)
    }
  }
}

console.log(`\nDone${APPLY ? '' : ' (dry run — re-run with --apply to write)'}. Item failures: ${itemFailures}, link failures: ${refFailures}`)
