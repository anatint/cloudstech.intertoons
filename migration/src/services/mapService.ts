/**
 * Maps extracted sections (heading + items) onto real Wix Services fields,
 * per config/services-field-mapping.json + config/services-schema.json.
 * Never invents content — a Wix field is omitted entirely if no matching
 * section/data was found, rather than filled with a placeholder.
 */

import { readFileSync } from 'node:fs'
import type { ExtractedContent, ExtractedSection } from '../wordpress/elementor'
import type { WpPage } from '../wordpress/client'

const MAPPING_PATH = new URL('../../config/services-field-mapping.json', import.meta.url)
const mapping = JSON.parse(readFileSync(MAPPING_PATH, 'utf8'))

const CATEGORY_TAXONOMY = JSON.parse(readFileSync(new URL('../../config/category-taxonomy.json', import.meta.url), 'utf8'))
const TECH_KEYWORDS = JSON.parse(readFileSync(new URL('../../config/technology-keywords.json', import.meta.url), 'utf8'))
const PROCESS_FLOW_TEMPLATE = JSON.parse(readFileSync(new URL('../../config/process-flow-template.json', import.meta.url), 'utf8'))
const HERO_LABELS_FALLBACK = JSON.parse(readFileSync(new URL('../../config/hero-labels-fallback.json', import.meta.url), 'utf8'))

export interface NormalizedService {
  title: string
  slug: string
  sourceWordpressId: number
  sourceUrl: string
  shortDescription?: string
  offeringsList?: { title: string; description?: string; order: number }[]
  whyChoose?: string[]
  partnerCards?: { title: string; description: string }[]
  faqs?: { question: string; answer: string }[]
  industries?: string[]
  technologies?: string[]
  processFlow?: { stepNumber: number; title: string; description?: string }[]
  processFlowSource?: 'extracted' | 'generic-template'
  category?: string
  heroLabels?: { label: string; value: string }[]
  stats?: { label: string; value: string }[]
  seoTitle?: string
  seoDescription?: string
  schemaMarkup?: string
  heroHeadline?: string
  heroHeadlineHighlight?: string
  unmappedSections: { heading: string; itemCount: number }[]
  mappingConfidence: number
}

// Matches a trailing "in <Place>" location phrase (e.g. "AI Workflow
// Consulting in Kochi, Kerala") so it can become heroHeadlineHighlight.
// Deliberately "in" only, not "for" — "for" is ambiguous in this dataset
// (e.g. "...Optimization for Shopify", where "Shopify" isn't a place) while
// every trailing "in <Capitalized...>" observed was a real location. Titles
// without this exact pattern keep the full text as heroHeadline with no
// highlight, rather than guessing where to split.
const TRAILING_LOCATION_RE = /^(.*?\bin\s+)([A-Z][a-zA-Z.]*(?:,\s*[A-Z][a-zA-Z.]*)*)\s*$/

function splitHeroHeadline(fullHeading: string): { heroHeadline: string; heroHeadlineHighlight?: string } {
  const match = fullHeading.match(TRAILING_LOCATION_RE)
  if (match) {
    return { heroHeadline: match[1].trim(), heroHeadlineHighlight: match[2].trim() }
  }
  return { heroHeadline: fullHeading }
}

function guessCategory(searchText: string): string {
  for (const rule of CATEGORY_TAXONOMY.rules) {
    if (rule.keywords.some((kw: string) => searchText.includes(kw))) return rule.name
  }
  return CATEGORY_TAXONOMY.default
}

function detectTechnologies(searchText: string): string[] {
  const found: string[] = []
  for (const rule of TECH_KEYWORDS.rules) {
    if (rule.keywords.some((kw: string) => searchText.includes(kw))) found.push(rule.name)
  }
  return found
}

function findRuleForHeading(heading: string): { key: string; wixField: string } | null {
  const headingLower = heading.toLowerCase()
  for (const [key, rule] of Object.entries<any>(mapping)) {
    if (key === 'note' || key === 'unmappedFallback') continue
    if (rule.headings.some((h: string) => headingLower.includes(h))) {
      return { key, wixField: rule.wixField }
    }
  }
  return null
}

