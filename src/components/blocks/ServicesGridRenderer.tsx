import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExpandableText from '@/components/ExpandableText'

type Service = {
  id: string
  title: string
  slug: string
  shortDescription?: string
  icon?: { url: string; alt?: string } | null
}

interface ServicesGridRendererProps {
  eyebrow?: string
  heading?: string
  description?: string
  services: Service[]
  showViewAll?: boolean
  viewAllLabel?: string
  layout?: string
}

export function ServicesGridRenderer({ eyebrow, heading, description, services, showViewAll, viewAllLabel, layout }: ServicesGridRendererProps) {
  const cols = layout === 'grid-3' ? 3 : layout === 'grid-4' ? 4 : 5

  return (
    <section className="py-20 bg-white">
      <div className="container">
        {(eyebrow || heading || description) && (
          <div className="text-center mb-12">
            {eyebrow && <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">{eyebrow}</p>}
            {heading && <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>}
            {description && <p className="mt-4 text-base text-slate-500 max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/${service.slug}`}
              className="group flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-200"
            >
              {service.icon ? (
                <Image src={service.icon.url} alt={service.icon.alt || service.title} width={48} height={48} className="w-12 h-12 mb-4 object-contain" />
              ) : (
                <div className="w-12 h-12 mb-4 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg">
                  {service.title.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-base leading-snug mb-2">{service.title}</h3>
              {service.shortDescription && (
                <ExpandableText text={service.shortDescription} className="text-[15px] text-slate-500 leading-relaxed flex-1" />
              )}
              <div className="mt-4 flex h-7 w-7 items-center justify-center rounded-full border border-brand-200 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
        {showViewAll && (
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/services">{viewAllLabel || 'View All Services'} →</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
