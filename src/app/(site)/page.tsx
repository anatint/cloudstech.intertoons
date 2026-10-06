export const revalidate = 0
import { getPayload } from '@/lib/payload'
import { getSiteSettings } from '@/lib/settings'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Brain, Zap, ShoppingBag, ShoppingCart, Smartphone, Store,
  ArrowRight, Play, Rocket, ChevronRight, Star, Linkedin, Twitter, Mail,
  SmilePlus, Clock, Building2, Users, Award, Code2,
  Globe, Layout, Palette, Code, Layers, Wrench, Cloud, Sparkles,
} from 'lucide-react'
import HomeHeroForm from '@/components/HomeHeroForm'
import HomeTestimonials from '@/components/HomeTestimonials'
import HorizontalScrollRow from '@/components/HorizontalScrollRow'

// Title/description editable from the Site Pages "home" entry (seoTitle/seoDescription),
// falling back to Site Settings defaults.
export async function generateMetadata(): Promise<Metadata> {
  const [{ docs }, s] = await Promise.all([
    (await getPayload()).find({ collection: 'home-settings', limit: 1 }),
    getSiteSettings(),
  ])
  const home: any = docs[0] ?? {}
  return {
    title: home.seoTitle || undefined,
    description: home.seoDescription || s.defaultSeoDescription,
  }
}

