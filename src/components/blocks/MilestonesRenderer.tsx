type Milestone = { id: string; value: string; label: string; icon?: string }

interface MilestonesRendererProps {
  milestones: Milestone[]
  style?: string
}

export function MilestonesRenderer({ milestones, style }: MilestonesRendererProps) {
  if (style === 'grid-white' || style === 'grid-bordered') {
    return (
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {milestones.map((m) => (
              <div key={m.id} className="text-center p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="text-3xl font-extrabold text-brand-600">{m.value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500 leading-tight">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: blue bar
  return (
    <section className="bg-brand-600 py-8">
      <div className="container">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 sm:gap-x-16">
          {milestones.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3">
              {i > 0 && <div className="hidden sm:block w-px h-10 bg-blue-400/50" />}
              <div className="text-center">
                <div className="text-2xl font-extrabold text-white">{m.value}</div>
                <div className="text-xs text-blue-200 font-medium mt-0.5">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
