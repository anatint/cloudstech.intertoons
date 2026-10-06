import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { InlineQuoteForm } from '@/components/blocks/InlineQuoteForm'

interface HeroBlockProps {
  block: {
    blockType: 'hero'
    eyebrow?: string
    heading: string
    headingHighlight?: string
    subheading?: string
    buttons?: Array<{ label: string; url: string; variant: string }>
    image?: { url: string; alt?: string; width?: number; height?: number } | null
    style?: string
    showQuoteForm?: boolean
    stats?: Array<{ icon?: string; label: string }>
  }
}

export function HeroBlockRenderer({ block }: HeroBlockProps) {
  const isDark = block.style === 'dark-gradient' || !block.style
  const heading = block.headingHighlight
    ? block.heading.replace(block.headingHighlight, '')
    : block.heading

  return (
    <section
      className={
        isDark
          ? 'bg-gradient-to-br from-[#0B1340] via-[#0D2060] to-[#1a3a9f] text-white'
          : 'bg-white text-slate-900'
      }
    >
      <div className="container pt-28 pb-16">
        <div className={`flex flex-col gap-10 ${block.showQuoteForm ? 'lg:flex-row lg:items-start lg:justify-between' : 'items-center text-center'}`}>
          {/* Text side */}
          <div className={block.showQuoteForm ? 'max-w-xl' : 'max-w-3xl'}>
            {block.eyebrow && (
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">{block.eyebrow}</p>
            )}
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {heading}
              {block.headingHighlight && (
                <span className="text-brand-400"> {block.headingHighlight}</span>
              )}
            </h1>
            {block.subheading && (
              <p className={`mt-5 text-lg leading-relaxed ${isDark ? 'text-blue-100' : 'text-slate-600'}`}>
                {block.subheading}
              </p>
            )}

            {/* Stats badges */}
            {block.stats && block.stats.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {block.stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
                    {stat.icon && <span className="text-base">{stat.icon}</span>}
                    <span className={isDark ? 'text-white/90' : 'text-slate-700'}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            {block.buttons && block.buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {block.buttons.map((btn, i) => (
                  <Button key={i} variant={btn.variant as any || 'default'} size="lg" asChild>
                    <Link href={btn.url}>{btn.label}</Link>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Right side: form or image */}
          {block.showQuoteForm ? (
            <div className="w-full lg:w-auto lg:min-w-[360px]">
              <InlineQuoteForm />
            </div>
          ) : block.image ? (
            <div className="relative w-full max-w-lg mx-auto">
              <Image
                src={(block.image as any).url}
                alt={(block.image as any).alt || ''}
                width={600}
                height={480}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
