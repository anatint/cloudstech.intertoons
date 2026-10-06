import Image from 'next/image'

type Platform = { id: string; name: string; logo?: { url: string; alt?: string } | null }

interface PlatformsRendererProps {
  eyebrow?: string
  platforms: Platform[]
}

export function PlatformsRenderer({ eyebrow, platforms }: PlatformsRendererProps) {
  return (
    <section className="py-10 bg-white border-y border-slate-100">
      <div className="container">
        {eyebrow && (
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-slate-200" />
            <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">{eyebrow}</p>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {platforms.map((p) =>
            p.logo ? (
              <Image
                key={p.id}
                src={p.logo.url}
                alt={p.logo.alt || p.name}
                width={120}
                height={40}
                className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
              />
            ) : (
              <span key={p.id} className="text-sm font-semibold text-slate-400">{p.name}</span>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
