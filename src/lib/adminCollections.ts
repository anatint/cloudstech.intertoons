/**
 * Collections exposed to the AI Assistant item-creation wizard. Only
 * repeatable, list-style content collections are included here — singleton
 * per-page/site settings collections (SitePages, ContactPage, SiteSettings,
 * home-settings, etc.) are edited directly in Wix since there's normally
 * exactly one relevant row, not a repeated "create a new one" workflow.
 *
 * IDs match the live Wix collection IDs used elsewhere in this project (see
 * COLLECTION_MAP in `src/lib/payload.ts`).
 */
export interface AdminCollectionDef {
  id: string
  label: string
}

export const ADMIN_COLLECTIONS: AdminCollectionDef[] = [
  { id: 'Services', label: 'Services' },
  { id: 'Technologies', label: 'Technologies' },
  { id: 'Products', label: 'Products' },
  { id: 'Projects', label: 'Projects' },
]

const ADMIN_COLLECTION_IDS = new Set(ADMIN_COLLECTIONS.map((c) => c.id))

export function isAdminCollection(id: string): boolean {
  return ADMIN_COLLECTION_IDS.has(id)
}

export function labelForCollection(id: string): string {
  return ADMIN_COLLECTIONS.find((c) => c.id === id)?.label ?? id
}
