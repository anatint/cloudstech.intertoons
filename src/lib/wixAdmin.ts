/**
 * Direct Wix Data REST calls using the admin API key (never the public OAuth
 * client). Mirrors the auth pattern already used in `api/forms/quote/route.ts`.
 */

const SITE_ID = process.env.WIX_SITE_ID || '4ffcfcd6-cb3f-4af1-959b-85296102be43'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function wixFetch<T = any>(path: string, body: unknown, apiKey: string, method: 'POST' | 'PATCH' = 'POST'): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://www.wixapis.com${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: apiKey, 'wix-site-id': SITE_ID },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    if (res.status === 429 && attempt < 8) {
      await sleep(Math.min(2000 * (attempt + 1), 15000))
      continue
    }
    if (!res.ok) throw new Error(`Wix ${path} ${res.status}: ${text.slice(0, 500)}`)
    return text ? JSON.parse(text) : ({} as T)
  }
}

export interface WixField {
  key: string
  displayName: string
  type: string
  systemField?: boolean
  typeMetadata?: { multiReference?: { referencedCollectionId: string } }
}

export interface WixCollectionSchema {
  id: string
  displayName: string
  displayField?: string
  fields: WixField[]
}

/** GET a collection's live field schema (admin key — works even on locked-down collections). */
export async function getCollectionSchema(collectionId: string, apiKey: string): Promise<WixCollectionSchema> {
  const res = await fetch(`https://www.wixapis.com/wix-data/v2/collections/${collectionId}`, {
    headers: { Authorization: apiKey, 'wix-site-id': SITE_ID },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Wix get-collection ${res.status}: ${text.slice(0, 500)}`)
  const json = JSON.parse(text)
  return json.collection ?? json
}

/** Query published items from a collection (admin key). Returns raw item data objects (with `_id`). */
export async function queryPublishedItems(collectionId: string, limit = 50, apiKey?: string): Promise<any[]> {
  if (!apiKey) throw new Error('apiKey required')
  const json = await wixFetch<{ dataItems?: Array<{ id: string; data: any }> }>(
    '/wix-data/v2/items/query',
    { dataCollectionId: collectionId, query: { filter: { status: 'published' }, paging: { limit } } },
    apiKey,
  )
  return (json.dataItems ?? []).map((i) => ({ id: i.id, ...i.data }))
}

/** Query all items regardless of status (for collections with no status field, e.g. BlogCategories). */
export async function queryAllItems(collectionId: string, limit = 50, apiKey?: string): Promise<any[]> {
  if (!apiKey) throw new Error('apiKey required')
  const json = await wixFetch<{ dataItems?: Array<{ id: string; data: any }> }>(
    '/wix-data/v2/items/query',
    { dataCollectionId: collectionId, query: { paging: { limit } } },
    apiKey,
  )
  return (json.dataItems ?? []).map((i) => ({ id: i.id, ...i.data }))
}

/**
 * Like `queryAllItems`, but pages through the ENTIRE collection via offset,
 * not just a single request — `queryAllItems` silently truncates at
 * whatever `limit` (max 1000 per request) is passed, which can hide real
 * data on large collections (e.g. FAQs, with 1000+ rows across all services).
 */
export async function queryAllItemsUnbounded(collectionId: string, apiKey: string, pageSize = 1000): Promise<any[]> {
  const all: any[] = []
  let offset = 0
  for (;;) {
    const json = await wixFetch<{ dataItems?: Array<{ id: string; data: any }> }>(
      '/wix-data/v2/items/query',
      { dataCollectionId: collectionId, query: { paging: { limit: pageSize, offset } } },
      apiKey,
    )
    const items = (json.dataItems ?? []).map((i) => ({ id: i.id, ...i.data }))
    all.push(...items)
    if (items.length < pageSize) break
    offset += pageSize
  }
  return all
}

/** Insert a new item into a collection (admin key). */
export async function insertItem(collectionId: string, data: Record<string, unknown>, apiKey: string): Promise<{ id: string }> {
  const json = await wixFetch<{ dataItem?: { id: string } }>(
    '/wix-data/v2/items',
    { dataCollectionId: collectionId, dataItem: { data } },
    apiKey,
  )
  if (!json.dataItem?.id) throw new Error('Wix insert: no item id returned')
  return { id: json.dataItem.id }
}

/** Permanently remove an item from a collection (admin key). Cannot be undone. */
export async function deleteItem(collectionId: string, itemId: string, apiKey: string): Promise<void> {
  const res = await fetch(
    `https://www.wixapis.com/wix-data/v2/items/${itemId}?dataCollectionId=${encodeURIComponent(collectionId)}`,
    { method: 'DELETE', headers: { Authorization: apiKey, 'wix-site-id': SITE_ID } },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Wix delete-item ${res.status}: ${text.slice(0, 500)}`)
  }
}

/**
 * Formally register a new field on a collection's schema. Undeclared fields
 * can still be written and admin-read, but the public visitor-token query
 * used by the live site only serializes declared schema fields — so any
 * field the frontend needs to read must be added here first.
 */
export async function createCollectionField(
  collectionId: string,
  key: string,
  displayName: string,
  type: string,
  apiKey: string,
): Promise<void> {
  await wixFetch('/wix-data/v2/collections/create-field', { dataCollectionId: collectionId, field: { key, displayName, type } }, apiKey)
}

/** Partial field update — only the listed fields change, everything else on the item is untouched. */
export async function patchItem(
  collectionId: string,
  itemId: string,
  fields: Record<string, unknown>,
  apiKey: string,
): Promise<void> {
  // The API's JSON representation of `Value` is the plain scalar itself
  // (e.g. `"value": "California"`), not a `{ stringValue }` wrapper object —
  // that wrapper is only the protobuf oneOf field name in the schema docs.
  const fieldModifications = Object.entries(fields).map(([fieldPath, value]) => ({
    fieldPath,
    action: 'SET_FIELD',
    setFieldOptions: { value },
  }))
  await wixFetch(
    `/wix-data/v2/items/${itemId}`,
    { dataCollectionId: collectionId, patch: { dataItemId: itemId, fieldModifications } },
    apiKey,
    'PATCH',
  )
}

/**
 * Link one referenced item into a MULTI_REFERENCE field. Wix's plain item
 * insert does NOT support multi-reference fields — each link must be added
 * separately via this endpoint, after the referring item already exists.
 */
export async function insertItemReference(
  collectionId: string,
  fieldKey: string,
  referringItemId: string,
  referencedItemId: string,
  apiKey: string,
): Promise<void> {
  await wixFetch(
    '/wix-data/v2/items/insert-reference',
    {
      dataCollectionId: collectionId,
      dataItemReference: { referringItemFieldName: fieldKey, referringItemId, referencedItemId },
    },
    apiKey,
  )
}
