#!/usr/bin/env node
/**
 * Extraction for the Team page — pulls name, role, photo URL, LinkedIn URL,
 * and email per team member from the old WordPress site's REST API.
 * Read-only; writes a JSON report. No Wix writes here.
 *
 * Usage: node wp-extract-team.mjs [output.json]
 */

const WP_BASE = 'https://intertoons.com/wp-json/wp/v2/pages'
const SLUG = 'teams'

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTeam(html) {
  const nameRe = /<h2 class="crafto-heading"><span class="crafto-primary-title">([\s\S]*?)<\/span><\/h2>/g
  const names = []
  let m
  while ((m = nameRe.exec(html))) names.push({ name: stripTags(m[1]), index: m.index })

  const members = []
  for (let i = 0; i < names.length; i++) {
    const { name, index } = names[i]
    const prevEnd = i > 0 ? names[i - 1].index : 0
    const nextStart = i < names.length - 1 ? names[i + 1].index : html.length
    const before = html.slice(prevEnd, index)
    const after = html.slice(index, nextStart)

    const imgMatches = before.match(/<img[^>]+src="([^"]+)"/g)
    const lastImg = imgMatches ? imgMatches[imgMatches.length - 1] : null
    const srcMatch = lastImg ? lastImg.match(/src="([^"]+)"/) : null
    const photoUrl = srcMatch ? srcMatch[1] : ''

    const roleMatch = after.match(/elementor-widget-text-editor[\s\S]*?<p>([\s\S]*?)<\/p>/)
    const role = roleMatch ? stripTags(roleMatch[1]) : ''

    const linkedinMatch = after.match(/href="([^"]*linkedin[^"]*)"/)
    const linkedinUrl = linkedinMatch ? linkedinMatch[1].replace(/&#038;/g, '&') : ''

    const emailMatch = after.match(/href="[^"]*?([\w.+-]+@[\w.-]+\.\w+)"/)
    const email = emailMatch ? emailMatch[1] : ''

    members.push({ name, role, photoUrl, linkedinUrl, email })
  }
  return members
}

async function main() {
  const outPath = process.argv[2] || 'wp-team-report.json'
  const url = `${WP_BASE}?slug=${SLUG}&_fields=id,slug,content,yoast_head_json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`)
  const arr = await res.json()
  const page = arr[0]
  if (!page) throw new Error('Team page not found')

  const members = extractTeam(page.content?.rendered || '')
  console.error(`Extracted ${members.length} team members:`)
  for (const m of members) console.error(` - ${m.name} | ${m.role} | linkedin=${!!m.linkedinUrl} email=${m.email}`)

  const fs = await import('node:fs')
  fs.writeFileSync(outPath, JSON.stringify(members, null, 2))
  console.error(`\nWrote ${members.length} records to ${outPath}`)
}

main()
