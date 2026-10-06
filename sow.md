# SOW — Intertoons CMS Re-platforming: PayloadCMS/D1 → Wix Headless + Cloudflare

## Context

The relationship-driven Intertoons CMS already exists, fully built, in `../itwebsite`
(PayloadCMS 3 + Next.js 15 + Cloudflare D1) with 16 collections, a shared `techStackField`,
selector blocks, and data-driven frontend pages. The Payload-side relationship re-engineering
is **done**.

This SOW covers a **re-platform** (not a re-build):

- **Backend** → **Wix Headless CMS** (Wix Data collections) on site `intertoonsHeadless`
  (site id `4ffcfcd6-cb3f-4af1-959b-85296102be43`).
- **Frontend** → new **Next.js (App Router) on Cloudflare Workers** via `@opennextjs/cloudflare`,
  built in this directory (`itwixheadless`), **reusing itwebsite's React/Tailwind components and
  page designs** (design unchanged), fed from Wix via `@wix/sdk` + `@wix/data`.

**Outcome:** same site, same design, every entity a Wix collection with proper, non-duplicating
relationships, hosted on Cloudflare and reading live from Wix Headless.

**Confirmed decisions:** techStack modelled as a **junction collection**; frontend is **Next.js +
OpenNext on Workers**; relationships use Wix `REFERENCE` / `MULTI_REFERENCE` fields (bidirectional,
so Payload `join` fields are unnecessary).

---

## 1. Architecture

| Layer | Payload (current) | Wix Headless target |
|---|---|---|
| Data store | D1 / Postgres | Wix Data collections (CMS) on `intertoonsHeadless` |
| Schema mgmt | `payload.config.ts` + migrations | Wix Data Collections Management API (`/wix-data/v2/collections`) |
| Relationships | `relationship` / `join` fields | `REFERENCE` / `MULTI_REFERENCE` (bidirectional ⇒ replace join fields) |
| Reads | `getPayload().find({ depth })` | `@wix/data` `items.query(...).include(ref)` + reverse queries |
| Drafts | `versions.drafts` | `status` field (`draft`/`published`) + query filter |
| Media | `media` collection / S3 | Wix Media Manager (`IMAGE` fields) |
| Frontend host | Next.js on CF (OpenNext) | Next.js App Router + `@opennextjs/cloudflare` → Workers |
| Auth to data | Payload local API | `@wix/sdk` `OAuthStrategy` visitor client (public published content) |

---

## 2. Wix collection schema

Field-type mapping: `text/textarea→TEXT, richText→RICH_CONTENT, number→NUMBER, checkbox→BOOLEAN,
select→TEXT, upload(media)→IMAGE, array-of-objects→ARRAY, relationship(single)→REFERENCE,
relationship(hasMany)→MULTI_REFERENCE`. Every content collection carries `slug` (TEXT),
`status` (TEXT), `featured` (BOOLEAN), `order` (NUMBER), `seoTitle`, `seoDescription`, `seoImage`.

| Collection | Scalar/array fields | References |
|---|---|---|
| **Services** | title, category, shortDescription, icon(IMG), heroImage(IMG), processSteps(ARRAY), faqs(ARRAY) | relatedIndustries→industries (M), defaultTechnologies→technologies (M) |
| **Projects** | title, client, clientLogo(IMG), category, excerpt, coverImage(IMG), thumbnailImage(IMG), liveUrl, platform, duration | industry→industries (1), services→services (M) |
| **Products** | name, badge, tagline, colorTheme, icon, logo(IMG), shortDescription, description, website, stats(ARRAY), highlights(ARRAY), features(ARRAY), steps(ARRAY), pricing(ARRAY) | services→services (M), relatedProjects→projects (M), testimonial→testimonials (1) |
| **CaseStudies** | title, client, category, excerpt, coverImage(IMG), overview(RICH), challenges(ARRAY), solution(RICH), keyFeatures(ARRAY), results(ARRAY), highlights(ARRAY), quote(OBJECT), gallery(ARRAY-IMG), downloadPdf(DOC) | project→projects (1), services→services (M), products→products (M), testimonial→testimonials (1) |
| **Technologies** | name, category, logo(IMG, optional), url | — |
| **Testimonials** | quote, author, role, company, avatar(IMG) | relatedService, relatedProject, relatedProduct, relatedCaseStudy (each single) |
| **Industries** | name, description, icon | — |
| **techStackEntries** (junction) | role (TEXT) | technology→technologies (req), one owner of project/product/caseStudy |
| Supporting (lift-and-shift) | Platforms, Milestones, Awards, TeamMembers, Pages | — |