/* ─────────────────────────────────────────────
   Tech logos — Google & Azure removed, stays one line
───────────────────────────────────────────── */
const TECH_LOGOS = [
  {
    name: 'Shopify',
    logo: (
      <svg viewBox="0 0 109 124" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M95.5 20.2c-.1-.7-.7-1.1-1.3-1.1s-11.5-.8-11.5-.8S74.6 10.6 73.7 9.7c-.9-.9-2.7-.6-3.4-.4-.1 0-1.9.6-4.8 1.5C62.8 5.7 59.3 2 53.6 2c-.2 0-.3 0-.5.1C51.9.8 50.5.2 49.3.2 38.7.2 33.6 13.3 32 20l-9.2 2.9C19.9 23.7 19.7 24 19.6 26.8L11 99.1 73.4 111 109 103.2 95.5 20.2z" fill="#95BF47"/>
        <path d="M94.2 19.1c-.6 0-11.5-.8-11.5-.8S74.6 10.6 73.7 9.7c-.3-.3-.7-.5-1.2-.5L73.4 111l35.6-7.8L95.5 20.2c-.1-.6-.7-1-1.3-1.1z" fill="#5E8E3E"/>
        <path d="M53.6 38.7l-4.4 13.1s-3.8-2-8.5-2c-6.8 0-7.1 4.3-7.1 5.3 0 5.8 15.2 8.1 15.2 21.8 0 10.8-6.8 17.7-16 17.7-11 0-16.6-6.9-16.6-6.9l2.9-9.8s5.8 5 10.6 5c3.2 0 4.5-2.5 4.5-4.3 0-7.6-12.5-7.9-12.5-20.5 0-10.5 7.5-20.7 22.8-20.7 5.9 0 8.8 1.9 9.1 1.3z" fill="#FFF"/>
      </svg>
    ),
  },
  {
    name: 'Wix Studio',
    logo: (
      <div className="flex items-center gap-1.5">
        <div className="h-7 w-7 rounded bg-black flex items-center justify-center">
          <span className="text-white font-black text-xs">W</span>
        </div>
        <span className="font-bold text-slate-800 text-base tracking-tight">WIX STUDIO</span>
      </div>
    ),
  },
  {
    name: 'Claude',
    logo: (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
          <circle cx="20" cy="20" r="20" fill="#D97757"/>
          <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 21.5c-5.2 0-9.5-4.3-9.5-9.5S14.8 10.5 20 10.5s9.5 4.3 9.5 9.5-4.3 9.5-9.5 9.5z" fill="white" opacity="0.9"/>
        </svg>
        <span className="font-bold text-slate-800 text-base">Claude</span>
      </div>
    ),
  },
  {
    name: 'AWS',
    logo: (
      <div className="flex items-center gap-1">
        <svg viewBox="0 0 60 36" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.7 13.5c0 .8.1 1.5.2 2 .2.5.4 1.1.7 1.7.1.2.2.4.2.6 0 .3-.2.5-.5.7l-1.7 1.1c-.2.2-.5.2-.7.2-.3 0-.5-.1-.8-.3-.4-.4-.7-.8-.9-1.2-.2-.4-.5-1-.7-1.7-1.8 2.1-4 3.2-6.7 3.2-1.9 0-3.4-.5-4.5-1.6C.6 18 0 16.6 0 14.8c0-1.9.7-3.4 2-4.5 1.4-1.1 3.2-1.7 5.5-1.7.8 0 1.6.1 2.4.2.8.1 1.7.3 2.6.6V7.8c0-1.7-.4-3-1.1-3.7-.7-.7-2-.1-3.6-.1-1.5 0-3 .2-4.6.6-1.6.4-3.1 1-4.6 1.7C-1.7 6.5 0 5.6 0 5.2V2.9c0-.4.1-.7.2-.9.2-.2.5-.3.9-.5C2.3 1 3.8.6 5.5.3 7.2.1 9 0 10.8 0c3.5 0 6.1.8 7.8 2.4 1.6 1.6 2.5 4 2.5 7.3l-.1 3.8h-.3zm-9.3 3.5c.7 0 1.5-.1 2.3-.4.8-.3 1.5-.8 2.1-1.5.4-.4.6-.9.7-1.5.1-.5.2-1.2.2-2V11c-.7-.2-1.3-.3-2-.4-.7-.1-1.3-.1-2-.1-1.4 0-2.4.3-3.1.8-.7.5-1 1.3-1 2.3 0 .9.2 1.6.7 2.1.5.5 1.2.8 2.1.8l.1-.5zm25.7 3.5c-.4 0-.7-.1-.9-.2-.2-.1-.4-.4-.5-.8L26 2.3c-.1-.4-.2-.7-.2-.9 0-.4.2-.5.5-.5h2.9c.4 0 .7.1.9.2.2.1.4.4.5.8l4.6 18.2 4.3-18.2c.1-.4.3-.7.5-.8.2-.2.5-.2.9-.2h2.4c.4 0 .7.1.9.2.2.1.4.4.5.8l4.3 18.4L53.6 2c.1-.4.3-.7.5-.8.2-.2.5-.2.9-.2H57c.4 0 .6.2.6.5 0 .1 0 .2-.1.4L51.2 19.7c-.1.4-.3.7-.5.8-.2.1-.5.2-.9.2h-2.6c-.4 0-.7-.1-.9-.2-.2-.1-.4-.4-.5-.8l-4.3-17.9-4.3 17.9c-.1.4-.3.7-.5.8-.2.1-.5.2-.9.2h-2.7v.8z" fill="#232F3E"/>
          <path d="M55 28.2c-7 5.2-17.2 7.9-25.9 7.9-12.2 0-23.2-4.5-31.5-12-.7-.6-.1-1.4.7-1 8.9 5.2 19.9 8.3 31.2 8.3 7.6 0 16-1.6 23.7-4.9 1.1-.5 2.1.7.9 1.7h-.1z" fill="#FF9900"/>
          <path d="M57.8 25c-.9-1.2-6.2-.6-8.6-.3-.7.1-.8-.5-.2-1 4.2-2.9 11-2.1 11.8-1.1.8 1-.2 7.8-4.1 11.1-.6.5-1.2.2-1-.4.9-2.2 2.9-7 2.1-8.3z" fill="#FF9900"/>
        </svg>
      </div>
    ),
  },
  {
    name: 'Flutter',
    logo: (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 28.5L20.5 21H42L27.5 35.5L13 28.5Z" fill="#40C4FF"/>
          <path d="M13 28.5L20.5 21H42L34.5 28.5H13Z" fill="#29B6F6"/>
          <path d="M27.5 35.5L20 43H42L27.5 35.5Z" fill="#01579B"/>
          <path d="M6 22.5L13.5 15H35.5L28 22.5H6Z" fill="#40C4FF"/>
          <path d="M6 8L28 8L6 30V8Z" fill="#40C4FF"/>
          <path d="M28 8H6L17 19H28V8Z" fill="#29B6F6"/>
        </svg>
        <span className="font-bold text-slate-800 text-base">Flutter</span>
      </div>
    ),
  },
  {
    name: 'OpenAI',
    logo: (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 41 41" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M37.5 16.9a10.1 10.1 0 00-.87-8.28 10.23 10.23 0 00-11-4.91A10.1 10.1 0 0018 1.05 10.23 10.23 0 007.6 7.66a10.1 10.1 0 00-6.75 4.9 10.23 10.23 0 001.26 12 10.1 10.1 0 00.87 8.27 10.23 10.23 0 0011 4.91 10.1 10.1 0 007.61 3.39 10.23 10.23 0 009.74-7.1 10.1 10.1 0 006.76-4.89 10.23 10.23 0 00-1.26-11.97v.03zM22.19 38.55a7.57 7.57 0 01-4.85-1.75c.06-.03.17-.09.24-.13l8.05-4.65a1.3 1.3 0 00.66-1.14V19.13l3.4 1.97c.04.02.06.06.07.1v9.41a7.6 7.6 0 01-7.57 7.94zM5.88 31.59a7.57 7.57 0 01-.91-5.09c.06.04.16.1.23.15l8.05 4.65c.41.24.92.24 1.33 0l9.83-5.68v3.93a.12.12 0 01-.05.11l-8.14 4.7a7.6 7.6 0 01-10.34-2.77zm-1.18-17.6A7.57 7.57 0 018.67 9.8v9.57a1.3 1.3 0 00.65 1.13l9.83 5.67-3.4 1.97a.12.12 0 01-.12 0L6.49 23.42a7.6 7.6 0 01-1.79-9.43zm27.93 6.52l-9.83-5.68 3.4-1.96a.12.12 0 01.12 0l9.14 5.28a7.6 7.6 0 01-1.18 13.71v-9.57a1.3 1.3 0 00-.65-1.14v.36zm3.38-5.12c-.06-.04-.16-.1-.23-.14L27.74 10.6a1.33 1.33 0 00-1.33 0l-9.83 5.68v-3.93a.12.12 0 01.05-.1L24.77 7.5a7.6 7.6 0 0111.24 7.89zM14.84 22.86l-3.4-1.96a.12.12 0 01-.07-.1v-9.41A7.6 7.6 0 0123.8 8.14c-.06.03-.17.09-.24.13L15.5 12.9a1.3 1.3 0 00-.66 1.14v11.27-.45zm1.84-3.98l4.37-2.53 4.38 2.52v5.04L21.05 26.4l-4.37-2.52v-5.04z" fill="currentColor"/>
        </svg>
        <span className="font-bold text-slate-800 text-base">OpenAI</span>
      </div>
    ),
  },
]

