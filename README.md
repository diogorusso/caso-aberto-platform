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

Public repo: [`diogorusso/caso-aberto-platform`](https://github.com/diogorusso/caso-aberto-platform). To connect Cloudflare Pages:

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

The project declares Astro 7 + its official React and sitemap integrations (Node.js 22.23.4 or higher). npm must have network access on the developer machine or Cloudflare builder to install dependencies.

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

**Status:** live on GitHub (`diogorusso/caso-aberto-platform`) and Cloudflare Pages (`https://casoaberto.pages.dev`). Deploys are triggered by commits to `main` through GitHub Actions and Wrangler direct upload to Cloudflare Pages.

## Dossiê corporativo Florense — pesquisa pública (09/11/2026)

`src/data/florense-dossier.json` concentra o cadastro de fabricantes/empresa no endereço da loja de Ipanema, administradores profissionais, rede de franquias, métricas históricas de reclamações, estrutura fabril e declarações públicas com URLs de origem. A página `/empresas/florense/` exibe esses dados por meio de `src/components/CompanyDossier.astro` e `src/styles/dossier.css`. A página `/empresas/florense/ipanema-rj/` expõe dados específicos da unidade e divergências nas razões sociais reportadas.

Os números do Reclame Aqui usam recortes temporais distintos: histórico da marca e período de seis meses, e não representam automaticamente a situação da franqueada Ipanema. Capital social é valor cadastral, não caixa. A documentação da falência da Roma é sobre outra empresa.

## Corporate profiles, documentary exports and media assets

- `src/data/company-profiles.json` contains five sourced CNPJ profiles (manufacturer, company at Ipanema, two corporate shareholders and a historical similarly named entity).
- `src/components/CompanyProfiles.astro` renders records, QSA, CNAE, dates, capital and source links; CNPJ verification through Receita Federal is linked.
- `src/data/evidence-index.json` contains 16 stable reference IDs for case CA-001, distinguishing publicly linked records and private originals still to collect.
- `/casos/:slug/evidencias/` prints the public evidence index or saves via browser print-to-PDF.
- `/casos/:slug/indice-evidencias.csv` is an Astro-generated static CSV for document review.
- `/casos/:slug/materiais-imprensa/` serves free media cards, editorial fact sheet and documentary links.
- `public/media/` has standalone SVG artwork and plain-text fact sheet.
- `scripts/build-evidence-manifest.mjs` computes SHA-256 manifests for local private files, without network or upload. See `docs/evidence-pack/README.md`.

Never publish private contracts, payment statements or personal identifiers to Cloudflare or the public repository. A corporate registry record confirms a registered entity, but not by itself a contract or liability. The historic Brasmoveis entry is kept explicitly separate from any confirmed contracting party.

## pSEO platform, company rankings and reusable case profiles (2026-11-09)

Full source and onboarding procedure: **[`docs/pseo-platform.md`](docs/pseo-platform.md)**.

- `/empresas/` — directory of reviewed companies, sorted by editorial recommendation band.
- `/avaliacoes/nao-recomendamos/` — sourced recommendations with explicit scope and review conditions.
- `/empresas/:slug/`, `/empresas/:slug/:unit/` — data-driven profiles with verdict, linked cases, local public complaints, CNPJs, QSA, corporate relationships and FAQ.
- `/cnpj/`, `/cnpj/:digits/` — registry index and individual public company records, separately linked to brands/cases when supported.
- `/problemas/`, `/problemas/:slug/` — substantive source-backed complaint-topic hubs (only when at least two records exist).
- `/casos/:slug/fact-sheet.txt` — generated, case-specific static press fact sheet; no copy of case CA-001 for future cases.
- Reusable Astro components: `EditorialVerdict`, `BrandRatingCard`, `BrandOverview`, `CompanyCaseMatrix`, `CompanyRanking`, and `CompanyProfiles`.

Create a **non-public** new-company draft without duplicating pages:

```bash
npm run new:company -- --slug exemplo --name "Empresa Exemplo" --segment "Construção" --location "São Paulo, SP"
```

Edit `src/data/brands.json` to supply verified primary CNPJ, related cases, documented verdict rationale, sources and review triggers. `published: false` keeps a draft out of routes. The production site uses Github Actions -> Wrangler Pages direct-upload, triggered by `main`; Cloudflare Pages is still static, no server and no database.

The editorial categories do not represent a nationwide numerical solvency ranking. The site compares only the companies and units published, with source, date, scope, and individually linked cases.

## Platform landing page boundary (2026-11-09)

The root route `/` now describes **CasoAberto as a multi-company publishing and research platform**, with generic company lookup, case exploration, CNPJ registry, editorial status methodology and real archive counters. Its homepage hero no longer repeats the Florense recommendation or Roma Mobili warning. This content remains on `/empresas/florense/`, `/empresas/florense/ipanema-rj/` and the specific CA-001 dossier.

The brand-neutrality regression check lives in `scripts/validate-structure.mjs`, automatically included in `npm run verify:data` and the GitHub CI build. The shared header/footer are also company-neutral. The home stylesheet is `src/styles/home-platform.css`.

## Painéis de impacto e exposição documentada (2026-11-09)

- `src/data/impact-models.json`: recortes datados da marca em plataformas externas, valor e prazo relatados pelo consumidor, datas de apuração, métricas indisponíveis como `null`, fontes e premissas para cenários.
- `src/lib/impact.ts`: calcula URLs únicas, reclamações por status, intervalos e vínculos de empresa, unidade e caso.
- `src/components/ImpactTeaser.astro`: indicadores e CTA nos perfis de empresas, unidades e casos.
- `src/components/ImpactDashboard.astro`: separa dados do arquivo, contextos de terceiros, estados das reclamações, fontes e chamadas de ação.
- `src/components/ImpactSimulator.tsx`: React island com cenários financeiros, comerciais e de demandas ajustáveis. Valores simulados não são perdas ou previsões verificadas.
- `/casos/:slug/impacto/`, `/empresas/:slug/impacto/`, `/empresas/:slug/:unit/impacto/`: páginas SEO geradas automaticamente.
- `scripts/validate-data.mjs` e `scripts/validate-structure.mjs`: validam formatos, fontes, recortes, datas e rotas.

A home institucional não recebe o alerta de uma empresa. Medições do Reclame Aqui não são tráfego do CasoAberto; reclamações respondidas não são necessariamente resolvidas; pagamentos não são perdas definitivas; notificações e protocolos não são ações judiciais. Todas as projeções possuem premissas explícitas e os registros não são somados quando se sobrepõem.

## Perfis empresariais visuais e CNPJs do contrato

A identidade visual da empresa/unidade e o arquivo de mídia têm fonte em `src/data/company-media.json`. Os dois papéis contratuais de CA-001 permanecem pendentes em `src/data/case-contract-entities.json`, até receber os CNPJs reais. Componentes: `CompanyIdentityHero`, `CompanyRecognitionGallery`, `CaseContractScope`, `CaseCompanyReference`. Instruções em `docs/company-visual-contract-entities.md`. Nenhum screenshot é fabricado; as referências à loja são datadas e atribuídas.

## Observatório de precedentes e cenários editoriais (2026-11-09)

Diferencial do produto: transformar dossiês de consumo em análises de risco documentadas com precedentes judiciais, tempo entre marcos, exposição de créditos e cenários condicionais — nunca previsão automática de insolvência.

- `src/data/precedents.json` — Roma Mobili, Lojas KD e Kitchens, com processos, datas, fontes, limites e relação explícita com CA-001.
- `src/lib/precedents.ts` — consulta por caso e duração UTC entre eventos datados.
- `src/components/PrecedentCard.astro`, `PrecedentTimeline.astro`, `PrecedentComparison.astro` — componentes pSEO reutilizáveis.
- `/precedentes/`, `/precedentes/:slug/`, `/precedentes/indice.csv` — observatório, fichas de precedentes e CSV para imprensa ou análise documental.
- `/casos/:slug/precedentes/` — comparação contextual vinculada ao caso por ID, com similaridades, diferenças, desfechos condicionais e links para o processo.
- Snippets para marca/unidade/caso/impacto e diferencial institucional genérico na home. A home não se transforma em campanha de uma empresa.
- Documentação e tabela de datas: `docs/precedent-observatory.md`.

**Conferência obrigatória:** Roma e Lojas KD têm falência decretada; Kitchens tinha processamento de RJ deferido em 03/11/2026 e **não** era uma falência registrada nesta revisão. A diferença entre data de reportagem, pedido de RJ, encerramento, sentença e prazo de ressarcimento deve ser preservada. `npm run verify:data` confere a aritmética e as fontes antes de publicar.
