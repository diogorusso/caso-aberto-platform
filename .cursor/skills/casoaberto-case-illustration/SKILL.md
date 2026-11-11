---
name: casoaberto-case-illustration
description: >-
  Imagery standard for the WHOLE CasoAberto catalog: every case/story cover must
  match the documented claim, never reuse a photo, and support the confrontational
  PT-BR question. Use when choosing, auditing, or replacing case photos, updating
  case-visual-assets.json, fetching Commons/Agência Brasil covers, or when cards
  show generic/repeated/mismatched stock. Not for KPI charts or print sheets
  (casoaberto-visual-data-storytelling) and not for copy voice (casoaberto-pt-br-tom).
---

# SKILL — Ilustração documental de alto impacto

Guia de imagem do produto. O agente **executa**. Não “melhora com stock bonito”. Não repete foto. Não contradiz a pergunta do dossiê.

**Always-on (todos os hosts):** `AGENTS.md` §31b + [references/always-on.md](references/always-on.md).  
Pacote descoberta: `.agents/skills/casoaberto-case-illustration/` ≡ `.cursor/skills/casoaberto-case-illustration/`.  
Par com a voz: `casoaberto-pt-br-tom` + `AGENTS.md` §31.  
Adapter Cursor apenas: `.cursor/rules/casoaberto-case-illustration.mdc` — **não** é a fonte canônica.

## Escopo — imagem da plataforma inteira

**Isto não é o visual de um caso.** É o padrão de capa de **todo** o arquivo pesquisável.

| Onde | O que |
|---|---|
| **Catálogo `/casos/`** | cards do `CaseResearchExplorer` — primeira impressão visual |
| **Todos os casos** | CA, EXT, POL, PLAT — mesma disciplina, fatos diferentes |
| **Histórias** | `PUB-*` — ilustração temática exclusiva; nunca o rosto inventado do relato |
| **Arquivo público / heróis** | **sempre** `photo` em `/media/` — OG tipográfico **nunca** on-page |
| **Share / Open Graph** | `/og/` só para meta social — não é capa do dossiê |
| **Manifesto** | `src/data/case-visual-assets.json` — fonte da verdade |

- Florense com foto da loja = **exemplo de fit**, não licença para stock genérico nos outros.
- Caso novo = **mesma disciplina visual** + substantivo visual daquele dossiê.
- Se o agente “caprichar” só no caso em destaque e preencher o resto com Congresso/estádio/show genérico → **falhou o skill**.

## Lei #0 — Papel do agente

| Faz | Não faz |
|---|---|
| Escolhe foto que sustenta a **pergunta incômoda** do caso | Usa stock do setor porque “combina com a categoria” |
| Uma foto **exclusiva** por `case_id` / história | Reutiliza path, URL Commons ou quase-duplicata |
| Credita fonte; marca ilustração vs incidente | Inventa incidente, deepfake ou retrato de ameaçado |
| Busca outra foto ética/única; OG só no share | Usa placeholder tipográfico no card/hero |
| Alinha imagem à voz de confronto | Bonito, neutro, RP ou turismo |

**ZERO FOTOS GENÉRICAS CORINGA.** Congresso, urna, estádio, plateia de show e caixa na porta **não** são curingas. Cada um só entra se for o mecanismo do dossiê — e só em **um** ID.

## 1. Identidade da imagem

A capa deve ser:

1. **Fiel ao claim** — o verbo do dossiê (não entregou, quem investiga, quem financia, quem rastreia)
2. **Fiel à consequência** — prejuízo, omissão, barreira ou disputa legíveis sem ler o título
3. **Específica** — outro caso da mesma categoria **não** poderia herdar a mesma foto
4. **Exclusiva** — path e `photo_source` únicos no manifesto
5. **Documental** — Commons / Agência Brasil / fonte do dossiê / mídia institucional creditada
6. **Honesta** — `is_incident_photo` só se for o incidente verificado; senão admitir ilustração no `credit`
7. **Confrontacional** — reforça a pergunta; não absolve nem ameniza
8. **Anticorporativa** — não vira folder da marca
9. **Segura** — sem retrato de pessoa ameaçada, sem ritual ornamental, sem localizar vulnerável além do público necessário
10. **Consistente** — mesma régua em CA, EXT, POL, PLAT e histórias

