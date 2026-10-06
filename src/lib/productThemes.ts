/**
 * Maps a Product's `colorTheme` (orange | blue | emerald | purple) to the exact
 * Tailwind class sets the original product pages used. Keeping the full literal
 * strings here (and scanning `src/lib` in tailwind.config) guarantees the JIT
 * compiler emits every colour variant. Ported verbatim from the Payload build.
 */
export type ProductColorTheme = 'orange' | 'blue' | 'emerald' | 'purple'

export interface ProductTheme {
  iconBg: string
  gradient: string
  bgLight: string
  borderColor: string
  textColor: string
  heroGradient: string
  featureIcon: string
}

export const PRODUCT_THEMES: Record<ProductColorTheme, ProductTheme> = {
  orange: {
    iconBg: 'bg-orange-500',
    gradient: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
    heroGradient: 'from-orange-600 via-red-600 to-rose-700',
    featureIcon: 'text-orange-500',
  },
  blue: {
    iconBg: 'bg-blue-600',
    gradient: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    heroGradient: 'from-blue-700 via-indigo-700 to-violet-800',
    featureIcon: 'text-blue-500',
  },
  emerald: {
    iconBg: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-600',
    heroGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    featureIcon: 'text-emerald-500',
  },
  purple: {
    iconBg: 'bg-purple-600',
    gradient: 'from-purple-600 to-violet-600',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
    heroGradient: 'from-purple-700 via-violet-700 to-indigo-800',
    featureIcon: 'text-purple-500',
  },
}

export function productTheme(theme?: string | null): ProductTheme {
  return PRODUCT_THEMES[(theme as ProductColorTheme)] ?? PRODUCT_THEMES.blue
}
