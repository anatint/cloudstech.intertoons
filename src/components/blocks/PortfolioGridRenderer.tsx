import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Project = {
  id: string
  title: string
  slug: string
  client: string
  category: string
  excerpt?: string
  coverImage?: { url: string; alt?: string } | null
  caseStudies?: { docs?: Array<{ slug: string }> } | null
}

interface PortfolioGridRendererProps {
  eyebrow?: string
  heading?: string
  projects: Project[]
  showViewAll?: boolean
  viewAllLabel?: string
  layout?: string
}

const categoryLabel: Record<string, string> = {
  ecommerce: 'E-commerce',
  'mobile-app': 'Mobile App',
  'web-development': 'Web Development',
  travel: 'Travel',
  'food-delivery': 'Food Delivery',
  'real-estate': 'Real Estate',
  healthcare: 'Healthcare',
  other: 'Other',
}

export function PortfolioGridRenderer({ eyebrow, heading, projects, showViewAll, viewAllLabel, layout }: PortfolioGridRendererProps) {
  const cols = layout === 'grid-4' ? 4 : 3

  return (
    <section className="py-20 bg-white">
      <div className="container">
        {(eyebrow || heading) && (
          <div className="text-center mb-12">
            {eyebrow && <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">{eyebrow}</p>}
            {heading && <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>}
          </div>
        )}
        <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {projects.map((project) => {
            const caseStudy = project.caseStudies?.docs?.[0]
            const href = caseStudy ? `/case-studies/${caseStudy.slug}` : `/works/${project.slug}`
            return (
              <Link key={project.id} href={href} className="group block rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-xl transition-all duration-200">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={project.coverImage?.url || '/images/portfolio-default.png'}
                    alt={project.coverImage?.alt || project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <Badge variant="default" className="mb-3 text-xs">
                    {categoryLabel[project.category] || project.category}
                  </Badge>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-base">{project.title}</h3>
                  {project.excerpt && <p className="mt-1.5 text-[15px] text-slate-500 line-clamp-2">{project.excerpt}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    {caseStudy ? 'View Case Study' : 'View Project'} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
        {showViewAll && (
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/works">{viewAllLabel || 'View All Projects'} →</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
