'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Send, CheckCircle2, ArrowRight } from 'lucide-react'

/** Fallbacks used only if the CMS collections are empty (so the form never breaks). */
const FALLBACK_SERVICES = [
  'AI Development',
  'AI Automations',
  'Shopify Development',
  'E-commerce Development',
  'Mobile App Development',
  'Product Licensing (Plattero / Triptels)',
  'Other',
]

const FALLBACK_BUDGETS = ['Under $5,000', '$5,000 – $15,000', '$15,000 – $50,000', '$50,000+', 'Not sure yet']

export default function ContactForm({
  supportEmail = 'hello@intertoons.com',
  heading,
  subtext,
  serviceOptions,
  budgetOptions,
}: {
  supportEmail?: string
  heading?: string
  subtext?: string
  serviceOptions?: string[]
  budgetOptions?: string[]
}) {
  const services = serviceOptions && serviceOptions.length ? serviceOptions : FALLBACK_SERVICES
  const budgets = budgetOptions && budgetOptions.length ? budgetOptions : FALLBACK_BUDGETS
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    service: '', budget: '', message: '', honeypot: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Same fix as the request-a-quote form: links pointing here with a
  // #contact-form hash need a manual scroll since the browser's native
  // anchor-scroll fires before this client component finishes hydrating,
  // and Next's router scroll-restoration can reset it back to 0 right after.
  useEffect(() => {
    if (window.location.hash !== '#contact-form') return
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    let attempts = 0
    const scroll = () => {
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      attempts += 1
      if (attempts < 6) setTimeout(scroll, 200)
    }
    scroll()
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (!form.message.trim()) e.message = 'Please describe your project'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.honeypot) return
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStatus('submitting')
    try {
      const res = await fetch('/api/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, formType: 'contact' }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div id="contact-form" className="scroll-mt-16 sm:scroll-mt-20 lg:scroll-mt-[100px]">
      <h2 className="text-[38px] font-extrabold text-slate-900 mb-2">{heading || 'Send Us a Message'}</h2>
      <p className="text-slate-500 text-base mb-8">
        {subtext || 'Fill in the form and our team will reach out within one business day.'}
      </p>

      {status === 'success' ? (
        <div className="flex flex-col items-center text-center py-16 gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-[38px] font-extrabold text-slate-900">Message Received!</h3>
          <p className="text-slate-500 max-w-sm">
            Thanks for reaching out. One of our team members will contact you within 24 hours.
          </p>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors">
            Back to Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <input type="text" name="_trap" className="hidden" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} tabIndex={-1} autoComplete="off" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Smith" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Corp" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service Interested In</label>
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white">
                <option value="">Select a service...</option>
                {services.map((sv) => <option key={sv} value={sv}>{sv}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Budget</label>
              <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white">
                <option value="">Select budget range...</option>
                {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Message *</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your project, requirements, timeline, or any questions you have..." rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none" />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>

          {status === 'error' && (
            <p className="mt-3 text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">
              Something went wrong. Please email us directly at {supportEmail}
            </p>
          )}

          <button type="submit" disabled={status === 'submitting'} className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20">
            {status === 'submitting' ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                Sending...
              </>
            ) : (
              <><Send className="h-4 w-4" /> Send Message</>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
