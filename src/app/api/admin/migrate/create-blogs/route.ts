import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'
import { insertItem, insertItemReference, deleteItem, queryAllItems } from '@/lib/wixAdmin'
import migrationData from '@/data/wp-blogs-migration-data.json'

export const dynamic = 'force-dynamic'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function requireAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const session = secret ? await verifySession(token, secret) : null
  return !!session
}

const DUMMY_BLOG_IDS = [
  '22ad808c-5c9e-44fb-94ea-367c92c4255f',
  'b5627e92-e82a-4895-ba8c-40597d1c07b4',
  '22bf3e9c-ac2c-4583-8e54-f7d0491d81b4',
]

const CATEGORY_NAMES = ['Shopify', 'Ecommerce', 'Mobile App Development', 'AI & Automation', 'SEO & Marketing', 'Web Development', 'General']

/**
 * Batched, resumable blog migration from WordPress. Call repeatedly with
 * increasing `offset` until the response has `done: true`. `offset=0` also
 * deletes the 3 dummy placeholder blog posts and ensures the consolidated
 * BlogCategories exist (safe to repeat — checks for existing ones first).
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const apiKey = process.env.WIX_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Server not configured.' }, { status: 503 })
  }
  const url = new URL(req.url)
  if (url.searchParams.get('confirm') !== 'yes') {
    return NextResponse.json({ ok: false, error: 'Pass ?confirm=yes to run this.' }, { status: 400 })
  }
  const offset = Number(url.searchParams.get('offset') || '0')
  const limit = Number(url.searchParams.get('limit') || '25')

  const deleted: Array<{ id: string; ok: boolean; error?: string }> = []
  if (offset === 0) {
    for (const id of DUMMY_BLOG_IDS) {
      try {
        await deleteItem('Blogs', id, apiKey)
        deleted.push({ id, ok: true })
      } catch (e) {
        deleted.push({ id, ok: false, error: (e as Error).message })
      }
      await sleep(500)
    }
  }

  // Ensure the consolidated categories exist; reuse if already created by an earlier batch.
  // BlogCategories has no status field, so it must be queried without a status filter.
  const existingCats = await queryAllItems('BlogCategories', 100, apiKey)
  const catIdByName = new Map<string, string>(existingCats.map((c: any) => [c.title, c.id]))
  for (const name of CATEGORY_NAMES) {
    if (catIdByName.has(name)) continue
    const { id } = await insertItem('BlogCategories', { title: name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }, apiKey)
    catIdByName.set(name, id)
    await sleep(500)
  }

  const batch = (migrationData as any[]).slice(offset, offset + limit)
  const results: Array<{ slug: string; ok: boolean; wixId?: string; error?: string }> = []

  for (const post of batch) {
    try {
      const fields: Record<string, unknown> = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        publishDate: post.publishDate,
        readingTime: post.readingTime,
        seoTitle: post.seoTitle,
        seoDescription: post.seoDescription,
        status: 'published',
      }
      if (post.featuredImage) fields.featuredImage = post.featuredImage
      const { id: wixId } = await insertItem('Blogs', fields, apiKey)
      await sleep(500)
      const catId = catIdByName.get(post.category)
      if (catId) {
        await insertItemReference('Blogs', 'categories', wixId, catId, apiKey)
        await sleep(500)
      }
      results.push({ slug: post.slug, ok: true, wixId })
    } catch (e) {
      results.push({ slug: post.slug, ok: false, error: (e as Error).message })
    }
  }

  const nextOffset = offset + limit
  const done = nextOffset >= (migrationData as any[]).length
  return NextResponse.json({
    ok: true,
    offset,
    limit,
    total: (migrationData as any[]).length,
    nextOffset,
    done,
    deleted: offset === 0 ? deleted : undefined,
    failed: results.filter((r) => !r.ok).length,
    results,
  })
}
