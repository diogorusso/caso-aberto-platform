# CasoAberto working instructions

Scope: a static Brazilian consumer-case publishing website. GitHub is the source of truth; Cloudflare Pages builds `dist/` from `main`.

1. Use Astro `.astro` components for default static pages. Never introduce server runtime, Cloudflare adapter, database, expensive hosted service, or new framework without a concrete use case.
2. Create reusable components rather than duplicating case markup. React islands only for necessary client interaction, with the least intrusive `client:*` directive.
3. One `src/data/casos.json` record generates four case routes through `getStaticPaths()`. Add linked public complaints in `src/data/relatos.json` with `case_id`.
4. Keep readable SEO titles, descriptions, canonical URLs (only after verified domain), sitemap, accessible navigation and mobile layouts.
5. All public claims need traceable source links, accurate dates and statuses. Do not fabricate testimonials, post impersonated reviews, or expose private documents.
6. Validate with `npm run verify:data`, `npm run check`, `npm run build` before merging. Maintain keyboard-friendly interactions and links that work without JS.
7. Preserve existing SEO slugs unless a 301 redirect is explicitly added.

8. `src/data/company-profiles.json` holds sourced CNPJ/QSA profiles; keep the manufacturer's own shareholders separate from franchise and unrelated historical entities.
9. `src/data/evidence-index.json` holds stable public/private evidence IDs; public CSV and printable pages are generated from this manifest. Never commit unredacted private originals.
10. Media assets are in `public/media/`. The hash inventory script in `scripts/build-evidence-manifest.mjs` must be run locally, not in production.

11. Editorial verdicts and published brands/units live in `src/data/brands.json`, with one recommendation band, scope, date, evidence and review triggers per brand/unit. Render them using `src/components/EditorialVerdict.astro` and `CompanyRanking.astro`.
12. `src/pages/empresas/[slug]/` and `src/pages/empresas/[slug]/[unit]/` are generic pSEO templates. Florense static pages take precedence and must reuse the same components, not duplicate UI logic. Never replace established URLs.
13. The brand must have linked published cases and source-backed review before `published:true`; new drafts are created with `npm run new:company -- ...`. Case, brand, unit, evidence and company registry IDs must resolve in `npm run verify:data`.
14. Topic pages in `src/data/issues.json` require distinct editorial context and at least two linked original source records. Do not generate empty/near-duplicate pages.
