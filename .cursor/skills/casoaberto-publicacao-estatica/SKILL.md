---
name: casoaberto-publicacao-estatica
description: Validar e publicar mudanças editoriais aprovadas no CasoAberto em GitHub/Cloudflare Pages, sem backend nem execução automática de campanhas.
---
# CasoAberto / publicar dossiês e atualizar o site estático

## Disparadores
"Publique o novo caso", "Atualize nosso site estático", "Rode a atualização do CasoAberto", "Deploy dos casos", "Republique o observatório". Se o dono pediu publicação nesta tarefa, há autorização para editar/commitar no repositório exato: `diogorusso/caso-aberto-platform`. Não requer nova confirmação genérica. A revisão factual de alegações sensíveis continua obrigatória.

## Sequência operacional
1. Inspecione `README.md`, `AGENTS.md`, `package.json`, `src/data/political-observatory.json` e o estado atual de `main`. Confirme que não existem mudanças remotas concorrentes.
2. Preserve rotas, slugs, identidade visual, navegação e dados históricos; edite o dataset e componentes reutilizáveis sem criar cópia de página para cada caso.
3. Faça o gate: fontes e datas -> distinção judicial -> contraditório -> privacidade -> relações verificadas -> acessibilidade e SEO. Registros sensíveis só com aprovação editorial genuína; nunca simule assinatura de revisão.
4. Execute `npm run verify:politics && npm run verify:data && npm run check && npm run build` em ambiente autorizado. Revise o HTML gerado, links de fontes e os rótulos de datas históricas.
5. Se todas as portas permitirem, grave commit no repositório alvo; o workflow existente de GitHub Actions/Wrangler executa publicação estática no Cloudflare Pages após push em `main`. Não introduzir runtime, banco de dados, login ou novos custos.
6. Verifique o commit SHA, o run de deploy e ao menos a rota de índice e uma rota de detalhe em `https://casoaberto.pages.dev/observatorio/politica/`. Somente então afirme "publicado". Se deploy falhar, reportar "commit gravado; deploy não confirmado", com motivo técnico.
7. Documente fonte de toda alteração e retificação. Dê direito de resposta em `/sobre/criterios-de-publicacao/`; atualizar conteúdo e status sem apagar versões históricas.

## Não fazer
Não publicar dossiês baseados em rumor sem documentação; não tratar suspeitos como condenados, clubes com patrocínio como criminosos, apoiadores de um candidato como autores coletivos de ataques, nem relatos de comunidades como culpa provada. Não mandar e-mail, WhatsApp, robô de pressão ou mensagens políticas automatizadas. Não transformar o observatório estático em serviço ativo não implementado.