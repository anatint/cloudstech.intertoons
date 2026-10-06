# Cloudstech Website — Where to Edit Content

Content is edited in the **Cloudstech headless** Wix site → **CMS**. Changes appear on
https://cloudstech.intertoons.workers.dev on the next page load.

Only items with **Status = `published`** appear on the website.

## Pages — one entry per page (text, headings, images, SEO)

| CMS collection | Website page |
|---|---|
| Page – Home | `/` |
| Page – Services | `/services` |
| Page – Products | `/products` |
| Page – Portfolio (Works) | `/works` |
| Page – Case Studies | `/case-studies` |
| Page – Contact | Contact page |
| Page – About, Team, Industries, Technologies, Quote, Blog | `/about-us`, `/team`, `/industries`, `/technologies`, `/request-a-quote`, `/blog` — one entry per page, matched by its **Slug** |
| Global – Site Settings (Header, Footer, SEO) | Header, footer, contact details and default SEO on every page |

## Content — lists and detail pages

| CMS collection | Where it shows |
|---|---|
| Content – Services | `/services` list and each `/services/…` page; Home page |
| Content – Products | `/products` list and each `/products/…` page |
| Content – Portfolio Projects | `/works` list and each `/works/…` page; Home page |
| Content – Case Studies | `/case-studies` list and each `/case-studies/…` page |
| Content – Blog Posts | `/blog` list and each `/blog/…` post |
| Content – Blog Authors | Author shown on blog posts |
| Content – Blog Categories | Blog category filters |
| Content – Industries | `/industries`; tags on services, projects, products |
| Content – Technologies | `/technologies` and each `/technologies/…` page; Home page |
| Content – Team Members | `/team`; Home page |
| Content – Testimonials | Home page; service, product and project pages |
| Content – Milestones (Home page) | Stats / milestones on the Home page |
| Content – FAQs (Services & Products) | FAQ sections on service and product pages |
| Content – Process Steps (Services & Products) | "How we work" steps on service and product pages |
| Content – Product Features | Feature list on product pages |
| Content – Product Pricing Plans | Pricing tiers on product pages |
| Content – Result Metrics (Case Studies & Projects) | Result numbers on case study and project pages |
| Content – Tech Stack Entries | Tech stack on case study pages |
| Content – Platforms, Content – Awards | Optional sections (currently empty) |

Links between collections (e.g. which FAQs belong to a service) are set with the
reference fields inside each item, e.g. a service's **FAQs** or **Process Flow** field.

## Quote form options

| CMS collection | Where it shows |
|---|---|
| Quote Form – Project Types | Project type choices on `/request-a-quote` and the contact form |
| Quote Form – Features | Feature checkboxes on the quote form |
| Quote Form – Budget Ranges | Budget choices on the quote form |

## Form submissions — read only

Filled in automatically when visitors submit forms; no need to edit.

| CMS collection | Comes from |
|---|---|
| Form Submissions – Contact & Quote Leads | Contact and quote forms |
| Form Submissions – Quote Requests | Quote form details |
| Form Submissions – Callback Requests | "Request a callback" form |

## System

**System – Admin Users (do not edit)** holds the login for the website's `/admin` area.

## Not editable in the CMS

A few parts are fixed in the website code: the `/careers` and `/privacypolicy` pages,
and some elements such as the technology logo strip on the Home page. Changing them
needs a developer and a redeploy.
