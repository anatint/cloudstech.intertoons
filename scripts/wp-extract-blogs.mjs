#!/usr/bin/env node
/**
 * Extraction for all WordPress blog posts. Read-only against the old
 * WordPress site's public REST API. Writes one JSON file; no Wix writes here.
 *
 * Usage: node scripts/wp-extract-blogs.mjs [output.json]
 */

const WP_BASE = 'https://intertoons.com/wp-json/wp/v2/posts'

// Raw WP category name -> consolidated Blogs category. First match wins.
// Long-tail categories with no match fall back to "General".
const CATEGORY_RULES = [
  [/shopify/i, 'Shopify'],
  [/magento|payment gateway|multivendor|ecommerce/i, 'Ecommerce'],
  [/food delivery|app development|react native|mobile app/i, 'Mobile App Development'],
  [/\bai\b|api|automation/i, 'AI & Automation'],
  [/seo|digital marketing/i, 'SEO & Marketing'],
  [/react|php|aws|cloudflare|cpanel|wix|web development/i, 'Web Development'],
]

function consolidateCategory(names) {
  for (const [re, label] of CATEGORY_RULES) {
    if (names.some((n) => re.test(n))) return label
  }
  return 'General'
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Reduce raw Elementor/WP HTML down to a safe subset for Wix RICH_TEXT (p, h2-h4, ul/ol/li, strong, em, a, img). */
function simplifyContent(html) {
  // Drop script/style and Elementor wrapper divs; keep only content-bearing tags.
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
  // Extract paragraphs, headings, lists, and their contents in document order.
  const blockRe = /<(p|h1|h2|h3|h4|ul|ol|li|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi
  const blocks = []
  let m
  while ((m = blockRe.exec(out))) {
    const tag = m[1].toLowerCase() === 'h1' ? 'h2' : m[1].toLowerCase()
    if (tag === 'ul' || tag === 'ol') continue // handled via nested <li> matches
    let inner = m[2]
    // Keep basic inline formatting/links; strip everything else.
    inner = inner
      .replace(/<(?!\/?(strong|b|em|i|a)\b)[^>]+>/gi, '')
      .replace(/<b>/gi, '<strong>').replace(/<\/b>/gi, '</strong>')
      .replace(/<i>/gi, '<em>').replace(/<\/i>/gi, '</em>')
    inner = inner.trim()
    if (!inner || stripTags(inner).length < 2) continue
    blocks.push(`<${tag}>${inner}</${tag}>`)
  }
  return blocks.join('')
}

function wordCount(html) {
  return stripTags(html).split(/\s+/).filter(Boolean).length
}

async function fetchPage(page) {
  const url = `${WP_BASE}?per_page=100&page=${page}&_embed=1&_fields=id,slug,title,excerpt,content,date,categories,yoast_head_json,_links,_embedded`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`WP fetch page ${page} failed: ${res.status}`)
  return res.json()
}

async function main() {
  const outPath = process.argv[2] || 'wp-blogs-report.json'
  const results = []
  for (let page = 1; page <= 6; page++) {
    console.error(`Fetching page ${page}/6...`)
    let posts
    try {
      posts = await fetchPage(page)
    } catch (e) {
      console.error(`  page ${page} failed: ${e.message}`)
      continue
    }
    for (const p of posts) {
      const yoast = p.yoast_head_json || {}
      const catNames = (p._embedded?.['wp:term']?.[0] || []).map((t) => t.name).filter((n) => n !== 'Uncategorized')
      const featuredImage = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
      const rawContent = p.content?.rendered || ''
      const content = simplifyContent(rawContent)
      const words = wordCount(rawContent)
      results.push({
        wpId: p.id,
        slug: p.slug,
        title: stripTags(p.title?.rendered || ''),
        excerpt: stripTags(p.excerpt?.rendered || '').slice(0, 300),
        content,
        publishDate: p.date ? p.date.slice(0, 10) : '',
        category: consolidateCategory(catNames),
        rawCategories: catNames,
        featuredImage,
        seoTitle: yoast.title || '',
        seoDescription: yoast.description || '',
        readingTime: Math.max(1, Math.round(words / 200)),
      })
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  const fs = await import('node:fs')
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.error(`\nWrote ${results.length} posts to ${outPath}`)
  const byCategory = {}
  for (const r of results) byCategory[r.category] = (byCategory[r.category] || 0) + 1
  console.error('By category:', JSON.stringify(byCategory, null, 2))
  console.error('No content:', results.filter((r) => !r.content).length)
  console.error('No featured image:', results.filter((r) => !r.featuredImage).length)
}

main()
