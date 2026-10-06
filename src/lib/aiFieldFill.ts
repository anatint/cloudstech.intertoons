import type { StepDef } from './adminSchemaSteps'

/**
 * OpenRouter doesn't reliably enforce the `strict` JSON-schema constraints we
 * send (confirmed live: a free-text field like `stats` — which must be
 * `{value,label}[]` — came back as a single descriptive sentence instead of
 * an array). Re-validate every value against its expected shape before it
 * ever reaches the admin's screen; anything malformed is dropped rather than
 * silently shown broken or corrupting the create request.
 */
export function sanitizeFields(steps: StepDef[], raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const s of steps) {
    if (s.kind === 'status' || !(s.key in raw)) continue
    const v = raw[s.key]
    if (v === null || v === undefined) continue
    if (s.kind === 'objectArray') {
      continue // handled separately by fillObjectArrayFields — tool-call output for these is unreliable
    } else if (s.kind === 'array' || s.kind === 'reference') {
      if (!Array.isArray(v)) continue
      const arr = v.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
      if (arr.length) out[s.key] = arr
    } else if (s.kind === 'number') {
      if (typeof v === 'number') out[s.key] = v
    } else if (s.kind === 'boolean') {
      if (typeof v === 'boolean') out[s.key] = v
    } else if (typeof v === 'string' && v.trim() !== '') {
      out[s.key] = v
    }
  }
  return out
}

// Alternate names the model tends to use instead of our exact field keys —
// matched case-insensitively before ever falling back to raw position.
const KEY_ALIASES: Record<string, string[]> = {
  value: ['stat', 'number', 'metric', 'figure', 'amount'],
  label: ['name', 'text', 'description', 'stat'],
  title: ['name', 'heading', 'partnername', 'partner'],
  description: ['desc', 'text', 'detail', 'benefit', 'summary'],
}

/**
 * Maps one model-generated row onto the exact expected keys — by exact key
 * match first, then a case-insensitive alias lookup, and only falls back to
 * raw positional order (first value → first shape key, etc.) if nothing
 * named matches at all. Pure positional mapping was the original approach,
 * but broke silently whenever the model wrote `{label, value}` instead of
 * `{value, label}` (or any other key order) — same values, wrong slots,
 * which is exactly the kind of bug that makes a field "fill in" but render
 * nothing usable on the live page.
 */
export function mapRowToShape(row: Record<string, unknown>, itemShape: { key: string }[]): Record<string, string> {
  const rowKeys = Object.keys(row)
  const used = new Set<string>()
  const out: Record<string, string> = {}
  const unmatched: string[] = []

  for (const { key } of itemShape) {
    let foundKey = rowKeys.find((k) => !used.has(k) && k === key)
    if (!foundKey) foundKey = rowKeys.find((k) => !used.has(k) && k.toLowerCase() === key.toLowerCase())
    if (!foundKey) {
      const aliases = KEY_ALIASES[key] || []
      foundKey = rowKeys.find((k) => !used.has(k) && aliases.includes(k.toLowerCase()))
    }
    if (foundKey) {
      used.add(foundKey)
      out[key] = String(row[foundKey])
    } else {
      unmatched.push(key)
    }
  }

  // Nothing named matched at all (model invented completely different keys) —
  // fall back to whatever values are left, in the order they appear.
  if (unmatched.length === itemShape.length) {
    const leftoverValues = rowKeys.filter((k) => !used.has(k)).map((k) => row[k])
    unmatched.forEach((key, i) => {
      if (leftoverValues[i] !== undefined) out[key] = String(leftoverValues[i])
    })
  }

  return out
}

/**
 * Fills `objectArray` fields (e.g. `stats`, `heroLabels`, `partnerCards` —
 * arrays of `{value,label}`-style objects) via a separate plain-text
 * completion instead of a tool call. Tool-calling reliably drops or mangles
 * nested array-of-object arguments for this model through OpenRouter, no
 * matter how the JSON schema is written (confirmed via repeated live tests);
 * a plain "reply with this JSON" prompt reliably produces real object
 * arrays, it just doesn't always keep the exact key names asked for — so
 * each row is re-mapped onto the expected keys by name (see mapRowToShape)
 * instead of trusting the model's own key order.
 */
export async function fillObjectArrayFields(
  steps: StepDef[],
  prompt: string,
  collectionId: string,
  openRouterKey: string
): Promise<Record<string, unknown>> {
  const objSteps = steps.filter((s) => s.kind === 'objectArray' && s.itemShape)
  if (!objSteps.length) return {}

  const MIN_ITEMS = 4
  const skeleton: Record<string, unknown> = {}
  for (const s of objSteps) {
    const exampleRow = Object.fromEntries(s.itemShape!.map((f) => [f.key, f.type === 'number' ? 1 : `<realistic ${f.label.toLowerCase()}>`]))
    skeleton[s.key] = Array.from({ length: MIN_ITEMS }, () => exampleRow)
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openRouterKey}` },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Generate realistic marketing content for a new "${collectionId}" item: "${prompt}".\n\nRespond with ONLY this exact JSON structure, nothing else — no markdown, no code fence, no explanation. Keep the same top-level keys and the same number of keys inside each object as shown below; only the placeholder text in angle brackets should change. Every array must have AT LEAST ${MIN_ITEMS} distinct, realistic entries — never fewer:\n\n${JSON.stringify(skeleton, null, 2)}`,
        },
      ],
      max_tokens: 1600,
    }),
  })
  if (!res.ok) return {}
  const json = (await res.json().catch(() => null)) as any
  const content: string | undefined = json?.choices?.[0]?.message?.content
  if (!content) return {}
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) return {}
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(match[0])
  } catch {
    return {}
  }

  const out: Record<string, unknown> = {}
  for (const s of objSteps) {
    const rawRows = parsed[s.key]
    if (!Array.isArray(rawRows)) continue
    const keys = s.itemShape!.map((f) => f.key)
    const rows = rawRows
      .filter((row): row is Record<string, unknown> => !!row && typeof row === 'object' && !Array.isArray(row))
      .map((row) => mapRowToShape(row, s.itemShape!))
      .filter((row) => keys.every((k) => row[k] && row[k] !== ''))
    if (rows.length) out[s.key] = rows
  }
  return out
}
