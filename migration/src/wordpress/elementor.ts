/**
 * Extracts structured content from Elementor/Crafto-theme rendered HTML
 * (WordPress `content.rendered`). Assigns each content-bearing widget to
 * the nearest preceding heading in document order, building a normalized
 * sections[] structure (per migration spec Phase 5).
 *
 * Selectors below were verified empirically against a real page
 * (shopify-development) — see migration/config notes for details.
 * Crafto's `.crafto-primary-title` is NOT reliably a real <h1>-<h6> tag,
 * so we can't rely on tag name; we walk the DOM in order instead.
 */

import * as cheerio from 'cheerio'

export interface ExtractedItem {
  widgetType: string
  title?: string
  description?: string
  value?: string
  label?: string
  question?: string
  answer?: string
  text?: string
  order: number
}

export interface ExtractedSection {
  heading: string
  items: ExtractedItem[]
}

export interface ExtractedContent {
  sections: ExtractedSection[]
  headings: string[]
  /** Text of the real page <h1> (Crafto's small uppercase eyebrow label above it uses the same CSS class but is NOT wrapped in <h1>, so this is looked up by tag, not by the heading-walk above). */
  h1Heading?: string
}

const HEADING_SELECTOR = '.crafto-primary-title'
const WIDGET_SELECTOR = '[data-widget_type]'

function cleanText(s: string | undefined | null): string {
  return (s ?? '').replace(/\s+/g, ' ').trim()
}

function extractHeadingText($: cheerio.CheerioAPI, el: any): string {
  const $el = $(el)
  const clone = $el.clone()
  clone.find('.heading-prefix').remove()
  return cleanText(clone.text())
}

/** Strip the nested legacy WPBakery/VC shortcode wrapper markup around accordion answers. */
function extractAccordionAnswer($: cheerio.CheerioAPI, contentEl: any): string {
  const $content = $(contentEl)
  const $toggle = $content.find('.vc_toggle_content')
  const $target = $toggle.length ? $toggle : $content
  const paragraphs = $target
    .find('p')
    .map((_, p) => cleanText($(p).text()))
    .get()
    .filter(Boolean)
  return paragraphs.length ? paragraphs.join('\n\n') : cleanText($target.text())
}

function extractWidget($: cheerio.CheerioAPI, el: any, order: number): ExtractedItem | null {
  const $el = $(el)
  const widgetType = $el.attr('data-widget_type') ?? ''

  if (widgetType.startsWith('crafto-icon-box')) {
    const title = cleanText($el.find('.elementor-icon-box-title').first().text())
    const description = cleanText($el.find('.elementor-icon-box-description').first().text())
    if (!title && !description) return null
    return { widgetType, title: title || undefined, description: description || undefined, order }
  }

  if (widgetType.startsWith('crafto-feature-box')) {
    const value = cleanText($el.find('.feature-box .number').first().text())
    const label = cleanText($el.find('.feature-box-content p').first().text())
    if (!value && !label) return null
    return { widgetType, value: value || undefined, label: label || undefined, order }
  }

  if (widgetType.startsWith('crafto-content-block')) {
    const title = cleanText($el.find('.content-block .title').first().text())
    const description = cleanText($el.find('.content-block .content p').first().text())
    if (!title && !description) return null
    return { widgetType, title: title || undefined, description: description || undefined, order }
  }

  if (widgetType.startsWith('crafto-accordion') || widgetType === 'accordion.default') {
    // Accordion widgets contain repeated tab title/content pairs — handled
    // separately in extractContent() since one widget yields many items.
    return null
  }

  if (widgetType === 'text-editor.default') {
    const text = cleanText($el.find('.elementor-widget-container').first().text())
    if (!text) return null
    return { widgetType, text, order }
  }

  return null
}

function extractAccordionItems($: cheerio.CheerioAPI, el: any, startOrder: number): ExtractedItem[] {
  const $el = $(el)
  const items: ExtractedItem[] = []
  $el.find('.elementor-tab-title').each((i, titleEl) => {
    const $title = $(titleEl)
    const question = cleanText($title.find('.title').first().text() || $title.text())
    const tabIndex = $title.attr('data-tab')
    const $content = tabIndex
      ? $el.find(`.elementor-tab-content[data-tab="${tabIndex}"]`).first()
      : $title.next('.elementor-tab-content')
    const answer = $content.length ? extractAccordionAnswer($, $content.get(0)) : ''
    if (!question && !answer) return
    items.push({ widgetType: 'crafto-accordion', question: question || undefined, answer: answer || undefined, order: startOrder + i })
  })
  return items
}

/**
 * Walk the rendered HTML in document order, grouping widget content under
 * the nearest preceding heading. Content before the first heading is
 * collected under a synthetic "" (unlabeled) heading.
 */
export function extractContent(html: string): ExtractedContent {
  const $ = cheerio.load(html)
  const sections: ExtractedSection[] = []
  const headings: string[] = []

  let current: ExtractedSection = { heading: '', items: [] }
  sections.push(current)

  const nodes = $('body').find(`${HEADING_SELECTOR}, ${WIDGET_SELECTOR}`).toArray()
  let order = 0

  for (const node of nodes) {
    const $node = $(node)

    if ($node.is(HEADING_SELECTOR)) {
      const headingText = extractHeadingText($, node)
      if (!headingText) continue
      current = { heading: headingText, items: [] }
      sections.push(current)
      headings.push(headingText)
      continue
    }

    // Skip widgets nested inside another widget already being processed
    // (e.g. an icon widget inside a content-block) to avoid duplicate items.
    const widgetType = $node.attr('data-widget_type') ?? ''
    if ($node.parents(WIDGET_SELECTOR).length > 0) continue

    if (widgetType.startsWith('crafto-accordion') || widgetType === 'accordion.default') {
      const accItems = extractAccordionItems($, node, order)
      order += accItems.length
      current.items.push(...accItems)
      continue
    }

    const item = extractWidget($, node, order)
    if (item) {
      order += 1
      current.items.push(item)
    }
  }

  const h1El = $('h1').first()
  const h1Heading = h1El.length ? extractHeadingText($, h1El.find(HEADING_SELECTOR).first().get(0) ?? h1El.get(0)) : undefined

  return { sections: sections.filter((s) => s.items.length > 0), headings, h1Heading: h1Heading || undefined }
}
