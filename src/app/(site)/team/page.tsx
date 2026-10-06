import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Users } from 'lucide-react'
import { getPayload } from '@/lib/payload'
import { getPage, field } from '@/lib/settings'
import TeamGrid, { type TeamMember } from '@/components/TeamGrid'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPage('team')
  return {
    title: field(p, 'seoTitle'),
    description: field(p, 'seoDescription'),
    alternates: { canonical: '/team' },
  }
}

export default async function TeamPage() {
  const payload = await getPayload()
  const [pg, { docs }] = await Promise.all([
    getPage('team'),
    payload.find({ collection: 'team-members', where: { status: { equals: 'published' } }, sort: 'order', limit: 50 }),
  ])

  const members: TeamMember[] = (docs as any[]).map((d) => ({
    id: d.id,
    name: d.name || '',
    role: d.role || '',
    category: d.category || '',
    photo: d.photo?.url || '',
    bio: d.bio || '',
    expertise: Array.isArray(d.expertise) ? d.expertise : [],
    education: Array.isArray(d.education) ? d.education : [],
    highlights: Array.isArray(d.highlights) ? d.highlights : [],
    linkedin: d.linkedin || undefined,
    twitter: d.twitter || undefined,
    email: d.email || undefined,
    yearsExp: d.yearsExp || '',
  }))

  const stats = [1, 2, 3].map((i) => ({
    value: field(pg, `stat${i}Value`),
    label: field(pg, `stat${i}Label`),
  }))

  return (
    <div>
      {/* Hero (light theme, matches the about-us/blog hero redesign) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-28 pb-14 sm:pt-32 lg:pt-36 lg:pb-20">
        <div className="absolute inset-0 w-full pointer-events-none hidden md:block">
          <Image src="/images/portfolio-detail-hero.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-white/55" />
        </div>
        <div className="container max-w-6xl relative z-10 text-center">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold">
            <Users className="h-4 w-4" />
            {field(pg, 'heroBadge')}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            {field(pg, 'heroTitle')}<br />
            <span className="bg-clip-text text-transparent animate-gradient-text">{field(pg, 'heroTitleHighlight')}</span>
          </h1>
          <p className="mt-5 text-slate-500 text-base font-inter max-w-xl mx-auto">
            {field(pg, 'heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="container max-w-6xl py-6">
          <div className="grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team grid (client component: filter + modal) */}
      <TeamGrid members={members} />

      {/* Join CTA */}
      <section className="bg-brand-600 py-14">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-[38px] font-extrabold text-white leading-tight">{field(pg, 'ctaBannerTitle')}</h2>
                <p className="text-blue-100 text-base mt-0.5">
                  {field(pg, 'ctaBannerSubtitle')}
                </p>
              </div>
            </div>
            <Link
              href={field(pg, 'ctaBannerButtonLink')}
              className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-brand-600 transition-colors whitespace-nowrap"
            >
              {field(pg, 'ctaBannerButtonLabel')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
