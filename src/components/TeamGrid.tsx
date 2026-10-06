'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  X, Linkedin, Twitter, Mail, ChevronRight,
  Briefcase, GraduationCap, Star, Code2, Palette, BarChart3,
} from 'lucide-react'

export interface TeamMember {
  id: string
  name: string
  role: string
  category: string
  photo: string
  bio: string
  expertise: string[]
  education: string[]
  highlights: string[]
  linkedin?: string
  twitter?: string
  email?: string
  yearsExp: string
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Team',
  leadership: 'Leadership',
  engineering: 'Engineering',
  design: 'Design',
  ops: 'Operations',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  leadership: <Star className="h-3.5 w-3.5" />,
  engineering: <Code2 className="h-3.5 w-3.5" />,
  design: <Palette className="h-3.5 w-3.5" />,
  ops: <BarChart3 className="h-3.5 w-3.5" />,
}

function getInitials(name?: string) {
  return (name || '').split(/[\s—-]/g).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selected, setSelected] = useState<TeamMember | null>(null)

  const filtered = activeFilter === 'all' ? members : members.filter((m) => m.category === activeFilter)

  return (
    <section className="bg-slate-50 py-16 lg:py-20">
      <div className="container max-w-6xl">
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-brand-50 hover:text-brand-600 border border-slate-200'
              }`}
            >
              {key !== 'all' && CATEGORY_ICONS[key]}
              {label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-16">No team members in this category.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelected(member)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 font-black text-4xl">
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-white font-black text-base leading-tight">{member.name}</div>
                    <div className="text-white/70 text-xs mt-0.5">{member.role}</div>
                  </div>
                  <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </div>
                </div>

                {(member.expertise.length > 0 || member.yearsExp || member.linkedin || member.email) && (
                  <div className="px-4 py-3 flex items-center justify-between">
                    {member.expertise.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {member.expertise.slice(0, 2).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 w-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                    {member.yearsExp && <div className="shrink-0 ml-2 text-xs font-bold text-brand-600">{member.yearsExp} yrs</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-48 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-t-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.1),transparent)]" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            <div className="px-8 pb-8">
              <div className="flex items-end gap-5 -mt-16 mb-6">
                <div className="h-28 w-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl shrink-0 relative bg-slate-100">
                  {selected.photo ? (
                    <Image src={selected.photo} alt={selected.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 font-black text-3xl">
                      {getInitials(selected.name)}
                    </div>
                  )}
                </div>
                <div className="pb-2">
                  <h2 className="text-2xl font-black text-slate-900">{selected.name}</h2>
                  <p className="text-brand-600 font-semibold text-sm">{selected.role}</p>
                  {selected.yearsExp && <p className="text-slate-500 text-xs mt-0.5">{selected.yearsExp} years experience</p>}
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                {selected.linkedin && (
                  <a href={selected.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {selected.twitter && (
                  <a href={selected.twitter} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 transition-colors">
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                )}
              </div>

              {selected.bio && <p className="text-slate-600 text-[15px] leading-relaxed mb-6">{selected.bio}</p>}

              {selected.expertise.length > 0 && (
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    <Briefcase className="h-3.5 w-3.5" />
                    Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.expertise.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selected.education.length > 0 && (
                <div className="mb-5">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Education
                  </h4>
                  <ul className="space-y-2">
                    {selected.education.map((edu) => (
                      <li key={edu} className="flex items-start gap-2 text-sm text-slate-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-2" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.highlights.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    <Star className="h-3.5 w-3.5" />
                    Highlights
                  </h4>
                  <ul className="space-y-2">
                    {selected.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <ChevronRight className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
