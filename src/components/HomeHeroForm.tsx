'use client'

import { useState } from 'react'
import { ChevronRight, Lock, ChevronDown } from 'lucide-react'

const SERVICES = [
  'AI Development',
  'AI Automations',
  'Shopify Development',
  'E-commerce Development',
  'Mobile App Development',
  'Web Development',
  'Other',
]

export default function HomeHeroForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', details: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const r = await fetch('/api/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, formType: 'rfq', sourcePage: '/' }),
      })
      setStatus(r.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Request Received!</h3>
        <p className="text-slate-500 text-sm mt-2">We'll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-7">
      <h3 className="text-lg font-extrabold text-slate-900 mb-1">Request a Free Quote</h3>
      <p className="text-sm text-slate-500 mb-5">Share your project details and we'll get back to you within 24 hours.</p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
          <input
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Enter your full name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="Enter your email"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
          <div className="flex">
            <span className="flex items-center gap-1 px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-sm text-slate-600 font-medium whitespace-nowrap">
              🇮🇳 +91 <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              value={form.phone}
              onChange={set('phone')}
              placeholder="Enter your phone number"
              className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Service</label>
          <div className="relative">
            <select
              value={form.service}
              onChange={set('service')}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-700 cursor-pointer"
            >
              <option value="">Select a service</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Project Details</label>
          <textarea
            rows={3}
            value={form.details}
            onChange={set('details')}
            placeholder="Tell us about your project"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send Request'}
          {status !== 'sending' && <ChevronRight className="h-4 w-4" />}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1">
          <Lock className="h-3.5 w-3.5" />
          100% Privacy Guaranteed
        </p>
      </form>
    </div>
  )
}
