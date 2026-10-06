/**
 * Writes the human-reviewable JSON + CSV dry-run reports for a migration run.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import type { MigrationRunResult, MigrationRow } from '../migration/migrateServices'

const REPORTS_DIR = new URL('../../data/reports/', import.meta.url)

function csvEscape(v: unknown): string {
  const s = v === undefined || v === null ? '' : String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows: MigrationRow[]): string {
  const headers = [
    'wordpressId', 'slug', 'title', 'url', 'isService', 'classificationConfidence',
    'action', 'matchReason', 'matchedExistingSlug', 'mappingConfidence', 'unmappedSectionCount',
  ]
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.wordpressId, r.slug, r.title, r.url, r.isService, r.classificationConfidence,
        r.action, r.matchReason ?? '', r.matchedExistingSlug ?? '', r.mappingConfidence ?? '',
        r.unmappedSections?.length ?? '',
      ]
        .map(csvEscape)
        .join(','),
    )
  }
  return lines.join('\n')
}

export function writeReports(result: MigrationRunResult, filenamePrefix = 'services-dry-run'): { jsonPath: string; csvPath: string } {
  mkdirSync(REPORTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const jsonUrl = new URL(`${filenamePrefix}-${timestamp}.json`, REPORTS_DIR)
  const csvUrl = new URL(`${filenamePrefix}-${timestamp}.csv`, REPORTS_DIR)

  const summary = {
    generatedAt: new Date().toISOString(),
    totalPagesScanned: result.totalPagesScanned,
    candidateServicePages: result.candidateServicePages,
    toCreate: result.toCreate,
    toSkip: result.toSkip,
    toReview: result.toReview,
    rows: result.rows,
  }

  writeFileSync(jsonUrl, JSON.stringify(summary, null, 2))
  writeFileSync(csvUrl, toCsv(result.rows))

  return { jsonPath: jsonUrl.pathname, csvPath: csvUrl.pathname }
}