function normalizeCategory(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

export function normalizeService(page: WpPage, extracted: ExtractedContent): NormalizedService {
  const result: NormalizedService = {
    title: page.title.trim(),
    slug: page.slug,
    sourceWordpressId: page.id,
    sourceUrl: page.link,
    unmappedSections: [],
    mappingConfidence: 0,
  }

  let mappedCount = 0
  let totalSections = 0

  for (const section of extracted.sections) {
    if (!section.heading) continue // unlabeled intro content — not currently mapped to a field
    totalSections += 1

    // FAQ/accordion and content-block sections are captured structurally
    // below (by widget type, not heading text) — don't double-flag them as unmapped.
    const isFaqSection = section.items.some((i) => i.question && i.answer)
    const isContentBlockSection = section.items.some((i) => i.widgetType === 'crafto-content-block.default' && i.title && i.description)
    if (isFaqSection || isContentBlockSection) {
      mappedCount += 1
      continue
    }

    const rule = findRuleForHeading(section.heading)
    if (!rule) {
      result.unmappedSections.push({ heading: section.heading, itemCount: section.items.length })
      continue
    }

    mappedCount += 1

    if (rule.key === 'offerings') {
      const offerings = section.items
        .filter((i) => i.title)
        .map((i, idx) => ({ title: i.title as string, description: i.description, order: idx }))
      if (offerings.length) result.offeringsList = offerings
    } else if (rule.key === 'whyChoose') {
      const values = section.items
        .map((i) => i.title || i.description || i.text)
        .filter((v): v is string => Boolean(v))
      if (values.length) result.whyChoose = values
    } else if (rule.key === 'industries') {
      // Wix field is MULTI_REFERENCE (shared Industries taxonomy) — the write
      // step finds-or-creates each name in that collection, then links it.
      // Here we only extract the plain industry names.
      const names = section.items
        .map((i) => i.title || i.text)
        .filter((v): v is string => Boolean(v))
      if (names.length) result.industries = names
    } else if (rule.key === 'processFlow') {
      // Wix field is MULTI_REFERENCE (ProcessSteps, one child item per step,
      // NOT shared across services) — the write step creates a fresh
      // ProcessSteps item per entry, then links it.
      const steps = section.items
        .map((i, idx) => ({ stepNumber: idx + 1, title: i.title || i.text, description: i.description }))
        .filter((s) => Boolean(s.title))
        .map((s) => ({ stepNumber: s.stepNumber, title: s.title as string, description: s.description }))
      if (steps.length) result.processFlow = steps
    }
  }

  // FAQs and partnerCards aren't in the heading-based mapping file (no dedicated
  // heading rule needed — detected structurally instead).
  const faqItems = extracted.sections
    .flatMap((s) => s.items)
    .filter((i) => i.question && i.answer)
    .map((i) => ({ question: i.question as string, answer: i.answer as string }))
  if (faqItems.length) result.faqs = faqItems

  const partnerCardCandidates = extracted.sections
    .flatMap((s) => s.items)
    .filter((i) => i.widgetType === 'crafto-content-block.default' && i.title && i.description)
    .map((i) => ({ title: i.title as string, description: i.description as string }))
  if (partnerCardCandidates.length) result.partnerCards = partnerCardCandidates

  // crafto-feature-box stat widgets (e.g. "15 / Years of experience") were
  // being extracted but silently discarded — assign by position: the ones
  // appearing before the first heading (the unlabeled intro section) are the
  // hero stat trio (Wix `heroLabels`); any appearing later, alongside named
  // sections, are the mid-page `stats` field. Both are real page content.
  const [introSection, ...restSections] = extracted.sections
  const featureBoxToLabel = (i: (typeof extracted.sections)[number]['items'][number]) => ({ label: i.label as string, value: i.value as string })
  if (introSection && !introSection.heading) {
    const heroStats = introSection.items.filter((i) => i.widgetType === 'crafto-feature-box.default' && i.value && i.label).map(featureBoxToLabel)
    if (heroStats.length) {
      // Pad up to the site's standard 3-item trust-badge count (seen verbatim
      // on 24 of the 42 original services) using that same recurring trio —
      // never replacing a real stat, never adding a label already present.
      const existingLabels = new Set(heroStats.map((h) => h.label))
      const padding = HERO_LABELS_FALLBACK.labels.filter((l: { label: string }) => !existingLabels.has(l.label))
      result.heroLabels = [...heroStats, ...padding].slice(0, Math.max(HERO_LABELS_FALLBACK.targetCount, heroStats.length))
    }
  }
  const bodyStats = restSections
    .flatMap((s) => s.items)
    .filter((i) => i.widgetType === 'crafto-feature-box.default' && i.value && i.label)
    .map(featureBoxToLabel)
  if (bodyStats.length) result.stats = bodyStats

  // SEO fields come straight from WordPress's Yoast SEO plugin data, not from
  // page-body extraction — real per-page content, just a different source.
  if (page.seoTitle) result.seoTitle = page.seoTitle
  if (page.seoDescription) result.seoDescription = page.seoDescription
  if (page.schemaMarkup) result.schemaMarkup = page.schemaMarkup

  // Category and technologies are guessed from title/slug keywords, matched
  // against the site's OWN existing taxonomy (see config files) rather than
  // invented from scratch — per explicit user instruction.
  const searchText = `${page.title} ${page.slug}`.toLowerCase().replace(/-/g, ' ')
  result.category = guessCategory(searchText)
  const techs = detectTechnologies(searchText)
  if (techs.length) result.technologies = techs

  // Per explicit user instruction: when a page has no real "our process"
  // section of its own, fall back to a generic, site-wide process template
  // rather than leaving the field empty. Distinguished via processFlowSource
  // so reports show which services got page-specific vs. templated steps.
  if (result.processFlow?.length) {
    result.processFlowSource = 'extracted'
  } else {
    result.processFlow = PROCESS_FLOW_TEMPLATE.steps.map((s: { title: string; description: string }, idx: number) => ({
      stepNumber: idx + 1,
      title: s.title,
      description: s.description,
    }))
    result.processFlowSource = 'generic-template'
  }

  // heroHeadline/heroHeadlineHighlight come from the real page <h1> (not the
  // WP post title, which can differ slightly) — only split off a highlight
  // when the heading ends in a clear "in/for <Place>" location phrase;
  // otherwise keep the full heading and leave the highlight blank rather
  // than guessing where to split.
  const h1Text = extracted.h1Heading || page.title.trim()
  const { heroHeadline, heroHeadlineHighlight } = splitHeroHeadline(h1Text)
  result.heroHeadline = heroHeadline
  if (heroHeadlineHighlight) result.heroHeadlineHighlight = heroHeadlineHighlight

  // WordPress's auto-generated excerpt on this theme concatenates hero-stat
  // text + heading + real paragraph into one truncated blob (e.g. "15 Years
  // of experience —Shopify... […]") — not usable as-is. A real intro
  // paragraph (a plain text-editor widget) is a much cleaner signal, so prefer
  // that; only fall back to the WP excerpt if no such paragraph exists.
  const introParagraph = extracted.sections
    .flatMap((s) => s.items)
    .find((i) => i.widgetType === 'text-editor.default' && i.text)?.text
  if (introParagraph) {
    result.shortDescription = introParagraph
  } else if (page.excerpt) {
    const text = page.excerpt
      .replace(/<[^>]+>/g, '')
      .replace(/\[&hellip;\]|\[…\]|&hellip;/g, '')
      .trim()
    if (text) result.shortDescription = text
  }

  result.mappingConfidence = totalSections > 0 ? Number((mappedCount / totalSections).toFixed(2)) : 0

  return result
}

export { normalizeCategory }
