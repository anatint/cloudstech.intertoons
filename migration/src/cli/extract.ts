/** `npm run migration:services:extract` — fetches & caches all WP pages. */
import { getAllPages } from '../wordpress/pages'

async function main() {
  const pages = await getAllPages({ forceRefresh: true })
  console.log(`Fetched ${pages.length} published WordPress pages -> migration/data/raw/all-pages.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
