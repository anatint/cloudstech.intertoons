import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="px-8 py-10 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="mt-1.5 text-sm text-slate-500">Choose a module to get started.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/ai-assistant"
          className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-6 hover:shadow-lg hover:border-brand-200 transition-all"
        >
          <div className="h-11 w-11 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-brand-600" />
          </div>
          <h2 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">AI Assistant</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed flex-1">
            Chat with the assistant to add a new Technology to the site — it asks the questions, you answer.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>
    </div>
  )
}
