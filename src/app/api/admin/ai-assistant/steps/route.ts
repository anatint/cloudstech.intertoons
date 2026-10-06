import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'
import { buildSteps } from '@/lib/adminSchemaSteps'
import { isAdminCollection } from '@/lib/adminCollections'

export const dynamic = 'force-dynamic'

async function requireAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const session = secret ? await verifySession(token, secret) : null
  return !!session
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const apiKey = process.env.WIX_API_KEY
  if (!apiKey) {
    console.error('[ai-assistant/steps] WIX_API_KEY not set')
    return NextResponse.json({ ok: false, error: 'Server not configured.' }, { status: 503 })
  }
  const collectionId = new URL(req.url).searchParams.get('collectionId') || ''
  if (!isAdminCollection(collectionId)) {
    return NextResponse.json({ ok: false, error: `Unsupported collection: ${collectionId}` }, { status: 400 })
  }
  try {
    const result = await buildSteps(collectionId, apiKey)
    return NextResponse.json({ ok: true, collectionId, ...result })
  } catch (e) {
    console.error('[ai-assistant/steps] failed:', (e as Error).message)
    return NextResponse.json({ ok: false, error: `Could not load schema: ${(e as Error).message}` }, { status: 502 })
  }
}
