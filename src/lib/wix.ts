import { createClient, OAuthStrategy, ApiKeyStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * Single entry point for Wix CMS data access (mirrors `getPayload()`).
 *
 * Auth strategy, in order of preference:
 *  1. **Admin API key** (`WIX_API_KEY` + `WIX_SITE_ID`) — used for all reads when
 *     available (worker runtime + build, since both inject these env vars). Admin
 *     identity has high rate limits and the token never goes stale, which fixes the
 *     intermittent anonymous-visitor throttling that cached `notFound()` 404s on
 *     content-heavy detail pages. Reads are safe: content collections are public and
 *     we always filter `status = published`.
 *  2. **Visitor OAuth** (`WIX_CLIENT_ID`) — anonymous fallback if no key is present.
 */
function buildClient() {
  const apiKey = process.env.WIX_API_KEY
  const siteId = process.env.WIX_SITE_ID
  if (apiKey && siteId) {
    return createClient({ modules: { items }, auth: ApiKeyStrategy({ apiKey, siteId }) })
  }
  const clientId = process.env.WIX_CLIENT_ID
  if (!clientId) {
    throw new Error('No Wix auth: set WIX_API_KEY+WIX_SITE_ID (preferred) or WIX_CLIENT_ID.')
  }
  return createClient({ modules: { items }, auth: OAuthStrategy({ clientId }) })
}

let cached: ReturnType<typeof buildClient> | undefined

export function getWixClient() {
  return (cached ??= buildClient())
}

/** Drop the cached client so the next call rebuilds it (fresh token).
 *  Used by the data layer's retry path when a request fails. */
export function resetWixClient() {
  cached = undefined
}
