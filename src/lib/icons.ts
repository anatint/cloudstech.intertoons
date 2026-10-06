import { icons, Package, type LucideIcon } from 'lucide-react'

/**
 * Resolve a CMS-stored icon name (e.g. "Truck", "Plane", "Bot") to its
 * lucide-react component. Accepts PascalCase ("Truck"), kebab-case ("truck"),
 * or lower-case spellings and falls back to a neutral Package icon so an unknown
 * value never crashes a render. Ported verbatim from the Payload build.
 */
export function lucideIcon(name?: string | null): LucideIcon {
  if (!name) return Package
  const map = icons as Record<string, LucideIcon>
  if (map[name]) return map[name]
  const pascal = name
    .replace(/[_\s]+/g, '-')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return map[pascal] ?? Package
}
