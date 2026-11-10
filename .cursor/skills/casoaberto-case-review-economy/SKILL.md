---
name: casoaberto-case-review-economy
description: Execute revisões de casos CasoAberto com custo mínimo: uma fila de GitHub Issues, um dossiê por vez, apenas diffs verificáveis e publicação Astro estática quando necessária.
---
# CasoAberto · revisão econômica de casos

Use quando o dono disser **“atualize os casos”**, “acompanhe até encerrar”, “revisar monitoramento”, “rode as atualizações”, ou quando houver tarefa programada. **Repositório único:** `diogorusso/caso-aberto-platform`.

## Ordem de execução (parar cedo = economizar)

1. Consultar apenas GitHub Issues **abertos** com o prefixo exato `[case-watch:<ID>]`, do repositório. Se nenhum: **ENCERRAR**. Não ler artigos, não navegar, não criar novas tasks, não chamar LLM novamente para sintetizar “nada mudou”, não commitar/republicar.
2. Ordenar `urgent > high > standard` por `src/data/case-watch-policy.json`. Selecionar no máximo **dois casos** por execução de agente. O cron GitHub já gera a fila com zero tokens de LLM e limite de 12 requisições HTTP por rodada.
3. Obter a cápsula única do caso com `npm run case:review -- --case POL-001` (ou construir manualmente APENAS este recorte se um agente não tiver shell). O pacote por padrão é JSON válido, inferior a 4.800 caracteres. Nunca anexar todos os JSON, README completo, wiki e fontes da biblioteca ao mesmo prompt.
4. Aguardar o detector: a alteração do hash/ETag de HTML é só **sinal de leitura**, nunca conclusão de fato. Pesquisar se houve nova decisão, ato administrativo, documento do interessado ou correção. A ausência de hash novo não descarta um ato em outra URL: checar o `focus` da cápsula em fontes oficiais.
5. Sem mudança material: comentar no Issue a data, as URLs consultadas e “sem alteração verificável”, então **fechar** a tarefa. O próximo vencimento se calcula com o `closedAt` dessa revisão; não alterar `reviewed_at` do site nem fazer commit.
6. Com fato novo: confirmar a fonte original, data **do ato** vs data **da notícia**, estágio jurídico, versão/contraditório, sujeito responsável, escopo e efeito concreto para a pessoa. Edite só o dataset canônico da família:
   - `CA-` → `casos.json`, `updates.json`, `relatos.json` e documentos pertinentes;
   - `EXT-` → `public-case-atlas.json`;
   - `POL-` → `political-observatory.json`, usando `research:politics` quando aplicável;
   - `PLAT-` → `platform-observatory.json`.
7. Atualizar `impact-stories.json` **somente** se a consequência, fato-chave ou conclusão mudaram. Cartazes/fichas são gerados dos dados; se há peça editorial derivada ou fonte histórica desatualizada, corrija. Preserve todos os slugs, a navegação, versões anteriores e referências.
8. Executar `npm run verify:data && npm run check && npm run build` em ambiente disponível. Registrar commit exato. Confirmar conclusão positiva do deploy Cloudflare Pages antes de afirmar publicado. Depois comentar Issue com URLs, mudança substantiva, commit e resultado, e fechá-lo.
9. Para fechar definitivamente um caso, há um gate separado na skill `casoaberto-case-lifecycle`. O fechamento de **issue** não equivale ao fechamento de **caso**.

## Balanço de tokens

| Degrau | Quando | Contexto entregue ao agente |
| --- | --- | --- |
| 0 | Sem Issue aberto | **Nenhuma** pesquisa adicional |
| 1 | Triagem do Issue | ID, última revisão, foco, 1–2 URLs, data e motivo |
| 2 | Mudança provável | Cápsula de até **4.800 caracteres**, até 3 fatos, 3 datas, 3 fontes e 3 perguntas |
| 3 | Documento novo | Somente trecho do ato pertinente + contraposição da parte |
| 4 | Edição | Diff dos arquivos pertinentes, não todo o repositório |
| 5 | Publicação | Resultado das validações, SHA e link do deploy |

Padrão: pesquisa limitada a **duas buscas dirigidas por caso e uma checagem de fonte primária por alegação nova**; amplie só quando houver contradição, falha de acesso ou decisão material que o exija. **Não há cota rígida** se a precisão exigir mais fontes; reduzir tokens nunca autoriza inventar ou omitir fatos relevantes.

## Tom obrigatório

Carregar `.cursor/skills/casoaberto-pt-br-tom/SKILL.md` para qualquer alteração pública. Sequência: **pergunta incômoda → fato atribuído → consequência → cobrança objetiva → link para agir**. Sem amortecimento corporativo automático. Sem criar dados, probabilidade de falência, valores de prejuízo, números de eleitores, responsáveis penais ou suspeitos por associação. Não inserir disclaimers artificiais.

Para processos políticos, consultar também `casoaberto-investigacao-politica` e `casoaberto-monitoramento-factual`. Para mudanças sensíveis sobre pessoas ameaçadas/indígenas, não reproduzir ameaças, dados privados, localização, rotinas de segurança nem identidade de denunciantes.

## Agendamento

- O GitHub Actions `.github/workflows/case-watch.yml` roda uma checagem HTTP **sem LLM** por dia, próximo de 09:23 no fuso `America/Sao_Paulo` (12:23 UTC), além de `workflow_dispatch`. Atrasos do GitHub podem ocorrer.
- Uma tarefa ChatGPT de revisão consome tokens apenas ao abrir Issues reais, limitada a dois dossiês por rodada.
- Não usar Worker, banco, fila persistente externa, Cloudflare D1 ou notificações push para esse objetivo. O **GitHub Issues** é a fila e **GitHub Actions cache** mantém fingerprints; o site público continua Astro estático.
- Se o último Issue foi fechado sem novidades, `closedAt` é a data da verificação editorial e posterga a próxima checagem. Se há nova alteração editorial publicada, usa a revisão no dataset.
- Falha de rede/403 não é notícia. Sem fonte verificável, manter Issue aberto com bloqueio específico; não fingir revisão.

## Comandos úteis

```bash
npm run case:watch -- --validate
npm run case:watch -- --offline --today 2026-11-11
npm run case:review -- --case CA-001
npm run case:review -- --case POL-002 --max-chars 3600
npm run verify:case-watch
npm run verify:data && npm run check && npm run build
```

Para encerrar uma revisão sem novidade comprovada, usar `npm run case:complete -- --case CA-001 --outcome no-change --source https://... --reviewer "editor real" --note "..." --apply` em ambiente com `GH_TOKEN`; no-change **não publica**.

### Resultado esperado

Relatar apenas: quantos Issues processados, quais fatos mudaram, provas, status/risco alterado, commit/deploy, ou bloqueio concreto. Se nada se alterou, manter silêncio informativo — o histórico da tarefa já existe no GitHub.
