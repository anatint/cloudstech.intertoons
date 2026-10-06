import Link from 'next/link'
import { Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTABlockRendererProps {
  block: {
    heading: string
    subheading?: string
    buttons?: Array<{ label: string; url: string; variant: string }>
    style?: string
  }
}

export function CTABlockRenderer({ block }: CTABlockRendererProps) {
  const isBlue = !block.style || block.style === 'blue-gradient'
  return (
    <section className={cn('py-16', isBlue ? 'bg-gradient-to-r from-brand-700 via-brand-600 to-blue-500' : 'bg-slate-900')}>
      <div className="container">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-[38px] font-extrabold text-white">{block.heading}</h2>
              {block.subheading && <p className="mt-1 text-blue-100 text-base">{block.subheading}</p>}
            </div>
          </div>
          {block.buttons && block.buttons.length > 0 && (
            <div className="flex gap-3 shrink-0">
              {block.buttons.map((btn, i) => (
                <Button key={i} variant="white" size="lg" asChild>
                  <Link href={btn.url}>{btn.label} →</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
