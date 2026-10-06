import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs'
import { fetchAllPages, type WpPage } from './client'

const RAW_DIR = new URL('../../data/raw/', import.meta.url)
const RAW_FILE = new URL('all-pages.json', RAW_DIR)

/** Fetch (or reuse a cached copy of) every published WordPress page. */
export async function getAllPages(opts: { forceRefresh?: boolean } = {}): Promise<WpPage[]> {
  if (!opts.forceRefresh && existsSync(RAW_FILE)) {
    return JSON.parse(readFileSync(RAW_FILE, 'utf8'))
  }
  const pages = await fetchAllPages()
  mkdirSync(RAW_DIR, { recursive: true })
  writeFileSync(RAW_FILE, JSON.stringify(pages, null, 2))
  return pages
}
