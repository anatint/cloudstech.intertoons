import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { ADMIN_COLLECTIONS } from '@/lib/adminCollections'

export default function AiAssistantPickerPage() {
  return (
    <div className="px-6 sm:px-8 py-10 max-w-3xl">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h1 className="text-2xl font-black text-slate-900">AI Assistant</h1>
      </div>
      <p className="text-sm text-slate-500 mb-8">Pick a collection to create a new item in — I&apos;ll walk you through every field.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ADMIN_COLLECTIONS.map((c) => (
          <Link
            key={c.id}
            href={`/admin/ai-assistant/${c.id}`}
            className="group flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 bg-white hover:border-brand-300 hover:shadow-sm transition-all"
          >
            <span className="font-semibold text-sm text-slate-800">{c.label}</span>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}
