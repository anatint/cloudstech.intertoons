/**
 * `npm run migration:services:dry-run` — full pipeline (extract, classify,
 * map, match against live Wix Services) and write JSON+CSV reports.
 * READ-ONLY: never writes to Wix. Supports `--limit=N` (POC run) and
 * `--slugs=a,b,c` (test specific pages).
 */
import { loadEnv } from './loadEnv'
loadEnv()

import { runServicesAnalysis } from '../migration/migrateServices'
import { writeReports } from '../reports/generateServicesReport'

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='))
  const slugsArg = process.argv.find((a) => a.startsWith('--slugs='))

  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined
  const slugs = slugsArg ? slugsArg.split('=')[1].split(',').map((s) => s.trim()) : undefined

  const result = await runServicesAnalysis({ limit, slugs })
  const { jsonPath, csvPath } = writeReports(result)

  console.log(`Scanned ${result.totalPagesScanned} pages.`)
  console.log(`  Service-page candidates: ${result.candidateServicePages}`)
  console.log(`  CREATE (missing, safe to add): ${result.toCreate}`)
  console.log(`  SKIP (already exists in Wix):  ${result.toSkip}`)
  console.log(`  REVIEW (needs human check):    ${result.toReview}`)
  console.log(`\nReport written:\n  ${jsonPath}\n  ${csvPath}`)
  console.log('\nNo Wix data was modified. This is a read-only dry-run.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
