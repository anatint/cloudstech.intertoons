'use client'

import { useEffect, useRef, useState } from 'react'
import { Phone, X, Send, Loader2, CheckCircle2, Plus, Minus } from 'lucide-react'
import type { SiteSettings } from '@/lib/settings'

/**
 * Floating "Request a Call Back" widget. All behaviour/appearance is driven by
 * the SiteSettings `callback*` fields (editable in the Wix CMS):
 *   callbackEnabled, callbackButtonTitle, callbackButtonColor, callbackButtonPosition
 *   (bottom-center | bottom-right | bottom-left), callbackButtonStyle (pill | rounded | square),
 *   callbackHeading, callbackSubtext, callbackMaxPerSession, callbackPopupFrequencySec,
 *   callbackAutoOpenDelaySec.
 * Captures name/phone/(optional)message; country + IP + referer are added server-side.
 */
export default function CallbackWidget({ settings }: { settings: SiteSettings }) {
  const enabled = settings.callbackEnabled === 'true'

  const position = settings.callbackButtonPosition || 'bottom-center'
  const color = settings.callbackButtonColor || '#0095da'
  const title = settings.callbackButtonTitle || 'Request a Call Back'
  const heading = settings.callbackHeading || 'Request a Call Back'
  const subtext = settings.callbackSubtext || ''
  const styleKey = settings.callbackButtonStyle || 'pill'
  const maxPerSession = parseInt(settings.callbackMaxPerSession || '0', 10) || 0
  const frequencySec = parseInt(settings.callbackPopupFrequencySec || '0', 10) || 0
  const autoOpenDelaySec = parseInt(settings.callbackAutoOpenDelaySec || '0', 10) || 0

  const [open, setOpen] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '', _hp: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [err, setErr] = useState('')
  const dismissedRef = useRef(false) // user submitted or closed enough — stop auto-opening

  /* Auto-popup scheduler: respects max-per-session + frequency. Manual opens don't count. */
  useEffect(() => {
    if (!enabled || autoOpenDelaySec <= 0 || maxPerSession <= 0) return
    if (typeof window === 'undefined') return

    const KEY = 'cb_auto_count'
    const getCount = () => parseInt(sessionStorage.getItem(KEY) || '0', 10) || 0
    const tryOpen = () => {
      if (dismissedRef.current) return
      if (getCount() >= maxPerSession) return
      setOpen((cur) => {
        if (cur) return cur // already open — don't double count
        sessionStorage.setItem(KEY, String(getCount() + 1))
        return true
      })
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(tryOpen, autoOpenDelaySec * 1000))
    let interval: ReturnType<typeof setInterval> | undefined
    if (frequencySec > 0) {
      interval = setInterval(() => {
        if (dismissedRef.current || getCount() >= maxPerSession) {
          if (interval) clearInterval(interval)
          return
        }
        tryOpen()
      }, Math.max(frequencySec, 15) * 1000)
    }
    return () => {
      timers.forEach(clearTimeout)
      if (interval) clearInterval(interval)
    }
  }, [enabled, autoOpenDelaySec, frequencySec, maxPerSession])

  if (!enabled) return null

  const radius = styleKey === 'square' ? 'rounded-md' : styleKey === 'rounded' ? 'rounded-xl' : 'rounded-full'
  const align =
    position === 'bottom-right' ? 'right-4 items-end' : position === 'bottom-left' ? 'left-4 items-start' : 'left-1/2 -translate-x-1/2 items-center'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form._hp) return
    if (!form.name.trim() || !form.phone.trim()) { setErr('Please enter your name and phone number.'); return }
    setStatus('submitting'); setErr('')
    try {
      const res = await fetch('/api/forms/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          message: form.message,
          _hp: form._hp,
          referer: typeof document !== 'undefined' ? document.referrer : '',
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      dismissedRef.current = true // stop auto popups after a successful submit
    } catch {
      setStatus('error'); setErr('Something went wrong. Please try again.')
    }
  }

  const closeAll = () => { setOpen(false); dismissedRef.current = true }

  return (
    <div className={`fixed bottom-4 z-[60] flex flex-col gap-3 ${align}`}>
      {/* Panel */}
      {open && (
        <div className="w-[300px] sm:w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_.15s_ease-out]">
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3" style={{ backgroundColor: color }}>
            <div>
              <p className="text-white font-extrabold text-sm leading-tight">{heading}</p>
              {subtext && <p className="text-white/85 text-xs mt-1 leading-snug">{subtext}</p>}
            </div>
            <button type="button" onClick={closeAll} aria-label="Close" className="text-white/80 hover:text-white shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="px-5 py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="font-bold text-slate-900 text-sm">Thanks, {form.name.split(' ')[0] || 'there'}!</p>
              <p className="text-slate-500 text-xs mt-1">We&apos;ll call you back shortly.</p>
              <button type="button" onClick={() => setOpen(false)} className="mt-4 text-xs font-semibold text-brand-600 hover:underline">Close</button>
            </div>
          ) : (
            <form onSubmit={submit} className="px-5 py-4 space-y-3">
              <input type="text" name="_hp" value={form._hp} onChange={(e) => setForm({ ...form, _hp: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" />
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone <span className="text-red-500">*</span></label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
              </div>

              {/* Optional message behind a toggle */}
              {showMessage ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Message</label>
                    <button type="button" onClick={() => { setShowMessage(false); setForm({ ...form, message: '' }) }} className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-0.5">
                      <Minus className="h-3 w-3" /> remove
                    </button>
                  </div>
                  <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help? (optional)" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              ) : (
                <button type="button" onClick={() => setShowMessage(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Enter message
                </button>
              )}

              {err && <p className="text-red-600 text-xs">{err}</p>}

              <button type="submit" disabled={status === 'submitting'} className={`w-full py-2.5 ${radius === 'rounded-full' ? 'rounded-xl' : radius} text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity`} style={{ backgroundColor: color }}>
                {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {status === 'submitting' ? 'Sending…' : 'Request Call Back'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-5 py-3 ${radius} text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
        style={{ backgroundColor: color }}
      >
        {open ? <X className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
        <span>{open ? 'Close' : title}</span>
      </button>
    </div>
  )
}
