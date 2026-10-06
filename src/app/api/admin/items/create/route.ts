import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'
import { insertItem, insertItemReference } from '@/lib/wixAdmin'
import { buildSteps } from '@/lib/adminSchemaSteps'
import { isAdminCollection } from '@/lib/adminCollections'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const session = secret ? await verifySession(token, secret) : null
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.WIX_API_KEY
  if (!apiKey) {
    console.error('[admin/items/create] WIX_API_KEY not set')
    return NextResponse.json({ ok: false, error: 'Server not configured.' }, { status: 503 })
  }

  let body: { collectionId?: string; fields?: Record<string, unknown>; status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const collectionId = body.collectionId || ''
  if (!isAdminCollection(collectionId)) {
    return NextResponse.json({ ok: false, error: `Unsupported collection: ${collectionId}` }, { status: 400 })
  }
  const fields = body.fields && typeof body.fields === 'object' ? body.fields : {}
  const status = body.status === 'published' ? 'published' : 'draft'

  try {
    // Wix's plain item insert doesn't support MULTI_REFERENCE fields — split
    // them out (using the live schema as the source of truth for which keys
    // are references) and link them separately after the item exists.
    const { steps } = await buildSteps(collectionId, apiKey)
    const refKeys = new Set(steps.filter((s) => s.kind === 'reference').map((s) => s.key))

    const plainData: Record<string, unknown> = { status }
    const refData: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(fields)) {
      if (refKeys.has(key) && Array.isArray(value)) refData[key] = value.filter((v): v is string => typeof v === 'string')
      else plainData[key] = value
    }

    const { id } = await insertItem(collectionId, plainData, apiKey)

    const refErrors: string[] = []
    await Promise.all(
      Object.entries(refData).flatMap(([fieldKey, ids]) =>
        ids.map((referencedItemId) =>
          insertItemReference(collectionId, fieldKey, id, referencedItemId, apiKey).catch((e) => {
            console.error(`[admin/items/create] reference link failed for ${fieldKey} -> ${referencedItemId}:`, (e as Error).message)
            refErrors.push(fieldKey)
          }),
        ),
      ),
    )

    if (refErrors.length) {
      return NextResponse.json({ ok: true, id, warning: `Item created, but some links failed to attach: ${[...new Set(refErrors)].join(', ')}. You can add them manually in Wix.` })
    }
    return NextResponse.json({ ok: true, id })
  } catch (e) {
    console.error('[admin/items/create] insert failed:', (e as Error).message)
    return NextResponse.json({ ok: false, error: 'Failed to create item.' }, { status: 502 })
  }
}
