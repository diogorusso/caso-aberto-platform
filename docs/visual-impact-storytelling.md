# CasoAberto — visualizações de impacto documental e fichas públicas

**Revisão:** 10/11/2026. **Status:** implementação integrada ao Astro estático.

## Problema corrigido

O sistema anterior expunha sliders para custo diário, juros, alcance publicitário, taxa de conversão, valor de venda e demandas fictícias. A interface pedia ao visitante para criar resultados numéricos sem observações. Foi removido `src/components/ImpactSimulator.tsx` e excluído o objeto `scenario_defaults` em `impact-models.json`.

O objetivo agora é responder: **o que está documentado, quem pode ser afetado, qual o agravamento condicional mais material, que prova muda a situação e o que cobrar?**

## Componentes e dados reutilizáveis

- `src/data/impact-stories.json`: texto editorial específico de cada caso. São 17 narrativas cobrindo CA-001, oito estudos externos, sete investigações políticas e o observatório de plataformas.
- `src/lib/visual-impact.ts`: camada que calcula KPIs sem fundir universos; gera métricas, trilha temporal, barras, referência documental e caminho de impressão a partir das fontes existentes.
- `src/components/CaseEvidenceChart.astro`: gráfico acessível com SVG estático, tipografia, bordas, espaços e cores do design system shadcn/Tailwind existente. Anima traçado/barra respeitando `prefers-reduced-motion`; o conteúdo é lido sem hidratação JavaScript. Evita Recharts no frontend quando o render estático já entrega a história com menor custo e acessibilidade nativa.
- `src/components/CaseVisualStory.astro`: headline, badges, ícones Lucide, quatro KPIs, gráfico, consequência mais crítica plausível, situação atual, prova de resolução e material A4 integrado.
- `src/pages/casos/imprimir/[slug].astro`: uma ficha pública por caso, URL estável, impressão pelo navegador, quatro fontes destacadas com títulos, fonte completa no caso, sem dados pessoais.
- `src/pages/casos/impacto.json.ts`: JSON estático com casos, KPIs, cronologia, fonte e ligações de impressão, para outros agentes/serviços reutilizarem o registro sem scraping da UI.
- `src/components/CaseSectionHub.astro`: organiza rotas de aprofundamento em **Entenda → Comprove → Tenha o material em mãos**, mantendo URLs históricas.

## Cobertura

| Família | Fontes | Página de impacto | Ficha A4 |
| --- | --- | --- | --- |
| Dossiê próprio CA-001 | `casos.json`, `relatos.json`, `impact-models.json` | Dentro do caso e na rota /impacto/ | /casos/imprimir/:slug/ + estúdio A4/A5/A6 |
| Estudos públicos EXT-001…008 | `public-case-atlas.json` | No topo de cada estudo | /casos/imprimir/:slug/ |
| Investigações políticas POL-001…007 | `political-observatory.json` | No topo de cada dossiê | /casos/imprimir/:slug/ |
| Plataformas PLAT-2026-CASE | `platform-observatory.json` | Na página do observatório | /casos/imprimir/:slug/ |

## Gramática editorial quantitativa

**Permitido:** valor relatado com atribuição, tempo entre duas datas do próprio caso, contagem de URLs únicas, número de evidências no arquivo, reclamações com seu denominador, marcos documentais com fonte, distribuição histórica de patrocinadores conforme levantamento datado.

**Jamais fabricar:** visitantes do CasoAberto, torcida alcançada, eleitores influenciados, probabilidade de falência, faturamento perdido, ações judiciais hipotéticas ou valores indenizatórios não calculados na fonte.

O gráfico de cronologia conta os **marcos catalogados no dossiê** e não o volume total de incidentes no país. O de barras é construído de registros da mesma população (classes de reclamações) ou de uma fotografia histórica de clubes patrocinados; há texto de origem próximo ao visual.

## Protocolo para atualizar via chat

1. Pesquise o fato novo e atualize primeiro a fonte de evidência apropriada (`casos`, `public-case-atlas`, `political-observatory` ou `platform-observatory`).
2. Se mudou a exposição ou o desfecho condicional, revise o ID em `impact-stories.json`. Atualize `updated_at` somente após uma revisão editorial real.
3. A camada `visual-impact.ts` recalcula valores observados e a trilha da fonte ao compilar. O site estático não publica contadores em tempo real e não coleta dados privados.
4. Rode `npm run verify:visual-stories && npm run verify:data && npm run check && npm run build`.
5. Revise uma página representativa de cada família, o JSON e as páginas de impressão em mobile e A4. Confira `prefers-reduced-motion`, links, leitura sem JavaScript e contraste.
6. Grave commit no repo e verifique a implantação do workflow Cloudflare; não presuma sucesso com base só no push.

## Tom e ação

Execute junto à skill `.cursor/skills/casoaberto-pt-br-tom/SKILL.md`: **pergunta incômoda → fato documentado → risco concreto → cobrança objetiva → material para conferência**. Não colocar relatório técnico de proteção jurídica na abertura da denúncia. Registrar a natureza da fonte e a data como parte do próprio dado, sem acusar por associação.

A ficha oferece distribuição voluntária de informações e consulta às fontes. Não representa mecanismo de disparo, coleta de perfis eleitorais ou campanhas dirigidas.

## Comandos

```sh
npm ci
npm run verify:visual-stories
npm run verify:data
npm run check
npm run build
```
