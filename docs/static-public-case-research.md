# CasoAberto — arquivo externo de casos e histórias com atribuição

**Atualização: 10/11/2026.** O site continua Astro estático. A nova linha editorial acrescenta páginas de casos públicos pesquisados e histórias individuais já publicadas **sem transformar entrevistas externas em processos investigados diretamente pelo CasoAberto**.

## Arquivos e páginas

- src/data/casos.json — dossiês diretamente acompanhados, com cronologia própria.
- src/data/public-case-atlas.json — quatro casos de fornecedores, contexto de Procon e Justiça, seis histórias pessoais atribuídas a reportagens e reclamações externas.
- src/data/public-case-guides.json — três guias originais por problema, com fontes e modelos de pedido genéricos.
- /casos/arquivo-publico/ e /casos/arquivo-publico/:slug/ — quadro institucional do caso, posição da empresa, linha do tempo e fonte de cada fato.
- /historias/ e /historias/:slug/ — publicação de relatos resumidos e atribuídos, sem reproduzir entrevistas ou dados privados.
- /guias/casos-de-consumo/ e /guias/casos-de-consumo/:slug/ — documentação e ação segura.
- /sobre/ e /sobre/criterios-de-publicacao/ — finalidade, limites, pesquisa, transparência e processo editorial.

O arquivo de terceiros é distinto de um dossiê originado de contrato próprio. Não incluir esses registros em contagens de casos diretamente acompanhados ou métricas de pessoas únicas. Cada estatística exige o denominador e ano corretos. Não atribuir as histórias de agosto de 2022 sobre 123milhas ao cancelamento em massa anunciado em agosto de 2023.

## Fontes usadas e natureza da conclusão

**Hurb:** Procon-SP descreveu adiamento de pacotes e problemas de restituição em 2023; ranking de reclamações de 2024 divulgado em 2025; Ministério da Justiça noticiou medida relacionada à Cadastur em abril de 2025. Isso **não** permite afirmar que houve decreto de falência da Hurb ou o desfecho atual dos contratos individuais.

**123milhas:** Procon-SP registrou o deferimento do processamento da recuperação judicial de 2023 e orientações documentais de credores de 2024; Radioagência Nacional reportou etapa de revisão de créditos de dezembro de 2025. Prazos históricos não devem ser reproduzidos como válidos automaticamente em 2026.

**Yeesco:** rankings do Procon-SP com registros do exercício 2024, e uma reportagem regional de maio de 2024 com versão das pessoas e da empresa. Indicadores estaduais do período não são probabilidade de não entrega para o cliente individual.

**Enel São Paulo:** reportagem da Agência Brasil sobre decisão judicial relativa ao apagão de dezembro de 2025 e multa administrativa de outubro de 2026, com resposta da distribuidora; depoimento externo do Reclame Aqui sobre perda de alimentos, sem acesso pelo CasoAberto ao registro técnico de uma unidade.

**Histórias individuais:** Carla (iG, 2025), Marcelo (Folha, 2024), Vivian e Marcelo (UOL, 2022), Monique (O Município, 2024) e morador sem identificação (Reclame Aqui, 2025). São **relatos atribuídos** e temporalmente limitados. Não expor nomes completos, endereços, protocolos, CPF, números de pedidos, comprovantes ou outras informações pessoais. Parafrasear em linguagem original com link para a fonte. Não insinuar entrevista, adesão ao projeto, apoio ao movimento ou permissão de uso de imagem.

## Linha de produção de novos casos sem inventar apuração

1. Escolher notícia ou evento a partir de órgão público, sentença identificada ou reportagem de origem com data.
2. Registrar tipo, fonte, episódio, recorte geográfico, data do evento, manifestação da empresa e eventuais recursos.
3. Conferir segunda fonte de contexto, evitando duplicar a mesma pessoa em contagens.
4. Escrever uma pergunta pública e o que ela precisaria para ter resposta documental.
5. Definir uma limitação específica: fato não observado, nova evolução não verificada ou testemunho sem documentos.
6. Preparar ações seguras e modelos genéricos; nunca orientar envio de dados privados ao site.
7. Ligar caso a história atribuída apenas quando a fonte realmente trata da empresa e do tema.
8. Rodar npm run verify:public-case-atlas e os testes do repositório. Revisar manualmente a data e integridade dos links externos.
9. Publicar atualização ou correção quando uma fonte posterior mudar o quadro. Não apagar a versão original silenciosamente.

## Uso de dados, IA e conteúdos educacionais

A automação editorial só pode apoiar classificação, extração de recortes, deduplicação, verificação e rascunhos. A revisão factual humana é obrigatória. Não fazer scraping de documentos pessoais, perfilagem política, disparos, avaliações falsas ou publicações de testemunhos fingindo serem do projeto. A obra completa da autonomia digital permanece como produto privado; os guias de consumo aqui publicados são material original público e não substituem os cursos.

## Segundo lote: mais três setores e um evento regional

Novo recorte revisado em 10/11/2026: Grão de Gente (produtos para bebês e recuperação judicial declarada), Lado Rosa (fiscalização estadual de vestuário), Novo Mundo (varejo e medida do Procon Goiás em novembro de 2026) e Light no apagão de julho de 2026 no Rio de Janeiro. As fontes primárias e atribuições estão em `src/data/public-case-atlas.json`.

Seis histórias adicionais incluem duas compras de produtos infantis com desfechos distintos (uma restituição ainda não comprovada em abril de 2026 e uma entrega tardia confirmada em agosto de 2024), dois relatos do Portal 6 (entrega após Procon e micro-ondas ainda pendente em outubro de 2026) e duas entrevistas da Agência Brasil sobre impactos de falta de energia no Rio (uma sem recomposição à saída para o trabalho, outra com retorno no dia seguinte). Nenhum relato comprova posição atual de terceiro além da sua fonte.

Ao escrever sobre Novo Mundo, o dado de 2.203 ocorrências do Procon Goiás entre junho de 2025 e outubro de 2026 reúne **reclamações e denúncias**, não 2.203 pessoas únicas. Cerca de 410 pendências informadas em 9/11/2026 não devem ser descritas como pendentes eternamente. O plano de ação anunciado pela companhia naquela data não é prova de execução. Lado Rosa: as contagens de 85 registros acumulados até julho de 2025, 15 queixas novas e 20 resoluções anteriores pertencem a recortes distintos. Não somar sem reconciliação. Light RJ 2026 e Enel SP 2025 são casos, concessionárias e regiões distintos.

Novos links usam o mesmo componente e templates estáticos; os guias já publicados de compra online e apagão agora incluem os casos correspondentes. Um quarto guia explica por que entrega, restituição e habilitação de crédito são eventos diferentes durante recuperação judicial.
