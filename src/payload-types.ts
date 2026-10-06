/**
 * Compatibility shim for ported PayloadCMS pages that import from
 * `@/payload-types`. The pages access fields loosely (the original Payload types
 * were far richer than the Wix model needs), so these are intentionally
 * permissive aliases. Real, query-facing types live in `@/lib/types`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Product = any
export type Technology = any
export type Testimonial = any
export type Service = any
export type Project = any
export type CaseStudy = any
export type Industry = any
export type TechStackEntry = any
export type Media = any
export type TeamMember = any
export type Milestone = any
export type Page = any
