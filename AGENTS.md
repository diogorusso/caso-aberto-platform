# CasoAberto working instructions

Scope: a static Brazilian consumer-case publishing website. GitHub is the source of truth; Cloudflare Pages builds `dist/` from `main`.

1. Use Astro `.astro` components for default static pages. Never introduce server runtime, Cloudflare adapter, database, expensive hosted service, or new framework without a concrete use case.
2. Create reusable components rather than duplicating case markup. React islands only for necessary client interaction, with the least intrusive `client:*` directive.
3. One `src/data/casos.json` record generates four case routes through `getStaticPaths()`. Add linked public complaints in `src/data/relatos.json` with `case_id`.
4. Keep readable SEO titles, descriptions, canonical URLs (only after verified domain), sitemap, accessible navigation and mobile layouts.
5. All public claims need traceable source links, accurate dates and statuses. Do not fabricate testimonials, post impersonated reviews, or expose private documents.
6. Validate with `npm run verify:data`, `npm run check`, `npm run build` before merging. Maintain keyboard-friendly interactions and links that work without JS.
7. Preserve existing SEO slugs unless a 301 redirect is explicitly added.
