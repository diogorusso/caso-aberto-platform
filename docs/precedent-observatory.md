# Observatório de precedentes — dados, processos, riscos e cenários

> O propósito deste recurso é mostrar o que **já aconteceu em outras empresas**, com processos e datas conferíveis. Ele não estima a probabilidade de falência de uma empresa citada por um consumidor.

## Fatos documentados em 09/11/2026

| Caso | Desfecho | A partir de qual marco? | Até qual marco? | Intervalo | Prova principal |
|---|---|---|---|---:|---|
| Roma Mobili / RM Projetos | Falência decretada | Primeira reclamação pública localizada, 06/05/2025 | Sentença, 19/12/2025 | **227 dias** | https://www.reclameaqui.com.br/roma-mobili/atraso-na-entrega-dos-moveis_tzibzr7roxpHE5gx/ |
| Roma Mobili / RM Projetos | Falência decretada | Autofalência protocolada, 17/10/2025 | Sentença, 19/12/2025 | **63 dias** | https://gomesdemattos.com.br/admjudicial/lista-de-processos/roma-mobili-industria-ltda-e-rm-projetos-e-montagens-de-moveis-ltda-epp/ |
| Lojas KD | Falência decretada | Primeira reportagem sobre ~1 mil consumidores, 14/11/2017 | Sentença TJPR, 13/02/2019 | **456 dias** | https://www.quadrogeralcredoreslkd.com.br/andamento-processual/ |
| Lojas KD | Falência decretada | Pedido de RJ, 08/05/2018 | Sentença, 13/02/2019 | **281 dias** | https://www.quadrogeralcredoreslkd.com.br/wp-content/uploads/2019/05/1-Decretada-a-fale%CC%82ncia-LKD.pdf |
| Móveis Três Irmãos | Falência decretada | Pedido de recuperação, 27/09/2024 | Sentença, 10/08/2026 | **682 dias** | https://recupereadmjudicial.com.br/processo/recuperacao-judicial_tres-irmaos-industria-de-moveis-3-irmaos-sociedade-anonima__356 |
| Grupo Toky (Tok&Stok e Mobly) | **Recuperação judicial deferida** | Pedido, 12/05/2026 | Deferimento, 15/06/2026 | **34 dias (RJ)** | https://www.tjsp.jus.br/Noticias/Noticia?codigoNoticia=114526 |
| Lojas Marabraz | **Recuperação judicial deferida** | Reportagem sobre estoque/reclamações, 21/05/2025 | Deferimento, 27/10/2026 | **524 dias** | https://veja.abril.com.br/coluna/radar-economico/estoque-vazio-e-reclamacoes-em-alta-o-sinal-de-alerta-da-marabraz/ |
| Grupo Kitchens | **Recuperação judicial deferida** | Fechamento de loja e atrasos, 07/10/2026 | Deferimento, 03/11/2026 | **27 dias (RJ)** | https://diariodonordeste.verdesmares.com.br/negocios/crise-da-kitchens-loja-de-luxo-em-fortaleza-fecha-apos-sofrer-acao-de-despejo-e-atrasar-entregas-1.3796973 |
| Planearte | Encerramento operacional — sem decreto no arquivo | Primeira reportagem, 13/05/2026 | Paralisação já consumada | — | https://g1.globo.com/sp/ribeirao-preto-franca/noticia/2026/05/13/clientes-relatam-prejuizos-com-fabrica-que-nao-entregou-moveis-planejados-em-ribeirao-preto-sp.ghtml |

**Média sobre as falências decretadas com duas datas verificadas:** 3 casos, média de **455 dias** entre o primeiro sinal público identificado e a sentença (Roma Mobili 227, Lojas KD 456, Móveis Três Irmãos 682). O número é calculado por `bankruptcyDurationSummary()` em `src/lib/precedents.ts` — nunca digitado à mão.

**Atenção:** nenhum desses intervalos determina o início real da crise. A primeira reportagem ou reclamação é o primeiro marco encontrado nesta pesquisa, não a data da primeira inadimplência. Pedido, deferimento de recuperação, encerramento operacional e falência são fatos diferentes.

## Kitchens: apuração de maior valor agregado

A reportagem jurídica de Migalhas de 04/11/2026, baseada na relação de credores apresentada pelo Grupo Kitchens, identifica:

