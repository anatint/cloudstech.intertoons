#!/usr/bin/env node
/**
 * Extraction for service pages that don't exist in Wix yet — pulls enough to
 * CREATE a new Services item: hero title, slug, short description, whyChoose
 * bullets, SEO title/description, JSON-LD schema, and FAQs.
 *
 * Read-only against the old WordPress site. Writes a JSON report; no Wix
 * writes here. Usage: node scripts/wp-extract-new-services.mjs [output.json]
 */

const WP_BASE = 'https://intertoons.com/wp-json/wp/v2/pages'
const CATEGORY = 'Software Development'

const SLUGS = [
  'ecommerce-website-app-development-company',
  'cochin-web-design-company',
  'custom-cms-websites',
  'wix-development',
  'hire-wix-website-designers-in-india-intertoons-a-wix-legend-partner',
  'website-migration',
  'ecommerce-seo',
]

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractHeroTitle(html) {
  // Hero title uses class="crafto-heading" but the tag level (h1/h2/h3) varies
  // by template variant — match any heading level and take the first hit.
  const m = html.match(/<h[1-6] class="crafto-heading"><span class="crafto-primary-title">([\s\S]*?)<\/span><\/h[1-6]>/)
  return m ? stripTags(m[1]) : ''
}

function extractShortDescription(html) {
  // First text-editor widget after the hero heading.
  const h1Idx = html.search(/<h[1-6] class="crafto-heading"/)
  if (h1Idx === -1) return ''
  const chunk = html.slice(h1Idx, h1Idx + 4000)
  const m = chunk.match(/elementor-widget-text-editor[\s\S]*?<div class="elementor-widget-container">([\s\S]*?)<\/div>\s*<\/div>/)
  if (!m) return ''
  return stripTags(m[1])
}

function extractWhyChoose(html) {
  const statsIdx = html.indexOf('Projects Delivered')
  const faqIdx = html.indexOf('Frequently asked questions')
  if (statsIdx === -1 || faqIdx === -1 || faqIdx < statsIdx) return []
  const section = html.slice(statsIdx, faqIdx)
  const items = []
  const re = /elementor-icon-box-title">\s*<span >\s*([\s\S]*?)\s*<\/span>\s*<\/span>/g
  let m
  while ((m = re.exec(section))) {
    const text = stripTags(m[1])
    if (text) items.push(text)
  }
  return items
}

function extractFaqs(html) {
  const faqs = []
  const items = html.split('elementor-accordion-item').slice(1)
  for (const chunk of items) {
    const titleMatch = chunk.match(/<div class="title">([\s\S]*?)<\/div>/)
    const contentMatch = chunk.match(/<div class="panel-tab-content">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)
    if (!titleMatch) continue
    const question = stripTags(titleMatch[1]).replace(/^\d+\.\s*/, '')
    const answer = contentMatch ? stripTags(contentMatch[1]) : ''
    if (question) faqs.push({ question, answer })
  }
  return faqs
}

async function fetchPage(slug) {
  const url = `${WP_BASE}?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content,yoast_head_json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`WP fetch failed for ${slug}: ${res.status}`)
  const arr = await res.json()
  return arr[0] || null
}

async function main() {
  const outPath = process.argv[2] || 'wp-new-services-report.json'
  const results = []
  for (const slug of SLUGS) {
    try {
      const page = await fetchPage(slug)
      if (!page) {
        console.error(`[missing] ${slug}`)
        continue
      }
      const html = page.content?.rendered || ''
      const yoast = page.yoast_head_json || {}
      const heroTitle = extractHeroTitle(html)
      const shortDescription = extractShortDescription(html)
      const whyChoose = extractWhyChoose(html)
      const faqs = extractFaqs(html)
      results.push({
        slug,
        category: CATEGORY,
        title: heroTitle || stripTags(page.title?.rendered || ''),
        shortDescription,
        whyChoose,
        seoTitle: yoast.title || '',
        seoDescription: yoast.description || yoast.og_description || '',
        schemaMarkup: yoast.schema ? JSON.stringify(yoast.schema) : '',
        faqs,
      })
      console.error(`[ok] ${slug} — title="${heroTitle}" whyChoose=${whyChoose.length} faqs=${faqs.length}`)
    } catch (e) {
      console.error(`[error] ${slug}: ${e.message}`)
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  const fs = await import('node:fs')
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.error(`\nWrote ${results.length} records to ${outPath}`)
}

main()
