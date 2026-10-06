import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Linkedin, Twitter, Facebook, ChevronRight, Mail } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { getSiteSettings, getContactHref } from '@/lib/settings'
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo'

export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  const { docs } = await (await getPayload()).find({ collection: 'blogs', where: { slug: { equals: slug }, status: { equals: 'published' } }, limit: 1, depth: 1 })
  return docs[0] as any
}

export async function generateStaticParams() {
  try {
    const { docs } = await (await getPayload()).find({ collection: 'blogs', limit: 100 })
    return (docs as any[]).map((d) => ({ slug: d.slug })).filter((p) => p.slug)
  } catch { return [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords,
    openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, images: post.featuredImage?.url ? [post.featuredImage.url] : undefined, type: 'article' },
  }
}

function fmtDate(d?: string) {
  if (!d) return ''
  const date = new Date(d)
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
const catSlug = (c: any) => (typeof c === 'object' ? c.slug : c)

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload()
  const [post, settings, contactHref, allRes, catsRes] = await Promise.all([
    getPost(slug),
    getSiteSettings(),
    getContactHref(),
    payload.find({ collection: 'blogs', where: { status: { equals: 'published' } }, sort: '-publishDate', limit: 50, depth: 1 }),
    payload.find({ collection: 'blog-categories', limit: 50, depth: 0 }),
  ])
  if (!post) notFound()

  const allPosts = (allRes.docs as any[]).filter((p) => p.slug !== slug)
  const categories = catsRes.docs as any[]
  const author = post.author || (post.authors || [])[0]
  const category = (post.categories || [])[0]
  const url = `${settings.baseUrl}/blog/${slug}`
  const counts: Record<string, number> = {}
  for (const p of allRes.docs as any[]) for (const c of p.categories || []) counts[catSlug(c)] = (counts[catSlug(c)] || 0) + 1

  const jsonLd = [
    buildArticleJsonLd(post, slug, settings),
    buildBreadcrumbJsonLd([{ name: 'Home', item: '/' }, { name: 'Blog', item: '/blog' }, { name: post.title, item: `/blog/${slug}` }], settings),
  ]

  return (
    <div className="pt-[104px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="bg-white py-10 lg:py-14">
        <div className="container max-w-6xl">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-brand-600">Home</Link><ChevronRight className="h-3.5 w-3.5" />
            <Link href="/blog" className="hover:text-brand-600">Blog</Link><ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-600 line-clamp-1">{post.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Main */}
            <div className="min-w-0">
              {category && <span className="inline-block mb-3 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wide">{typeof category === 'object' ? category.title : category}</span>}
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{post.title}</h1>
              {post.excerpt && <p className="mt-4 text-base font-inter text-slate-500 leading-relaxed">{post.excerpt}</p>}

              <div className="flex flex-wrap items-center gap-4 mt-5 pb-6 border-b border-slate-100">
                {author && (
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      {author.photo?.url && <Image src={author.photo.url} alt={author.name} width={40} height={40} className="object-cover w-full h-full" />}
                    </div>
                    <div className="leading-tight">
                      <div className="text-base font-bold text-slate-800">{author.name}</div>
                      {author.designation && <div className="text-sm text-slate-400">{author.designation}</div>}
                    </div>
                  </div>
                )}
                {post.publishDate && <span className="flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="h-4 w-4" />{fmtDate(post.publishDate)}</span>}
                {post.readingTime ? <span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock className="h-4 w-4" />{post.readingTime} min read</span> : null}
              </div>

              {post.featuredImage?.url && (
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mt-6 bg-slate-100">
                  <Image src={post.featuredImage.url} alt={post.title} fill className="object-cover" priority />
                </div>
              )}

              {/* Content (RICH_TEXT / HTML) */}
              <div
                className="mt-8 max-w-none text-slate-700 leading-relaxed [&_p]:mb-5 [&_p]:text-[15px] [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_a]:text-brand-600 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              {/* Share */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Share this article</span>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-[#0077B5] flex items-center justify-center hover:opacity-80"><Linkedin className="h-4 w-4 text-white" /></a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center hover:opacity-80"><Twitter className="h-4 w-4 text-white" /></a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80"><Facebook className="h-4 w-4 text-white" /></a>
              </div>

              {/* Author bio */}
              {author && (
                <div className="mt-8 bg-slate-50 rounded-2xl p-6 flex gap-4 items-start">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-200 shrink-0">
                    {author.photo?.url && <Image src={author.photo.url} alt={author.name} width={56} height={56} className="object-cover w-full h-full" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{author.name}</div>
                    {author.designation && <div className="text-sm text-brand-600 font-semibold mb-1">{author.designation}</div>}
                    {author.bio && <p className="text-[15px] text-slate-500 leading-relaxed">{author.bio}</p>}
                    {author.linkedin && <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-brand-600"><Linkedin className="h-3.5 w-3.5" /> Connect</a>}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <h3 className="font-extrabold text-slate-900 mb-4">Categories</h3>
                <ul className="space-y-1">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/blog?cat=${c.slug}`} className="flex items-center justify-between py-1.5 text-sm text-slate-600 hover:text-brand-600 transition-colors">
                        <span>{c.title}</span>
                        <span className="text-xs text-slate-400">{counts[c.slug] || 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <h3 className="font-extrabold text-slate-900 mb-4">Latest Posts</h3>
                <ul className="space-y-4">
                  {allPosts.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      <Link href={`/blog/${p.slug}`} className="flex gap-3 group">
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {p.featuredImage?.url && <Image src={p.featuredImage.url} alt={p.title} fill className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-slate-700 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">{p.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{fmtDate(p.publishDate)}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6 text-center">
                <Mail className="h-8 w-8 text-brand-600 mx-auto mb-2" />
                <h3 className="font-extrabold text-slate-900">Stay Updated</h3>
                <p className="text-base text-slate-500 mt-1 mb-4">Subscribe for the latest insights straight to your inbox.</p>
                <Link href={`${contactHref}#contact-form`} className="block w-full px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors">Subscribe</Link>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </div>
  )
}