/* ─────────────────────────────────────────────
   Service icons for hero strip
   (removed standalone "Development" label)
───────────────────────────────────────────── */
const SERVICE_STRIPS = [
  { icon: Brain,        label: 'AI Development' },
  { icon: Zap,          label: 'AI Automations' },
  { icon: ShoppingBag,  label: 'Shopify' },
  { icon: ShoppingCart, label: 'E-commerce' },
  { icon: Smartphone,   label: 'Mobile Apps' },
]

/* ─────────────────────────────────────────────
   Milestone icons
───────────────────────────────────────────── */
const MILESTONE_ICONS: Record<string, React.FC<any>> = {
  'Online Stores Launched': Store,
  'Android Apps': Smartphone,
  'iOS Apps': Award,
  'Industries Served': Building2,
  'Client Satisfaction': SmilePlus,
  'Support Available': Clock,
  'Support & Maintenance': Clock,
}

/* ─────────────────────────────────────────────
   Service card data (synced with DB)
───────────────────────────────────────────── */
const SERVICE_META: Record<string, { icon: React.FC<any>; desc: string; color: string }> = {
  'ai-development':            { icon: Brain,        desc: 'Custom AI solutions, LLM integrations, predictive analytics & more.', color: 'bg-purple-100 text-purple-600' },
  'ai-automations':            { icon: Zap,          desc: 'Automate workflows, reduce manual tasks & boost productivity.', color: 'bg-amber-100 text-amber-600' },
  'shopify-developers-kerala': { icon: ShoppingBag,  desc: 'High converting Shopify stores, custom apps, theme development.', color: 'bg-green-100 text-green-600' },
  'ecommerce-development':     { icon: ShoppingCart, desc: 'Scalable, secure & feature-rich e-commerce solutions.', color: 'bg-brand-100 text-brand-600' },
  'mobile-app-development':    { icon: Smartphone,   desc: 'Android & iOS apps that deliver smooth user experiences.', color: 'bg-rose-100 text-rose-600' },
}

