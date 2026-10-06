/**
 * Builds a deterministic, ordered list of "steps" (one per creatable field) for
 * a Wix Data collection. This replaces having the AI model decide what to ask
 * about and what options exist — that was unreliable with a free/weak model
 * (it skipped reference fields, only offered single-select, etc). Everything
 * here is derived directly from the live Wix schema, so it's always complete
 * and always in sync.
 */

import { getCollectionSchema, queryAllItems, type WixField } from './wixAdmin'

export interface StepOption {
  value: string
  label: string
}

export type StepKind = 'text' | 'url' | 'number' | 'boolean' | 'array' | 'objectArray' | 'reference' | 'status'

export interface ObjectArrayField {
  key: string
  label: string
  type: 'text' | 'number'
}

export interface StepDef {
  key: string
  displayName: string
  kind: StepKind
  multiSelect: boolean
  options: StepOption[] | null
  skippable: boolean
  itemShape?: ObjectArrayField[]
}

/**
 * A handful of ARRAY-type fields store structured objects, not plain strings
 * (e.g. `stats` is `{ value, label }[]`, not `string[]`) — Wix's schema API
 * has no way to express that (ARRAY fields are schemaless JSON at rest), so
 * the shapes are hardcoded here from the real page components that read
 * them (see `ServiceDetailPage.tsx`). Used both to render a proper
 * multi-field editor instead of a flat string list, and to tell the AI
 * assistant the exact object shape to fill in.
 */
export const OBJECT_ARRAY_SHAPES: Record<string, ObjectArrayField[]> = {
  stats: [
    { key: 'value', label: 'Value', type: 'text' },
    { key: 'label', label: 'Label', type: 'text' },
  ],
  statsList: [
    { key: 'value', label: 'Value', type: 'text' },
    { key: 'label', label: 'Label', type: 'text' },
  ],
  heroLabels: [
    { key: 'value', label: 'Value', type: 'text' },
    { key: 'label', label: 'Label', type: 'text' },
  ],
  partnerCards: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
  ],
  offeringsList: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
  ],
}

const isSystemField = (f: WixField) => f.systemField || f.key.startsWith('_')
// Many collections (e.g. Technologies) have their own literal `status` field.
// The wizard always adds its own synthetic draft/publish step at the end, so
// asking about a real `status` field too would be redundant AND would let the
// user's free-text answer silently overwrite the actual publish decision when
// the create route merges collected fields. Exclude it from the walk.
const RESERVED_FIELD_KEYS = new Set(['status'])

export async function buildSteps(collectionId: string, apiKey: string) {
  const schema = await getCollectionSchema(collectionId, apiKey)
  const fields = schema.fields.filter((f) => !isSystemField(f))
  const imageFields = fields.filter((f) => f.type === 'IMAGE')
  const askable = fields.filter((f) => f.type !== 'IMAGE' && !RESERVED_FIELD_KEYS.has(f.key))
  const refFields = askable.filter((f) => f.type === 'MULTI_REFERENCE' && f.typeMetadata?.multiReference?.referencedCollectionId)

  const refOptionsByField = new Map<string, StepOption[]>()
  await Promise.all(
    refFields.map(async (f) => {
      const targetCollection = f.typeMetadata!.multiReference!.referencedCollectionId
      try {
        // `queryAllItems`, not published-only — many reference targets
        // (ProcessSteps, Technologies, Industries, etc.) are structural
        // building blocks, not standalone published content, and often have
        // no `status` field set at all. Filtering to `status: 'published'`
        // silently hid every real option on ProcessSteps (50 real items, 0
        // with that field set) even though they're perfectly valid to link.
        const [targetSchema, items] = await Promise.all([
          getCollectionSchema(targetCollection, apiKey).catch(() => null),
          queryAllItems(targetCollection, 100, apiKey),
        ])
        // Prefer the referenced collection's own display field (e.g. FAQs' is
        // "question", Testimonials' is "quote") — falling back through common
        // names only if that field is missing or the schema lookup failed.
        const displayField = targetSchema?.displayField
        refOptionsByField.set(
          f.key,
          items.map((it) => ({
            value: it.id,
            label: (displayField && it[displayField]) || it.title || it.name || it.question || it.quote || it.id,
          })),
        )
      } catch (e) {
        console.error(`[adminSchemaSteps] option fetch failed for ${targetCollection}:`, (e as Error).message)
        refOptionsByField.set(f.key, [])
      }
    }),
  )

  const steps: StepDef[] = askable.map((f) => {
    const skippable = f.key !== schema.displayField
    if (refOptionsByField.has(f.key)) {
      return { key: f.key, displayName: f.displayName, kind: 'reference', multiSelect: true, options: refOptionsByField.get(f.key) ?? [], skippable: true }
    }
    // Checked by field key, not `f.type` — these collections' schema
    // metadata registers stats/heroLabels/partnerCards as plain TEXT even
    // though the real stored data (and the page components that read them)
    // treat them as arrays of objects. The registered type can't be trusted
    // for these specific fields.
    if (OBJECT_ARRAY_SHAPES[f.key]) {
      return { key: f.key, displayName: f.displayName, kind: 'objectArray', multiSelect: false, options: null, skippable, itemShape: OBJECT_ARRAY_SHAPES[f.key] }
    }
    if (f.type === 'BOOLEAN') {
      return {
        key: f.key,
        displayName: f.displayName,
        kind: 'boolean',
        multiSelect: false,
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ],
        skippable,
      }
    }
    if (f.type === 'NUMBER') return { key: f.key, displayName: f.displayName, kind: 'number', multiSelect: false, options: null, skippable }
    if (f.type === 'ARRAY' || f.type === 'ARRAY_STRING') return { key: f.key, displayName: f.displayName, kind: 'array', multiSelect: false, options: null, skippable }
    if (f.type === 'URL') return { key: f.key, displayName: f.displayName, kind: 'url', multiSelect: false, options: null, skippable }
    return { key: f.key, displayName: f.displayName, kind: 'text', multiSelect: false, options: null, skippable }
  })

  steps.push({
    key: '__status',
    displayName: 'Publish status',
    kind: 'status',
    multiSelect: false,
    options: [
      { value: 'draft', label: 'Save as Draft' },
      { value: 'published', label: 'Publish Now' },
    ],
    skippable: false,
  })

  return {
    displayName: schema.displayName,
    steps,
    imageFields: imageFields.map((f) => ({ key: f.key, displayName: f.displayName })),
  }
}
