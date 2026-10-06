'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2, Phone, Mail, MapPin, Shield, Clock, Award, ChevronRight,
  Send, Loader2, CalendarCheck, BarChart3, Handshake, CheckCheck,
  ShoppingBag, Layout, RefreshCw, Wrench, ArrowRight, Store, LayoutGrid,
  type LucideIcon,
} from 'lucide-react'

/** Maps a CMS `icon` text value (lucide name) to its component; unknown → default. */
const ICON_MAP: Record<string, LucideIcon> = {
  Store, Layout, ShoppingBag, ArrowRight, RefreshCw, Wrench, LayoutGrid,
}
const DEFAULT_ICON: LucideIcon = LayoutGrid

/** CMS-managed content for the page (hero + direct-contact block). */
export interface RfqContent {
  heroBadge: string
  heroTitle: string
  heroTitleHighlight: string
  heroSubtitle: string
  phone: string
  phoneHref: string
  email: string
  address: string
}

/** Fallbacks used only if the CMS collections are empty (so the form never breaks). */
const FALLBACK_PROJECT_TYPES: { label: string; icon: string }[] = [
  { label: 'New Shopify Store Development', icon: 'Store' },
  { label: 'Shopify Theme Development', icon: 'Layout' },
  { label: 'Shopify App Development', icon: 'ShoppingBag' },
  { label: 'Store Migration to Shopify', icon: 'ArrowRight' },
  { label: 'Store Redesign & Optimization', icon: 'RefreshCw' },
  { label: 'Maintenance & Support', icon: 'Wrench' },
]

const FALLBACK_FEATURES = [
  'Custom Theme Design',
  'Payment Gateway Integration',
  'Wholesale / B2B Features',
  'Product Customization',
  'Subscription / Recurring Orders',
  'Loyalty & Rewards Program',
  'Multi-language Support',
  'Third-party App Integration',
  'Advanced Search & Filtering',
  'Other (Please specify)',
]

const FALLBACK_BUDGETS = [
  'Under ₹50,000',
  '₹50,000 – ₹1,50,000',
  '₹1,50,000 – ₹5,00,000',
  '₹5,00,000+',
  'Not sure yet',
]
const TIMELINES = ['ASAP (within 2 weeks)', '1 – 2 months', '3 – 6 months', '6+ months', 'Flexible']
const REFERRALS = ['Google / Search Engine', 'Social Media', 'Friend / Referral', 'LinkedIn', 'Facebook / Instagram Ad', 'Previous Client', 'Other']
const ROLES = ['Business Owner / Founder', 'Marketing Manager', 'Product Manager', 'Developer / Tech Lead', 'Designer', 'Other']
const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳' }, { code: '+1', flag: '🇺🇸' }, { code: '+44', flag: '🇬🇧' },
  { code: '+971', flag: '🇦🇪' }, { code: '+61', flag: '🇦🇺' },
]
const TRUST_BADGES = [
  { icon: Award,      label: 'Expert Developers' },
  { icon: Shield,     label: '100% Confidential & Secure' },
  { icon: Clock,      label: 'Quick Response within 24 hrs' },
  { icon: CheckCheck, label: 'No Obligation Free Quote' },
]
const NEXT_STEPS = [
  { icon: CheckCircle2, title: '1. We Receive Your Request',  desc: "We'll review your project details carefully." },
  { icon: BarChart3,    title: '2. We Analyze & Plan',        desc: 'Our experts will analyze your requirements and plan the best approach.' },
  { icon: Handshake,    title: '3. We Get Back to You',       desc: "You'll receive a tailored proposal and estimate within 24 hours." },
]

