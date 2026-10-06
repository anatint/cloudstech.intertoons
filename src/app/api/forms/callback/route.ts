import { NextResponse } from 'next/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * "Request a Call Back" widget handler. Saves to the CallBackRequests CMS
 * collection. Captures country + IP + referer server-side (Cloudflare headers)
 * so they can't be spoofed by the client.
 */

export const dynamic = 'force-dynamic'

const SITE_ID = process.env.WIX_SITE_ID || '4ffcfcd6-cb3f-4af1-959b-85296102be43'
const COLLECTION = 'CallBackRequests'

type Json = Record<string, any>
const str = (v: any): string => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v))

export async function POST(req: Request) {
  let body: Json
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  // Honeypot — silently accept bots.
  if (body.honeypot || body._hp) return NextResponse.json({ ok: true })

  const name = str(body.name)
  const phone = str(body.phone)
  const message = str(body.message)
  if (!name || !phone) {
    return NextResponse.json({ ok: false, error: 'name and phone required' }, { status: 400 })
  }

  // Server-derived metadata (Cloudflare populates these headers).
  const h = req.headers
  const ipAddress = str(h.get('cf-connecting-ip') || (h.get('x-forwarded-for') || '').split(',')[0])
  const country = str(h.get('cf-ipcountry'))
  const userAgent = str(h.get('user-agent'))
  // Referer the visitor arrived from; fall back to the page they submitted from.
  const refererUrl = str(body.referer) || str(h.get('referer'))
  const pageUrl = str(body.pageUrl)

  const apiKey = process.env.WIX_API_KEY
  if (!apiKey) {
    console.error('[callback] WIX_API_KEY not set — cannot save request')
    return NextResponse.json({ ok: false, error: 'server not configured' }, { status: 503 })
  }

  const data: Json = {
    name,
    phone,
    message,
    country,
    ipAddress,
    refererUrl,
    pageUrl,
    userAgent,
    status: 'New',
  }
  for (const k of Object.keys(data)) if (data[k] === '' || data[k] == null) delete data[k]

  try {
    const res = await fetch('https://www.wixapis.com/wix-data/v2/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
        'wix-site-id': SITE_ID,
      },
      body: JSON.stringify({ dataCollectionId: COLLECTION, dataItem: { data } }),
    })
    if (!res.ok) {
      const t = await res.text()
      console.error('[callback] insert failed:', res.status, t.slice(0, 200))
      return NextResponse.json({ ok: false, error: 'save failed' }, { status: 502 })
    }
  } catch (e) {
    console.error('[callback] insert error:', (e as Error).message)
    return NextResponse.json({ ok: false, error: 'save failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
