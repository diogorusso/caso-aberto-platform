# Kit Boca a Boca — impressão e coordenação

## O que é

Ações de comunicação com fatos e fontes. Cada material traz identificação do caso, data de revisão e QR code para o dossiê. O objetivo é que uma empresa responda pelo serviço contratado e que consumidores possam pesquisar o histórico antes de tomar decisões.

O kit não precisa de CMS, servidores de impressão, banco, usuários registrados ou API externa: Astro gera as páginas e os navegadores imprimem os layouts com CSS \`@media print\`.

## Navegação

- \`/kit-boca-a-boca/\` — hub com instruções e seleção de casos.
- \`/casos/:slug/kit-boca-a-boca/\` — estúdio de impressão por caso (só quando kit publicado).
- \`/cenarios/\` — pesquisa e caminhos de acompanhamento.
- \`/casos/:slug/cenarios/\` — reações, novos fatos e exigências de solução.
- \`/kit-boca-a-boca/registro.csv\` — registro *agregado* de distribuição; não captura contatos de participantes.

A home continua institucional. O caso específico e suas perguntas ficam na página do dossiê.

## 5 modelos em A4

| Modelo | Rendimento | Uso |
|---|---|---|
| Cartaz de impacto | 1 A4 | Informar valor, perguntas e QR |
| Ficha de fatos e fontes | 1 A4 | Reuniões, órgãos de defesa do consumidor, comunidade |
| Panfleto A5 | 2 exemplares / A4 | Distribuição de mão em mão, com autorização |
| Cartão A6 | 4 exemplares / A4 | Convite para consultar o caso |
| Plano de distribuição | 1 A4 | Conferência editorial e registro agregado |

Cada modelo existe em **colorido** e **preto e branco** por variação das mesmas propriedades CSS, sem manter arquivos duplicados. A impressão pode ser feita por **Ctrl/Cmd+P → salvar como PDF**. Formato A4 em retrato; escala 100%; margens de 10 mm (do próprio CSS de impressão); habilitar gráficos de fundo caso o navegador não respeite cores. Para P&B, economize tinta e não use fundos preenchidos.

## Novos casos: sem editar templates

1. Publique o caso verificado em \`src/data/casos.json\`.
2. Insira em \`src/data/print-kits.json\` um registro com \`case_id\`, chamada curta, recomendação editorial datada, QR SVG, formatos e URLs originais.
3. Execute \`python3 -m pip install qrcode\` (somente na máquina do autor) e \`python3 scripts/generate-print-qrs.py\`.
4. Escaneie o QR com celular e confira o URL final.
5. Rode \`npm run verify:data && npm run check && npm run build\`.
6. Faça commit. O deploy Cloudflare Pages é estático e baseado no GitHub.

**Não use um código QR que aponta para outro caso.** O validador exige que o SVG configurado realmente exista em \`public/media/print\`.

## Qual o padrão de linguagem?

Priorize fatos e perguntas diretas: “R$ 190 mil informados como pagos”; “Prazo descumprido”; “Onde estão os móveis?”; “Quem deve responder?”. Atribua ao consumidor o que é relato, indique status e data, e não substitua desfecho verificado por suposição. Não transformamos falência de outra empresa em afirmação de falência da contratada.

Evite linguagem institucional vazia que diminua a gravidade. Também não esconda origem dos dados ou o fato de um cenário ainda depender de evento futuro.

## Segurança e coordenação

- Confirme antes de cada tiragem se o caso mudou ou foi resolvido.
- Peça autorização quando o local exigir. Não interrompa entradas, funcionários, clientes ou operações comerciais.
- Não exponha CPF, endereço residencial, nome do consumidor ou documentos integrais em cartazes.
- Faça distribuição pacífica, sem confronto, ameaça, pressão sobre familiares ou números inventados.
- Anote **somente quantidades agregadas** impressas, entregues e restantes.
- O QR sempre conduz a uma página com fontes e mecanismo de correção, nunca a ataques pessoais.
- Quando houver solução, atualize as peças, interrompa circulação de versões ultrapassadas e preserve o registro histórico.

## Relação com MiroFish

O MiroFish demonstra um fluxo de sementes documentais → grafo de atores → cenários de interação → relatórios. Nesta primeira implementação, o CasoAberto utiliza **roteiros estáticos orientados a evidências**, não o motor multiagente do MiroFish e nem inferência sobre situação financeira de empresas.

A estrutura editável está em \`src/data/action-scenarios.json\`. Novas etapas podem incorporar eventos datados, caminhos validados por administradores, cenários por setor e métodos quantitativos examináveis, mantendo cada saída atribuída e audível.

Referência: https://github.com/666ghj/MiroFish
