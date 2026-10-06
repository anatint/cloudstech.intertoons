import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Mail, Phone, MapPin, Clock, ChevronRight, MessageSquare,
  Globe, Linkedin, Twitter, Instagram, Youtube,
} from 'lucide-react'
import { getSiteSettings, socialLinks, field, getContactPage, getContactHref } from '@/lib/settings'
import { getPayload } from '@/lib/payload'
import ContactForm from '@/components/ContactForm'

async function fetchTitles(collection: string, sort = 'order') {
  try {
    const payload = await getPayload()
    const { docs } = await payload.find({ collection, where: { status: { equals: 'published' } }, sort, limit: 50 })
    return (docs as any[]).map((d) => String(d.title || '').trim()).filter(Boolean)
  } catch {
    return []
  }
}

export async function getContactPageMetadata(): Promise<Metadata> {
  const p = await getContactPage()
  const href = await getContactHref()
  return {
    title: field(p, 'seoTitle'),
    description: field(p, 'seoDescription'),
    alternates: { canonical: href },
  }
}

export default async function ContactPageContent() {
  const [s, pg, serviceOptions, budgetOptions] = await Promise.all([
    getSiteSettings(),
    getContactPage(),
    fetchTitles('rfq-project-types'),
    fetchTitles('budget-ranges', 'number'),
  ])

  const contactInfo = [
    { icon: <Phone className="h-5 w-5 text-brand-600" />, label: 'Phone', value: s.phone, sub: `${s.phoneWhatsapp} (WhatsApp)`, href: `tel:${s.phone.replace(/\s/g, '')}` },
    { icon: <Mail className="h-5 w-5 text-brand-600" />, label: 'Email', value: s.email, sub: s.emailSupport, href: `mailto:${s.email}` },
    { icon: <MapPin className="h-5 w-5 text-brand-600" />, label: 'Address', value: s.addressTitle, sub: s.addressLine, href: s.mapUrl },
    { icon: <Clock className="h-5 w-5 text-brand-600" />, label: 'Business Hours', value: s.businessHours, sub: s.emergencySupport, href: null as string | null },
  ]
  const socialIcon: Record<string, React.ReactNode> = {
    facebook: <Globe className="h-4 w-4" />, twitter: <Twitter className="h-4 w-4" />,
    linkedin: <Linkedin className="h-4 w-4" />, instagram: <Instagram className="h-4 w-4" />,
    youtube: <Youtube className="h-4 w-4" />,
  }
  const socials = socialLinks(s)
  const quickActions = [1, 2, 3]
    .map((i) => ({
      label: field(pg, `quickAction${i}Label`),
      href: field(pg, `quickAction${i}Link`),
    }))
    .filter((a) => a.label && a.href && !/read\s*case\s*stud/i.test(a.label))

  return (
    <div>
      {/* Hero (light theme, matches the blog/portfolio-detail hero redesign) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-28 pb-14 sm:pt-32 lg:pt-36 lg:pb-20">
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <Image src="/images/portfolio-detail-hero.png" alt="" fill className="object-cover" priority />
        </div>
        <div className="container max-w-6xl relative z-10 text-center">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold">
            <MessageSquare className="h-4 w-4" />
            {field(pg, 'heroBadge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            {field(pg, 'heroTitle')}<br />
            <span className="bg-clip-text text-transparent animate-gradient-text">{field(pg, 'heroTitleHighlight')}</span>
          </h1>
          <p className="mt-5 text-slate-500 text-base max-w-xl mx-auto">
            {field(pg, 'heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px]">
            {/* Form (client component) */}
            <ContactForm
              supportEmail={s.email}
              heading={field(pg, 'formHeading')}
              subtext={field(pg, 'formSubtext')}
              serviceOptions={serviceOptions}
              budgetOptions={budgetOptions}
            />

            {/* Sidebar — contact info */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-brand-600" />
                  Contact Information
                </h3>
                <div className="space-y-5">
                  {contactInfo.map((c) => (
                    <div key={c.label} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">{c.icon}</div>
                      <div>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.label}</div>
                        {c.href ? (
                          <a href={c.href} className="text-[15px] font-semibold text-slate-800 hover:text-brand-600 transition-colors block mt-0.5">{c.value}</a>
                        ) : (
                          <div className="text-[15px] font-semibold text-slate-800 mt-0.5">{c.value}</div>
                        )}
                        <div className="text-sm text-slate-500 mt-0.5">{c.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social links */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-extrabold text-slate-900 mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-3">
                  {socials.map((soc) => (
                    <a key={soc.key} href={soc.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 text-xs font-medium transition-colors capitalize">
                      {socialIcon[soc.key]}
                      {soc.key}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-brand-600 rounded-2xl p-6">
                <h3 className="font-extrabold text-white mb-4">{field(pg, 'quickActionsTitle')}</h3>
                <div className="space-y-2">
                  {quickActions.map(({ label, href }) => (
                    <Link key={href} href={href} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                      {label} <ChevronRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-slate-100 h-72 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-brand-400 mx-auto mb-3" />
            <div className="text-slate-600 font-semibold">{s.addressLine}</div>
            <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
              View on Google Maps <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </section>
    </div>
  )
}
