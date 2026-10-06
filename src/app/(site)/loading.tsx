import { Skeleton } from '@/components/ui/skeleton'

// Shown automatically by Next.js while a page in this route group is
// server-rendering (initial load or client-side navigation) — covers the gap
// while the destination page's Wix data fetch is in flight. The header/footer
// (part of the shared layout) stay visible and interactive throughout.
export default function Loading() {
  return (
    <div>
      {/* Hero skeleton — matches the light, left-aligned hero now used across
          the home/services/portfolio pages (gradient bg, stats card, CTA row). */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-20">
        <div className="container">
          <div className="max-w-xl">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-5 h-9 sm:h-11 w-full max-w-md" />
            <Skeleton className="mt-3 h-9 sm:h-11 w-3/4 max-w-sm" />
            <Skeleton className="mt-6 h-4 w-full max-w-lg" />
            <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />

            {/* Stats card */}
            <div className="mt-8 hidden sm:grid grid-cols-4 gap-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg shadow-slate-200/50 px-6 py-5 max-w-2xl">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Skeleton className="h-11 w-36 rounded-xl" />
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Content grid skeleton */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden">
                <Skeleton className="h-52 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
