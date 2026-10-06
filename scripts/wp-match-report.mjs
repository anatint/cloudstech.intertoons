#!/usr/bin/env node
/**
 * Dry-run diff: matches the WP extraction report against the live Wix
 * Services id/slug list and prints a per-item summary. No writes anywhere.
 *
 * Usage: node scripts/wp-match-report.mjs <wp-extract.json> <wix-services.json>
 */
import fs from 'node:fs'

const SLUG_ALIASES = {
  'custom-shopify-theme-services': 'custom-shopify-themes',
}

const [wpPath, wixPath] = process.argv.slice(2)
const wp = JSON.parse(fs.readFileSync(wpPath, 'utf8'))
const wix = JSON.parse(fs.readFileSync(wixPath, 'utf8')).items
const wixBySlug = new Map(wix.map((w) => [w.slug, w]))

const matched = []
const unmatched = []

for (const rec of wp) {
  if (!rec.found) {
    unmatched.push({ slug: rec.slug, reason: 'not found on WP' })
    continue
  }
  const targetSlug = SLUG_ALIASES[rec.slug] || rec.slug
  const wixItem = wixBySlug.get(targetSlug)
  if (!wixItem) {
    unmatched.push({ slug: rec.slug, reason: 'no matching Wix item' })
    continue
  }
  matched.push({
    wpSlug: rec.slug,
    wixId: wixItem.id,
    wixSlug: wixItem.slug,
    seoTitle: rec.seoTitle,
    seoDescriptionLen: (rec.seoDescription || '').length,
    hasSchema: !!rec.schema,
    faqCount: rec.faqs?.length || 0,
  })
}

console.log(`Matched: ${matched.length} / Unmatched: ${unmatched.length}\n`)
console.log('slug'.padEnd(55), 'seoTitle?'.padEnd(10), 'schema?'.padEnd(8), 'faqs')
for (const m of matched) {
  console.log(
    m.wpSlug.slice(0, 54).padEnd(55),
    (m.seoTitle ? 'yes' : 'NO').padEnd(10),
    (m.hasSchema ? 'yes' : 'NO').padEnd(8),
    m.faqCount,
  )
}
if (unmatched.length) {
  console.log('\nUnmatched:')
  for (const u of unmatched) console.log(' -', u.slug, `(${u.reason})`)
}

fs.writeFileSync('wp-match-report-full.json', JSON.stringify({ matched, unmatched }, null, 2))
console.log('\nFull detail written to wp-match-report-full.json')
