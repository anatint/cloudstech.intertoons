/**
 * Classifies whether a WordPress page represents a "service" page, with a
 * confidence score (0-1), per migration spec Phase 4 + config/services-classification-rules.json.
 */

import { readFileSync } from 'node:fs'
import type { WpPage } from '../wordpress/client'
import type { ExtractedContent } from '../wordpress/elementor'

const RULES_PATH = new URL('../../config/services-classification-rules.json', import.meta.url)
const rules = JSON.parse(readFileSync(RULES_PATH, 'utf8'))

const CONFIRMED_PATH = new URL('../../config/user-confirmed-service-slugs.json', import.meta.url)
const confirmedSlugs: Set<string> = new Set(JSON.parse(readFileSync(CONFIRMED_PATH, 'utf8')).slugs)

export interface ClassificationResult {
  isService: boolean
  confidence: number
  reasons: string[]
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim()
}

export function classifyPage(page: WpPage, extracted: ExtractedContent): ClassificationResult {
  const reasons: string[] = []
  const slug = normalizeSlug(page.slug)
  const title = page.title.toLowerCase()

  if (confirmedSlugs.has(slug)) {
    return { isService: true, confidence: 1, reasons: [`slug '${slug}' is on the user-confirmed service-page list`] }
  }

  if (rules.excludeSlugExact.includes(slug)) {
    return { isService: false, confidence: 0, reasons: [`slug '${slug}' is in excludeSlugExact`] }
  }
  if (rules.excludeSlugContains.some((s: string) => slug.includes(s))) {
    return { isService: false, confidence: 0, reasons: [`slug '${slug}' matches excludeSlugContains`] }
  }
  if (rules.excludeTitleContains.some((s: string) => title.includes(s))) {
    return { isService: false, confidence: 0, reasons: [`title '${page.title}' matches excludeTitleContains`] }
  }

  let score = 0

  const highHits = rules.serviceKeywordsHigh.filter((kw: string) => title.includes(kw) || slug.includes(kw.replace(/\s+/g, '-')))
  if (highHits.length > 0) {
    score += 0.5
    reasons.push(`high-confidence keyword(s) in title/slug: ${highHits.join(', ')}`)
  }

  const mediumHits = rules.serviceKeywordsMedium.filter((kw: string) => title.includes(kw))
  if (mediumHits.length > 0) {
    score += 0.2
    reasons.push(`medium-confidence keyword(s) in title: ${mediumHits.join(', ')}`)
  }

  const headingsLower = extracted.headings.map((h) => h.toLowerCase())
  const structureHits = rules.servicePageStructureSignals.headingsAnyOf.filter((sig: string) =>
    headingsLower.some((h) => h.includes(sig)),
  )
  if (structureHits.length > 0) {
    const bump = Math.min(0.4, structureHits.length * 0.15)
    score += bump
    reasons.push(`structural service-page heading(s) found: ${structureHits.join(', ')}`)
  }

  const bodyText = stripHtml(page.content)
  if (bodyText.length > 800) {
    score += 0.05
    reasons.push('substantial body content (>800 chars)')
  }

  if (extracted.sections.some((s) => s.items.some((i) => 'question' in i && i.question))) {
    score += 0.1
    reasons.push('FAQ-style accordion content present')
  }

  score = Math.min(1, score)

  const threshold = rules.confidenceThresholds.rejectBelow
  return { isService: score >= threshold, confidence: Number(score.toFixed(2)), reasons }
}