- R$ 190,1 milhões de créditos ligados a móveis pagos e não entregues;
- 63,4% da dívida sujeita à recuperação atribuída a esses créditos;
- 962 **lançamentos**, que não equivalem necessariamente a 962 consumidores distintos;
- 535 lançamentos de R$ 100 mil ou mais; 81 de R$ 500 mil ou mais; 10 de R$ 1 milhão ou mais;
- Processo TJSP `4213329-13.2026.8.26.0100` — grupo com quatro empresas; decisão de 03/11/2026.

Fonte detalhada: https://www.migalhas.com.br/quentes/467807

Esses números evidenciam exposição documentada de clientes de uma empresa comparável de móveis planejados de alto padrão: quem pagou e não recebeu entrou na fila de credores. São do precedente Kitchens — não do dossiê Florense. Créditos nominais ≠ perdas definitivas.

## Matriz "sinais antes do colapso"

`src/components/CollapseSignalsMatrix.astro` compara, linha a linha, os sinais públicos documentados (pagamento integral antecipado, atraso, remarcação, equipe ausente, reclamação sem resposta, alta de reclamações, notificação/Procon, fechamento, dívidas/protestos, ação judicial) entre cada precedente vinculado e o Caso Florense Ipanema.

- A coluna do caso usa **apenas** fatos de `casos.json`, `relatos.json`, `updates.json` e `impact-models.json`.
- Cada célula tem data e fonte, ou fica explicitamente "não documentado".
- A matriz só aparece quando `case_links` conecta o precedente ao caso.
- Legenda de campanha (sem disclaimer do LLM): usar o canon agressivo / CTA. Disclaimers são papel exclusivo do legal — não inventar “não afirmamos insolvência” na UI.
- Não há palancas, simulação ou probabilidade: o que aparece é o desfecho já documentado.

## Escalonamento de danos — cenários

Registrar separadamente: (1) execução e conclusão, (2) negociação administrativa ou restituição, (3) litígio individual, (4) eventual recuperação judicial da empresa contratada e (5) eventual falência decretada em seu processo. **Não existe sequência causal obrigatória.** Uma reclamação ou ação de consumidor não estabelece insolvência.

A escada de escalonamento em `src/data/action-scenarios.json` (`escalation`) mostra, degrau por degrau, o que já aconteceu e o que está documentado como possível, com uma fonte para cada efeito. O contador de dias sem resposta é calculado das datas do próprio arquivo.

## Modelo reutilizável

**Dados:** `src/data/precedents.json`.

- `precedents[]`: entidade, setor, local, estágio formal, processo, datas, primeiro sinal público, marcos, métricas, sinais datados, fontes e limites do comparativo.
- `signal_rows[]`: registro canônico dos sinais comparáveis.
- `case_links[]`: conexões editoriais explícitas com um caso CasoAberto, sem relacionamento societário ou causal presumido.
- `stage_definitions`: distinções entre falência, recuperação judicial, encerramento e mero conflito de consumo.
- `common_analysis`: comparabilidades, limites, alternativas de resolução e caminhos condicionais.

**Componentes:** `PrecedentCard.astro`, `PrecedentTimeline.astro`, `PrecedentComparison.astro`, `CollapseSignalsMatrix.astro`.

**Rotas:** `/precedentes/`, `/precedentes/:slug/`, `/precedentes/indice.csv`, `/casos/:slug/precedentes/`.

**Integração:** páginas de empresa, unidade, caso e painel de impacto exibem comparativos conforme o vínculo `case_links`, sem forçar o exemplo da Florense em páginas de outras marcas. A home institucional somente descreve a capacidade de pesquisa.

**Adicionar precedente:** inserir ID/slug único, número de processo (só `encerramento_operacional` pode não ter CNJ, com `process_number: null`), sentença ou decisão, tipo formal, marcos com URLs individuais, sinais datados, referência jurídica primária, limitações e data de revisão. As durações são conferidas pelo validador a partir das datas UTC; não preencher um intervalo sem marcos verificáveis.

## Controle de qualidade

```bash
npm run verify:data
npm run check
npm run build
```

Antes de republicar, revisar o estágio **atual** de cada processo. Em 09/11/2026, Kitchens, Grupo Toky e Marabraz estavam em recuperação judicial. Nada aqui substitui consulta judicial atualizada ou análise jurídica do caso concreto.
