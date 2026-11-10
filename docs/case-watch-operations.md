# CasoAberto — acompanhamento econômico de casos até resolução

**Revisão da arquitetura:** 10/11/2026  
**Repositório de execução:** `diogorusso/caso-aberto-platform`  
**Resultado público:** arquivos HTML/JSON gerados por Astro a partir de fontes Git versionadas; deploy pelo workflow já existente no Cloudflare Pages.  
**Sem runtime dinâmico no site:** não há fila pública, banco, CMS, coleta de usuários, webhook, novas portas, agente no navegador do visitante ou API para enviar mensagens.

## Por que separar monitoramento de pesquisa

Um HTML pode mudar porque a página trocou a barra de navegação. Uma decisão judicial pode surgir em outro endereço sem alteração no documento antigo. Para evitar custo, ruído e alegações imprecisas, o monitor faz **triagem determinística sem usar LLM**; a investigação pontual ocorre apenas no contexto mínimo do dossiê vencido. Nenhum hash de conteúdo vira notícia por si só.

```text
GitHub Actions (cron, sem LLM)
    ↓
case-watch-policy.json + datas editoriais dos casos
    ↓
descartar closed/paused e Issues de revisão ainda abertos
    ↓
checar no máx. 12 fontes HTTPS com timeout e cache ETag/hash
    ↓
outbox curta, descartável e sem conteúdo de terceiros
    ↓
Github Issues: [case-watch:ID] (máx. 8 por dia; sem duplicação)
    ↓
agente editorial, até 2 dossiês por execução; cápsula <= 4.800 caracteres
    ├── Nenhum fato novo verificável → comentar, fechar Issue, SEM commit/deploy
    ├── Ato novo → verificar prova + contraditório, mudar JSON, validar, commit → site estático
    └── Resolução comprovada → atualizar o caso e sua política para closed → parar checagens
```

## Custos e frequências

| Estágio | Cadência / limite | Tokens de LLM |
| --- | --- | --- |
| GitHub cron | Uma vez por dia, `23 12 * * *` UTC (aprox. 09:23 de São Paulo); pode atrasar | **0** |
| Fontes públicas | Máx. **12 requests** por execução, no máximo **2** por caso; timeout de **8,5s** e corpo até 100KB | **0** |
| Abertura de tarefas | Máx. **8** novos casos por execução; Issue aberto permanece único e é ignorado nos ciclos seguintes | **0** |
| Processamento editorial | Máx. **2** dossiês por execução do agente; contexto inicial até **4.800 caracteres** por caso | Somente quando existe tarefa |
| Active urgent | Revisão após 1 dia da última verificação editorial concluída | Depende de issue |
| Active high | De 1 a 3 dias, conforme `interval_days` por caso | Depende de issue |
| Active standard | 7 dias, salvo configuração específica | Depende de issue |
| Paused e closed | Excluídos do cron | **0** |
| Sem novidade | Comentário curto com fontes e fechamento do Issue; próxima verificação após intervalo | Sem deploy |
| Mudança comprovada | Diff pontual em dataset principal + visual e ficha; validação e build | Um caso por vez |

**Contadores não inflados:** requisições HTTP não são “investigações concluídas”; fontes alteradas não equivalem a desfechos novos. Ao falhar uma fonte (403/404/timeout, redirect), não fechar um caso nem declarar “sem novidades”; a falha fica no resumo da execução.

Os estados de fingerprint, ETag e Last-Modified ficam em `actions/cache` como `.case-watch-cache/state.json`, não são publicados no site nem commitados. O cache pode expirar; a primeira checagem em novo cache estabelece baseline sem sinalizar mudança falsa. GitHub Issues armazena a fila e o histórico de conclusão.

A última verificação editorial efetiva é a data mais recente entre **data publicada no dataset** e `closedAt` de um Issue concluído. Isso impede a revisão idêntica diária de casos que permaneceram sem fato novo. Prazo público futuro informado no campo `deadlines` cria revisão pontual quando vencer, mesmo que o ciclo normal ainda não tenha terminado.

## Tipos de caso, fonte canônica e fechamento

| ID | Arquivo editorial | Estado inicial | Condição de parada |
| --- | --- | --- | --- |
| `CA-*` | `casos.json`, `updates.json`, `relatos.json` | `active` | Prestação ou restituição comprovada e resposta editorial registrada |
| `EXT-*` | `public-case-atlas.json` | `active` | Desfecho pertinente no recorte documentado ou providência final comprovada |
| `POL-*` | `political-observatory.json` | `active` | Providência/investigação/decisão encerrada com prova e versões registradas, sem generalização |
| `PLAT-2026-CASE` | `platform-observatory.json` | `active` | Resultado institucional da questão pesquisada com documentação verificável |

Todo ID público do catálogo `src/lib/case-catalog.ts` deve ter política. Quando adicionar um caso, adicionar também sua regra em `src/data/case-watch-policy.json` no mesmo commit. `verify:case-watch` falha com omissão, ID duplicado, URL não HTTPS, limites excessivos, estado desconhecido ou fechamento sem fonte e status correspondente.

