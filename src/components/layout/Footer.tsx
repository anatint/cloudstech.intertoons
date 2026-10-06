import Link from 'next/link'
import Image from 'next/image'
import {
  Facebook, Linkedin, Instagram, Youtube, Twitter, Mail, Phone, MapPin,
  Link2, Package, Box, Send, ChevronRight,
  Sparkles, ShieldCheck, Zap, Users, ArrowUp, Code2,
} from 'lucide-react'
import { FooterNewsletterForm } from './FooterNewsletterForm'

const QUICK_LINKS_BASE = [
  ['Home', '/'],
  ['Services', '/services'],
  ['Products', '/products'],
  ['Portfolio', '/works'],
  ['About Us', '/about-us'],
  ['Team', '/team'],
  ['Blog', '/blog'],
]
const SERVICES_FALLBACK = [
  ['AI Development', '/ai-development'],
  ['AI Automations', '/ai-automations'],
  ['Shopify Developers Kerala', '/shopify-developers-kerala'],
  ['E-commerce Development', '/ecommerce-development'],
  ['Mobile App Development', '/mobile-app-development'],
]
const PRODUCTS_FALLBACK = [
  ['Plattero — Food Delivery', '/products/food-delivery-app'],
  ['Triptels — Travel Portal', '/products/travel-portal-saas'],
  ['Car Rental System', '/products/car-rental-system'],
  ['ConvoAI — AI Chatbots', '/products/ai-chatbots'],
]
const TRUST_STRIP = [
  { icon: Sparkles, title: 'Innovative Solutions', sub: 'Built for a smarter tomorrow' },
  { icon: ShieldCheck, title: 'Trusted by 200+ Clients', sub: 'Across multiple industries' },
  { icon: Zap, title: 'On-Time Delivery', sub: 'Every project, every time' },
  { icon: Users, title: 'Expert Team', sub: 'Skilled. Passionate. Dedicated.' },
]

/* eslint-disable @typescript-eslint/no-explicit-any */
const pick4 = (arr?: any[]) => [...(arr ?? [])].sort(() => Math.random() - 0.5).slice(0, 4)

function FooterColumn({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <span className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-violet-600" />
        </span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600">{title}</h4>
      </div>
      <ul className="space-y-1">{children}</ul>
    </div>
  )
}

