---
name: casoaberto-case-lifecycle
description: Gerenciar estados active, paused e closed dos casos CasoAberto, sem encerrar por falta de notícias e sem reabrir indefinidamente após resolução comprovada.
---
# CasoAberto · acompanhamento até o desfecho

## Modelo de estados

- `active`: situação aberta ou providência institucional pendente. O cron verifica nas janelas da `case-watch-policy.json` e abre Issue quando revisão se torna necessária.
- `paused`: suspensão editorial explícita, **com motivo documentado**, por exemplo proteção de vítima, acesso indisponível persistente ou investigação suspensa. Não interpretar como conclusão nem apagar do arquivo público.
- `closed`: desfecho comprovado no recorte publicado, estado correspondente no dataset, fonte de fechamento no registro, data de fechamento e confirmação editorial. Cron deixa de vigiar. O site permanece estático e arquivado, com seu histórico.

**Fechar uma tarefa [case-watch:ID] não significa fechar o caso**. A tarefa representa uma rodada de pesquisa; fechar a tarefa após revisão sem mudança evita repetição desnecessária de tokens. Novas tarefas só vencem no intervalo seguinte.

## Procedimento de fechamento real

1. Identifique a obrigação ou desfecho verificável específico:
   - contrato/consumo: entrega integral aceita, restituição comprovada, acordo cumprido ou decisão/ato final documentado;
   - fiscalização: decisão e execução, arquivamento, cumprimento da obrigação ou exaurimento documentado da competência/recorte;
   - judicial: sentença/decisão, recurso, arquivamento, trânsito em julgado **conforme estágio efetivo**; processo em andamento não é encerrado por noticiário;
   - ameaça ou direitos indígenas: investigação/medidas de proteção com publicação institucional e proteção permanente de denunciantes; não fechar apenas porque deixou de ser notícia;
   - plataformas: decisão ou solução institucional comprovada da questão pesquisada.
2. Leia a fonte primária e a versão da parte quando aplicável. Não encerrar por prazo decorrido, perda de mídia, promessas, 404, baixa repercussão ou resultado parcial sem comprovação.
3. Atualize **antes de fechar a política** o dataset principal da família de caso com status conclusivo (“Resolvido”, “Concluído”, “Encerrado”, “Arquivado” ou equivalente que descreva exatamente o ato), data editorial, cronologia e URL de prova. Se houver dúvida jurídica, não converter liminar em trânsito nem pedido em entrega.
4. Refaça o modelo de impacto e as peças impressas se houver mudança substantiva. O visual não pode continuar dizendo que uma obrigação está aberta depois de comprovadamente concluída.
5. Em `src/data/case-watch-policy.json`, altere **somente o ID correspondente**:
   `"mode": "closed"`, `"closed_at": "AAAA-MM-DD"`, `"closure_source_url": "https://url-exatamente-conferida"`, mantendo o `closure_evidence` textual para auditar os critérios.
6. Valide: `npm run verify:case-watch && npm run verify:data && npm run check && npm run build`. O validador exige documento HTTPS, data consistente e estado conclusivo publicado. Commit/push no repositório selecionado e confira o deploy.
7. Com o commit confirmado, documente no Issue: fato que mudou, fonte, data, número do procedimento quando público, versão da parte, SHA e URL da página. Só então feche Issue.
8. Se surgirem **fatos novos verificáveis** que reabram o mesmo problema, reativar explicitamente `mode:active` com nova cronologia e fonte editorial; o cron não reabre sozinho caso fechado.

## Exceções que não permitem conclusão automática

- Publicação de denúncia ou operação policial sem condenação.
- Mudança de advogado ou partido.
- Nota de empresa com promessa de solução sem prova de execução.
- Dados contraditórios de dois órgãos com recortes diferentes.
- Retirada temporária de propaganda ou decisão liminar ainda em disputa.
- Página fonte bloqueada por autenticação ou indisponível.
- Proteção de pessoas expostas a violência política: nunca rastrear sua rotina, endereço ou escolta.

## Controle de custos

Um caso `closed` gera **zero requisições HTTP e zero tokens** em cada nova rodada. Uma tarefa `no-change` recém-fechada não é reaberta antes de novo vencimento porque a data `closedAt` do Issue é usada como última verificação. `paused` também não é consultado até retorno editorial.

## Seguir outras skills

`casoaberto-case-review-economy` para triagem e pacote curto; `casoaberto-pt-br-tom` para qualquer texto público; `casoaberto-publicacao-estatica` para commit e confirmação; `casoaberto-monitoramento-factual` nos processos políticos.