O campo `mode` tem três valores: `active`, `paused` (decisão editorial), `closed`. Fechamento requer `closed_at`, `closure_source_url` e status conclusivo atualizado **no arquivo do caso**. Não concluir porque desapareceu da imprensa, expirou o prazo ou um órgão publicou promessa futura. Em caso de nova prova, um editor pode reabrir `active` com registro do novo fato; cron nunca reabre por conta própria.

## Configuração

| Arquivo | Finalidade |
| --- | --- |
| `.github/workflows/case-watch.yml` | Cron diário, disparo manual e execução inicial; sem npm install nem modelos |
| `src/data/case-watch-policy.json` | 24 IDs, prioridade, intervalo, links-chave, marcos de prazo e critério de fechamento |
| `scripts/case-watch-core.mjs` | Planejamento puro, validação, ordenação, calendário, criação de briefs |
| `scripts/case-watch.mjs` | Fonte HTTP condicional, cache e outbox (sem ler conteúdo privado) |
| `scripts/case-watch-issues.mjs` | Criação/reabertura idempotente de Issues, sem alterações no site |
| `scripts/case-review-packet.mjs` | Cápsula única de contexto para agente com orçamento de caracteres |
| `scripts/case-review-complete.mjs` | Registra pesquisa e fecha Issue com prova e autoria editorial |
| `scripts/test-case-watch.mjs` | Testes de orçamento, revisão, rechecagem e encerramento |
| `.cursor/skills/casoaberto-case-review-economy/SKILL.md` | Pesquisa de custo mínimo e tom público |
| `.cursor/skills/casoaberto-case-lifecycle/SKILL.md` | Fechamento seguro dos casos |

## Operações

### Simular sem rede nem escrita no GitHub

```bash
npm run verify:case-watch
npm run case:review -- --case POL-001
npm run case:watch -- --offline --today 2026-11-12
node scripts/case-watch-issues.mjs --dry-run
```

`--offline` cria arquivos só em `.case-watch-cache/` (gitignored). Não gera “prova” de revisão, não publica e não consome tokens de modelo.

### Rodar scanner manual no GitHub

Abra **Actions → Case Watch — zero-token research queue → Run workflow**. Opcionalmente informe `case_id` (p. ex. `POL-001`) e marque `force` para revisão fora do intervalo. O workflow lê Issues fechados/abertos, usa cache, compara as fontes e publica novas tarefas de pesquisa no GitHub Issues. **Não precisa de chave de LLM, serviço externo, banco ou segredo adicional**: usa o `GITHUB_TOKEN` fornecido pelo próprio Actions para gerenciar Issues.

### Processar Issue sem mudança

1. Pesquise somente o ID e recorte da Issue, em documentos oficiais e fontes relevantes, com data e fonte.
2. Se comprovadamente não houve atualização material, não edite nenhum arquivo. Registre no Issue os links e a conclusão da checagem e feche-o.
3. Quando houver shell GitHub configurado, pode usar:

```bash
npm run case:complete -- \
  --case POL-001 --outcome no-change \
  --source https://exemplo.gov.br/ato-conferido \
  --reviewer "identidade verdadeira do revisor" \
  --note "Registro editorial real com pelo menos 55 caracteres explicando o ato consultado e o resultado." \
  --apply
```

`--apply` exige GH_TOKEN; sem ele a ferramenta só mostra prévia. O exemplo acima não registra uma aprovação, documento ou resultado real. \`--method automated\` documenta pesquisa de agente e só permite \`no-change\`; uma publicação ou encerramento definitivo exige revisão editorial humana real quando aplicável.

### Publicar fato novo

1. Editar o arquivo canônico correspondente ao ID e, quando necessário, `impact-stories.json`/material de impressão. Não mexer em outros casos por associação.
2. Conferir datas de ato, publicação e revisão, citações, posição da parte citada, status judicial/administrativo e dados pessoais.
3. Rodar `npm run verify:data && npm run check && npm run build`.
4. Fazer commit em `main`; o workflow existente `deploy-cloudflare-pages.yml` faz build e deploy. Conferir SHA, resultado e página.
5. Comentar/fechar Issue com prova e commit; se concluído, atualizar `mode=closed` na mesma revisão.

## Regras de tom, proteção e comunicação

O portal mantém o tom legal de **confronto documental** da skill `casoaberto-pt-br-tom`, sem parágrafos editoriais de absolvição automática. Perguntas contundentes são baseadas em documentos, com números reais e sem imputação por associação. Pesquisa sensível sobre eleições/ameaças não coleta preferências partidárias de visitantes, não publica localizações protegidas ou denunciantes, nem dispara pressão individualizada e mensagens automáticas. As fichas A4 e o visual das páginas seguem estáticos e são regenerados apenas quando conteúdo verificado muda.

## Observabilidade e falhas

Cada run em Actions exibe quantidade de casos vencidos, already-queued, HTTP checks, mudanças candidatas e erros. O GitHub Issue recebe sempre o ID, última revisão, foco, fontes-chave, critério de encerramento e roteiro conciso para a próxima revisão. Se o cron falhar, a próxima execução tenta novamente; não afirma atualização realizada. O cache não é um mecanismo durável de provas; fontes canônicas, commits e Issues fazem a auditoria de longo prazo.

Se GitHub Issues estiver desabilitado ou a permissão `issues:write` for negada, o workflow falha explicitamente; não substitui o serviço com publicação não revisada.
