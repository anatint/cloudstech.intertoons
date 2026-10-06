'use client'
import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

// No newsletter backend exists yet — this only gives the visitor honest local
// feedback (clears the field, shows a checkmark) rather than pretending an
// email was actually stored anywhere.
export function FooterNewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <form
      className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault()
        if (!email) return
        setSubmitted(true)
        setEmail('')
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => { setEmail(e.target.value); setSubmitted(false) }}
        placeholder="Enter your email address"
        className="min-w-0 flex-1 bg-transparent px-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-brand-600 text-white hover:opacity-90 transition-opacity"
      >
        {submitted ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  )
}
