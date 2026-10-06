import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'
import { buildSteps } from '@/lib/adminSchemaSteps'
import { isAdminCollection } from '@/lib/adminCollections'
import { sanitizeFields, fillObjectArrayFields } from '@/lib/aiFieldFill'

export const dynamic = 'force-dynamic'

async function requireAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const session = secret ? await verifySession(token, secret) : null
  return !!session
}

/**
 * Generates a complete draft item from a free-text prompt ("Add a new service
 * called Product Development in the Software Development category") — using
 * the model's own general knowledge to write realistic values for as many
 * fields as possible, not just fields literally restated from the prompt.
 * Every value is shown back to the admin on an editable review screen and
 * nothing is written to Wix until they confirm. If the model call fails, we
 * degrade silently to an empty result; the review screen still works with
 * blank fields either way.
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { collectionId?: string; prompt?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true, fields: {} })
  }

  const collectionId = body.collectionId || ''
  const prompt = (body.prompt || '').trim()
  const apiKey = process.env.WIX_API_KEY
  const openRouterKey = process.env.OPENROUTER_API_KEY

  if (!isAdminCollection(collectionId) || !prompt || !apiKey || !openRouterKey) {
    return NextResponse.json({ ok: true, fields: {} })
  }

  try {
    const { steps } = await buildSteps(collectionId, apiKey)
    const fieldProps: Record<string, any> = {}
    for (const s of steps) {
      if (s.kind === 'status') continue
      if (s.kind === 'reference') {
        fieldProps[s.key] = {
          type: 'array',
          items: { type: 'string' },
          description: `Item IDs for "${s.displayName}" — ONLY use IDs from this exact list, never invent one. Use an empty array if none fit: ${
            s.options?.map((o) => `${o.label} [${o.value}]`).join(', ') || '(none available)'
          }`,
        }
      } else if (s.kind === 'number') {
        fieldProps[s.key] = { type: ['number', 'null'], description: s.displayName }
      } else if (s.kind === 'boolean') {
        fieldProps[s.key] = { type: ['boolean', 'null'], description: s.displayName }
      } else if (s.kind === 'objectArray') {
        continue // filled separately below — see fillObjectArrayFields
      } else if (s.kind === 'array') {
        fieldProps[s.key] = { type: 'array', items: { type: 'string' }, description: s.displayName }
      } else {
        fieldProps[s.key] = { type: ['string', 'null'], description: s.displayName }
      }
    }

    // Strict mode forces the model to produce a value (or explicit null/[])
    // for every single field — without it, a "fill in what you can" tool call
    // lets a small model quietly skip fields it treats as decorative (hero
    // copy, stats, partner cards) even though nothing stops it from writing
    // them; confirmed via a live test where those exact fields came back
    // missing with room to spare in the token budget.
    const tool = {
      type: 'function' as const,
      function: {
        name: 'fill_fields',
        description: 'Fill in every field for the new item, using both the admin\'s message and your own general knowledge of the subject.',
        strict: true,
        parameters: { type: 'object', properties: fieldProps, required: Object.keys(fieldProps), additionalProperties: false },
      },
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openRouterKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are drafting a new "${collectionId}" item for a real business's website admin, from a short instruction. Call fill_fields exactly once. You must provide a value for every field listed — this includes hero/marketing copy, stats, and partner cards, which are just as important as the title and description, not optional extras. Use your own knowledge of the subject to write realistic, specific, well-written content, the same way a knowledgeable copywriter would — never limit yourself to only what's literally stated in the admin's message. Only use null (for text/number/boolean fields) or an empty array (for list fields) when you genuinely have no reasonable basis for a value. The one hard rule: for any field whose description lists exact existing item IDs, you may ONLY use an ID from that exact list — never invent one, and use an empty array if nothing in the list is a good fit.`,
          },
          { role: 'user', content: prompt },
        ],
        tools: [tool],
        tool_choice: { type: 'function', function: { name: 'fill_fields' } },
        max_tokens: 4000,
      }),
    })
    const raw = await res.text()
    if (!res.ok) throw new Error(`${res.status}: ${raw.slice(0, 300)}`)
    const json = JSON.parse(raw)
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0]
    const rawFields = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : {}
    const fields = sanitizeFields(steps, rawFields)

    const objectArrayFields = await fillObjectArrayFields(steps, prompt, collectionId, openRouterKey).catch(() => ({}))
    Object.assign(fields, objectArrayFields)

    return NextResponse.json({ ok: true, fields })
  } catch (e) {
    console.error('[ai-assistant/extract] failed (non-fatal, degrading to empty):', (e as Error).message)
    return NextResponse.json({ ok: true, fields: {} })
  }
}
