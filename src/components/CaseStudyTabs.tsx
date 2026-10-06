'use client'

import { useState } from 'react'
import {
  LayoutDashboard, AlertTriangle, Lightbulb, Star, BarChart2,
  Cpu, Image as ImageIcon, ExternalLink, CheckCircle2, Zap,
  TrendingUp, Users, Puzzle, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const TABS = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'challenge', label: 'The Challenge', Icon: AlertTriangle },
  { id: 'solution', label: 'Our Solution', Icon: Lightbulb },
  { id: 'features', label: 'Key Features', Icon: Star },
  { id: 'results', label: 'Results', Icon: BarChart2 },
  { id: 'tech', label: 'Tech Stack', Icon: Cpu },
  { id: 'gallery', label: 'Gallery', Icon: ImageIcon },
]

const FEATURE_ICONS: Record<string, React.FC<any>> = {
  CheckCircle2, Zap, TrendingUp, Users, Puzzle, Star, Lightbulb,
}

interface Props {
  project: any
  basePath?: string
}

export default function CaseStudyTabs({ project, basePath = '/case-studies' }: Props) {
  const [active, setActive] = useState('overview')

  // Normalise the tech stack — supports the new `techStack[] { technology, role }`
  // shape as well as the legacy flat `technologies[]` array.
  const techItems: Array<{ name: string; role?: string }> = (
    project.techStack?.length
      ? project.techStack.map((t: any) => ({
          name: typeof t.technology === 'object' && t.technology ? t.technology.name : '',
          role: t.role,
        }))
      : (project.technologies ?? []).map((t: any) => ({ name: typeof t === 'string' ? t : t?.name }))
  ).filter((t: { name?: string }) => !!t.name)

  // Quote may live in a `quote` group ({ text, author }) or as flat fields.
  const quoteText = project.quote?.text ?? project.quoteText
  const quoteAuthor = project.quote?.author ?? project.quoteAuthor

  const availableTabs = TABS.filter((t) => {
    if (t.id === 'gallery') return project.gallery?.length > 0
    if (t.id === 'tech') return techItems.length > 0
    if (t.id === 'features') return project.keyFeatures?.length > 0
    if (t.id === 'results') return project.results?.length > 0
    if (t.id === 'challenge') return project.challenges?.length > 0
    if (t.id === 'solution') return !!project.solution
    return true
  })

  return (
    <div className="bg-white">
      {/* Tab bar */}
      <div className="border-b border-slate-200 sticky top-[100px] z-20 bg-white">
        <div className="container max-w-6xl">
          <div className="flex overflow-x-auto scrollbar-hide gap-1">
            {availableTabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active === id
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body: 2-col */}
      <div className="container max-w-6xl py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">

          {/* ── Main content ── */}
          <article className="space-y-14">

            {/* Overview */}
            {(active === 'overview') && project.overview && (
              <section id="overview">
                <SectionHeading>Project Overview</SectionHeading>
                <div className="text-slate-600 leading-relaxed">
                  <LexicalText content={project.overview} />
                </div>
              </section>
            )}

            {/* The Challenge */}
            {(active === 'overview' || active === 'challenge') && project.challenges?.length > 0 && (
              <section id="challenge">
                <SectionHeading>The Challenge</SectionHeading>
                <ul className="space-y-3">
                  {project.challenges.map((c: any, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{c.text || c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Our Solution */}
            {(active === 'overview' || active === 'solution') && project.solution && (
              <section id="solution">
                <SectionHeading>Our Solution</SectionHeading>
                <div className="text-slate-600 leading-relaxed">
                  <LexicalText content={project.solution} />
                </div>
              </section>
            )}

            {/* Key Features */}
            {(active === 'overview' || active === 'features') && project.keyFeatures?.length > 0 && (
              <section id="features">
                <SectionHeading>Key Features</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {project.keyFeatures.map((f: any, i: number) => {
                    const label = typeof f === 'string' ? f : f.title
                    const desc = typeof f === 'string' ? '' : f.description
                    const FIcon = (typeof f === 'object' && f && FEATURE_ICONS[f.icon]) || Star
                    return (
                      <div
                        key={i}
                        className="flex gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-brand-200 hover:bg-brand-50 transition-colors"
                      >
                        <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                          <FIcon className="h-5 w-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-base">{label}</p>
                          {desc && (
                            <p className="text-[15px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Results */}
            {(active === 'overview' || active === 'results') && project.results?.length > 0 && (
              <section id="results">
                <SectionHeading>Results</SectionHeading>
                <div className="flex flex-wrap gap-4">
                  {project.results.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="flex-1 min-w-[100px] text-center p-4 rounded-xl border border-slate-100 bg-slate-50"
                    >
                      <div className="text-2xl font-black text-brand-600">{r.metric}</div>
                      <div className="text-sm text-slate-500 mt-1 leading-tight">{r.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Quote */}
            {(active === 'overview') && quoteText && (
              <section>
                <div className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="absolute top-4 left-5 text-7xl leading-none font-serif text-slate-200 select-none">
                    &ldquo;
                  </span>
                  <blockquote className="relative pl-6">
                    <p className="text-slate-700 italic leading-relaxed">{quoteText}</p>
                    {quoteAuthor && (
                      <footer className="mt-3 text-sm font-semibold text-slate-500">
                        — {quoteAuthor}
                      </footer>
                    )}
                  </blockquote>
                </div>
              </section>
            )}

            {/* Tech Stack */}
            {active === 'tech' && techItems.length > 0 && (
              <section id="tech">
                <SectionHeading>Tech Stack</SectionHeading>
                <div className="flex flex-wrap gap-3">
                  {techItems.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium"
                    >
                      {t.name}
                      {t.role && (
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">{t.role}</span>
                      )}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {active === 'gallery' && project.gallery?.length > 0 && (
              <section id="gallery">
                <SectionHeading>Gallery</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {project.gallery.map((item: any, i: number) => {
                    const url = item.image?.url || item.url
                    return url ? (
                      <div key={i} className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={item.alt || `Gallery ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : null
                  })}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar ── */}
          <aside className="space-y-6">

            {/* Project Highlights */}
            {project.highlights?.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Project Highlights</h3>
                <ul className="space-y-3">
                  {project.highlights.map((h: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700">
                      <span className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                        <ChevronRight className="h-3.5 w-3.5 text-brand-600" />
                      </span>
                      {h.text || h}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              /* Fallback highlights from keyFeatures */
              project.keyFeatures?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Project Highlights</h3>
                  <ul className="space-y-3">
                    {project.keyFeatures.slice(0, 4).map((f: any, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-[15px] text-slate-700">
                        <span className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                          <ChevronRight className="h-3.5 w-3.5 text-brand-600" />
                        </span>
                        {typeof f === 'string' ? f : f.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            )}

            {/* Similar Project CTA */}
            <div className="rounded-2xl bg-brand-600 p-6 text-white">
              <h3 className="font-bold text-lg leading-snug mb-2">
                Have a Similar Project<br />in Mind?
              </h3>
              <p className="text-blue-100 text-base leading-relaxed mb-5">
                Let&apos;s build something amazing together. Share your ideas and we&apos;ll help you turn them into reality.
              </p>
              <Button
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-brand-600 font-semibold"
                asChild
              >
                <Link href="/request-a-quote#quote-form">
                  Request a Free Quote
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-extrabold text-slate-900 mb-5 pb-3 border-b border-slate-100">
      {children}
    </h2>
  )
}

function LexicalText({ content }: { content: any }) {
  if (!content) return null
  if (typeof content === 'string') return <p>{content}</p>
  if (typeof content !== 'object') return null
  try {
    // Extract plain text from a single node, in either Lexical (`children`/`.text`)
    // or Wix Ricos (`nodes`/`textData.text`, uppercase `type`) rich-text shape.
    const extractText = (node: any): string => {
      if (!node) return ''
      if (typeof node.text === 'string') return node.text
      if (typeof node.textData?.text === 'string') return node.textData.text
      const children = node.children || node.nodes || []
      return children.map(extractText).join('')
    }
    // Classic Lexical: { root: { children: [...] } }
    if (content.root) {
      const paragraphs = (content.root.children || []).map(extractText).filter(Boolean)
      return paragraphs.length ? <>{paragraphs.map((t: string, i: number) => <p key={i}>{t}</p>)}</> : null
    }
    // Wix Ricos: { nodes: [...] }
    if (Array.isArray(content.nodes)) {
      const paragraphs = content.nodes.map(extractText).filter(Boolean)
      return paragraphs.length ? <>{paragraphs.map((t: string, i: number) => <p key={i}>{t}</p>)}</> : null
    }
    return null
  } catch {
    return null
  }
}
