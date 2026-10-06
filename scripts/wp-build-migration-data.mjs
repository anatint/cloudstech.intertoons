#!/usr/bin/env node
/**
 * Builds the final migration payload from the WP extraction + Wix id/slug
 * list, applying slug aliases and the small set of manual FAQ corrections
 * found while reviewing pages earlier (mismatched Q&A pairs on the old
 * WordPress source, not a scraping bug).
 *
 * Usage: node scripts/wp-build-migration-data.mjs <wp-extract.json> <wix-services.json> <out.json>
 */
import fs from 'node:fs'

const SLUG_ALIASES = {
  'custom-shopify-theme-services': 'custom-shopify-themes',
}

// Manual overrides for known mismatched Q&A pairs on the WordPress source.
const FAQ_OVERRIDES = {
  'hire-langchain-developer-kochi': {
    'What types of projects can your LangChain developers handle?':
      'From AI chatbots and RAG systems to multi-step automation agents and enterprise AI integrations — we handle projects of any complexity.',
  },
  'business-ai-automation-kochi': {
    'Can AI automation integrate with existing software?':
      'Yes, we build seamless integrations between your existing enterprise software, CRMs, and internal systems.',
  },
}

const [wpPath, wixPath, outPath] = process.argv.slice(2)
const wp = JSON.parse(fs.readFileSync(wpPath, 'utf8'))
const wix = JSON.parse(fs.readFileSync(wixPath, 'utf8')).items
const wixBySlug = new Map(wix.map((w) => [w.slug, w]))

const out = []
for (const rec of wp) {
  if (!rec.found) continue
  const targetSlug = SLUG_ALIASES[rec.slug] || rec.slug
  const wixItem = wixBySlug.get(targetSlug)
  if (!wixItem) continue

  const overrides = FAQ_OVERRIDES[rec.slug] || {}
  const faqs = (rec.faqs || []).map((f) => ({
    question: f.question,
    answer: overrides[f.question] || f.answer,
  }))

  out.push({
    wpSlug: rec.slug,
    wixId: wixItem.id,
    seoTitle: rec.seoTitle || '',
    seoDescription: rec.seoDescription || '',
    schemaMarkup: rec.schema ? JSON.stringify(rec.schema) : '',
    faqs,
  })
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log(`Wrote ${out.length} service records to ${outPath}`)
