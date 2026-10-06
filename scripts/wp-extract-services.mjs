#!/usr/bin/env node
/**
 * Read-only extraction from the old WordPress site's public REST API.
 * Pulls, per service page: slug, SEO title/description, JSON-LD schema,
 * and FAQ question/answer pairs parsed out of the Elementor accordion markup.
 *
 * Writes a single JSON report to stdout-referenced file — no Wix writes here.
 * Usage: node scripts/wp-extract-services.mjs [output.json]
 */

const WP_BASE = 'https://intertoons.com/wp-json/wp/v2/pages'

// Every service slug migrated (or being migrated) into the new site's Services
// collection. Kept as an explicit list rather than "all WP pages" so this only
// ever touches known service pages, not About/Careers/legal pages etc.
const SLUGS = [
  // Shopify
  'shopify-development',
  'custom-shopify-theme-services',
  'shopify-migration-services',
  'shopify-gokwik-integration-services',
  'shopify-headless-site-development',
  'shopify-maintenance-and-support-services',
  'shopify-agentic-commerce',
  'shopify-ai-chatbot-integration',
  'shopify-ai-seo-content-automation',
  'ai-integration-with-shopify-magento-custom-platforms-kochi-kerala',
  // Mobile App
  'mobile-application-development-company',
  'flutter-mobile-app-development-company-kochi',
  'e-commerce-mobile-application-development',
  'magento-mobile-apps-development',
  'mobile-marketing',
  'magento-development',
  'react-native-app-development-in-kerala',
  'ready-to-deploy-ecommerce-mobile-apps',
  'food-delivery-app-development',
  // AI Development
  'top-ai-developers-in-kochi-smart-agent-solutions',
  'top-generative-ai-startup-in-kerala-ai-development-company-in-kochi-intertoons',
  'claude-ai-automation-agency-kochi',
  'codex-automation-agency-kochi',
  'hire-langchain-developer-kochi',
  'ai-chatbots',
  'business-ai-automation-kochi',
  'hire-lovable-developer-kochi',
  'openclaw-ai-agency-kerala',
  'api-development-services-in-kochi-kerala',
  // Software Development
  'ecommerce-website',
  'website-development-company',
  'n8n-workflow-automation',
  'b2b-ecommerce-solutions',
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

/** Extract [{question, answer}] from Elementor accordion widget markup. */
function extractFaqs(html) {
  const faqs = []
  const items = html.split('elementor-accordion-item').slice(1)
  for (const chunk of items) {
    const titleMatch = chunk.match(/<div class="title">([\s\S]*?)<\/div>/)
    const contentMatch = chunk.match(/<div class="panel-tab-content">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)
    if (!titleMatch) continue
    let question = stripTags(titleMatch[1]).replace(/^\d+\.\s*/, '')
    let answer = contentMatch ? stripTags(contentMatch[1]) : ''
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
  const outPath = process.argv[2] || 'wp-extract-report.json'
  const results = []
  for (const slug of SLUGS) {
    try {
      const page = await fetchPage(slug)
      if (!page) {
        results.push({ slug, found: false })
        console.error(`[missing] ${slug} — no WP page found`)
        continue
      }
      const yoast = page.yoast_head_json || {}
      const faqs = extractFaqs(page.content?.rendered || '')
      results.push({
        slug,
        found: true,
        wpId: page.id,
        title: stripTags(page.title?.rendered || ''),
        seoTitle: yoast.title || '',
        seoDescription: yoast.description || yoast.og_description || '',
        schema: yoast.schema || null,
        faqs,
      })
      console.error(`[ok] ${slug} — ${faqs.length} FAQs extracted`)
    } catch (e) {
      results.push({ slug, found: false, error: String(e.message || e) })
      console.error(`[error] ${slug}: ${e.message}`)
    }
    // Be polite to the old site.
    await new Promise((r) => setTimeout(r, 250))
  }
  const fs = await import('node:fs')
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.error(`\nWrote ${results.length} records to ${outPath}`)
}

main()