export default function RequestQuoteForm({
  content,
  contactHref = '/contact-us',
  projectTypeOptions,
  featureOptions,
  budgetOptions,
}: {
  content: RfqContent
  contactHref?: string
  projectTypeOptions?: { label: string; icon?: string }[]
  featureOptions?: string[]
  budgetOptions?: string[]
}) {
  // CMS-driven lists with safe fallbacks.
  const typeOptions = projectTypeOptions && projectTypeOptions.length ? projectTypeOptions : FALLBACK_PROJECT_TYPES
  const featOptions = featureOptions && featureOptions.length ? featureOptions : FALLBACK_FEATURES
  const budgetOpts = budgetOptions && budgetOptions.length ? budgetOptions : FALLBACK_BUDGETS
  const [projectTypes, setProjectTypes] = useState<string[]>([])
  const [features, setFeatures]         = useState<string[]>([])
  const [otherFeature, setOtherFeature] = useState('')
  const [countryCode, setCountryCode]   = useState('+91')
  const [refStore, setRefStore]         = useState<string | null>(null)
  const [contentReady, setContentReady] = useState<string | null>(null)
  const [submitted, setSubmitted]       = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [fieldError, setFieldError]     = useState('')

  const [f, setF] = useState({
    projectTitle: '', description: '', timeline: '', budget: '',
    referral: '', extraMessage: '', name: '', email: '',
    phone: '', company: '', role: '', _hp: '',
  })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setF(prev => ({ ...prev, [k]: e.target.value }))
    if (fieldError === k) { setFieldError(''); setError('') }
  }
  const toggleType    = (t: string) => { setProjectTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]); if (fieldError === 'projectType') { setFieldError(''); setError('') } }
  const toggleFeature = (t: string) => setFeatures(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  // Every "Request a Quote" link site-wide points here with a #quote-form
  // hash, expecting the page to land on the form. Two things fight this:
  // (1) the browser's native scroll-to-anchor fires before this client
  // component finishes hydrating, so it silently lands at the top instead;
  // (2) Next.js's own router scroll-restoration runs right after navigation
  // and can reset scroll back to 0 even after we've scrolled. Retry a few
  // times over ~1s so our scroll is the one that "wins" and sticks.
  useEffect(() => {
    if (window.location.hash !== '#quote-form') return
    // Strip the hash from the address bar immediately — the scroll below is
    // what actually gets the user to the form, so the URL doesn't need to
    // keep advertising it (matches every other page's URL staying clean).
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    let attempts = 0
    const scroll = () => {
      document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      attempts += 1
      if (attempts < 6) setTimeout(scroll, 200)
    }
    scroll()
  }, [])

  /* Field refs so validation can jump to and focus the first invalid field. */
  const titleRef  = useRef<HTMLInputElement>(null)
  const typeRef   = useRef<HTMLDivElement>(null)
  const descRef   = useRef<HTMLTextAreaElement>(null)
  const timeRef   = useRef<HTMLSelectElement>(null)
  const budgetRef = useRef<HTMLSelectElement>(null)
  const nameRef   = useRef<HTMLInputElement>(null)
  const emailRef  = useRef<HTMLInputElement>(null)
  const phoneRef  = useRef<HTMLInputElement>(null)
  const refMap: Record<string, React.RefObject<any>> = {
    projectTitle: titleRef, projectType: typeRef, description: descRef,
    timeline: timeRef, budget: budgetRef, name: nameRef, email: emailRef, phone: phoneRef,
  }
  const errCls = (key: string) => (fieldError === key ? ' border-red-400 ring-2 ring-red-300' : '')
  const focusField = (key: string) => {
    const el = refMap[key]?.current as HTMLElement | null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => { try { el.focus({ preventScroll: true }) } catch { /* noop */ } }, 250)
  }
  const validate = (): { key: string; msg: string } | null => {
    if (!f.projectTitle.trim())     return { key: 'projectTitle', msg: 'Please enter a project title.' }
    if (projectTypes.length === 0)  return { key: 'projectType',  msg: 'Please select at least one project type.' }
    if (!f.description.trim())      return { key: 'description',  msg: 'Please describe your project.' }
    if (!f.name.trim())            return { key: 'name',         msg: 'Please enter your full name.' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return { key: 'email', msg: 'Please enter a valid email address.' }
    if (!f.phone.trim())           return { key: 'phone',        msg: 'Please enter your phone number.' }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f._hp) return
    const invalid = validate()
    if (invalid) { setError(invalid.msg); setFieldError(invalid.key); focusField(invalid.key); return }
    setLoading(true); setError(''); setFieldError('')
    try {
      const res = await fetch('/api/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'rfq',
          data: {
            ...f,
            phone: `${countryCode} ${f.phone}`,
            projectTypes,
            features: [...features, ...(otherFeature ? [`Other: ${otherFeature}`] : [])],
            hasReferenceStore: refStore,
            contentReady,
          },
        }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  /* Success state */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl p-10">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-[38px] font-extrabold text-slate-900 mb-3">Request Submitted!</h2>
          <p className="text-slate-500 mb-8">
            Thank you, {f.name.split(' ')[0] || 'there'}! We&apos;ll review your project and get back within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors">Back to Home</Link>
            <Link href="/works" className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">View Our Work</Link>
          </div>
        </div>
      </div>
    )
  }

  /* Input class helpers */
  const inp = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
  const sel = `${inp} bg-white appearance-none text-slate-700`

  return (
    <div>

      {/* ── HERO (light theme, matches the services/blog hero redesign) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50">
        {/* Full-bleed desk photo — the mockup laptop screen ("Turn Your Ideas
            Into Reality") is baked into the image itself, so no separate
            illustration card is needed here. */}
        <div className="absolute inset-0 w-full pointer-events-none hidden md:block">
          <Image src="/images/request-quote-hero.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-white/40" />
        </div>

        <div className="container max-w-6xl relative z-10 pt-28 pb-24 sm:pt-32 lg:pt-40 lg:pb-32">
          <div className="max-w-xl">
            {content.heroBadge && (
              <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-sm font-semibold">
                <Send className="h-4 w-4" />
                {content.heroBadge}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4 text-slate-900">
              {content.heroTitle}
              {content.heroTitleHighlight && <> <span className="bg-clip-text text-transparent animate-gradient-text">{content.heroTitleHighlight}</span></>}
            </h1>
            <p className="text-slate-500 text-base font-inter leading-relaxed max-w-md">
              {content.heroSubtitle}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-brand-600" />
                  </div>
                  <span className="text-xs text-slate-600 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM (overlaps hero with -mt) ── */}
      <div id="quote-form" className="container max-w-6xl -mt-14 relative z-20 pb-16 px-4 sm:px-6 lg:px-8 scroll-mt-16 sm:scroll-mt-20 lg:scroll-mt-[100px]">
        <form onSubmit={handleSubmit} noValidate>
          <input type="text" name="_hp" value={f._hp} onChange={set('_hp')} className="hidden" tabIndex={-1} autoComplete="off" />

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">

            {/* Left — main sections (on mobile, `contents` lets each card reorder via `order-*`) */}
            <div className="contents lg:block lg:space-y-5">

              {/* ① Tell Us About Your Project */}
              <div className="order-2 lg:order-none bg-white rounded-2xl shadow-lg border border-slate-100 p-5 sm:p-7">
                <h2 className="flex items-center gap-3 text-base sm:text-lg font-extrabold text-slate-900 mb-5">
                  <span className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
                  Tell Us About Your Project
                </h2>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Project Title <span className="text-red-500">*</span></label>
                  <input ref={titleRef} type="text" placeholder="e.g. Custom Shopify Store for Fashion Brand" value={f.projectTitle} onChange={set('projectTitle')} className={inp + errCls('projectTitle')} required />
                </div>

                {/* Type buttons */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Project Type <span className="text-red-500">*</span></label>
                  <p className="text-xs text-slate-500 mb-3">You can select multiple if applicable.</p>
                  <div ref={typeRef} tabIndex={-1} className={`grid grid-cols-1 sm:grid-cols-2 gap-2 outline-none rounded-xl${errCls('projectType')}`}>
                    {typeOptions.map(({ label, icon }) => {
                      const Icon = ICON_MAP[icon || ''] || DEFAULT_ICON
                      const active = projectTypes.includes(label)
                      return (
                        <button key={label} type="button" onClick={() => toggleType(label)}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50/50'}`}>
                          <span className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-brand-100' : 'bg-slate-100'}`}>
                            <Icon className={`h-3.5 w-3.5 ${active ? 'text-brand-600' : 'text-slate-500'}`} />
                          </span>
                          <span className="flex-1 leading-tight">{label}</span>
                          {active && <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Project Description <span className="text-red-500">*</span></label>
                  <p className="text-xs text-slate-500 mb-2">Describe your project, goals, target audience and key features.</p>
                  <textarea ref={descRef} rows={4} placeholder="Write a detailed description of your project..." value={f.description} onChange={set('description')} className={`${inp} resize-none${errCls('description')}`} required />
                </div>

                {/* Timeline + Budget */}
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Launch Date</label>
                    <select ref={timeRef} value={f.timeline} onChange={set('timeline')} className={sel + errCls('timeline')}>
                      <option value="">Select Timeframe</option>
                      {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estimated Budget</label>
                    <select ref={budgetRef} value={f.budget} onChange={set('budget')} className={sel + errCls('budget')}>
                      <option value="">Select Budget Range</option>
                      {budgetOpts.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Radios */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Do you have a reference store or design?</p>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(v => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="refStore" value={v} checked={refStore === v} onChange={() => setRefStore(v)} className="accent-brand-600" />
                          <span className="text-sm text-slate-700">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Do you have content ready?</p>
                    <div className="flex gap-3 flex-wrap">
                      {['Yes', 'In Progress', 'No'].map(v => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="contentReady" value={v} checked={contentReady === v} onChange={() => setContentReady(v)} className="accent-brand-600" />
                          <span className="text-sm text-slate-700">{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ② Key Features */}
              <div className="order-3 lg:order-none bg-white rounded-2xl shadow-lg border border-slate-100 p-5 sm:p-7">
                <h2 className="flex items-center gap-3 text-base sm:text-lg font-extrabold text-slate-900 mb-1.5">
                  <span className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
                  Key Features &amp; Functionalities
                </h2>
                <p className="text-xs text-slate-500 mb-4 ml-10">Select the features you need in your store (Select all that apply)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {featOptions.map(feat => (
                    <label key={feat} className="flex items-start gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={features.includes(feat)} onChange={() => toggleFeature(feat)} className="mt-0.5 h-4 w-4 accent-brand-600 shrink-0 rounded" />
                      <span className="text-sm text-slate-700 group-hover:text-brand-600 transition-colors leading-tight">{feat}</span>
                    </label>
                  ))}
                </div>
                {features.includes('Other (Please specify)') && (
                  <input type="text" placeholder="Please specify other features..." value={otherFeature} onChange={e => setOtherFeature(e.target.value)} className={`mt-4 ${inp}`} />
                )}
              </div>

              {/* ③ Additional Info */}
              <div className="order-4 lg:order-none bg-white rounded-2xl shadow-lg border border-slate-100 p-5 sm:p-7">
                <h2 className="flex items-center gap-3 text-base sm:text-lg font-extrabold text-slate-900 mb-5">
                  <span className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
                  Additional Information
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">How did you hear about us?</label>
                  <select value={f.referral} onChange={set('referral')} className={sel}>
                    <option value="">Select an option</option>
                    {REFERRALS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Any specific requirements or message?</label>
                  <textarea rows={3} placeholder="Share any additional information that will help us understand your project better..." value={f.extraMessage} onChange={set('extraMessage')} className={`${inp} resize-none`} />
                </div>
              </div>

              {/* (mobile submit is the floating bar at the bottom of the form) */}
            </div>

            {/* Right — sticky sidebar (on mobile, `contents` so cards reorder via `order-*`) */}
            <div className="contents lg:block lg:space-y-5 lg:sticky lg:top-24">

              {/* ④ Contact Details */}
              <div className="order-1 lg:order-none bg-white rounded-2xl shadow-lg border border-slate-100 p-5 sm:p-6">
                <h2 className="flex items-center gap-3 text-base sm:text-lg font-extrabold text-slate-900 mb-5">
                  <span className="h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">4</span>
                  Your Contact Details
                </h2>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input ref={nameRef} type="text" placeholder="Enter your full name" value={f.name} onChange={set('name')} className={inp + errCls('name')} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <input ref={emailRef} type="email" placeholder="Enter your email address" value={f.email} onChange={set('email')} className={inp + errCls('email')} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="px-2 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white appearance-none shrink-0">
                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                      </select>
                      <input ref={phoneRef} type="tel" placeholder="Phone number" value={f.phone} onChange={set('phone')} className={`flex-1 ${inp}${errCls('phone')}`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company / Store Name</label>
                    <input type="text" placeholder="Enter your company or store name" value={f.company} onChange={set('company')} className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Role</label>
                    <select value={f.role} onChange={set('role')} className={sel}>
                      <option value="">Select your role</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {error && <div className="hidden lg:block mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
                <button type="submit" disabled={loading} className="hidden lg:flex mt-5 w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors items-center justify-center gap-2 disabled:opacity-60 shadow-lg" style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>

              {/* What Happens Next */}
              <div className="order-5 lg:order-none bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
                <h3 className="text-sm font-extrabold text-brand-600 mb-4">What Happens Next?</h3>
                <div className="space-y-4">
                  {NEXT_STEPS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex gap-3">
                      <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                  <Shield className="h-3.5 w-3.5 text-brand-400 shrink-0 mt-0.5" />
                  We respect your privacy. Your information is safe with us and will never be shared.
                </div>
              </div>

              {/* Direct contact */}
              <div className="order-6 lg:order-none bg-brand-50 rounded-2xl border border-brand-100 p-5">
                <p className="text-sm font-bold text-slate-800 mb-3">Prefer to reach us directly?</p>
                <div className="space-y-2">
                  {content.phone && (
                    <a href={content.phoneHref} className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 transition-colors">
                      <Phone className="h-3.5 w-3.5 text-brand-600 shrink-0" /> {content.phone}
                    </a>
                  )}
                  {content.email && (
                    <a href={`mailto:${content.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 transition-colors">
                      <Mail className="h-3.5 w-3.5 text-brand-600 shrink-0" /> {content.email}
                    </a>
                  )}
                  {content.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" /> {content.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating submit bar (mobile only) ── */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            {error && <p className="text-red-600 text-xs font-medium mb-2 text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Bottom CTA ── */}
      <section className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm sm:text-base">Prefer to talk to our experts?</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Let&apos;s discuss your project over a call and get all your questions answered.</p>
              </div>
            </div>
            <Link href={`${contactHref}#contact-form`} className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-brand-600 text-brand-600 font-bold text-sm hover:bg-brand-600 hover:text-white transition-colors whitespace-nowrap">
              Schedule a Free Consultation <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      <div className="h-28 lg:hidden" />
    </div>
  )
}