Se remover logo + título e a resposta for só “futebol / Brasília / show / eleição / pacote” → **rejeitar**.

## 2. Fórmula de seleção (paralela à voz)

**Voz:** Pergunta incômoda → Fato → Consequência → Cobrança → CTA  
**Imagem:** Pergunta do card → **substantivo visual do mecanismo** → consequência visível → arena/ator corretos → exclusividade no catálogo

Para cada capa, preencher e obedecer:

```text
CLAIM:       [verbo documentado]
CONSEQ:      [prejuízo / omissão / disputa]
ACTORS:      [empresa / órgão / comunidade / plataforma]
SETTING:     [onde o problema ocorre]
VISUAL_NOUN: [1–3 substantivos concretos da foto]
FAIL_IF:     [o que a foto não pode sugerir]
UNIQUENESS:  [grep manifesto: photo + photo_source livres]
```

Rubrica mínima **4/5** (`references/selection-rubric.md`). Unicidade falhou → Honesty = 0 → sem `accept`.

## 3. Exemplo autorizado de fit (não é o único caso)

**Bom fit (Florense):** foto da unidade / operação ligada ao atraso de móveis planejados — o lugar do descumprimento, não um sofá stock.

**Mesmo registro para outros IDs:** trocar empresa, verbo e `VISUAL_NOUN`. Não colar Congresso/estádio/show porque “é político / é futebol / é evento”.

| Anti-exemplo real | Por que falha | Direção |
|---|---|---|
| Yeesco + caixa amassada na porta | Prova **entrega**; o caso pergunta se **chegou** | Ausência / rastreio parado / nunca recebido |
| Voto indígena + urna clínica | Setor eleição, não barreira de acesso | Transporte, seção remota, língua, território |
| Flamengo/bets + Maracanã lotado | Atmosfera de jogo, não financiamento | Patrocínio / publicidade / disputa jurídica |
| MP bets + audiência genérica + logo | Logo-muleta | CPI/rito da MP / STF no tema |
| Emendas ou ameaças + Congresso genérico | Brasília coringa (e reuso) | Rastreio orçamentário **ou** proteção/PF — **fotos diferentes** |
| Revenda + plateia de festival | Show ≠ Senacon/revenda | Bilheteria, plataforma, fiscalização |
| Revenda Senacon + fachada StubHub estrangeira | Crédito confessa: “não é o processo brasileiro” | Arena Senacon/MJ **ou** mecanismo de revenda no BR — sem fachada-muleta |
| Logo branco solto acima do H1 | Chip corporativo disputa a pergunta | Logo só na figcaption / placa da foto — nunca entre eyebrow e título |

Anti-exemplos em foto: `assets/anti-examples/`. Nomes: `references/anti-patterns.md`.

## 4. Regras para o agente (obrigatórias)

- Começar pelo **mecanismo** do headline, não pela categoria
- Proibir reuso: mesmo `photo`, mesmo `photo_source` / `File:`, mesmo crop da mesma cena
- Logos da **mesma** marca podem repetir; capas **nunca**
- Não marcar `is_incident_photo: true` para ilustração Commons
- Não inventar vítima, rosto, deepfake ou “foto do cliente”
- Violência política: sem retrato da pessoa ameaçada; sem rotina/endereço
- Povos indígenas: registro coletivo creditado ou arena que deveria apurar — sem ornamentalizar
- Patrocínio de bets ilustra relação econômica documentada — não prova de crime
- Sem licença/crédito → **buscar outra foto** ética/única (Commons / Agência Brasil / arena institucional). **Não** publicar capa tipográfica na página.
- Atualizar só o ID em `case-visual-assets.json`; arquivo novo em `public/media/...`
- Foto deve **sustentar** o tom confrontacional — nunca contradizer a pergunta
- **Lei da foto real:** cards, heróis, arquivo público, observatório político e plataformas usam **sempre** `photo` em `/media/`. `/og/*.png` é **só** meta social / WhatsApp / X — nunca o `<img>` principal do dossiê.

### Tipos permitidos (escolha um) — tipos A–E são on-page