function FooterRow({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-2 rounded-lg py-1.5 text-sm text-slate-600 hover:text-brand-600 transition-colors"
      >
        <span className="line-clamp-1">{label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </Link>
    </li>
  )
}

export function Footer({ footerData, services: svc, products: prod, industries: inds, technologies: techs, settings, contactHref = '/contact-us' }: { footerData?: any; services?: any[]; products?: any[]; industries?: any[]; technologies?: any[]; settings?: any; contactHref?: string }) {
  const s = settings ?? {}
  const quickLinks = [...QUICK_LINKS_BASE, ['Contact', `${contactHref}#contact-form`]]
  const services = svc?.length
    ? svc.filter((x) => x?.slug && x.title).slice(0, 9).map((x) => [x.title as string, `/${x.slug}`])
    : SERVICES_FALLBACK.slice(0, 9)
  const products = prod?.length
    ? prod.filter((p) => p?.slug && p.name).slice(0, 6).map((p) => [p.name as string, `/products/${p.slug}`])
    : PRODUCTS_FALLBACK
  const socials = [
    { Icon: Facebook, href: s.facebook || 'https://facebook.com/intertoons' },
    { Icon: Twitter, href: s.twitter || 'https://twitter.com/intertoons' },
    { Icon: Linkedin, href: s.linkedin || 'https://linkedin.com/company/intertoons' },
    { Icon: Instagram, href: s.instagram || 'https://instagram.com/intertoons' },
    { Icon: Youtube, href: s.youtube || 'https://youtube.com/@intertoons' },
  ].filter((x) => x.href)
  // A handful of real technologies for the trust-strip logos (not the full list).
  const stripTech = pick4(techs).filter((x) => x?.slug && x.name && x.id !== undefined)

  return (
    <footer
      className="relative"
      style={{
        // Soft color glow concentrated on the left edge and along the bottom
        // (matching the reference), fading to plain white toward the right —
        // a diagonal linear gradient washed color evenly across the whole
        // panel instead, which is what didn't match.
        backgroundImage: [
          'radial-gradient(55% 75% at 0% 25%, rgba(167,139,250,0.30), transparent 70%)',
          'radial-gradient(70% 55% at 20% 100%, rgba(99,102,241,0.28), transparent 70%)',
          'radial-gradient(45% 45% at 100% 10%, rgba(196,181,253,0.18), transparent 70%)',
        ].join(', '),
        backgroundColor: '#ffffff',
      }}
    >

      {/* ── Top section — left-aligned multi-column ── */}
      <div className="container py-14 lg:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] lg:gap-8">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.logo || '/logo.png'}
                alt={s.siteName || 'Intertoons'}
                className="h-9 sm:h-10 w-auto object-contain max-w-[190px]"
              />
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              {s.tagline || 'We help businesses grow with AI, automation and digital solutions that create real impact.'}
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map(({ Icon, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn icon={Link2} title="Quick Links">
            {quickLinks.map(([label, href]) => <FooterRow key={href} href={href} label={label} />)}
          </FooterColumn>

          {/* Our Services */}
          <FooterColumn icon={Package} title="Our Services">
            {services.map(([label, href]) => <FooterRow key={href} href={href} label={label} />)}
            <li>
              <Link href="/services" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1 py-1.5">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </FooterColumn>

          {/* Our Products */}
          <FooterColumn icon={Box} title="Our Products">
            {products.map(([label, href]) => <FooterRow key={href} href={href} label={label} />)}
          </FooterColumn>


          {/* Contact Us */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <span className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Send className="h-3.5 w-3.5 text-violet-600" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600">Contact Us</h4>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 mb-6">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-violet-500 shrink-0" />
                <a href={`tel:${(s.phone || '+91 484 123 4567').replace(/\s/g, '')}`} className="hover:text-brand-600 transition-colors whitespace-nowrap">{s.phone || '+91 484 123 4567'}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-violet-500 shrink-0" />
                <a href={`mailto:${s.email || 'hello@intertoons.com'}`} className="hover:text-brand-600 transition-colors whitespace-nowrap">{s.email || 'hello@intertoons.com'}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                <span>{s.addressLine || 'Kochi, Kerala — 682 030, India'}</span>
              </li>
            </ul>

            <div className="rounded-xl bg-white/70 border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-800 mb-0.5">Stay Updated</p>
              <p className="text-xs text-slate-500 mb-3">Get the latest updates, ideas and offers from Intertoons.</p>
              <FooterNewsletterForm />
            </div>
          </div>
        </div>

        {/* ── Trust strip ── */}
        <div className="mt-12 rounded-2xl bg-white/70 border border-slate-200 shadow-sm px-6 py-5 flex flex-wrap items-center gap-y-4 justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {TRUST_STRIP.map((t, i) => (
              <div key={t.title} className={`flex items-center gap-2.5 ${i > 0 ? 'sm:border-l sm:border-slate-200 sm:pl-8' : ''}`}>
                <span className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <t.icon className="h-4 w-4 text-violet-600" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{t.title}</p>
                  <p className="text-[11px] text-slate-400 leading-tight">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
          {stripTech.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 sm:border-l sm:border-slate-200 sm:pl-8">
              {stripTech.map((t: any) => (
                <div key={t.id} className="flex items-center gap-1.5 opacity-70">
                  {t.logo?.url ? (
                    <Image src={t.logo.url} alt={t.name} width={20} height={20} className="h-5 w-5 object-contain" />
                  ) : (
                    <Code2 className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                  )}
                  <span className="font-bold text-slate-600 text-sm whitespace-nowrap">{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar — dark, with a wave divider at its top edge ── */}
      <div className="relative">
        <svg className="absolute -top-6 left-0 w-full h-6 text-[#0B1130]" viewBox="0 0 1440 48" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
          <path d="M0 48 C 360 0 1080 0 1440 48 Z" />
        </svg>
        <div className="bg-[#0B1130] text-slate-300">
          <div className="container flex flex-col items-center gap-3 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} {s.addressTitle || 'Intertoons Internet Services Pvt. Ltd.'} All Rights Reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacypolicy" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1">
                Back to top <ArrowUp className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