/* Services outside the 5 known slugs above (mostly migrated WordPress pages)
   all fell back to the same Brain icon/brand color. Give each a varied
   icon+color combo instead — picked deterministically from the slug so it's
   stable across renders rather than truly random. */
const SERVICE_VARIANT_POOL: { icon: React.FC<any>; color: string }[] = [
  { icon: Globe,    color: 'bg-slate-100 text-slate-600' },
  { icon: Layout,   color: 'bg-cyan-100 text-cyan-600' },
  { icon: Palette,  color: 'bg-pink-100 text-pink-600' },
  { icon: Rocket,   color: 'bg-orange-100 text-orange-600' },
  { icon: Code,     color: 'bg-teal-100 text-teal-600' },
  { icon: Layers,   color: 'bg-fuchsia-100 text-fuchsia-600' },
  { icon: Wrench,   color: 'bg-lime-100 text-lime-600' },
  { icon: Cloud,    color: 'bg-sky-100 text-sky-600' },
  { icon: Sparkles, color: 'bg-violet-100 text-violet-600' },
]
function pickServiceVariant(slug: string) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  return SERVICE_VARIANT_POOL[hash % SERVICE_VARIANT_POOL.length]
}

/* ─────────────────────────────────────────────
   Case study badge colours
───────────────────────────────────────────── */
const CATEGORY_BADGE: Record<string, string> = {
  ecommerce:         'bg-green-100 text-green-700',
  'mobile-app':      'bg-purple-100 text-purple-700',
  'web-development': 'bg-brand-100 text-brand-700',
}
const CATEGORY_LABEL: Record<string, string> = {
  ecommerce:         'E-commerce',
  'mobile-app':      'Mobile App',
  'web-development': 'Web Development',
}

const CS_GRADIENTS = [
  'from-blue-50 to-indigo-100',
  'from-amber-50 to-orange-100',
  'from-slate-800 to-slate-900',
]

