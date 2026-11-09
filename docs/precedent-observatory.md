# Observatório de precedentes — dados, processos, riscos e cenários

> O propósito deste recurso é mostrar o que **já aconteceu em outras empresas**, com processos e datas conferíveis. Ele não estima a probabilidade de falência de uma empresa citada por um consumidor.

## Fatos documentados em 09/11/2026

| Caso | Desfecho | A partir de qual marco? | Até qual marco? | Intervalo | Prova principal |
|---|---|---|---|---:|---|
| Roma Mobili / RM Projetos | Falência decretada | Autofalência protocolada, 17/10/2025 | Sentença, 19/12/2025 | **63 dias** | https://gomesdemattos.com.br/admjudicial/lista-de-processos/roma-mobili-industria-ltda-e-rm-projetos-e-montagens-de-moveis-ltda-epp/ |
| Lojas KD | Falência decretada | Primeira reportagem localizada sobre ~1 mil consumidores, 14/11/2017 | Sentença TJPR, 13/02/2019 | **456 dias** | https://www.quadrogeralcredoreslkd.com.br/andamento-processual/ |
| Lojas KD | Falência decretada | Pedido de RJ, 08/05/2018 | Sentença, 13/02/2019 | **281 dias** | https://www.quadrogeralcredoreslkd.com.br/wp-content/uploads/2019/05/1-Decretada-a-fale%CC%82ncia-LKD.pdf |
| Lojas KD | Falência decretada | Encerramento anunciado, 10/12/2018 | Sentença, 13/02/2019 | **65 dias** | https://www.moveisdevalor.com.br/portal/lojas-kd-encerra-operacoes-de-e-commerce |
| Kitchens | **Recuperação judicial deferida — não falência** | Pedido distribuído, 28/10/2026 | Processamento deferido, 03/11/2026 | **6 dias (RJ)** | https://preservacred.com.br/dados/empresas/60848991000199-kitchens-industria-e-comercio |

**Atenção:** nenhum desses intervalos determina o início real da crise. A primeira reportagem sobre a Lojas KD é o primeiro marco encontrado nesta pesquisa, não a data da primeira inadimplência. O pedido de recuperação judicial não é decretação de falência.

## Kitchens: apuração de maior valor agregado

A reportagem jurídica de Migalhas de 04/11/2026, baseada na relação de credores apresentada pelo Grupo Kitchens, identifica:

- R$ 190,1 milhões de créditos ligados a móveis pagos e não entregues;
- 63,4% da dívida sujeita à recuperação atribuída a esses créditos;
- 962 **lançamentos**, que não equivalem necessariamente a 962 consumidores distintos;
- 535 lançamentos de R$ 100 mil ou mais; 81 de R$ 500 mil ou mais; 10 de R$ 1 milhão ou mais;
- Processo TJSP \`4213329-13.2026.8.26.0100\` — grupo com quatro empresas; decisão de 03/11/2026.

Fonte detalhada: https://www.migalhas.com.br/quentes/467807

Esses números evidenciam exposição documentada de clientes de uma empresa comparável de móveis planejados de alto padrão. Não são números da Florense, não provam risco de falência desta e não representam perdas definitivas.

## Modelo reutilizável

**Dados:** \`src/data/precedents.json\`.

- \`precedents[]\`: entidade, setor, local, estágio formal, processo, datas, marcos, métricas, sinais, fontes e limites do comparativo.
- \`case_links[]\`: conexões editoriais explícitas com um caso CasoAberto, sem relacionamento societário ou causal presumido.
- \`stage_definitions\`: distinções entre falência, recuperação judicial, encerramento e mero conflito de consumo.
- \`common_analysis\`: comparabilidades, limites, alternativas de resolução e caminhos condicionais.

**Componentes:** \`PrecedentCard.astro\`, \`PrecedentTimeline.astro\`, \`PrecedentComparison.astro\`.

**Rotas:** \`/precedentes/\`, \`/precedentes/:slug/\`, \`/precedentes/indice.csv\`, \`/casos/:slug/precedentes/\`.

**Integração:** páginas de empresa, unidade, caso e painel de impacto exibem comparativos conforme o vínculo \`case_links\`, sem forçar o exemplo da Florense em páginas de outras marcas. A home institucional somente descreve a capacidade de pesquisa.

**Adicionar precedente:** inserir ID/slug único, número de processo, sentença ou decisão, tipo formal, marcos com URLs individuais, referência jurídica primária, limitações e data de revisão. As durações são conferidas pelo validador a partir das datas UTC; não preencher um intervalo sem marcos verificáveis.

## Escalonamento de danos — cenários

Registrar separadamente: (1) execução e conclusão, (2) negociação administrativa ou restituição, (3) litígio individual, (4) eventual recuperação judicial da empresa contratada e (5) eventual falência decretada em seu processo. **Não existe sequência causal obrigatória.** Uma reclamação ou ação de consumidor não estabelece insolvência nem constitui prova de que a empresa vá falir.

O simulador de impacto do CasoAberto usa premissas ajustáveis para ilustrar custo e alcance, sem converter hipóteses em audiência real, perda de faturamento ou passivo judicial confirmado.

## Controle de qualidade

\`\`\`bash
npm run verify:data
npm run check
npm run build
\`\`\`

Antes de republicar, revisar o estágio **atual** de cada processo. O status Kitchens em 09/11/2026 era recuperação judicial, não falência. Nada aqui substitui consulta judicial atualizada ou análise jurídica do caso concreto.
