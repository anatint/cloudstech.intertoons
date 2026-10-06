import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'

/**
 * ISR/incremental cache backed by Cloudflare KV (binding `NEXT_INC_CACHE_KV`)
 * + a Durable Object revalidation queue (binding `NEXT_CACHE_DO_QUEUE`).
 *
 * The KV cache alone serves pages fast but never refreshes — background ISR
 * revalidation needs a queue to actually regenerate stale pages on the Worker.
 * With both, pages serve from cache AND a CMS edit appears within the page's
 * `revalidate` window (60s) without a redeploy.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: doQueue,
})
