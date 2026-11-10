# CasoAberto — distribuição educativa com fontes

Os **12 pacotes** em `drafts/` são materiais editoriais para revisão. Eles oferecem rascunho de card, vídeo curto, newsletter e FAQ, **não são conteúdos publicados nem mensagens enviadas**.

Cada pacote usa somente uma pergunta original do `src/data/content-distribution-queue.json`, uma amostra pública revisada em `src/data/learning-publications.json` e fontes externas. O conteúdo premium completo permanece na wiki e em seu ambiente educacional futuro, não neste repositório.

Arquitetura: amostra pública / problema específico → recorte e fontes → microexercício gratuito → apresentação do programa na `/academia/`. O catálogo é informativo e não realiza pagamentos.

Gerador para novas revisões: `npm run content:pack`. A saída automatizada fica em `build/editorial-drafts/`, ignorada pelo Git, para evitar publicação acidental. Reconciliar manualmente diferenças com os briefs versionados em `campaign/education/drafts/` antes de atualizar assets.

Os rascunhos não indicam segmentação por preferências políticas, captura de e-mails, uso de bots ou promessa de novos fatos. Publicação, circulação e revisão de qualquer peça exigem aprovação humana.
