/**
 * WRITE PATH — creates missing Services in Wix. Only ever processes rows the
 * live re-analysis marks CREATE (never SKIP/REVIEW/NOT_A_SERVICE). Requires
 * `--confirm` to do anything at all; without it, prints what WOULD happen
 * and exits without touching Wix. Supports `--limit=N` for a small test
 * batch and `--slugs=a,b,c` to target specific pages.
 */
import { loadEnv } from './loadEnv'
loadEnv()

import { runServicesAnalysis } from '../migration/migrateServices'
import { createServiceInWix } from '../wix/insertServices'
import { writeFileSync, mkdirSync } from 'node:fs'

const REPORTS_DIR = new URL('../../data/reports/', import.meta.url)

async function main() {
  const apiKey = process.env.WIX_API_KEY
  if (!apiKey) {
    console.error('WIX_API_KEY not set — cannot write to Wix. Aborting.')
    process.exit(1)
  }

  const confirm = process.argv.includes('--confirm')
  const limitArg = process.argv.find((a) => a.startsWith('--limit='))
  const slugsArg = process.argv.find((a) => a.startsWith('--slugs='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined
  const slugs = slugsArg ? slugsArg.split('=')[1].split(',').map((s) => s.trim()) : undefined

  console.log('Re-checking current WordPress + Wix state before writing anything...')
  const result = await runServicesAnalysis({ slugs })
  let toCreate = result.rows.filter((r) => r.action === 'CREATE' && r.normalized)
  if (limit) toCreate = toCreate.slice(0, limit)

  console.log(`\n${toCreate.length} service(s) will be created in Wix (as draft):`)
  for (const r of toCreate) console.log(`  - ${r.slug} (${r.title})`)

  if (!confirm) {
    console.log('\nDry run only — pass --confirm to actually write these to Wix. Nothing was changed.')
    return
  }

  console.log('\n--confirm passed. Writing to Wix now...\n')

  const results: Array<{ slug: string; title: string; ok: boolean; wixId?: string; warnings?: string[]; error?: string }> = []
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  for (const row of toCreate) {
    try {
      const { serviceId, warnings } = await createServiceInWix(row.normalized!, apiKey)
      results.push({ slug: row.slug, title: row.title, ok: true, wixId: serviceId, warnings })
      console.log(`  CREATED ${row.slug} -> Wix id ${serviceId}${warnings.length ? ` (${warnings.length} warning(s))` : ''}`)
    } catch (e) {
      results.push({ slug: row.slug, title: row.title, ok: false, error: (e as Error).message })
      console.error(`  FAILED ${row.slug}: ${(e as Error).message}`)
    }
    await sleep(500)
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = new URL(`services-import-${timestamp}.json`, REPORTS_DIR)
  writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))

  const succeeded = results.filter((r) => r.ok).length
  console.log(`\nDone: ${succeeded}/${results.length} created successfully.`)
  console.log(`Report: ${reportPath.pathname}`)
  console.log('All created services were saved as status: draft — nothing is live/published yet.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
