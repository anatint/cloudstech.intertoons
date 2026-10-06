import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { productTheme } from '@/lib/productThemes'
import { lucideIcon } from '@/lib/icons'

type Product = {
  id: string
  slug: string
  name: string
  badge?: string
  tagline?: string
  shortDescription?: string
  icon?: string
  colorTheme?: string
}

interface ProductsGridRendererProps {
  eyebrow?: string
  heading?: string
  description?: string
  products: Product[]
  showViewAll?: boolean
}

export function ProductsGridRenderer({ eyebrow, heading, description, products, showViewAll }: ProductsGridRendererProps) {
  if (!products?.length) return null

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100">
      <div className="container max-w-6xl">
        {(eyebrow || heading) && (
          <div className="text-center mb-12">
            {eyebrow && <p className="text-[15px] font-bold uppercase tracking-[0.18em] text-brand-600 mb-3">{eyebrow}</p>}
            {heading && <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>}
            {description && <p className="mt-3 text-slate-500 max-w-xl mx-auto">{description}</p>}
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const theme = productTheme(p.colorTheme)
            const Icon = lucideIcon(p.icon)
            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className={`group rounded-2xl border ${theme.borderColor} bg-white p-6 hover:shadow-lg transition-all duration-200`}
              >
                <div className={`h-12 w-12 rounded-xl ${theme.iconBg} flex items-center justify-center text-white mb-4 shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                {p.badge && <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textColor} mb-1`}>{p.badge}</p>}
                <h3 className="font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">{p.name}</h3>
                {(p.tagline || p.shortDescription) && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.tagline || p.shortDescription}</p>
                )}
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                  Learn more <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
        {showViewAll && (
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-white transition-colors"
            >
              View All Products <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
