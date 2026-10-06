import { HeroBlockRenderer } from './blocks/HeroBlockRenderer'
import { CTABlockRenderer } from './blocks/CTABlockRenderer'
import { FaqBlockRenderer } from './blocks/FaqBlockRenderer'
import { ServicesGridRenderer } from './blocks/ServicesGridRenderer'
import { PortfolioGridRenderer } from './blocks/PortfolioGridRenderer'
import { ProductsGridRenderer } from './blocks/ProductsGridRenderer'
import { CaseStudiesRenderer } from './blocks/CaseStudiesRenderer'
import { TestimonialsRenderer } from './blocks/TestimonialsRenderer'
import { TeamRenderer } from './blocks/TeamRenderer'
import { MilestonesRenderer } from './blocks/MilestonesRenderer'
import { PlatformsRenderer } from './blocks/PlatformsRenderer'
import { QuoteFormRenderer } from './blocks/QuoteFormRenderer'
import { getPayload } from '@/lib/payload'

// Selector blocks load their own data from Payload by taking `block` params.
// Content blocks receive already-resolved data.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function BlockRenderer({ blocks }: { blocks: any[] }) {
  if (!blocks?.length) return null
  const payload = await getPayload()

  const rendered = await Promise.all(
    blocks.map(async (block, i) => {
      switch (block.blockType) {
        case 'hero':
          return <HeroBlockRenderer key={i} block={block} />

        case 'cta':
          return <CTABlockRenderer key={i} block={block} />

        case 'faq':
          return <FaqBlockRenderer key={i} heading={block.heading} items={block.items || []} />

        case 'servicesGrid': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let where: any
          if (block.source === 'selected' && block.selected?.length) {
            where = { id: { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) } }
          } else if (block.source === 'featured') {
            where = { featured: { equals: true }, status: { equals: 'published' } }
          } else {
            where = { status: { equals: 'published' } }
          }
          const result = await payload.find({ collection: 'services', where, limit: block.limit || 6, sort: 'order' })
          return (
            <ServicesGridRenderer
              key={i}
              eyebrow={block.eyebrow}
              heading={block.heading}
              description={block.description}
              services={result.docs as any}
              showViewAll={block.showViewAll}
              layout={block.layout}
            />
          )
        }

        case 'portfolioGrid': {
          const where: Record<string, any> = { status: { equals: 'published' } }
          if (block.source === 'featured') where.featured = { equals: true }
          if (block.source === 'byCategory' && block.category) where.category = { equals: block.category }
          if (block.source === 'selected' && block.selected?.length) {
            where.id = { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) }
          }
          const result = await payload.find({ collection: 'projects', where, depth: 1, limit: block.limit || 3, sort: 'order' })
          return (
            <PortfolioGridRenderer
              key={i}
              eyebrow={block.eyebrow}
              heading={block.heading}
              projects={result.docs as any}
              showViewAll={block.showViewAll}
              layout={block.layout}
            />
          )
        }

        case 'productsGrid': {
          const where: Record<string, any> = { status: { equals: 'published' } }
          if (block.source === 'featured') where.featured = { equals: true }
          if (block.source === 'selected' && block.selected?.length) {
            where.id = { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) }
          }
          const result = await payload.find({ collection: 'products', where, depth: 1, limit: block.limit || 4, sort: 'order' })
          return (
            <ProductsGridRenderer
              key={i}
              eyebrow={block.eyebrow}
              heading={block.heading}
              description={block.description}
              products={result.docs as any}
              showViewAll={block.showViewAll}
            />
          )
        }

        case 'caseStudies': {
          const where: Record<string, any> = { status: { equals: 'published' } }
          if (block.source === 'featured') where.featured = { equals: true }
          if (block.source === 'byService' && block.service) {
            where.services = { contains: typeof block.service === 'string' ? block.service : block.service.id }
          }
          if (block.source === 'byProduct' && block.product) {
            where.products = { contains: typeof block.product === 'string' ? block.product : block.product.id }
          }
          if (block.source === 'selected' && block.selected?.length) {
            where.id = { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) }
          }
          const result = await payload.find({ collection: 'case-studies', where, depth: 1, limit: block.limit || 3, sort: 'order' })
          return (
            <CaseStudiesRenderer
              key={i}
              eyebrow={block.eyebrow}
              heading={block.heading}
              caseStudies={result.docs as any}
              showViewAll={block.showViewAll}
              layout={block.layout}
            />
          )
        }

        case 'testimonials': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const where: any = block.source === 'selected' && block.selected?.length
            ? { id: { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) } }
            : { featured: { equals: true } }
          const result = await payload.find({ collection: 'testimonials', where, limit: 9, sort: 'order' })
          return (
            <TestimonialsRenderer
              key={i}
              eyebrow={block.eyebrow}
              heading={block.heading}
              testimonials={result.docs as any}
              style={block.style}
            />
          )
        }

        case 'team': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const where: any = block.source === 'selected' && block.selected?.length
            ? { id: { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) } }
            : { featured: { equals: true } }
          const result = await payload.find({ collection: 'team-members', where, limit: 20, sort: 'order' })
          return (
            <TeamRenderer
              key={i}
              eyebrow={block.eyebrow}
              heading={block.heading}
              members={result.docs as any}
              showViewAll={block.showViewAll}
            />
          )
        }

        case 'milestones': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const where: any = block.source === 'selected' && block.selected?.length
            ? { id: { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) } }
            : { featured: { equals: true } }
          const result = await payload.find({ collection: 'milestones', where, limit: 20, sort: 'order' })
          return <MilestonesRenderer key={i} milestones={result.docs as any} style={block.style} />
        }

        case 'platforms': {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const where: any = block.source === 'selected' && block.selected?.length
            ? { id: { in: block.selected.map((s: any) => (typeof s === 'string' ? s : s.id)) } }
            : { featured: { equals: true } }
          const result = await payload.find({ collection: 'platforms', where, limit: 20, sort: 'order' })
          return <PlatformsRenderer key={i} eyebrow={block.eyebrow} platforms={result.docs as any} />
        }

        case 'quoteForm':
          return <QuoteFormRenderer key={i} block={block} />

        default:
          return null
      }
    }),
  )

  return <>{rendered}</>
}