Forms → Wix Forms; Redirects → Cloudflare/Next config; Users → Wix members (not CMS).

---

## 3. Relationship model (canonical, no duplication)

- **Many-to-many** → `MULTI_REFERENCE`, queryable from both sides. Store once; read either direction.
  A Service's projects/products/case studies are **reverse queries**, not stored fields.
- **Single relations** → `REFERENCE`: `projects.industry`, `caseStudies.project`, `*.testimonial`,
  `testimonials.related*`.
- **techStack** → junction collection `techStackEntries` (`technology` ref + `role` + one owner ref).
  A project's stack = query `techStackEntries` where `project = id`, `.include('technology')`.
  One Technology edit propagates to every owner — the reusability proof.
- **Derived (no stored field):** `service.projects|products|caseStudies`, `product.caseStudies`,
  `project.caseStudy`, `technology.*`, `industry.projects` — computed in `src/lib/queries.ts`.

---

## 4. Blocks / layout

Payload's visual `layout` blocks builder has no Wix-headless equivalent. Replaced with **fixed
templated section components** (ported from itwebsite) rendered per collection — design identical.
Selector blocks (`ProductsGridBlock`, `CaseStudiesBlock`, …) become reusable frontend section
components driven by query helpers. (Future: optional `pageSections` collection — out of v1 scope.)

---

## 5. Execution

### Phase A — Wix backend (via MCP)
Wix Data Collections Management API (`/wix-data/v2/collections`), `siteId=4ffcfcd6-...`.
1. Create base collections **without refs first** (technologies, industries, testimonials, services,
   projects, products, case-studies, + supporting); set `displayField`, fields, indexes.
2. Add `REFERENCE` / `MULTI_REFERENCE` fields once both ends exist.
3. Create `techStackEntries` junction with its references.
4. `dataPermissions`: `itemRead = anyone`; writes = admin.

### Phase B — Cloudflare/Next.js scaffold (`itwixheadless`)
1. Next.js App Router + Tailwind; deps `@opennextjs/cloudflare`, `wrangler`, `@wix/sdk`, `@wix/data`,
   `lucide-react`; configs `open-next.config.ts`, `wrangler.toml`, `next.config.ts`.
2. Data layer `src/lib/wix.ts` (`createClient` + `OAuthStrategy({ clientId })` from Headless Settings,
   client id in `.dev.vars` / Worker secret) and `src/lib/queries.ts` (typed query helpers with
   forward `.include()` + reverse queries).
3. Port frontend from itwebsite, swapping `getPayload().find()` → Wix helpers, markup unchanged.
   Pages: products, case-studies, portfolio, services/[slug], [...slug], home, contact, team,
   industries. Copy `src/lib/{icons,productThemes}.ts` verbatim. Keep `force-dynamic`.
4. Map media via `@wix/sdk` media `getImageUrl`.

### Phase C — Data migration / seed
Export itwebsite content per collection → JSON; upload images to Wix Media; insert via Wix Data Items
API in dependency order (technologies → industries → testimonials → services → projects/products →
case-studies → techStackEntries), wiring references by Wix `_id`; idempotent find-or-create by `slug`.

### Phase D — Deploy
Worker secrets (Wix `clientId`); `npx @opennextjs/cloudflare build` → `wrangler deploy` (account
`f763c87d28c5cb2a660e7206e5b5aceb`). Credentials live in env/secrets only — never committed.

---

## 6. Verification

1. **Wix**: all collections present; a CaseStudy links Project+Services+Products+techStackEntries;
   reverse query returns a Service's projects/products/case studies.
2. **Reusability**: rename one Technology → reflected across all owners via `techStackEntries`.
3. **Local** (`npm run dev`): `/products`, `/products/[slug]`, `/case-studies`, `/case-studies/[slug]`,
   `/portfolio`, `/services/[slug]` render from Wix; visual diff vs itwebsite = unchanged. No `getPayload`,
   no hardcoded `const PRODUCTS`.
4. **Workers preview** (`@opennextjs/cloudflare build` + `wrangler dev`): `.include()` populates under `workerd`.
5. **Types**: `tsc --noEmit` clean.
6. **Deploy** (`wrangler deploy`): smoke-test products, a product slug, a case study, a service slug live.
