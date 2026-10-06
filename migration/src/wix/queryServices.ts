/**
 * Read-only query of existing Wix Services — used for duplicate matching.
 * Reuses the app's own payload.ts facade, so it exercises the exact same
 * read path the live site uses (no separate Wix client wiring needed).
 */

import { getPayload } from '@/lib/payload'

export interface ExistingService {
  id: string
  title: string
  slug: string
  category?: string
}

export async function getAllExistingServices(): Promise<ExistingService[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({ collection: 'services', limit: 200 })
  return (docs as any[]).map((d) => ({
    id: d.id ?? d._id,
    title: d.title ?? '',
    slug: d.slug ?? '',
    category: d.category,
  }))
}
