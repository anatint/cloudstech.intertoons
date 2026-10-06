'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

interface Testimonial {
  id: number
  quote: string
  author: string
  position: string
  company: string
  avatar?: string | null
  rating: number
}

interface Props {
  testimonials: Testimonial[]
}

function getInitials(name?: string) {
  return (name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-brand-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-500', 'bg-rose-600',
]

function TestimonialCard({ t, colorIdx }: { t: Testimonial; colorIdx: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative h-full flex flex-col">
      <span className="absolute top-5 right-5 text-4xl leading-none text-slate-100 font-serif select-none">&ldquo;</span>

      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
          <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-slate-600 text-[15px] leading-relaxed mb-5 flex-1">{t.quote}</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {t.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatar} alt={t.author} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]}`}>
            {getInitials(t.author)}
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900 text-sm">— {t.author}</p>
          <p className="text-xs text-slate-500">{t.position}{t.company ? `, ${t.company}` : ''}</p>
        </div>
      </div>
    </div>
  )
}

export default function HomeTestimonials({ testimonials }: Props) {
  const [active, setActive] = useState(0)
  const total = testimonials.length

  /* Desktop pagination (3-per-page) */
  const [page, setPage] = useState(0)
  const perPage = 3
  const totalPages = Math.ceil(total / perPage)
  const visible = testimonials.slice(page * perPage, page * perPage + perPage)

  const prev = () => setActive(i => (i - 1 + total) % total)
  const next = () => setActive(i => (i + 1) % total)

  if (!testimonials.length) return null

  return (
    <>
      {/* ── Mobile: single-card carousel ── */}
      <div className="md:hidden relative">
        <div className="overflow-hidden rounded-2xl">
          <TestimonialCard t={testimonials[active]} colorIdx={active} />
        </div>

        {/* Arrows */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={prev}
            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand-500 hover:text-brand-500 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Counter */}
        <p className="text-center text-xs text-slate-400 mt-2">{active + 1} / {total}</p>
      </div>

      {/* ── Desktop: 3-column grid with pagination ── */}
      <div className="hidden md:block">
        <div className="grid gap-6 md:grid-cols-3">
          {visible.map((t, i) => (
            <TestimonialCard key={t.id} t={t} colorIdx={page * perPage + i} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand-500 hover:text-brand-500 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2.5 rounded-full transition-all ${i === page ? 'bg-brand-600 w-6' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand-500 hover:text-brand-500 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
