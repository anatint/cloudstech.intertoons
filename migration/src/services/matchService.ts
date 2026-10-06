/**
 * Matches a normalized WordPress service against existing Wix Services to
 * decide CREATE / SKIP / REVIEW, per migration spec Phase 9. Never
 * auto-creates a duplicate — normalizes slug/title before comparing, since
 * a real casing-drift duplicate bug was already found on the sibling
 * Projects collection ("E-commerce" vs "ecommerce").
 */

import type { NormalizedService } from './mapService'
import type { ExistingService } from '../wix/queryServices'

export type MatchAction = 'CREATE' | 'SKIP' | 'REVIEW'

export interface MatchResult {
  action: MatchAction
  matchedExisting?: ExistingService
  reason: string
}

function normalizeForMatch(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function matchService(service: NormalizedService, existing: ExistingService[]): MatchResult {
  const normSlug = normalizeForMatch(service.slug)
  const normTitle = normalizeForMatch(service.title)

  const exactSlugMatch = existing.find((e) => normalizeForMatch(e.slug) === normSlug)
  if (exactSlugMatch) {
    return { action: 'SKIP', matchedExisting: exactSlugMatch, reason: `slug already exists in Wix ('${exactSlugMatch.slug}')` }
  }

  const exactTitleMatch = existing.find((e) => normalizeForMatch(e.title) === normTitle)
  if (exactTitleMatch) {
    return { action: 'REVIEW', matchedExisting: exactTitleMatch, reason: `title matches an existing service ('${exactTitleMatch.title}') but slug differs — needs human review to confirm it's the same service` }
  }

  // Word-overlap similarity, not plain substring containment — a short generic
  // title like "AI Development" is a substring of many distinct, more specific
  // titles ("Codex AI Development Services Kochi") and must NOT flag those as
  // duplicates. Only flag REVIEW when the titles are near-identical (share
  // almost all their words), which plain containment doesn't guarantee.
  const FUZZY_JACCARD_THRESHOLD = 0.8
  const titleWords = (s: string) => new Set(normalizeForMatch(s).split('-').filter(Boolean))
  const jaccard = (a: Set<string>, b: Set<string>) => {
    const intersectionSize = [...a].filter((w) => b.has(w)).length
    const unionSize = new Set([...a, ...b]).size
    return unionSize === 0 ? 0 : intersectionSize / unionSize
  }

  const wordsA = titleWords(service.title)
  let bestMatch: ExistingService | undefined
  let bestScore = 0
  for (const e of existing) {
    const score = jaccard(wordsA, titleWords(e.title))
    if (score > bestScore) {
      bestScore = score
      bestMatch = e
    }
  }
  if (bestMatch && bestScore >= FUZZY_JACCARD_THRESHOLD) {
    return { action: 'REVIEW', matchedExisting: bestMatch, reason: `title is near-identical to existing service ('${bestMatch.title}', ${Math.round(bestScore * 100)}% word overlap) — needs human review` }
  }

  return { action: 'CREATE', reason: 'no matching slug or title found in existing Wix Services' }
}
