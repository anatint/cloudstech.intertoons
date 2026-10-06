import { NextResponse } from 'next/server'
import { verifyPassword, signSession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const SITE_ID = process.env.WIX_SITE_ID || '4ffcfcd6-cb3f-4af1-959b-85296102be43'
const SESSION_TTL_SECONDS = 60 * 60 * 8 // 8 hours

// Used when no matching user is found, so the PBKDF2 check still runs and
// timing doesn't reveal whether an email exists in AdminUsers.
const DUMMY_SALT = 'AAAAAAAAAAAAAAAAAAAAAA=='
const DUMMY_HASH = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='

interface AdminUserRecord {
  email: string
  passwordSalt: string
  passwordHash: string
  iterations?: number
}

async function findAdminUser(email: string, apiKey: string): Promise<AdminUserRecord | null> {
  const res = await fetch('https://www.wixapis.com/wix-data/v2/items/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey, 'wix-site-id': SITE_ID },
    body: JSON.stringify({
      dataCollectionId: 'AdminUsers',
      query: { filter: { email: { $eq: email } }, paging: { limit: 1 } },
    }),
  })
  if (!res.ok) throw new Error(`Wix query ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json = await res.json() as { dataItems?: Array<{ data: AdminUserRecord }> }
  return json.dataItems?.[0]?.data ?? null
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Email and password are required.' }, { status: 400 })
  }

  const apiKey = process.env.WIX_API_KEY
  const sessionSecret = process.env.ADMIN_SESSION_SECRET
  if (!apiKey || !sessionSecret) {
    console.error('[admin/login] WIX_API_KEY or ADMIN_SESSION_SECRET not set')
    return NextResponse.json({ ok: false, error: 'Server not configured.' }, { status: 503 })
  }

  let user: AdminUserRecord | null
  try {
    user = await findAdminUser(email, apiKey)
  } catch (e) {
    console.error('[admin/login] lookup failed:', (e as Error).message)
    return NextResponse.json({ ok: false, error: 'Server error.' }, { status: 502 })
  }

  const valid = await verifyPassword(
    password,
    user?.passwordSalt || DUMMY_SALT,
    user?.passwordHash || DUMMY_HASH,
    user?.iterations || 100_000,
  )

  if (!user || !valid) {
    return NextResponse.json({ ok: false, error: 'Invalid email or password.' }, { status: 401 })
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const token = await signSession({ email, exp }, sessionSecret)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
  return response
}
