import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'
import { deleteItem } from '@/lib/wixAdmin'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function requireAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const session = secret ? await verifySession(token, secret) : null
  return !!session
}

/**
 * Removes duplicate FAQ items per service (same question text linked more
 * than once to the same service) — keeps the first occurrence, deletes the
 * rest. Deleting a FAQ item also clears it from the service's `faqs`
 * multi-reference automatically (Wix behavior).
 */
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

  const payload = await getPayload()
  const { docs: services } = await payload.find({ collection: 'services', limit: 100, depth: 2 })

  const toDelete: Array<{ serviceSlug: string; question: string; id: string }> = []
  for (const s of services as any[]) {
    const faqs = Array.isArray(s.faqs) ? s.faqs : []
    const seen = new Map<string, string>()
    for (const f of faqs) {
      const q = String(f?.question || '').trim().toLowerCase()
      const id = f?.id || f?._id
      if (!id) continue
      if (seen.has(q)) {
        toDelete.push({ serviceSlug: s.slug, question: q, id })
      } else {
        seen.set(q, id)
      }
    }
  }

  const results: Array<{ id: string; question: string; serviceSlug: string; ok: boolean; error?: string }> = []
  for (const dup of toDelete) {
    try {
      await deleteItem('FAQs', dup.id, apiKey)
      results.push({ ...dup, ok: true })
    } catch (e) {
      results.push({ ...dup, ok: false, error: (e as Error).message })
    }
    await sleep(500)
  }

  const failed = results.filter((r) => !r.ok)
  return NextResponse.json({ ok: failed.length === 0, totalDuplicatesFound: toDelete.length, deleted: results.length - failed.length, failed: failed.length, results })
}
