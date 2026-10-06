'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  // Step 1 — Project info
  projectType: z.string().min(1, 'Please select a project type'),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  description: z.string().min(20, 'Please describe your project (at least 20 characters)'),
  // Step 2 — Features
  features: z.array(z.string()).optional(),
  // Step 3 — Contact
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  // Honeypot
  _hp: z.string().max(0, 'Bot detected').optional(),
})

type FormValues = z.infer<typeof schema>

const PROJECT_TYPES = [
  'AI Development / LLM Integration',
  'AI Automation / Workflow',
  'Shopify Store / App',
  'E-commerce Website',
  'Mobile App (Android / iOS)',
  'Web Application',
  'UI/UX Design',
  'Other',
]

const BUDGETS = ['< $5,000', '$5,000 – $15,000', '$15,000 – $50,000', '$50,000+', 'Not sure yet']
const TIMELINES = ['ASAP', '1–2 months', '3–6 months', '6+ months', 'Flexible']

const DEFAULT_FEATURES = [
  'User Authentication', 'Admin Dashboard', 'Payment Integration', 'API Integration',
  'AI / ML Features', 'Analytics & Reporting', 'Multi-language', 'Push Notifications',
  'CMS / Content Management', 'SEO Optimisation', 'Third-party Integrations', 'Custom Design',
]

const STEPS = ['Your Project', 'Key Features', 'Contact Details']

interface Props {
  block?: {
    heading?: string
    subheading?: string
    successMessage?: string
    availableServices?: string[]
  }
}

export function QuoteFormRenderer({ block }: Props) {
  const heading = block?.heading || 'Request a Free Quote'
  const subheading = block?.subheading || 'Tell us about your project and we will get back within 24 hours.'
  const successMsg = block?.successMessage || "Thank you! We'll be in touch within 24 hours."
  const features = block?.availableServices?.length ? block.availableServices : DEFAULT_FEATURES

  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { features: [] },
  })

  const selectedFeatures = watch('features') || []

  const toggleFeature = (f: string) => {
    const curr = selectedFeatures
    setValue('features', curr.includes(f) ? curr.filter((x) => x !== f) : [...curr, f])
  }

  const onSubmit = async (data: FormValues) => {
    setError('')
    try {
      const res = await fetch('/api/forms/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, sourcePage: window.location.pathname }),
      })
      const json = await res.json() as { ok?: boolean; message?: string }
      if (!res.ok) throw new Error(json.message || 'Submission failed')
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
  }

  const nextStep = async () => {
    let valid = false
    if (step === 0) valid = await trigger(['projectType', 'description'])
    else if (step === 1) valid = true
    else valid = await trigger(['name', 'email'])
    if (valid) setStep((s) => s + 1)
  }

  if (submitted) {
    return (
      <section className="py-24 bg-white">
        <div className="container max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-[38px] font-extrabold text-slate-900">Request Received!</h2>
          <p className="mt-4 text-slate-600">{successMsg}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-slate-50">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">
            Get Started
          </p>
          <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>
          <p className="mt-3 text-slate-600">{subheading}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500',
                )}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={cn('text-xs font-medium hidden sm:block', i === step ? 'text-slate-900' : 'text-slate-400')}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5', i < step ? 'bg-green-500' : 'bg-slate-200')} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Honeypot */}
          <input {...register('_hp')} type="text" className="hidden" tabIndex={-1} />

          {/* Step 0 — Project info */}
          {step === 0 && (
            <div className="space-y-6 bg-white rounded-2xl p-6 shadow-sm">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What type of project? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TYPES.map((pt) => {
                    const selected = watch('projectType') === pt
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setValue('projectType', pt)}
                        className={cn(
                          'text-left text-sm px-4 py-3 rounded-xl border transition-colors',
                          selected
                            ? 'bg-brand-50 border-brand-400 text-brand-700 font-semibold'
                            : 'border-slate-200 hover:border-brand-200 text-slate-600',
                        )}
                      >
                        {pt}
                      </button>
                    )
                  })}
                </div>
                {errors.projectType && (
                  <p className="text-red-500 text-xs mt-1">{errors.projectType.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Budget Range</label>
                  <select {...register('budget')} className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none">
                    <option value="">Select budget</option>
                    {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Timeline</label>
                  <select {...register('timeline')} className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-700 focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none">
                    <option value="">Select timeline</option>
                    {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Describe your project <span className="text-red-500">*</span>
                </label>
                <Textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Tell us what you are building, who it is for, and any specific requirements..."
                  className="rounded-xl"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              <Button type="button" onClick={nextStep} className="w-full">
                Next: Key Features →
              </Button>
            </div>
          )}

          {/* Step 1 — Features */}
          {step === 1 && (
            <div className="space-y-6 bg-white rounded-2xl p-6 shadow-sm">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Which features do you need? <span className="text-slate-400 font-normal">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((f) => {
                    const checked = selectedFeatures.includes(f)
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className={cn(
                          'text-left text-sm px-4 py-3 rounded-xl border transition-colors flex items-center gap-2',
                          checked
                            ? 'bg-brand-50 border-brand-400 text-brand-700 font-semibold'
                            : 'border-slate-200 hover:border-brand-200 text-slate-600',
                        )}
                      >
                        <span className={cn('h-4 w-4 rounded border flex items-center justify-center shrink-0', checked ? 'bg-brand-600 border-brand-600' : 'border-slate-300')}>
                          {checked && <span className="text-white text-[10px]">✓</span>}
                        </span>
                        {f}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                  ← Back
                </Button>
                <Button type="button" onClick={nextStep} className="flex-1">
                  Next: Your Details →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Contact */}
          {step === 2 && (
            <div className="space-y-5 bg-white rounded-2xl p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input {...register('name')} placeholder="John Smith" className="rounded-xl" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input {...register('email')} type="email" placeholder="john@company.com" className="rounded-xl" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <Input {...register('phone')} type="tel" placeholder="+1 234 567 8900" className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                  <Input {...register('company')} placeholder="Acme Inc." className="rounded-xl" />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  ← Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Submit Request →'
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-slate-400">
                We respect your privacy. No spam, ever.
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
