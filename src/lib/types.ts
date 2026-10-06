/**
 * Lightweight types for the Wix CMS collections. Each maps a Wix data item's
 * `data` payload (fields live at the top level alongside `_id`). These mirror
 * the Payload collection shapes so ported components need minimal changes.
 *
 * NOTE: Wix Data is schemaless at read time — array/object fields come back as
 * plain JSON. These interfaces document the expected shape, not a guarantee.
 */

export interface WixRef {
  _id: string
  [key: string]: unknown
}

export interface Technology extends WixRef {
  name: string
  category?: string
  logo?: string
  url?: string
  slug?: string
}

export interface TechStackEntry extends WixRef {
  role?: string
  /** Populated when the query uses `.include('technology')`. */
  technology?: Technology | string
  project?: string
  product?: string
  caseStudy?: string
}

export interface Stat {
  value: string
  label: string
}
export interface Highlight {
  text: string
}
export interface Feature {
  icon?: string
  title: string
  description?: string
}
export interface Step {
  num?: string
  title: string
  description?: string
}
export interface PricingTier {
  name: string
  price: string
  period?: string
  description?: string
  features?: { text: string }[]
  highlight?: boolean
  cta?: string
}

export interface Product extends WixRef {
  name: string
  slug?: string
  badge?: string
  tagline?: string
  colorTheme?: string
  icon?: string
  logo?: string
  shortDescription?: string
  description?: string
  website?: string
  status?: string
  order?: number
  featured?: boolean
  stats?: Stat[]
  highlights?: Highlight[]
  features?: Feature[]
  steps?: Step[]
  pricing?: PricingTier[]
  // References (populated with `.include(...)`):
  services?: (Service | string)[]
  relatedProjects?: (Project | string)[]
  testimonial?: Testimonial | string
  // Derived (attached by query helpers):
  techStack?: TechStackEntry[]
}

export interface Service extends WixRef {
  title: string
  slug?: string
  category?: string
  shortDescription?: string
  icon?: string
  heroImage?: string
  processSteps?: Step[]
  faqs?: { question: string; answer?: unknown }[]
  relatedIndustries?: (Industry | string)[]
  defaultTechnologies?: (Technology | string)[]
  featured?: boolean
  order?: number
  status?: string
  /* DB-driven structured content (seeded by admin-migrate.ts) */
  subServices?: { icon: string; title: string; desc: string }[]
  whyChoose?: string[]
  stats?: Stat[]
  heroLabels?: { value: string; label: string }[]
  partnerCards?: { title: string; description: string }[]
  heroHeadline?: { black: string; blue: string; suffix?: string }
  ctaHeading?: string
  ctaSub?: string
  ctaBtnText?: string
}

export interface Project extends WixRef {
  title: string
  slug?: string
  client?: string
  clientLogo?: string
  category?: string
  excerpt?: string
  coverImage?: string
  thumbnailImage?: string
  liveUrl?: string
  platform?: string
  duration?: string
  industry?: Industry | string
  services?: (Service | string)[]
  techStack?: TechStackEntry[]
}

export interface CaseStudy extends WixRef {
  title: string
  slug?: string
  client?: string
  category?: string
  excerpt?: string
  coverImage?: string
  overview?: unknown
  challenges?: { text: string }[]
  solution?: unknown
  keyFeatures?: Feature[]
  results?: { metric: string; label: string; icon?: string }[]
  highlights?: Highlight[]
  quote?: { text?: string; author?: string }
  project?: Project | string
  services?: (Service | string)[]
  products?: (Product | string)[]
  testimonial?: Testimonial | string
  techStack?: TechStackEntry[]
}

export interface Industry extends WixRef {
  name: string
  slug?: string
  description?: string
  icon?: string
}

export interface Testimonial extends WixRef {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
}