| Tipo | Quando | Proibido como coringa |
|---|---|---|
| A. Consequência do consumidor | Não-entrega, cobrança, serviço falho | Pacote “já na porta” se o claim é não chegou |
| B. Operação / produto | RJ, loja, água, energia, streaming | Sala/stock reutilizado |
| C. Arena institucional | Órgão/rito **do** caso | Qualquer Congresso |
| D. Financiamento / publicidade | Bets, clubes, emendas | Só torcida |
| E. Direitos / povos / voto | Acesso, denúncia coletiva, proteção | Ritual close; urna isolada |
| Meta social `/og/` | Share cards / Open Graph **apenas** | Usar OG como hero/card on-page |

## 5. Anti-padrão — NÃO regenerar / NÃO manter

```
Card com headline sobre não-entrega
+ foto de pacote entregue na porta
+ logo da marca no canto
→ “está bom, o logo identifica”
```

```
Card político sobre emendas / ameaças / voto
+ mesma fachada de Brasília / urna / plateia
+ “é o setor, serve”
```

```
Card Senacon / revenda BR
+ fachada StubHub / loja estrangeira / show
+ credit que admite: “não é o processo Senacon brasileiro”
→ o crédito vira desculpa da foto errada
```

```
Hero do dossiê
+ placa branca de logo flutuando entre eyebrow e H1
+ foto que o credit precisa desmentir
→ chip salva a marca; a pergunta some
```

Isso é stock-coringa do LLM. Apagar. Não “ajustar crop”. Voltar à fórmula / `VISUAL_NOUN` / unicidade.

**Lei do crédito:** se o `credit` precisa dizer o que a foto **não** é (país errado, processo errado, prova invertida), a foto já falhou — troque a imagem; não “honeste” o erro no texto.

## 6. Superfícies de dados / UI

| Superfície | Papel |
|---|---|
| `src/data/case-visual-assets.json` | manifesto — photo exclusiva, source, credit |
| `src/lib/case-media.ts` | `primaryImageForCase` / logo |
| `CaseResearchExplorer.tsx` | card do catálogo |
| `PublicCaseCard.astro` | arquivo público |
| `scripts/fetch-case-photos.mjs` | download 1600×900 |
| `company-media.json` | loja/logo institucional (pode alimentar fit; não libera reuso de capa) |
| `/og/casos/:slug.png` | **só** Open Graph / share — nunca hero on-page; gerado por `og:build` **com a mesma `photo` exclusiva** embutida (não tipografia vazia) |

## 7. Checklist (igual à disciplina do tom)

- [ ] Régua vale para **todo** o catálogo — não só o caso em edição
- [ ] Foto bate nos 10 traços de identidade
- [ ] Segue a fórmula Claim → VISUAL_NOUN → exclusividade
- [ ] Sem reuso de path / source / quase-duplicata
- [ ] Sem prova invertida nem setor-coringa
- [ ] Sem retrato inventado / pessoa ameaçada exposta
- [ ] `credit` + `photo_source` honestos; `is_incident_photo` correto
- [ ] Todo ID tem `photo` real em `/media/` (validators falham sem arquivo)
- [ ] Nenhuma página POL/EXT/PLAT/história renderiza `/og/` como `<img>` principal
- [ ] Sustenta a pergunta confrontacional (skill de tom)
- [ ] Rubrica ≥ 4/5 — se falhar, outra foto, não placeholder

## Fluxo curto de execução

1. Ler headline + deck + fontes do ID  
2. Preencher bloco CLAIM…UNIQUENESS  
3. Buscar candidato (Commons / Agência Brasil / dossiê / mídia institucional)  
4. Grep manifesto — rejeitar colisão  
5. Rubrica + gate de honestidade  
6. Gravar arquivo novo + atualizar entrada do ID  
7. `npm run verify:case-actions` (+ `check` se for publicar)

## Arquivos

- Anti-padrões: [references/anti-patterns.md](references/anti-patterns.md)
- Rubrica: [references/selection-rubric.md](references/selection-rubric.md)
- Fonte/segurança/unicidade: [references/source-and-safety.md](references/source-and-safety.md)
- Falhas do LLM: [llm-failure-modes.md](llm-failure-modes.md)
- Anti-exemplos visuais: [assets/anti-examples/](assets/anti-examples/)
- Always-on portable: [references/always-on.md](references/always-on.md) · `AGENTS.md` §31b
- Adapter Cursor: `.cursor/rules/casoaberto-case-illustration.mdc`
