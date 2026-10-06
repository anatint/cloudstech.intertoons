/**
 * Convert a Wix media URI or a plain https URL into a usable <img> src.
 * Wix IMAGE fields store `wix:image://v1/<mediaId>/<filename>#...`, served from
 * `static.wixstatic.com/media/`. Wix Vector Art (SVG) fields store
 * `wix:vector://v1/<mediaId>.svg/<filename>`, served from `static.wixstatic.com/shapes/`.
 */
export function wixImage(value?: string | null): string | undefined {
  if (!value) return undefined
  if (value.startsWith('http')) return value
  const imageMatch = value.match(/^wix:image:\/\/v1\/([^/]+)/)
  if (imageMatch) return `https://static.wixstatic.com/media/${imageMatch[1]}`
  const vectorMatch = value.match(/^wix:vector:\/\/v1\/([^/]+)/)
  if (vectorMatch) return `https://static.wixstatic.com/shapes/${vectorMatch[1]}`
  return value
}
