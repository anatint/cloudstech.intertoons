import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'
import { patchItem } from '@/lib/wixAdmin'

export const dynamic = 'force-dynamic'

async function requireAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const session = secret ? await verifySession(token, secret) : null
  return !!session
}

const ITEM_ID = 'fe59952f-0cb9-4ca5-8dff-6eb88a46d39d' // "Theme Customization"

/** One-time: fixes the only slug mismatch found vs WordPress (custom-shopify-themes -> custom-shopify-theme-services). */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const apiKey = process.env.WIX_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Server not configured.' }, { status: 503 })
  }
  const url = new URL(req.url)
  if (url.searchParams.get('confirm') !== 'yes') {
    return NextResponse.json({ ok: false, error: 'Pass ?confirm=yes to run this.' }, { status: 400 })
  }
  try {
    await patchItem('Services', ITEM_ID, { slug: 'custom-shopify-theme-services' }, apiKey)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 })
  }
}
