# Wix CMS Collections — Admin Guide

This guide explains how to manage the Wix Headless CMS collections used by the Intertoons website. It covers:
1. How to add new fields to make JSON arrays user-friendly
2. How to set up proper references between collections
3. How to seed structured data via script

---

## Current Collection Structure

| Collection | Fields | References |
|---|---|---|
| **Services** | title, slug, category, shortDescription, faqs, processSteps, featured, order, status | defaultTechnologies → Technologies (M), relatedIndustries → Industries (M) |
| **Projects** | title, slug, client, category, excerpt, platform, duration, featured, order, status | industry → Industries (1), services → Services (M) |
| **Products** | name, slug, badge, tagline, colorTheme, icon, shortDescription, description, features, highlights, stats, steps, pricing, featured, order, status | services → Services (M), relatedProjects → Projects (M), testimonial → Testimonials (1) |
| **CaseStudies** | title, slug, client, category, excerpt, overview, challenges, solution, results, highlights, quote, featured, order, status | project → Projects (1), services → Services (M), products → Products (M), testimonial → Testimonials (1) |
| **Industries** | name, slug, description, icon, featured, order, status | — |
| **Technologies** | name, slug, category, featured, order, status | — |
| **Testimonials** | author, slug, quote, company, order, status | — |
| **TeamMembers** | name, slug, role, bio, featured, order, status | — |
| **Milestones** | title, slug, description, year, featured, order, status | — |
| **TechStackEntries** | role, status | technology → Technologies (1), caseStudy → CaseStudies (1) |

---

## New Fields to Add in Wix Dashboard

### Services Collection — New Structured Fields

Go to **Wix Dashboard → CMS → Services** and add these fields:

| Field Name | Display Name | Type | Purpose |
|---|---|---|---|
| `subServices` | Sub Services | **Array** (JSON) | List of { icon, title, desc } for the "What We Offer" grid |
| `whyChoose` | Why Choose | **Array** (JSON) | Bullet points for "Why Choose Intertoons" section |
| `stats` | Stats | **Array** (JSON) | { value, label } pairs for the stats counter |
| `heroLabels` | Hero Labels | **Array** (JSON) | Badge labels shown in the hero section |
| `heroHeadline` | Hero Headline | **Object** (JSON) | { black, blue, suffix } for the hero H1 split |
| `ctaHeading` | CTA Heading | **Text** | Main CTA section heading |
| `ctaSub` | CTA Sub | **Text** | CTA section description |
| `ctaBtnText` | CTA Button Text | **Text** | CTA button label |

> [!TIP]
> After adding these fields in the Wix Dashboard, run the `admin-migrate.ts` script to seed the existing hardcoded data into the database.

---

## Making JSON Fields User-Friendly

### Option 1: Use Wix Dashboard JSON Editor (Quick)
Array fields like `faqs`, `processSteps`, `subServices` will show as JSON in the Wix CMS dashboard. You can edit them directly as JSON arrays.

### Option 2: Create Sub-Collections (Recommended for Power Users)

For the best editing experience, create child collections with references:

#### Example: Service FAQs
1. Create a new collection `ServiceFAQs`
2. Add fields: `question` (Text), `answer` (Rich Text), `order` (Number)
3. Add reference: `service` → Services (Single Reference)
4. Now each FAQ is a separate row — easy to add/edit/reorder

#### Example: Service Process Steps
1. Create a new collection `ServiceProcessSteps`  
2. Add fields: `stepNumber` (Number), `title` (Text), `description` (Text)
3. Add reference: `service` → Services (Single Reference)

> [!IMPORTANT]
> If you create sub-collections, the frontend code also needs updating to query the sub-collection instead of reading the array field.

---

## Running the Migration Script

```bash
# Get an API key from Wix Dashboard → Settings → API Keys
# The key needs "Wix Data" write permissions

WIX_CLIENT_ID=df0c393b-5bc6-403c-bb55-f4c5cb734dd7 \
WIX_API_KEY=<your-admin-api-key> \
npx tsx admin-migrate.ts
```

This script will:
- Read all services from the Services collection
- Add `subServices`, `whyChoose`, `stats`, `heroLabels`, `heroHeadline`, `ctaHeading`, `ctaSub`, `ctaBtnText` fields
- Populate them with the data currently hardcoded in the frontend

---

## Reference Fields Setup

The following references are already configured in Wix:

### Single References (→ one target)
- `CaseStudies.project` → Projects
- `CaseStudies.testimonial` → Testimonials
- `Products.testimonial` → Testimonials
- `Projects.industry` → Industries
- `TechStackEntries.technology` → Technologies

### Multi References (→ many targets)
- `Services.defaultTechnologies` → Technologies
- `Services.relatedIndustries` → Industries
- `Projects.services` → Services
- `Products.services` → Services
- `Products.relatedProjects` → Projects
- `CaseStudies.services` → Services
- `CaseStudies.products` → Products

### How Reverse Queries Work
When viewing a Service detail page, the site needs to show related Projects, Products, and Case Studies. Since Wix MULTI_REFERENCE fields are queryable from both sides:

```
// "Show me all projects that reference this service"
Projects.query().hasSome('services', [serviceId])
```

This is handled automatically by the `payload.ts` facade.