function getInitials(name?: string) {
  return (name || '').split(/[\s—-]/g).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
const TEAM_COLORS = ['bg-brand-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-500', 'bg-rose-600', 'bg-teal-600']

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default async function HomePage() {
  const payload = await getPayload()

  // Home rows show FEATURED entries (toggle `featured` + set `order` in the CMS to control them).
  const featured = { status: { equals: 'published' }, featured: { equals: true } }
  const [servicesRes, milestonesRes, projectsRes, teamRes, testimonialsRes, homeRes, technologiesRes] = await Promise.allSettled([
    payload.find({ collection: 'services', where: featured, limit: 12, sort: 'order', depth: 0 }),
    payload.find({ collection: 'milestones', limit: 6, sort: 'order' }),
    payload.find({ collection: 'projects', where: featured, limit: 12, sort: 'order', depth: 1 }),
    payload.find({ collection: 'team-members', limit: 6, sort: 'order', depth: 1 }),
    payload.find({ collection: 'testimonials', where: { featured: { equals: true } }, limit: 12, depth: 1 }),
    payload.find({ collection: 'home-settings', limit: 1 }),
    payload.find({ collection: 'technologies', where: featured, limit: 20, sort: 'order', depth: 0 }),
  ])

  const services     = servicesRes.status     === 'fulfilled' ? (servicesRes.value.docs     as any[]) : []
  const milestones   = milestonesRes.status   === 'fulfilled' ? (milestonesRes.value.docs   as any[]) : []
  const projects     = projectsRes.status     === 'fulfilled' ? (projectsRes.value.docs     as any[]) : []
  const team         = teamRes.status         === 'fulfilled' ? (teamRes.value.docs         as any[]) : []
  const testimonials = testimonialsRes.status === 'fulfilled' ? (testimonialsRes.value.docs as any[]) : []
  const technologies = technologiesRes.status === 'fulfilled' ? (technologiesRes.value.docs as any[]) : []

  // Editable home content — the single row in the dedicated Home Settings collection.
  // Each field falls back to the original copy if the entry/field is blank.
  // A handful of fields survived a CSV re-import with an all-lowercase key
  // (e.g. `heroBadge` -> `herobadge`), so fall back to that variant too.
  const home: any = (homeRes.status === 'fulfilled' ? homeRes.value.docs[0] : null) ?? {}
  const h = (key: string, fallback = ''): string => {
    const raw = home[key] ?? home[key.toLowerCase()]
    return (raw && String(raw).trim()) || fallback
  }

  return (
    <div>

      {/* ══════════════ 1. HERO (full-bleed under the fixed header) ══════════════ */}
      <section className="relative bg-white overflow-hidden">
        {/* The image's own box is fixed to 90vh (not the whole section) and
            fully covers that box via `object-cover` — no cropped/aspect-locked
            band inside it. The section itself is back to its natural,
            content-driven height, so the plain white gap below the image
            (once content runs past 90vh) returns as the visual separation
            into the next section, instead of the image being stretched to
            chase the section's full height everywhere. */}
        <div className="absolute inset-x-0 top-0 w-full h-[90vh]">
          <Image
            src="/images/home_background.jpg"
            alt=""
            fill
            priority
            className="object-cover animate-hero-bg-fade-in"
          />
        </div>

        {/* ── Centered hero content ── */}
        <div className="container max-w-4xl relative z-10 pt-28 pb-12 sm:pt-32 lg:pt-40 lg:pb-16 flex flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold uppercase tracking-[0.25em]">
            <Sparkles className="h-3.5 w-3.5" />
            {h('heroBadge')}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[70px] font-black leading-tight tracking-tight text-slate-900">
            {h('heroTitle')}{' '}
            <span className="bg-clip-text text-transparent animate-gradient-text">{h('heroTitleHighlight')}</span>
          </h1>
          <p className="mt-5 text-slate-600 text-base font-inter leading-relaxed max-w-2xl">
            {h('heroSubtitle')}
          </p>

          {/* Service icon strip */}
          <div className="mt-8 flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
            {SERVICE_STRIPS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2.5">
                <div className="h-16 w-16 rounded-2xl bg-white shadow-md flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <Icon className="h-7 w-7 text-brand-600" strokeWidth={1.75} />
                </div>
                {/* `whitespace-nowrap` instead of a fixed max-width — "AI
                    Automations" was the one label long enough to wrap onto a
                    second line while every other item stayed on one, making
                    that single item taller and throwing off the row's
                    alignment. */}
                <span className="text-xs font-medium text-slate-600 text-center leading-tight whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href={h('heroPrimaryCtaLink')}
              className="group relative isolate overflow-hidden inline-flex h-11 sm:h-12 items-center gap-2 px-5 sm:px-7 rounded-xl bg-brand-600 text-white font-bold text-[15px] shadow-lg whitespace-nowrap transition-all duration-300 ease-out hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-600/30 active:translate-y-0 active:scale-[0.97] active:duration-100 before:absolute before:inset-0 before:-z-10 before:-translate-x-[150%] before:skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-[150%]"
            >
              {h('heroPrimaryCtaLabel')}
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={h('heroSecondaryCtaLink')}
              className="group relative isolate overflow-hidden inline-flex h-11 sm:h-12 items-center gap-2 px-5 sm:px-7 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-[15px] shadow-sm whitespace-nowrap transition-all duration-300 ease-out hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.97] active:duration-100 before:absolute before:inset-0 before:-z-10 before:-translate-x-[150%] before:skew-x-12 before:bg-gradient-to-r before:from-transparent before:via-brand-100/60 before:to-transparent before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-[150%]"
            >
              <span className="h-6 w-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                <Play className="h-3 w-3 ml-0.5 text-brand-600" />
              </span>
              {h('heroSecondaryCtaLabel')}
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════ 2. TECHNOLOGIES WE TRUST ══════════════ */}
      <section className="pt-4 pb-10 bg-white border-b border-slate-100">
        {/* max-w-7xl — the header's own container (holding the logo and nav)
            is max-w-7xl, not max-w-6xl like the rest of this page's sections.
            Matching that exactly (not just matching the other sections,
            which sit narrower) is what actually lines this strip's left/right
            edges up with the logo's own starting point on every screen. */}
        <div className="container max-w-7xl">
          {/* Minimal auto-scrolling logo strip. The track's content is
              rendered twice back-to-back and animated exactly -50% so the
              loop is seamless; pauses on hover so a logo can be read, and
              sits still under prefers-reduced-motion (see .animate-marquee
              in globals.css). `overflow-hidden` keeps it to one row. */}
          <div className="overflow-hidden">
            <div className="flex items-center w-max animate-marquee gap-10 lg:gap-14">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center gap-10 lg:gap-14 shrink-0" aria-hidden={copy === 1}>
                  {technologies.length > 0
                    ? technologies.map((t: any) => (
                        <div key={t.id} className="flex items-center gap-4 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                          {t.logo?.url ? (
                            <Image src={t.logo.url} alt={t.name} width={56} height={56} className="h-14 w-14 object-contain" />
                          ) : (
                            // Fallback icon for technologies without a logo set in the
                            // CMS — keeps every item the same icon+text height so the
                            // row doesn't visibly dip where one entry lacks an image.
                            <Code2 className="h-14 w-14 text-slate-400" strokeWidth={1.5} />
                          )}
                          <span className="font-bold text-slate-700 text-xl whitespace-nowrap">{t.name}</span>
                        </div>
                      ))
                    : TECH_LOGOS.map(({ name, logo }) => (
                        <div key={name} className="flex items-center shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                          {logo}
                        </div>
                      ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 3. WHAT WE DO ══════════════ */}
      <section className="py-16 bg-white">
        {/* max-w-7xl to match the header's own container exactly (see the
            Technologies strip above) — the cards' left/right edges line up
            with the logo's starting point instead of sitting narrower. */}
        <div className="container max-w-7xl">
          <div className="text-center mb-10">
            <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-2">{h('solutionsEyebrow')}</p>
            <h2 className="text-[38px] font-extrabold text-slate-900">{h('solutionsTitle')}</h2>
            <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">
              {h('solutionsSubtitle')}
            </p>
          </div>

          {/* Single horizontal row (scrolls if it overflows) — nav arrows
              show up only when there's more to scroll to in that direction. */}
          <HorizontalScrollRow rowClassName="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x">
            {services.map((svc: any) => {
              const variant = pickServiceVariant(svc.slug)
              const meta = SERVICE_META[svc.slug] ?? { icon: variant.icon, desc: svc.shortDescription || '', color: variant.color }
              const Icon = meta.icon
              return (
                <Link
                  key={svc.id}
                  href={`/${svc.slug}`}
                  className="group relative flex flex-col text-left p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-brand-200 hover:shadow-lg transition-all bg-white shrink-0 w-[290px] snap-start"
                >
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-brand-600 group-hover:border-brand-600 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="h-16 w-16 flex items-center justify-center mb-5 text-slate-600">
                    <Icon className="h-9 w-9" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 pr-8 line-clamp-2">{svc.title}</h3>
                  {/* Plain clamped text instead of ExpandableText — its "More"
                      toggle had to stopPropagation to avoid triggering this
                      card's own Link, which meant part of the card didn't
                      navigate on click. The whole card should always open the
                      service's detail page, so there's no separate control
                      here to intercept that. */}
                  <p className="text-slate-500 text-[15px] leading-relaxed flex-1 line-clamp-4">{meta.desc}</p>
                </Link>
              )
            })}
          </HorizontalScrollRow>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              {h('servicesViewAllLabel')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ 4. MILESTONES / STATS BAR ══════════════ */}
      {milestones.length > 0 && (
        <section className="bg-gradient-to-r from-brand-600 via-brand-500 to-[#0095da] py-8">
          {/* max-w-7xl — matches the header/logo and the Technologies strip,
              so this bar's left/right edges line up with them too. */}
          <div className="container max-w-7xl">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
              {milestones.slice(0, 6).map((m: any, i: number) => {
                // CMS Milestones store the number in `year` and the label in `title`.
                const value = m.value ?? m.year
                const label = m.label ?? m.title
                const Icon = MILESTONE_ICONS[label] ?? Store
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col items-center text-white text-center px-2 ${i > 0 ? 'sm:border-l sm:border-white/20' : ''}`}
                  >
                    <Icon className="h-9 w-9 mb-3 text-white/80" />
                    <span className="text-4xl font-black tracking-tight">{value}</span>
                    {/* `whitespace-nowrap` needs the label small enough to
                        actually fit that one line in a narrow grid column
                        (6 columns across, even at just the sm breakpoint) —
                        stepping the size up by breakpoint instead of a single
                        fixed size keeps it fitting instead of overflowing
                        onto neighboring columns on smaller screens. */}
                    <span className="mt-2 text-[9px] sm:text-[11px] lg:text-sm font-medium text-blue-100 leading-snug whitespace-nowrap">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ 5b. PROJECTS / PORTFOLIO ══════════════ */}
      {projects.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container max-w-6xl">
            <div className="text-center mb-10">
              <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-2">{h('projectsEyebrow')}</p>
              <h2 className="text-[38px] font-extrabold text-slate-900">{h('projectsTitle')}</h2>
            </div>

            <HorizontalScrollRow rowClassName="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x">
              {projects.map((project: any, i: number) => {
                const badgeClass = CATEGORY_BADGE[project.category] ?? 'bg-slate-100 text-slate-700'
                const badgeLabel = CATEGORY_LABEL[project.category] ?? project.category
                const coverUrl = project.coverImage?.url ?? project.thumbnailImage?.url ?? '/images/portfolio-default.png'
                return (
                  <Link
                    key={project.id}
                    href={`/works/${project.slug}`}
                    className="rounded-2xl border border-slate-100 bg-white overflow-hidden hover:shadow-lg transition-shadow group shrink-0 w-[320px] snap-start"
                  >
                    <div className={`relative h-44 bg-gradient-to-br ${CS_GRADIENTS[i % CS_GRADIENTS.length]} flex items-center justify-center overflow-hidden`}>
                      {coverUrl ? (
                        <Image src={coverUrl} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-black ${TEAM_COLORS[i % TEAM_COLORS.length]}`}>
                          {getInitials(project.title)}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${badgeClass}`}>{badgeLabel}</span>
                      <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-2">{project.title}</h3>
                      {project.client && <p className="text-xs text-slate-500">{project.client}</p>}
                    </div>
                  </Link>
                )
              })}
            </HorizontalScrollRow>

            <div className="text-center mt-10">
              <Link
                href="/works"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-600 text-brand-600 font-semibold text-sm hover:bg-brand-600 hover:text-white transition-colors"
              >
                {h('projectsViewAllLabel')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ 6. TEAM — 6 members, 3-col grid ══════════════ */}
      {team.length > 0 && (
        <section className="py-20 bg-slate-50">
          {/* max-w-7xl — matches the header/logo and the Technologies strip,
              so this section's edges line up with them too. */}
          <div className="container max-w-7xl">
            <div className="text-center mb-10">
              <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-2">{h('teamEyebrow')}</p>
              <h2 className="text-[38px] font-extrabold text-slate-900">{h('teamTitle')}</h2>
              <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">
                {h('teamSubtitle')}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-12">
              {team.slice(0, 6).map((member: any, i: number) => {
                const photoUrl = member.photo?.url
                return (
                  <div key={member.id} className="flex flex-col items-center text-center w-[calc(50%-24px)] sm:w-[calc(33.333%-32px)] lg:w-[calc(16.666%-40px)]">
                    <div className="relative mb-4">
                      <div className="h-36 w-36 rounded-full overflow-hidden ring-4 ring-white shadow-md">
                        {photoUrl ? (
                          <Image src={photoUrl} alt={member.name} width={144} height={144} className="object-cover w-full h-full" />
                        ) : (
                          <div className={`h-full w-full flex items-center justify-center text-white text-4xl font-black ${TEAM_COLORS[i % TEAM_COLORS.length]}`}>
                            {getInitials(member.name)}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xl">{member.name}</h3>
                    {/* whitespace-nowrap keeps the role title on one line —
                        stepping the size down on narrower columns (mobile's
                        2-per-row grid is the tightest fit) instead of a single
                        fixed size keeps longer titles from overflowing their
                        column. */}
                    <p className="text-sm sm:text-base text-slate-500 mt-1 whitespace-nowrap">{member.role}</p>
                    <div className="flex gap-2.5 mt-4">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                          className="h-10 w-10 rounded-full bg-[#0077B5] flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Linkedin className="h-[18px] w-[18px] text-white" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noopener noreferrer"
                          className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity">
                          <Twitter className="h-[18px] w-[18px] text-white" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`}
                          className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors">
                          <Mail className="h-[18px] w-[18px] text-slate-600" />
                        </a>
                      )}
                      {!member.linkedin && !member.twitter && !member.email && (
                        <>
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <Linkedin className="h-[18px] w-[18px] text-slate-400" />
                          </div>
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <Twitter className="h-[18px] w-[18px] text-slate-400" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/team"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-brand-600 text-brand-600 font-semibold text-sm hover:bg-brand-600 hover:text-white transition-colors"
              >
                {h('teamViewAllLabel')}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ 7. TESTIMONIALS ══════════════ */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container max-w-6xl">
            <div className="text-center mb-10">
              <div className="flex items-center gap-4 justify-center mb-2">
                <div className="h-px flex-1 bg-slate-200 max-w-[80px]" />
                <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-slate-500">{h('testimonialsEyebrow')}</p>
                <div className="h-px flex-1 bg-slate-200 max-w-[80px]" />
              </div>
              <h2 className="text-[38px] font-extrabold text-slate-900 mt-2">{h('testimonialsTitle')}</h2>
            </div>
            <HomeTestimonials testimonials={testimonials.map((t: any) => ({
              id: t.id,
              quote: t.quote,
              author: t.author,
              position: t.position,
              company: t.company,
              avatar: t.avatar?.url ?? null,
              rating: t.rating ?? 5,
            }))} />
          </div>
        </section>
      )}

      {/* ══════════════ 8. BOTTOM CTA ══════════════ */}
      <section className="bg-gradient-to-r from-brand-600 via-brand-500 to-[#0095da] py-12 mb-0 sm:mb-0">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h2 className="text-[38px] font-extrabold text-white leading-tight">{h('ctaTitle')}</h2>
                <p className="text-blue-100 text-base mt-0.5">{h('ctaSubtitle')}</p>
              </div>
            </div>
            <Link
              href={h('ctaButtonLink')}
              className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-bold hover:bg-white hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              {h('ctaButtonLabel')}
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom padding on mobile to clear floating button */}
      <div className="h-20 lg:hidden" />

    </div>
  )
}
