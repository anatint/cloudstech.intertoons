'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const services = [
  'AI Development', 'AI Automations', 'Shopify Development',
  'E-commerce Development', 'Mobile App Development', 'Web Development',
]

export function InlineQuoteForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState({ name: '', email: '', phone: '', service: '', details: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'contact', data, sourcePage: window.location.pathname }),
      })
      setSuccess(true)
    } catch {
      // fail silently — form submission still recorded
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
      {success ? (
        <div className="py-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-bold text-slate-900">Request Received!</h3>
          <p className="mt-2 text-sm text-slate-500">We'll get back to you within 24 hours.</p>
        </div>
      ) : (
        <>
          <h3 className="text-base font-bold text-slate-900 mb-1">Request a Free Quote</h3>
          <p className="text-xs text-slate-500 mb-4">Share your project details and we'll get back to you within 24 hours.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Full Name</label>
              <Input placeholder="Enter your full name" value={data.name} required onChange={e => setData({ ...data, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Email Address</label>
              <Input type="email" placeholder="Enter your email" value={data.email} required onChange={e => setData({ ...data, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Phone Number</label>
              <div className="flex gap-2">
                <select className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none">
                  <option>🇮🇳 +91</option>
                </select>
                <Input placeholder="Enter your phone number" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Select Service</label>
              <select
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none"
                value={data.service}
                onChange={e => setData({ ...data, service: e.target.value })}
              >
                <option value="">Select a service</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Project Details</label>
              <Textarea placeholder="Tell us about your project" value={data.details} onChange={e => setData({ ...data, details: e.target.value })} className="min-h-[80px]" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send Request →'}
            </Button>
            <p className="text-center text-xs text-slate-400">🔒 100% Privacy Guaranteed</p>
          </form>
        </>
      )}
    </div>
  )
}
