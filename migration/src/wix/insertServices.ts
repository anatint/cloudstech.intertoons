/**
 * WRITE PATH — creates a new Wix Services record (and its MULTI_REFERENCE
 * children: FAQs, ProcessSteps, Industries, Technologies) from a
 * NormalizedService. Not wired into any npm script yet — this module is
 * intentionally unused until the user explicitly approves an import run.
 * When wired up, it must only ever be called for rows the dry-run report
 * marked CREATE (never SKIP/REVIEW), and only after a human has reviewed
 * the report.
 *
 * Wix's plain item insert does not support MULTI_REFERENCE fields — each
 * one requires: (1) find-or-create the referenced child item, then
 * (2) insertItemReference to link it to the new Service. Confirmed
 * collection IDs (from src/lib/payload.ts COLLECTION_MAP and
 * src/lib/adminSchemaSteps.ts): FAQs, ProcessSteps, Industries, Technologies.
 */

import { insertItem, insertItemReference, queryAllItems } from '@/lib/wixAdmin'
import type { NormalizedService } from '../services/mapService'

const SERVICES_COLLECTION = 'Services'

const CHILD_COLLECTIONS = {
  faqs: 'FAQs',
  processFlow: 'ProcessSteps',
  industries: 'Industries',
  technologies: 'Technologies',
} as const

export interface WriteResult {
  serviceId: string
  warnings: string[]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Wix enforces a per-minute request quota (WDE0014). Firing a batch of
 * creates/links via Promise.all was fast but burst well past that quota on a
 * full ~170-service run — sequential with a small gap between calls stays
 * comfortably under it (wixFetch's own retry-with-backoff in wixAdmin.ts
 * still covers the rare remaining 429).
 */
async function sequentialMap<T, R>(items: T[], fn: (item: T) => Promise<R>, delayMs = 350): Promise<R[]> {
  const results: R[] = []
  for (const item of items) {
    results.push(await fn(item))
    await sleep(delayMs)
  }
  return results
}

function normalizeForDedup(s: string): string {
  return s.trim().toLowerCase()
}

/**
 * Industries/Technologies are a SHARED taxonomy reused across services —
 * reuse an existing child item by name instead of creating a duplicate.
 * FAQs/ProcessSteps are per-service content — always create fresh.
 */
async function findOrCreateSharedItem(
  collectionId: string,
  nameField: string,
  name: string,
  apiKey: string,
  cache: Map<string, string>,
): Promise<string> {
  const key = `${collectionId}:${normalizeForDedup(name)}`
  const cached = cache.get(key)
  if (cached) return cached

  const existing = await queryAllItems(collectionId, 200, apiKey)
  const match = existing.find((item) => normalizeForDedup(String(item[nameField] ?? '')) === normalizeForDedup(name))
  if (match) {
    cache.set(key, match.id ?? match._id)
    return match.id ?? match._id
  }

  const { id } = await insertItem(collectionId, { [nameField]: name }, apiKey)
  cache.set(key, id)
  return id
}

async function linkAll(
  serviceId: string,
  fieldKey: string,
  childIds: string[],
  apiKey: string,
  warnings: string[],
): Promise<void> {
  await sequentialMap(childIds, (childId) =>
    insertItemReference(SERVICES_COLLECTION, fieldKey, serviceId, childId, apiKey).catch((e) => {
      warnings.push(`Failed to link ${fieldKey} -> ${childId}: ${(e as Error).message}`)
    }),
  )
}

/**
 * Creates one Service record from a normalized, already-classified-as-CREATE
 * WordPress page. Sets status: 'draft' — never auto-publishes; the user
 * decides when a migrated page goes live in Wix.
 */
export async function createServiceInWix(service: NormalizedService, apiKey: string): Promise<WriteResult> {
  const warnings: string[] = []

  const plainData: Record<string, unknown> = {
    title: service.title,
    slug: service.slug,
    status: 'draft',
  }
  if (service.shortDescription) plainData.shortDescription = service.shortDescription
  if (service.offeringsList?.length) plainData.offeringsList = service.offeringsList
  if (service.whyChoose?.length) plainData.whyChoose = service.whyChoose
  if (service.partnerCards?.length) plainData.partnerCards = service.partnerCards
  if (service.category) plainData.category = service.category
  if (service.heroLabels?.length) plainData.heroLabels = service.heroLabels
  if (service.stats?.length) plainData.stats = service.stats
  if (service.seoTitle) plainData.seoTitle = service.seoTitle
  if (service.seoDescription) plainData.seoDescription = service.seoDescription
  if (service.schemaMarkup) plainData.schemaMarkup = service.schemaMarkup
  if (service.heroHeadline) plainData.heroHeadline = service.heroHeadline
  if (service.heroHeadlineHighlight) plainData.heroHeadlineHighlight = service.heroHeadlineHighlight

  const { id: serviceId } = await insertItem(SERVICES_COLLECTION, plainData, apiKey)

  // Per-service reference children (FAQs, ProcessSteps) — always create fresh,
  // never reused across services.
  if (service.faqs?.length) {
    const faqIds = await sequentialMap(service.faqs, (f) =>
      insertItem(CHILD_COLLECTIONS.faqs, { question: f.question, answer: f.answer }, apiKey)
        .then((r) => r.id)
        .catch((e) => {
          warnings.push(`Failed to create FAQ '${f.question}': ${(e as Error).message}`)
          return null
        }),
    )
    await linkAll(serviceId, 'faqs', faqIds.filter((id): id is string => Boolean(id)), apiKey, warnings)
  }

  if (service.processFlow?.length) {
    const stepIds = await sequentialMap(service.processFlow, (step) =>
      insertItem(CHILD_COLLECTIONS.processFlow, { stepNumber: step.stepNumber, title: step.title, description: step.description }, apiKey)
        .then((r) => r.id)
        .catch((e) => {
          warnings.push(`Failed to create ProcessStep '${step.title}': ${(e as Error).message}`)
          return null
        }),
    )
    await linkAll(serviceId, 'processFlow', stepIds.filter((id): id is string => Boolean(id)), apiKey, warnings)
  }

  // Shared taxonomy children (Industries, Technologies) — find-or-create by
  // name so repeated migration runs don't create duplicate taxonomy entries.
  if (service.industries?.length) {
    const cache = new Map<string, string>()
    const industryIds = await sequentialMap(service.industries, (name) =>
      findOrCreateSharedItem(CHILD_COLLECTIONS.industries, 'name', name, apiKey, cache).catch((e) => {
        warnings.push(`Failed to find-or-create Industry '${name}': ${(e as Error).message}`)
        return null
      }),
    )
    await linkAll(serviceId, 'industries', industryIds.filter((id): id is string => Boolean(id)), apiKey, warnings)
  }

  if (service.technologies?.length) {
    const cache = new Map<string, string>()
    const techIds = await sequentialMap(service.technologies, (name) =>
      findOrCreateSharedItem(CHILD_COLLECTIONS.technologies, 'name', name, apiKey, cache).catch((e) => {
        warnings.push(`Failed to find-or-create Technology '${name}': ${(e as Error).message}`)
        return null
      }),
    )
    await linkAll(serviceId, 'technologies', techIds.filter((id): id is string => Boolean(id)), apiKey, warnings)
  }

  return { serviceId, warnings }
}
