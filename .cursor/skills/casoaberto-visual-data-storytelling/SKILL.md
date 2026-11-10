---
name: casoaberto-visual-data-storytelling
description: Redesenhar e atualizar narrativas visuais, KPIs, gráficos documentais e material A4 para todos os casos, sem sliders ou valores projetados sem fonte.
---
# CasoAberto / data storytelling e impacto público

Use esta skill quando o editor pedir: “Melhore a visualização”, “Mostre o impacto real”, “Atualize o gráfico”, “Crie uma ficha para imprimir”, “Integre o material no caso”, “Mostre o pior cenário se nada mudar”.

**Destino:** `diogorusso/caso-aberto-platform`, Astro estático. Inspecione README, AGENTS, `.cursor/skills/casoaberto-pt-br-tom/SKILL.md`, componentes e dados antes de editar.

## Método de apresentação

1. Começar pelo direito, perda, tempo ou serviço comprometido para a pessoa. Não começar por tecnologia ou simulação.
2. Selecionar indicador efetivamente calculável com origem, data e denominador. Se não existe valor financeiro comprovado, não inventar; apresentar fontes, marcos, status e pergunta com a atribuição correta.
3. Modelar consequência sem controles numéricos: `agora → se persistir → o que comprovaria resolução`, sempre condicional e relacionado a obrigação, fonte e situação atual. Não gerar números de alcance, “potenciais vendas perdidas”, multiplicações de demandas fictícias, probabilidades de falência, valores diários ou danos indenizáveis sem base.
4. Usar os mesmos componentes para toda a biblioteca: `src/lib/visual-impact.ts` prepara métricas e recortes; `src/components/CaseVisualStory.astro` rende narrativa e fichas; `src/components/CaseEvidenceChart.astro` desenha gráficos SVG estáticos e acessíveis usando tokens compatíveis com shadcn.
5. **Gramática dos gráficos:** série acumulada = quantidade de marcos documentais no arquivo, não quantidade de vítimas/denúncias no mundo real. Barras = registros classificados no mesmo denominador. Patrocínios = fotografia datada antes da MP. Não misturar séries com bases distintas; não transformar contagem de fontes em número de casos.
6. **Tom de confronto conforme skill legal:** pergunta incômoda → fato com origem → consequência concreta → exigência → ação. Sem rodapé de absolvição automática; sem acusação nova baseada em hipótese. Caso indígena ou ameaças: preservar privacidade e segurança.
7. Material de impressão universal em `/casos/imprimir/:slug/`: ficha A4 com identificação do caso, revisão, até seis fontes, valores apenas quando fornecidos, cenário condicional e link direto ao registro. Materiais CA-001 A4/A5/A6 continuam em seu estúdio próprio, ligado na página.
8. A página do caso contém o impacto e um preview de impressão sem sair para um dashboard separado. Rotas profundas de SEO, arquivos e cronologia continuam acessíveis por um hub em três etapas.
9. Microanimação permitida apenas em barras/traçado e hover, com `prefers-reduced-motion` e conteúdo legível sem JS. Não adicionar Emotion/Framer por aparência. A consistência de design e acesso às fontes vem primeiro.
10. Execute `npm run verify:visual-stories`, `npm run verify:data`, `npm run check` e `npm run build`. Revise relatório do GitHub Actions e confirme deploy de produção antes de afirmar que está publicado.

## Solicitações futuras de caso novo

Incluir ID em `src/data/impact-stories.json`, preencher `audience`, `exposure`, `headline`, `worst_case` condicional, `threshold`, `resolution` e `action`; garantir fontes e eventos datados no atlas original. O validador bloqueia caso público sem narrativa e não permite reintroduzir o simulador antigo.

## Limites
O gráfico mede o que está na base — não fabrica opinião pública, pressão acumulada, arrecadação, preferências eleitorais, cidadãos únicos ou perdas. A ficha pode ser impressa voluntariamente para consulta e debate público; não há disparos, contato dirigido com ameaças ou coleta de dados políticos. Preserve revisões e direitos de correção.
