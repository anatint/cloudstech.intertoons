import type { Metadata } from 'next'
import type { SiteSettings } from './settings'

/* eslint-disable @typescript-eslint/no-explicit-any */
const FALLBACK_NAME = 'Intertoons'
const FALLBACK_BASE = process.env.NEXT_PUBLIC_SERVER_URL || 'https://intertoons.com'
const FALLBACK_DESC =
  'Full-service digital agency specialising in AI development, AI automations, Shopify, e-commerce & mobile apps.'

const abs = (base: string, url: string) => (/^https?:\/\//.test(url) ? url : `${base}${url}`)

/**
 * Build Next.js Metadata from a CMS record. Reads the collection's flat SEO
 * fields (`seoTitle`/`seoDescription`/`seoImage`) — also tolerates a legacy
 * `seo` group — and uses Site Settings for the site-wide defaults.
 */
export function generateMetadata(
  doc: any,
  canonicalPath: string,
  settings?: SiteSettings,
  opts?: { exactTitle?: boolean }
): Metadata {
  const SITE_NAME = settings?.siteName || FALLBACK_NAME
  const BASE_URL = settings?.baseUrl || FALLBACK_BASE
  const DEFAULT_DESCRIPTION = settings?.defaultSeoDescription || FALLBACK_DESC
  const seo = doc?.seo ?? {}
  // No "| SITE_NAME" suffix here — the root layout's title template already appends it,
  // unless `exactTitle` is set (Services must match the WordPress site's <title> tag
  // byte-for-byte, which never carried that suffix) — `{ absolute }` bypasses the template.
  const titleText = doc?.seoTitle || seo.metaTitle || doc?.title || doc?.name || SITE_NAME
  const title = opts?.exactTitle ? { absolute: titleText } : titleText
  const description = doc?.seoDescription || seo.metaDescription || doc?.excerpt || doc?.shortDescription || DEFAULT_DESCRIPTION
  const canonical = seo.canonicalOverride || `${BASE_URL}${canonicalPath}`
  const ogImage = doc?.seoImage?.url || seo.ogImage?.url || abs(BASE_URL, settings?.ogImage || '/og-default.jpg')

  const robots =
    seo.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true }

  return {
    title,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      title: titleText,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: titleText }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description,
      images: [ogImage],
    },
  }
}

/** Build a JSON-LD Organization snippet (used site-wide), driven by Site Settings. */
export function buildOrganizationJsonLd(settings?: SiteSettings) {
  const name = settings?.siteName || FALLBACK_NAME
  const base = settings?.baseUrl || FALLBACK_BASE
  const logo = abs(base, settings?.logo || '/logo.png')
  const sameAs = [settings?.facebook, settings?.twitter, settings?.linkedin, settings?.instagram, settings?.youtube]
    .filter(Boolean) as string[]
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: base,
    logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.orgTelephone || '+91-9747-443300',
      contactType: 'customer support',
      availableLanguage: 'English',
    },
    sameAs: sameAs.length ? sameAs : [
      'https://facebook.com/intertoons',
      'https://linkedin.com/company/intertoons',
      'https://instagram.com/intertoons',
      'https://youtube.com/@intertoons',
    ],
  }
}

/** Build a BreadcrumbList JSON-LD snippet. */
export function buildBreadcrumbJsonLd(items: Array<{ name: string; item: string }>, settings?: SiteSettings) {
  const base = settings?.baseUrl || FALLBACK_BASE
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${base}${crumb.item}`,
    })),
  }
}

/** Build a BlogPosting JSON-LD snippet. */
export function buildArticleJsonLd(post: any, slug: string, settings?: SiteSettings) {
  const name = settings?.siteName || FALLBACK_NAME
  const base = settings?.baseUrl || FALLBACK_BASE
  const author = post.author || (post.authors || [])[0]
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seoDescription || '',
    image: post.featuredImage?.url ? [post.featuredImage.url] : undefined,
    datePublished: post.publishDate || post._createdDate,
    dateModified: post._updatedDate || post.publishDate,
    author: author?.name ? { '@type': 'Person', name: author.name } : { '@type': 'Organization', name },
    publisher: { '@type': 'Organization', name, logo: { '@type': 'ImageObject', url: abs(base, settings?.logo || '/logo.png') } },
    mainEntityOfPage: `${base}/blog/${slug}`,
  }
}

/** Build a Service JSON-LD snippet. */
export function buildServiceJsonLd(service: any, slug: string, settings?: SiteSettings) {
  const name = settings?.siteName || FALLBACK_NAME
  const base = settings?.baseUrl || FALLBACK_BASE
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.shortDescription || settings?.defaultSeoDescription || FALLBACK_DESC,
    provider: { '@type': 'Organization', name, url: base },
    url: `${base}/${slug}`,
  }
}
