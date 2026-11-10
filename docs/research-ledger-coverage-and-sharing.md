# CasoAberto · dados, números e ações de cada investigação

**Data editorial:** 10 de novembro de 2026 · **escopo:** site Astro estático, sem autenticação.

## 1. O erro corrigido

O quadro anterior da home apresentava **1 empresa avaliada, 1 unidade** e **17 casos** em quatro cartões de peso idêntico. O número um estava correto para o sistema de veredictos de empresa, mas não representava as organizações documentadas na biblioteca de pesquisa. A nova home usa métricas do **acervo inteiro**, enquanto o catálogo de veredictos especializados continua em /empresas/.

## 2. Contadores e denominadores

A implementação em src/lib/research-metrics.ts lê dados existentes e calcula automaticamente:

- **Casos:** soma de dossiês com contrato detalhado, estudos de consumo, pesquisas de política/direitos e um estudo de plataformas agregado.
- **Links de fontes:** URLs HTTPS únicas das referências de cada caso. URLs repetidas em estudos diferentes são contadas só uma vez; um link não corresponde a um documento único nem valida por si só o conteúdo.
- **Marcos:** cronologias completas por caso; o mesmo evento registrado em dois casos pode aparecer duas vezes. São entradas de cronologia, não eventos mundiais únicos.
- **Perguntas e exigências:** número de perguntas e pedidos presentes nas fichas; não são respostas recebidas.
- **Histórias:** relatos publicados e conectados a estudos de caso; uma pessoa pode aparecer em mais de um estudo.
- **Reclamações:** registros públicos catalogados no dossiê Florense, não o total de vítimas de todas as empresas.
- **Precedentes:** base de precedentes com fatos processuais datados.
- **Categorias:** taxonomia do arquivo de estudos com exatamente uma categoria por caso.

Todas as métricas e fichas resumidas são publicadas em **/instituto/dados/pesquisa.json** e as seções da home apontam para fonte ou página própria.

## 3. Escala verificada do Procon-SP

A publicação da Fundação Procon-SP em 14/03/2025 sobre o exercício **2024** registra **255.536 reclamações fundamentadas** no total estadual combinado (238.995 Fundação e 16.541 em 71 Procons municipais). No recorte das queixas diretamente registradas na Fundação, Yeesco teve 10.647, Enel Eletropaulo 8.508 e Hurb 7.554; índices de solução informados, respectivamente, 29,6%, 16,4% e 0,3%. O total das três **não** é o total do cadastro. A taxa geral de solução da segunda fase na Fundação foi 29,1%, não para todos os atendimentos.

Fonte: https://www.procon.sp.gov.br/procon-sp-divulga-cadastro-das-empresas-mais-reclamadas-em-2024/

Os dados são apresentados como **dados públicos do Procon**, não estatísticas acumuladas pelo CasoAberto.

## 4. Sete novos casos documentados

| ID | Caso | Documentos-chave | Pergunta pública |
|---|---|---|---|
| EXT-009 | Grupo Casas Bahia | fatos relevantes do grupo, Senacon 25/08, TJSP 21/10 | O processamento judicial e os contratos de entrega foram explicados ao consumidor? |
| EXT-010 | Grupo Toky, Tok&Stok e Mobly | informações à CVM, TJSP, Senacon | Quem cumpre o contrato e qual é o prazo de entrega? |
| EXT-011 | Marabraz | Folha 16/08, Senacon 25/08, CNN 28/10 | Como a operação de entregas corresponde ao que foi vendido? |
| EXT-012 | Live Nation/Ticketmaster — BTS | três boletins Senacon de 23, 28 e 29/10 | Quem explica acesso, portões, bilhetes e estrutura anunciada? |
| EXT-013 | Corsan/Aegea | MPRS 19/10 e Senacon 22/10 | Os canais regionais e o mutirão prometidos foram realizados? |
| EXT-014 | Amazon Prime Video | Senacon 10/09 e Mobile Time 11/09 | Qual contrato foi alterado e sob qual consentimento? |
| EXT-015 | Revenda digital de ingressos | Senacon 20/07, 17/08 e 28/10 | Quem vende, quanto cobra e como garante o ingresso? |

Os estudos mantêm todas as fontes, perguntas, cronologia, manifestação identificada e períodos originais. **Recuperação judicial não é sinônimo de falência**, e um boletim antigo não implica situação atual idêntica. O site cobra sem inventar crime, resultado ou vítima.

## 5. Compartilhamento e ação

O componente CaseActionBar.astro centraliza links para WhatsApp, X, Facebook, Telegram, copiar URL, imprimir dossiê e, em casos de consumo, abrir Consumidor.gov.br. A mensagem é **pré-composta para uma ação voluntária da pessoa**; não há envio automático, campanhas em massa, perfis políticos ou captação de contatos.

Compartilha-se o **endereço completo do caso**, com título e síntese, para que a pessoa acesse documentos, cronologia e atualizações; não apenas um screenshot isolado. URLs da biblioteca, do observatório político, do observatório de plataformas e das histórias permanecem funcionais.

## 6. Reutilização e manutenção

- Não repetir número de empresas avaliadas como substituto do universo pesquisado.
- Inserir casos em public-case-atlas.json, classificar em case-categories.json, ligar guide_slug e adicionar a história visual correspondente em impact-stories.json.
- Revisar dados sem editar artificialmente os números derivados da biblioteca.
- Rodar npm run verify:data, npm run check, npm run build e conferir deploy no Cloudflare.
- Roteiros PT-BR seguem a skill já existente .cursor/skills/casoaberto-pt-br-tom/SKILL.md: pergunta contundente, fato com prova, consequência, cobrança e ação.
