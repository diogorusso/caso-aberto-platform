# CasoAberto — Astro + React Islands + Cloudflare Pages

**A platform landing page and SEO-friendly dossiers for Brazilian consumer cases**, with a reusable component system and zero runtime servers. The first case is **Florense Ipanema (CA-001)**.

## Architecture

- **Astro** renders the entire site as static HTML at build time (`output: 'static'`).
- **Reusable `.astro` components** power the masthead, footer, case cards, case introductions, timelines, requests, source lists, breadcrumbs and case navigation.
- **React only when useful**: `ReportsExplorer.tsx` is a searchable/filterable complaints archive, hydrated with `client:visible`. Its initial content is rendered as HTML on the server/build so the source links remain visible without JavaScript.
- **Structured JSON**: `src/data/casos.json` and `src/data/relatos.json` define what gets built.
- **Cloudflare Pages** hosts only `dist/`. There is no server at runtime, no database, CMS, Python builder, Cloudflare adapter or API key.
- **GitHub commits** are the publication mechanism: update data/content/components, commit, push, Cloudflare builds and publishes. Pull requests produce preview URLs.

## Pages

| Role | URL |
|---|---|
| Brand landing page and value proposition | `/` |
| All consumer cases | `/casos/` |
| Individual case dossier | `/casos/:slug/` |
| Timeline and milestones | `/casos/:slug/linha-do-tempo/` |
| Sources and public complaints | `/casos/:slug/reclamacoes-publicas/` |
| Press dossier | `/casos/:slug/imprensa/` |
| How it works | `/como-funciona/` |
| Editorial methodology | `/metodologia/` |

`/robots.txt` and `/404.html` are generated. If the real production URL is configured, Astro automatically generates the sitemap using `@astrojs/sitemap`, along with canonical and `og:url` metadata. Site content is in **Brazilian Portuguese**, and the existing Florense case slug is preserved.

## Add a case in one commit

1. Add an object to `src/data/casos.json`. Required: `id`, `slug`, `empresa`, `empresa_resumo`, `local`, `categoria`, `titulo`, `chamada`, `resumo`, `status`, `status_data`, `data_publicacao`, `cronologia`, `pedidos`, `fontes`. Optional: `valor_brl`, `prazo_original`, `prazo_posterior`, `imprensa_perguntas`.
2. Add any external public reports to `src/data/relatos.json` with `case_id` set to that case's `id`, and a direct `https://` link for each original report.
3. Run `npm run build`, or push to `main` to have Cloudflare build it. Astro generates **four paths per case** automatically through `getStaticPaths()`.

Case content is escaped by Astro/React and sent to pages as text, not injected with `set:html`. Only project-owned JSON-LD is emitted as a structured script. Do not add private files, full signed legal notices, CPF/address/telephone data, or unpublished consumer evidence to the public repository.

## Cloudflare Pages — one-time connection

Create a **public** repo named `diogorusso/casoaberto` (or your preferred name), upload/commit this project's source files, then:

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select the GitHub repository.
3. **Production branch:** `main`.
4. **Framework preset:** Astro.
5. **Build command:** `npm run build`.
6. **Build output directory:** `dist`.
7. **Root directory:** `/`.
8. **Node.js:** `22.23.4` or newer (this repo pins `.node-version`; this matches the current Cloudflare Pages build image).

Once Cloudflare assigns the **actual** `https://<name>.pages.dev` URL (or after attaching a custom domain), set it in `src/data/site.json` as `base_url`, for example:

```json
{"base_url": "https://YOUR-REAL-PROJECT.pages.dev"}
```

Alternatively set the build-time environment variable `PUBLIC_SITE_URL` to your verified live production origin. This enables canonical tags, `og:url` and the sitemap (the project does **not** assume or invent a real domain in advance). Commit that change and allow Cloudflare to redeploy.

### Every subsequent release

```bash
git add .
git commit -m "content: update case CA-001"
git push origin main
```

No local CLI or Cloudflare token is required after Git connection. GitHub remains the source of truth, and Cloudflare Pages handles build and preview deployment.

## Local development

```bash
npm install
npm run dev          # http://localhost:4321/
npm run verify:data
npm run check        # Astro/TS diagnostics
npm run build        # outputs dist/
npm run preview      # preview built static site
```

The project declares Astro 6 + its official React and sitemap integrations (Node.js 22.23.4 or higher). npm must have network access on the developer machine or Cloudflare builder to install dependencies. This handoff's environment cannot contact the npm registry, so the **actual Astro compiler build was not verified here**; structural/data tests were run instead. Before going live, make a successful Cloudflare build and inspect one mobile and one desktop deployment preview.

## Design system and interaction boundaries

- One global stylesheet `src/styles/global.css` is based on the previously approved CasoAberto layout: dark green / warm coral, high-contrast type, responsive grids.
- Static by default: cards, headers, metadata, timeline, case page, navigation, footer and press copy.
- React island only for interactive search/filtering. To add a new island later, add `src/components/islands/<Name>.tsx` and attach `client:visible` or `client:idle` to its use.
- Avoid a global client-side store, SSR adapter, content API or bespoke build generator until a genuine requirement emerges.

## Editorial update hygiene

Keep each complaint's source, date, geographic scope, status and updates distinct. Public reviews by third parties must not be fabricated or impersonated; do not replace statuses of resolved cases with "unresolved". These rules protect the platform's credibility and strengthen the visibility of substantiated cases. Copy should distinguish the client's statements from independently verified sources.

## Security / privacy

- `public/_headers` contains static-hosting security headers and `public/_redirects` preserves historical single-case URLs.
- Never commit `.env`, signed PDF/DOCX attachments or unredacted private messages.
- Analytics can be added using Cloudflare Web Analytics, with no customer account system.
- SEO has canonical URLs when the verified site origin is configured. Noindex unpublished drafts through content workflow (not by publishing them to `main`).

**Status:** this is a complete, local Astro source migration packaged for upload. It has not been pushed to `diogorusso/casoaberto` or deployed to Cloudflare.
