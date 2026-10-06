/**
 * Orchestrates the extract -> classify -> map -> match pipeline for
 * WordPress Service pages. Read-only: never writes to Wix. Supports a
 * `limit` option for the 5-page proof-of-concept run.
 */

import { getAllPages } from '../wordpress/pages'
import { extractContent } from '../wordpress/elementor'
import { classifyPage } from '../services/detectService'
import { normalizeService, normalizeCategory, type NormalizedService } from '../services/mapService'
import { matchService, type MatchResult } from '../services/matchService'
import { getAllExistingServices, type ExistingService } from '../wix/queryServices'
import type { WpPage } from '../wordpress/client'

export interface MigrationRow {
  wordpressId: number
  slug: string
  title: string
  url: string
  isService: boolean
  classificationConfidence: number
  classificationReasons: string[]
  action: 'CREATE' | 'SKIP' | 'REVIEW' | 'NOT_A_SERVICE'
  matchReason?: string
  matchedExistingSlug?: string
  mappingConfidence?: number
  unmappedSections?: { heading: string; itemCount: number }[]
  normalized?: NormalizedService
}

export interface MigrationRunResult {
  totalPagesScanned: number
  candidateServicePages: number
  toCreate: number
  toSkip: number
  toReview: number
  rows: MigrationRow[]
}

export async function runServicesAnalysis(opts: { limit?: number; slugs?: string[] } = {}): Promise<MigrationRunResult> {
  let pages: WpPage[] = await getAllPages()

  if (opts.slugs?.length) {
    pages = pages.filter((p) => opts.slugs!.includes(p.slug))
  } else if (opts.limit) {
    pages = pages.slice(0, opts.limit)
  }

  const existing: ExistingService[] = await getAllExistingServices()
  const rows: MigrationRow[] = []

  for (const page of pages) {
    const extracted = extractContent(page.content)
    const classification = classifyPage(page, extracted)

    if (!classification.isService) {
      rows.push({
        wordpressId: page.id,
        slug: page.slug,
        title: page.title,
        url: page.link,
        isService: false,
        classificationConfidence: classification.confidence,
        classificationReasons: classification.reasons,
        action: 'NOT_A_SERVICE',
      })
      continue
    }

    const normalized = normalizeService(page, extracted)
    const match: MatchResult = matchService(normalized, existing)

    rows.push({
      wordpressId: page.id,
      slug: page.slug,
      title: page.title,
      url: page.link,
      isService: true,
      classificationConfidence: classification.confidence,
      classificationReasons: classification.reasons,
      action: match.action,
      matchReason: match.reason,
      matchedExistingSlug: match.matchedExisting?.slug,
      mappingConfidence: normalized.mappingConfidence,
      unmappedSections: normalized.unmappedSections,
      normalized,
    })
  }

  const serviceRows = rows.filter((r) => r.isService)
  return {
    totalPagesScanned: pages.length,
    candidateServicePages: serviceRows.length,
    toCreate: serviceRows.filter((r) => r.action === 'CREATE').length,
    toSkip: serviceRows.filter((r) => r.action === 'SKIP').length,
    toReview: serviceRows.filter((r) => r.action === 'REVIEW').length,
    rows,
  }
}

export { normalizeCategory }
