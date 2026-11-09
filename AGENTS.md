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

15. The homepage (`src/pages/index.astro`) belongs to the CasoAberto **platform**, not to any company: its hero, navigation and final CTA must be company-neutral. Show cases only as curated links/cards in the case section; editorial verdicts, Roma comparisons and warnings belong to brand, unit and case pages. Enforced in `scripts/validate-structure.mjs` during `npm run verify:data`.
16. Global header/footer navigation must be platform-centric. Do not hardcode one company's case or a sector-specific alert as the primary site-wide CTA. Company-specific pSEO content stays on `/empresas/:slug/`, `/empresas/:slug/:unit/` and `/casos/:slug/`.

17. Impact data is in `src/data/impact-models.json`; each observed metric must have a named source and dated period; consumer amounts stay attributed. Null audience or court case counts must not be rendered as real zero or made-up positive numbers.
18. Impact summaries in brand/unit/case pages use `ImpactTeaser.astro` and the full `ImpactDashboard.astro`; isolate hypothetical projections in `ImpactSimulator.tsx` with adjacent explicit labels. Never put a company-specific impact panel on the platform home.
19. Keep external brand-wide Reclame Aqui totals, complaint samples, status categories, unique source URLs and unit-specific complaints in separate denominators; do not sum overlapping samples or treat answered complaints as resolved.

20. Perfis corporativos usam `company-media.json` e `CompanyIdentityHero.astro` para logo, estabelecimento e fonte. Não apresentar screenshots sem captura real e metadados. Manter home institucional neutra.
21. As entidades contratuais ficam em `case-contract-entities.json`. Administradores só aparecem como vinculados ao pedido quando razão social, CNPJ, fonte e data forem confirmados no documento contratual e QSA. Cadastros ou endereço similares não confirmam participação no pedido.
22. A recomendação editorial pode abranger novas compras independentemente da forma de pagamento, mas exige fundamento documental e não equivale à comprovação de insolvência ou falência da marca.
