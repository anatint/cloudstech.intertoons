# itwixheadless

Intertoons headless frontend — **Next.js (App Router) on Cloudflare Workers**, reading
relationship-driven content from **Wix Headless CMS**. Re-platform of the PayloadCMS/D1
build in `../itwebsite`; design preserved. Full plan in [`sow.md`](./sow.md).

## Stack

- **Backend / CMS:** Wix Headless — site `intertoonsHeadless` (`4ffcfcd6-cb3f-4af1-959b-85296102be43`).
  Collections created via the Wix Data Collections API (see `sow.md` §2–3).
- **Frontend:** Next.js 15 + Tailwind, deployed to Cloudflare Workers via `@opennextjs/cloudflare`.
- **Data access:** `@wix/sdk` (`OAuthStrategy` visitor client) + `@wix/data` — see `src/lib/wix.ts`,
  `src/lib/queries.ts`.

## Setup

1. `npm install`
2. Get the Wix Headless OAuth **client ID** (Wix dashboard → Settings → Headless Settings → OAuth Apps).
3. `cp .dev.vars.example .dev.vars` and set `WIX_CLIENT_ID`. Also set it in `wrangler.toml` `[vars]`.
4. `npm run dev` → http://localhost:3000

## Data model (Wix collections)

`Technologies, Industries, Testimonials, Services, Projects, Products, CaseStudies,
TechStackEntries` (junction) + supporting `Platforms, Milestones, Awards, TeamMembers, SitePages`.
Relationships use `REFERENCE` / `MULTI_REFERENCE` (bidirectional — reverse queries replace Payload
join fields). Per-item tech roles live in the `TechStackEntries` junction. Details in `sow.md`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Next.js production build |
| `npm run cf:preview` | OpenNext build + `wrangler dev` (Workers runtime) |
| `npm run cf:deploy` | OpenNext build + `wrangler deploy` |

## Status

- ✅ Wix collections + relationships created and **seeded** (technologies, industries, milestones,
  team, testimonials, services, projects, products, case studies, techStack junction).
- ✅ Full UI ported from `../itwebsite` (design intact), data-driven via the Wix-backed
  `getPayload()` facade in `src/lib/payload.ts`.
- ✅ **Deployed:** https://itwixheadless.intertoons.workers.dev — all pages render live Wix data.

### Data access note (important)
Wix Headless **visitor tokens cannot use `.include()`** on references (returns `WDE0181`). The
facade therefore resolves relationships with visitor-permitted primitives:
single refs → batch-fetch by `_id`; forward multi-refs → inversion via `owner.hasSome(field,[id])`;
techStack → the `TechStackEntries` junction. Reverse relations use `where: { field: { contains: id } }`.

### Known follow-ups
- `team/page.tsx` is a `'use client'` component (client-rendered); wire it to a Wix fetch or
  pass server data if you want team members in SSR HTML.
- Rich-text (`overview`/`solution`) is seeded as plain strings; switch to Ricos if rich formatting is needed.
- Media: collections currently have no images seeded; upload to Wix Media and the facade will
  surface them as `{ url }` automatically.
