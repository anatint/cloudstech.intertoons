/**
 * `npm run migration:services:analyze` — classification + mapping only,
 * no Wix existing-service matching (works even without any Wix env vars).
 * Useful for a quick look at classification/mapping quality alone.
 */
import { loadEnv } from './loadEnv'
loadEnv()

import { getAllPages } from '../wordpress/pages'
import { extractContent } from '../wordpress/elementor'
import { classifyPage } from '../services/detectService'
import { normalizeService } from '../services/mapService'

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined

  let pages = await getAllPages()
  if (limit) pages = pages.slice(0, limit)

  let serviceCount = 0
  for (const page of pages) {
    const extracted = extractContent(page.content)
    const classification = classifyPage(page, extracted)
    if (!classification.isService) continue
    serviceCount += 1
    const normalized = normalizeService(page, extracted)
    console.log(
      `[${classification.confidence}] ${page.slug} — mapping ${normalized.mappingConfidence}, unmapped: ${normalized.unmappedSections.map((s) => s.heading).join('; ') || 'none'}`,
    )
  }
  console.log(`\n${serviceCount} / ${pages.length} pages classified as services.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
