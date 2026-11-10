---
name: casoaberto-monitoramento-factual
description: Reconsultar fontes oficiais e comparar mudanças desde a revisão anterior em casos políticos do CasoAberto, sob demanda e com rastreabilidade.
---
# CasoAberto / revisar e atualizar investigação em andamento

## Comandos a partir desta conversa
Exemplos: "Atualize o observatório político", "Qual novidade na MP das bets?", "Revise POL-003", "Reveja todos os casos políticos", "Atualize os vínculos Betano/Flamengo". Para execução online nesta conversa, use busca atualizada e acesso GitHub ao repo exato. Não existe monitor em background neste produto estático.

## Protocolo
1. Abra a revisão e os IDs em `src/data/political-observatory.json` e rode `npm run research:politics -- --list` ou `--case POL-001` em ambiente local disponível.
2. Escolha a janela desde `reviewed_at`, com consulta obrigatória a todos os atos de prazo conhecido. Na primeira implantação: MP 1.394/2026 (23/11 no registro consultado), ADIs 8024/8027/8028/8035, ADPF 854 (30/11), PF/MJSP e eleições/direitos indígenas.
3. Compare novos atos com fonte e versão anteriores: **novo**, **confirmado sem mudança**, **retificado**, **revogado/suspenso**, **em disputa**, **não localizável**. Nunca transforme ausência de notícia em "resolvido".
4. Um evento precisa de `date`, `title`, `detail`, `source`; um fato novo de `finding`, `source` e `kind`. Novas fontes exigem URL HTTPS, ID único, tipo de fonte, data de origem quando conhecida.
5. Em decisões: diferencie liminar, suspensão de processos, efeito material, confirmação colegiada e trânsito. Em contratos: anúncio, pagamento, aditivo, rescisão e controvérsia são fatos distintos. Em violência: denúncia, abertura de inquérito, indiciamento e condenação jamais se confundem.
6. Não sobrescreva fatos históricos só porque situação atual mudou; acrescente evento e atualize status com referência. Reconciliar números e períodos, não somar bases sobrepostas.
7. O protocolo para edição local do JSON é `npm run research:politics -- --apply caminho/packet-revisado.json`, com `editorial_review.approved=true`, `reviewer` e `review_note` legítimos. O comando não aprova a própria pesquisa e não publica automaticamente.
8. Rode `npm run verify:politics`, `npm run verify:data`, `npm run check`, `npm run build`. Revise diff e gere commit; publicação estática ocorre por push em `main` e precisa de confirmação de deploy.
9. Responda com uma tabela compacta "mudou / não mudou / sem acesso", evidências e link do caso. Caso não haja fontes novas, não altere data da revisão apenas para aparentar atualização.

## Onde agir
Dataset: `src/data/political-observatory.json`; lista `/observatorio/politica/`; página `/observatorio/politica/:slug/`; documentação `docs/observatorio-politico.md`. O índice de vínculos está em `entities`, `relationships` e `sponsorships`.

## Exigências especiais
Na revisão de segurança da deputada Ana Elisa ou de comunidades indígenas não expor rotinas de proteção nem quaisquer dados de ameaçados. Nunca automatizar persuasão ou envio de mensagens; acompanhamento é documental, não vigília pessoal.