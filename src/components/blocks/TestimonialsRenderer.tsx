'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

type Testimonial = {
  id: string
  quote: string
  author: string
  position?: string
  company?: string
  avatar?: { url: string; alt?: string } | null
  rating?: number
}

interface TestimonialsRendererProps {
  eyebrow?: string
  heading?: string
  testimonials: Testimonial[]
  style?: string
}

export function TestimonialsRenderer({ eyebrow, heading, testimonials, style }: TestimonialsRendererProps) {
  const [current, setCurrent] = useState(0)
  if (!testimonials.length) return null

  if (style === 'grid') {
    return (
      <section className="py-20 bg-slate-50">
        <div className="container">
          {(eyebrow || heading) && (
            <div className="text-center mb-12">
              {eyebrow && <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">{eyebrow}</p>}
              {heading && <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>}
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Carousel
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-5xl">
        {(eyebrow || heading) && (
          <div className="text-center mb-12">
            {eyebrow && <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">{eyebrow}</p>}
            {heading && <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>}
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(Math.min(3, testimonials.length))].map((_, offset) => {
            const idx = (current + offset) % testimonials.length
            return <TestimonialCard key={idx} t={testimonials[idx]} />
          })}
        </div>
        {testimonials.length > 3 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={prev} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:bg-brand-50 hover:border-brand-300 transition-colors">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex gap-2">
              {testimonials.slice(0, Math.ceil(testimonials.length / 3)).map((_, i) => (
                <button key={i} onClick={() => setCurrent(i * 3)}
                  className={`h-2 rounded-full transition-all ${Math.floor(current / 3) === i ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300'}`} />
              ))}
            </div>
            <button onClick={next} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:bg-brand-50 hover:border-brand-300 transition-colors">
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="flex gap-1 mb-4">
        {[...Array(t.rating || 5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-slate-700 text-[15px] leading-relaxed italic">"{t.quote}"</p>
      <div className="mt-5 flex items-center gap-3">
        {t.avatar ? (
          <Image src={t.avatar.url} alt={t.avatar.alt || t.author} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
            {t.author.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-900">— {t.author}</p>
          {(t.position || t.company) && (
            <p className="text-sm text-slate-500">{[t.position, t.company].filter(Boolean).join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
