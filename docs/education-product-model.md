# CasoAberto — operacionalização do conteúdo público e do produto educacional

**Decisão de produto:** o playbook completo de 56 capítulos e seus protocolos avançados continuam sendo o ativo educacional reservado. O site público não deve copiar capítulos nem publicar uma série de resumos que permita reconstruir gratuitamente a obra completa. O CasoAberto publica apenas perguntas independentes, insights curtos com fontes, exercícios introdutórios e materiais de utilidade cívica.

## Quatro camadas e onde cada uma vive

| Tipo | Fonte | Distribuição |
| --- | --- | --- |
| Acervo autoral | `diogorusso/obsidian-to-html`, wiki e playbooks | Privado; nenhuma cópia integral no build Astro |
| Snippets úteis | `src/data/learning-publications.json` | Site SEO com 1–2 insights, duas perguntas, fontes e um exercício de entrada |
| Produtos educacionais | `src/data/education-products.json` | Apenas página de apresentação em `/academia/`, sem acesso premium, cadastro ou pagamento |
| Distribuição derivada | `src/data/content-distribution-queue.json` | Pautas **não publicadas**, convertidas em briefs por `npm run content:pack` |

## Operação editorial em três portas

1. **Pesquisa:** confirme os fatos nas fontes originais do repositório de pesquisa e verifique data, contexto e limitações. Não trate alegações ou simulações como observação.
2. **Recorte público:** escolha uma pergunta específica respondível, escreva insight independente e vincule fontes originais e um microexercício. O teste automatizado `npm run verify:publications` bloqueia excesso de texto, snippets órfãos e programas ficticiamente ativos.
3. **Distribuição e receita:** prepare drafts de card, FAQ, roteiro curto e newsletter **a partir do snippet público**, não do playbook privado. Leve o leitor ao produto correspondente; mantenha apenas a descrição comercial até que checkout e entrega autenticada funcionem.

Para gerar os briefs **sem API de IA, sem envio externo e sem publicação**:

```bash
npm run content:pack
npm run content:pack -- --slug=privacidade-sem-ilusoes
```

Os arquivos `build/editorial-drafts/*.md` e `*.json` devem ser revisados e produzidos antes de serem publicados; a pasta é ignorada pelo Git. Fonte, autoria, contexto, imagem licenciada, data e finalização editorial precisam ser confirmados. A presença de um brief não é aprovação nem disparo de campanha.

### Produto educacional real vs. amostra gratuita

**Gratuito** — um insight delimitado, com valor próprio, referências verificáveis, uma ação simples, informação básica de segurança/direitos e links para instrumentos públicos.

**Premium, somente depois de estar pronto** — progressão didática, conteúdo original extenso, protocolos completos, casos comentados, rubricas de avaliação, feedback, laboratórios avançados, materiais para docentes e atualizações. A entrega deve acontecer em plataforma com autorização real no servidor, controle de acesso por titular, termos e política de reembolso. Esconder um PDF em Javascript, CSS, `public/` ou `dist/` não constitui proteção.

**Monetização futura** — cobrança transparente por aprofundamento educacional; não condicionar acesso à documentação de casos, dados do instituto ou direitos básicos à compra. Não há checkout, métricas de conversão nem captura de e-mails neste release.

## Qualidade, medição e próximos incrementos

- Cada pauta tem `slug`, pergunta, mecanismo, `article_slug`, `product_slug`, limite da evidência e formatos possíveis.
- SEO: uma intenção distinta por página, título útil, resposta breve própria, fonte e revisão; não produzir centenas de variações que repetem o mesmo parágrafo.
- Provas: contagens somente com denominadores; sem inferir mudança política ou psicológica a partir de um clique/visita.
- Produto: quando existir plataforma de venda, medir apenas eventos com consentimento e finalidade documentada; nunca perfis de convicção política de leitores.
- Revisão: a fila gerada é pauta, não fato já publicado; acompanhar versões e correções posteriores em cada meio.
- Verificação: `npm run verify:data && npm run check && npm run build` e `npm run verify:content-packs`.

## Pacotes originais revisáveis para lançamento

Além da geração local sem IA em `build/editorial-drafts/`, existem **12 packs editoriais curados** em `campaign/education/*.md` (um por tema) com quatro quadros de carrossel, legenda, roteiro de vídeo, abertura de newsletter, links públicos e limites da evidência. Estes são rascunhos, não conteúdos já distribuídos. O manifesto `src/data/education-content-packs.json` registra o material para que seja reutilizado com fidelidade.

O gate `npm run verify:curated-content` confere versão, referências, mapeamento ao produto, tamanho e presença do material em arquivos Markdown; ainda exige revisão humana contextual de conteúdo, acessibilidade e fontes. **Não executar distribuição automática** ou adicionar a obra integral ao projeto público.


## Recursos gratuitos por trilha — camada de aquisição sem captura

Os quatro programas possuem uma ficha própria em `/academia/:slug/ferramenta-gratuita/`, gerada pela mesma página estática a partir de `src/data/academy-lead-magnets.json`. Cada ficha oferece um problema único, cinco perguntas introdutórias, três campos para preenchimento em papel e um limite explícito do que demonstra. A ficha é pronta para impressão ou "Salvar como PDF" via navegador. **Não há formulário enviado a servidor, lead capture, pixel de conversão ou promessa de acesso premium**.

O índice `/autonomia-digital/guias/` agora agrupa as perguntas de acordo com os produtos educacionais e as páginas de insight trazem até três materiais de leitura relacionados. Isso constrói caminhos úteis de SEO e educação sem multiplicar páginas idênticas. `npm run verify:lead-magnets` garante ligações, limites e presença das quatro fichas.


## Ateliê editorial local

Run `npm run content:preview` to build a self-contained visual review at `build/editorial-preview/index.html`. To preview one curated content item, use `npm run content:preview -- --slug=arquivo-deepfake`. The HTML displays four-panel carousel mockups, copy, video scripts, newsletter introductions, citations and scope notes. It is **only a local file**, not an authenticated workspace, public landing page or distributed campaign. The generator reads public-snippet-derived drafts, never private playbook manuscripts. The HTML escapes source strings and loads no remote script or image. Content requires fresh source verification and human approval before any publication. Never move this output under `public/` or `dist/`.

## Próxima etapa: embalagem privada da obra

Há agora um utilitário de release offline para materiais educacionais que já estejam concluídos e revisados em diretório privado. Com chave AES-256-GCM externa, npm run course:package gera pacote cifrado e manifesto de integridade fora do checkout público. npm run course:verify confirma integridade sem extrair conteúdo. O build público executa uma auditoria adicional em dist/ para impedir o vazamento acidental de arquivos de curso e caminhos da wiki. Consulte docs/private-education-release.md.

Essa ferramenta não implementa pagamento, autenticação de aluno, autorização de download nem produtos já disponíveis. O catálogo público permanece em `em-producao` até infraestrutura privada de identidade/entitlement e checkout verificado existirem. Esse passo é checklist operacional do dono — não item aberto do backlog do site estático.
