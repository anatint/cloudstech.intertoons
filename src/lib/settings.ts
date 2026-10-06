import { cache } from 'react'
import { getPayload } from './payload'

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Site-wide settings, editable from the Wix "Site Settings" collection (`global` entry). */
export interface SiteSettings {
  siteName: string
  tagline: string
  logo: string | null
  logoWhite: string | null
  phone: string
  phoneWhatsapp: string
  email: string
  emailSupport: string
  addressTitle: string
  addressLine: string
  mapUrl: string
  businessHours: string
  emergencySupport: string
  facebook: string
  twitter: string
  linkedin: string
  instagram: string
  youtube: string
  baseUrl: string
  defaultSeoTitle: string
  defaultSeoDescription: string
  ogImage: string
  orgTelephone: string
  leadNotifyEmail: string
  headCode: string
  bodyEndCode: string
  sitemapUrl: string
  /* Floating "Request a Call Back" widget (all stored as text in the CMS). */
  callbackEnabled: string
  callbackButtonTitle: string
  callbackButtonColor: string
  callbackButtonPosition: string
  callbackButtonStyle: string
  callbackHeading: string
  callbackSubtext: string
  callbackMaxPerSession: string
  callbackPopupFrequencySec: string
  callbackAutoOpenDelaySec: string
}

/** Current hardcoded values — used when a CMS field is blank, so nothing regresses. */
const DEFAULTS: SiteSettings = {
  siteName: 'Intertoons',
  tagline: 'We help businesses grow with AI, automation and digital solutions that create real impact.',
  logo: '/logo.png',
  logoWhite: '/logo-white.png',
  phone: '+91 484 123 4567',
  phoneWhatsapp: '+91 98765 43210',
  email: 'hello@intertoons.com',
  emailSupport: 'support@intertoons.com',
  addressTitle: 'Intertoons Internet Services Pvt. Ltd.',
  addressLine: 'Kochi, Kerala — 682 030, India',
  mapUrl: 'https://maps.google.com/?q=Kochi+Kerala',
  businessHours: 'Mon – Fri: 9:00 AM – 6:00 PM IST',
  emergencySupport: 'Emergency support: 24/7',
  facebook: 'https://facebook.com/intertoons',
  twitter: 'https://twitter.com/intertoons',
  linkedin: 'https://linkedin.com/company/intertoons',
  instagram: 'https://instagram.com/intertoons',
  youtube: 'https://youtube.com/@intertoons',
  baseUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://intertoons.com',
  defaultSeoTitle: 'Intertoons',
  defaultSeoDescription:
    'Full-service digital agency specialising in AI development, AI automations, Shopify, e-commerce & mobile apps.',
  ogImage: '/og-default.jpg',
  orgTelephone: '+91-9747-443300',
  leadNotifyEmail: 'hello@intertoons.com',
  headCode: '',
  bodyEndCode: '',
  sitemapUrl: '',
  callbackEnabled: 'true',
  callbackButtonTitle: 'Request a Call Back',
  callbackButtonColor: '#0095da',
  callbackButtonPosition: 'bottom-center',
  callbackButtonStyle: 'pill',
  callbackHeading: 'Request a Call Back',
  callbackSubtext: "Leave your number and we'll call you right back.",
  callbackMaxPerSession: '2',
  callbackPopupFrequencySec: '120',
  callbackAutoOpenDelaySec: '15',
}

/** Wix media-image fields arrive as `{ url }`; text/url fields as strings. */
function val(raw: any, key: string): any {
  const v = raw?.[key]
  if (v && typeof v === 'object' && 'url' in v) return v.url || null
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

/**
 * Fetch the global Site Settings entry, merged over the defaults. React-`cache`d
 * so multiple components in one render share a single Wix request.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  let raw: any = {}
  try {
    const { docs } = await (await getPayload()).find({
      collection: 'site-settings',
      where: { slug: { equals: 'global' } },
      limit: 1,
    })
    raw = docs[0] ?? {}
  } catch {
    /* fall back to defaults */
  }
  const out = { ...DEFAULTS }
  for (const key of Object.keys(DEFAULTS) as (keyof SiteSettings)[]) {
    const v = val(raw, key)
    if (v !== undefined && v !== null) (out as any)[key] = v
  }
  return out
})

/**
 * Fetch a Site Pages entry by slug (e.g. 'products', 'portfolio', 'blog') — used to make
 * listing-page heroes + SEO editable from the CMS. Returns `{}` if not found.
 * The returned `p(key, fallback)` helper reads a trimmed field or the fallback.
 */
export const getPage = cache(async (slug: string): Promise<any> => {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1 })
    return docs[0] ?? {}
  } catch {
    return {}
  }
})

/** Fetch the single-row Contact Page settings entry. Also holds `budgetRanges`
 *  (a shared array field), reused by both /contact and /request-a-quote. */
export const getContactPage = cache(async (): Promise<any> => {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'contact-page-settings', limit: 1 })
    return docs[0] ?? {}
  } catch {
    return {}
  }
})

/** Both CTA-only pages should land visitors directly on their form, not the
 *  hero above it — append the anchor whenever a CMS link field points there
 *  (a raw "/request-a-quote" with no anchor, e.g. from an older CSV import). */
export function withQuoteAnchor(href: string): string {
  return href === '/request-a-quote' ? '/request-a-quote#quote-form' : href
}

/** Same idea for Contact, and also self-heals CMS link fields still holding
 *  the old hardcoded "/contact" (from before the page's slug became editable). */
export function withContactAnchor(href: string, contactHref: string): string {
  return href === '/contact' || href === contactHref ? `${contactHref}#contact-form` : href
}

/** The contact page's URL is editor-controlled via its `slug` field (e.g. "contact-us"),
 *  not a fixed route — resolved dynamically by the [...slug] catch-all. */
export async function getContactHref(): Promise<string> {
  return `/${field(await getContactPage(), 'slug', 'contact-us')}`
}

/** Pick a trimmed string field from a Site Pages entry, else the fallback.
 *  Some fields survived a CSV re-import with an all-lowercase key
 *  (e.g. `heroBadge` -> `herobadge`), so fall back to that variant too. */
export function field(entry: any, key: string, fallback = ''): string {
  const v = entry?.[key] ?? entry?.[key.toLowerCase()]
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

/** The 5 social links as an array (for the footer / schema `sameAs`). */
export function socialLinks(s: SiteSettings) {
  return [
    { key: 'facebook', href: s.facebook },
    { key: 'twitter', href: s.twitter },
    { key: 'linkedin', href: s.linkedin },
    { key: 'instagram', href: s.instagram },
    { key: 'youtube', href: s.youtube },
  ].filter((x) => x.href)
}
