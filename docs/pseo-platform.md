# CasoAberto — data-driven pSEO publishing model

> The public site is static. Data and templates live in Git; Cloudflare Pages deploys a reviewed commit.

## URL graph

| Resource | SEO path | Source of truth | When generated |
|---|---|---|---|
| Company directory + editorial ranking | \`/empresas/\` | \`brands.json\` | Always |
| “Não recomendamos” | \`/avaliacoes/nao-recomendamos/\` | \`brands.json\` | Always, with review methodology |
| Brand | \`/empresas/:slug/\` | \`brands.json\` | Only if published |
| Unit | \`/empresas/:slug/:unit/\` | \`brands.json\` | Only if published |
| CNPJ | \`/cnpj/:digits/\` | \`company-profiles.json\` | When corporate registry evidence exists |
| Case dossier | \`/casos/:slug/\` | \`casos.json\` | Published cases |
| Documentary index, fact sheet, CSV | \`/casos/:slug/{evidencias/,fact-sheet.txt,indice-evidencias.csv}\` | \`evidence-index.json\`, \`casos.json\` | From case data |
| Problem topics | \`/problemas/:slug/\` | \`issues.json\` + \`relatos.json\` | At least two genuinely linked reports |
| Press assets | \`/casos/:slug/materiais-imprensa/\` | Case data + reviewed static media | From case data |

Existing Florense slugs stay in place; special editorial comparisons (Roma Mobili) remain case-specific and are not automatically generated for unrelated cases.

## Create a brand draft

\`\`\`bash
npm run new:company -- --slug exemplo-sa --name "Exemplo S.A." --segment "Eletrodomésticos" --location "São Paulo, SP"
\`\`\`

The script adds an **unpublished** record to \`src/data/brands.json\` (no unverified default recommendation is public). Fill the summary, linked CNPJs, cases and primary source URLs, review the status and scope, then set \`published:true\`.

### Company vs unit
- \`brand.case_ids\` are documented cases the editor intentionally associates with the brand.
- \`unit.case_ids\` are only cases verifiably associated with the selected local unit.
- \`company_profile_ids\` are **registries, not verdicts**: a QSA relationship does not automatically make that entity a contracting party.
- The company verdict is a scoped editorial recommendation, not a pooled financial solvency score or a star rating. Units can have a different scope/status from the overall brand.
- Ranking orders publicly reviewed profiles by **editorial band**, with their source dates and listed case counts. It does not claim any rank across the Brazilian market.

### Add a case
1. Create a unique \`id\` and SEO \`slug\` in \`casos.json\`; set \`empresa_slug\`, optionally \`unidade_slug\`.
2. Add the case ID to the corresponding \`brand.case_ids\` and, for unit-specific cases, \`unit.case_ids\`.
3. Add reports with matching \`case_id\`, \`data\`, \`cidade\`, \`unit\`, \`tema\`, \`status\` and verified \`https\` source.
4. Add documentary entries to \`evidence-index.json\` using a unique evidence ID and the matching \`case_id\` on **each** row.
5. Review recommendation date, rationale, scope, source URLs, correction triggers and any company response.
6. Generate or curate media assets that are case-specific. Generic fact sheet TXT and evidence CSV are generated automatically.

\`\`\`bash
npm run verify:data
npm run check
npm run build
\`\`\`

## Editorial safeguards that improve usefulness

No empty doorway pages, auto-invented companies, scores, or star ratings. A CNPJ page is linked to its parent/holding or unit **only where the relation is actually documented**. If no case is linked, the registry page says so. Issue-topic pages require substantive original context and at least two linked public reports.

Statuses must be reviewed. A resolved claim remains resolved. Dates, scope, sample sizes and primary source URLs travel with every published recommendation. Publishing a company profile does not require pretending the company is insolvent.

## Integration

The site still uses Astro static output. React is used for complaint-search interaction only. No database, API server, hosted CMS or paid search indexing tool is required. Automated Cloudflare deployment remains the GitHub Actions \`main\` workflow.
