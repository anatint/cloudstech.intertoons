import { getWixClient } from './wix'
import type {
  Product,
  Service,
  Project,
  CaseStudy,
  Industry,
  TechStackEntry,
} from './types'

/**
 * Typed read helpers over the Wix Headless CMS. These replace the Payload
 * `getPayload().find()` calls — same intent, same returned shapes, so ported
 * pages need only swap the import. Reverse-reference queries replace Payload's
 * read-only `join` fields (Wix MULTI_REFERENCE is queryable from both sides).
 *
 * Collection IDs match those created via the Wix Data Collections API.
 */

type AnyItem = Record<string, unknown> & { _id: string }

const PUBLISHED = 'published'

/** Fetch every published item in a collection, ascending by `order`. */
async function queryAll<T = AnyItem>(
  collectionId: string,
  opts: { include?: string[]; limit?: number } = {},
): Promise<T[]> {
  const client = getWixClient()
  let q = client.items.query(collectionId).eq('status', PUBLISHED).ascending('order').limit(opts.limit ?? 100)
  for (const ref of opts.include ?? []) q = q.include(ref)
  const res = await q.find()
  return res.items as T[]
}

async function queryBySlug<T = AnyItem>(
  collectionId: string,
  slug: string,
  opts: { include?: string[] } = {},
): Promise<T | null> {
  const client = getWixClient()
  let q = client.items.query(collectionId).eq('slug', slug).limit(1)
  for (const ref of opts.include ?? []) q = q.include(ref)
  const res = await q.find()
  return (res.items[0] as T) ?? null
}

/**
 * Tech stack for a set of owners. Queries the `TechStackEntries` junction by
 * the owner field (`project` | `product` | `caseStudy`), resolving each
 * technology via `.include('technology')`, then groups by owner id.
 */
async function techStackFor(
  ownerField: 'project' | 'product' | 'caseStudy',
  ownerIds: string[],
): Promise<Record<string, TechStackEntry[]>> {
  if (ownerIds.length === 0) return {}
  const client = getWixClient()
  const res = await client.items
    .query('TechStackEntries')
    .hasSome(ownerField, ownerIds)
    .include('technology')
    .limit(500)
    .find()
  const grouped: Record<string, TechStackEntry[]> = {}
  for (const raw of res.items as TechStackEntry[]) {
    const owner = raw[ownerField] as string | undefined
    if (!owner) continue
    ;(grouped[owner] ??= []).push(raw)
  }
  return grouped
}

// ─── Products ──────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const products = await queryAll<Product>('Products')
  const byId = await techStackFor('product', products.map((p) => p._id))
  for (const p of products) p.techStack = byId[p._id] ?? []
  return products
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await queryBySlug<Product>('Products', slug, {
    include: ['services', 'relatedProjects', 'testimonial'],
  })
  if (!product) return null
  const byId = await techStackFor('product', [product._id])
  product.techStack = byId[product._id] ?? []
  return product
}

// ─── Services (with reverse-join relations) ──────────────────────────────────

export async function getServices(): Promise<Service[]> {
  return queryAll<Service>('Services')
}

export async function getServiceBySlug(slug: string): Promise<
  | (Service & { projects: Project[]; products: Product[]; caseStudies: CaseStudy[] })
  | null
> {
  const service = await queryBySlug<Service>('Services', slug, {
    include: ['relatedIndustries', 'defaultTechnologies'],
  })
  if (!service) return null
  const client = getWixClient()
  // Reverse queries replace Payload join fields.
  const [projects, products, caseStudies] = await Promise.all([
    client.items.query('Projects').hasSome('services', [service._id]).eq('status', PUBLISHED).find(),
    client.items.query('Products').hasSome('services', [service._id]).eq('status', PUBLISHED).find(),
    client.items.query('CaseStudies').hasSome('services', [service._id]).eq('status', PUBLISHED).find(),
  ])
  return {
    ...service,
    projects: projects.items as Project[],
    products: products.items as Product[],
    caseStudies: caseStudies.items as CaseStudy[],
  }
}

// ─── Projects (Portfolio) ────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const projects = await queryAll<Project>('Projects', { include: ['industry'] })
  const byId = await techStackFor('project', projects.map((p) => p._id))
  for (const p of projects) p.techStack = byId[p._id] ?? []
  return projects
}

export async function getProjectBySlug(
  slug: string,
): Promise<(Project & { caseStudy: CaseStudy | null }) | null> {
  const project = await queryBySlug<Project>('Projects', slug, { include: ['industry', 'services'] })
  if (!project) return null
  const byId = await techStackFor('project', [project._id])
  project.techStack = byId[project._id] ?? []
  // Reverse: does a case study point at this project?
  const client = getWixClient()
  const cs = await client.items.query('CaseStudies').eq('project', project._id).eq('status', PUBLISHED).limit(1).find()
  return { ...project, caseStudy: (cs.items[0] as CaseStudy) ?? null }
}

// ─── Case Studies ────────────────────────────────────────────────────────────

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return queryAll<CaseStudy>('CaseStudies')
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const cs = await queryBySlug<CaseStudy>('CaseStudies', slug, {
    include: ['project', 'services', 'products', 'testimonial'],
  })
  if (!cs) return null
  const byId = await techStackFor('caseStudy', [cs._id])
  cs.techStack = byId[cs._id] ?? []
  return cs
}

// ─── Industries ──────────────────────────────────────────────────────────────

export async function getIndustries(): Promise<Industry[]> {
  return queryAll<Industry>('Industries')
}
