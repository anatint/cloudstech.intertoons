import { NextResponse } from 'next/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Form handler for /contact (formType "contact") and /request-a-quote (formType "rfq").
 *
 * With an admin Wix API key (Cloudflare secret `WIX_API_KEY`) it:
 *  1. Saves the full lead to the `ContactLeads` CMS collection (insert = ADMIN).
 *  2. Creates a Wix CRM **Contact** — this also fires any "Contact Created" Wix
 *     Automation, which is how the notification email is sent (Wix has no direct
 *     "email an arbitrary address" REST API; the dashboard automation handles it).
 *
 * Auth uses the API key directly: `Authorization: <key>` + `wix-site-id` header.
 */

export const dynamic = 'force-dynamic'

const SITE_ID = process.env.WIX_SITE_ID || '4ffcfcd6-cb3f-4af1-959b-85296102be43'

type Json = Record<string, any>

const str = (v: any): string => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v))

async function wixFetch(url: string, body: Json, apiKey: string): Promise<Json> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
      'wix-site-id': SITE_ID,
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Wix ${res.status}: ${text.slice(0, 300)}`)
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { raw: text }
  }
}

function splitName(name: string): { first: string; last: string } {
  const parts = str(name).split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first: 'Website', last: 'Lead' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

export async function POST(req: Request) {
  let payload: Json
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  // Honeypot — silently accept (so bots think they succeeded) but do nothing.
  if (payload.honeypot || payload._hp || payload?.data?._hp || payload?.data?.honeypot) {
    return NextResponse.json({ ok: true })
  }

  const formType = str(payload.formType) || 'contact'
  // /contact posts flat fields; /request-a-quote nests everything under `data`.
  const d: Json = payload.data && typeof payload.data === 'object' ? payload.data : payload

  const name = str(d.name)
  const email = str(d.email)
  const phone = str(d.phone)
  const company = str(d.company)

  if (!email && !phone && !name) {
    return NextResponse.json({ ok: false, error: 'missing contact info' }, { status: 400 })
  }

  // --- Compose lead detail from both form shapes ---
  const projectTitle = str(d.projectTitle)
  const budget = str(d.budget)
  const projectTypes = Array.isArray(d.projectTypes) ? d.projectTypes.map(str).filter(Boolean) : []
  const features = Array.isArray(d.features) ? d.features.map(str).filter(Boolean) : []
  const service = str(d.service)
  const role = str(d.role)
  const timeline = str(d.timeline)
  const referral = str(d.referral)
  const contentReady = str(d.contentReady)
  const hasReferenceStore = str(d.hasReferenceStore)
  const message = str(d.message) || str(d.description)
  const extra = str(d.extraMessage)

  const projectType = projectTypes.length ? projectTypes.join(', ') : service
  const leadSource = formType === 'rfq' ? 'Request a Quote' : 'Contact Form'

  const apiKey = process.env.WIX_API_KEY
  if (!apiKey) {
    console.error('[forms] WIX_API_KEY not set — cannot save lead or create contact')
    return NextResponse.json({ ok: false, error: 'server not configured' }, { status: 503 })
  }

  // 1. Save the submission to the right CMS collection:
  //      Request a Quote → RFQResponses (dedicated fields)
  //      Contact form    → ContactLeads
  const isRfq = formType === 'rfq'
  const targetCollection = isRfq ? 'RFQResponses' : 'ContactLeads'

  let leadData: Json
  if (isRfq) {
    leadData = {
      name: name || email || phone,
      email,
      phone,
      company,
      role,
      projectTitle,
      projectType,
      budget,
      timeline,
      features: features.join(', '),
      projectDescription: message,
      referral,
      hasReferenceStore,
      contentReady,
      extraMessage: extra,
      leadSource,
      status: 'New',
    }
  } else {
    leadData = {
      name: name || email || phone,
      email,
      phone,
      company,
      projectType,
      budget,
      projectDescription: message,
      leadSource: referral ? `${leadSource} (${referral})` : leadSource,
      status: 'New',
    }
  }
  for (const k of Object.keys(leadData)) if (leadData[k] === '' || leadData[k] == null) delete leadData[k]

  let savedLead = false
  let contactCreated = false

  try {
    await wixFetch(
      'https://www.wixapis.com/wix-data/v2/items',
      { dataCollectionId: targetCollection, dataItem: { data: leadData } },
      apiKey,
    )
    savedLead = true
  } catch (e) {
    console.error(`[forms] ${targetCollection} insert failed:`, (e as Error).message)
  }

  // 2. Create a CRM contact (also fires the "Contact Created" automation → email).
  try {
    const { first, last } = splitName(name)
    const info: Json = { name: { first, last } }
    if (email) info.emails = { items: [{ tag: 'MAIN', email, primary: true }] }
    if (phone) info.phones = { items: [{ tag: 'MOBILE', phone, primary: true }] }
    if (company) info.company = company
    if (role) info.jobTitle = role
    await wixFetch(
      'https://www.wixapis.com/contacts/v4/contacts',
      { allowDuplicates: true, info },
      apiKey,
    )
    contactCreated = true
  } catch (e) {
    console.error('[forms] Contact create failed:', (e as Error).message)
  }

  if (!savedLead && !contactCreated) {
    return NextResponse.json({ ok: false, error: 'save failed' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, savedLead, contactCreated })
}
