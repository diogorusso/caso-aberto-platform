# Rubrica de seleção de capa — CasoAberto

Pontue cada candidato de 0–1 em cinco eixos. **Mínimo para publicar: 4/5.** Empate → preferir honestidade + fonte rastreável.

## Eixos

### 1. Claim Fit (afirmação)

A foto ilustra o **mesmo verbo** do dossiê?

| Score | Critério |
| --- | --- |
| 1 | Verbo alinhado (não entregou; investiga; financia; rastreia; proíbe; ameaça→protege) |
| 0.5 | Tema vizinho (varejo quando o caso é RJ de móveis) |
| 0 | Setor genérico ou verbo oposto |

### 2. Consequence Fit (consequência)

Mostra o que está em risco para a pessoa/coletivo/instituição?

| Score | Critério |
| --- | --- |
| 1 | Consequência legível (dinheiro pago sem bem; serviço interrompido; direito obstado; disputa regulatória visível) |
| 0.5 | Contexto atmosférico fraco |
| 0 | Beleza ou drama sem consequência |

### 3. Actor Fit (atores)

Os atores certos aparecem **ou** a arena certa — sem culpar por associação?

| Score | Critério |
| --- | --- |
| 1 | Marca/órgão/comunidade correta, ou arena documental do caso |
| 0.5 | Ator parcial (clube sem bets; Congresso sem tema) |
| 0 | Ator errado ou logo salvando foto irrelevante |

### 4. Setting Fit (lugar do problema)

O cenário é onde o problema ocorre?

| Score | Critério |
| --- | --- |
| 1 | Porta/loja/rede/seção/órgão/contrato no universo do caso |
| 0.5 | Brasil genérico plausível |
| 0 | Cenário de outro país/setor sem disclaimer, ou stock clínico |

### 5. Honesty (honestidade editorial)

| Score | Critério |
| --- | --- |
| 1 | `credit` + `photo_source` verdadeiros; `is_incident_photo` correto; não finge ser o incidente |
| 0 | Crédito falso, foto incidente, retrato inventado, reuso silencioso |

## Teste de 10 segundos (obrigatório)

Mostre a foto **sem** título e **sem** logo a um leitor hipotético. Peça: “Que caso é este?”

- Se a resposta for só “futebol / Congresso / show / eleição / caixa” → falhou Claim Fit.
- Se a resposta citar o mecanismo (revenda, não-entrega, patrocínio de bets, rastreio de emenda, barreira de voto indígena) → passou.

## Matriz por família

| Família | Priorizar | Evitar |
| --- | --- | --- |
| CA / EXT consumo | Consequência do pedido/serviço | Stock de “produto feliz” |
| RJ varejo | Loja/marca real creditada ou operação | Sala genérica repetida |
| Eventos/ingressos | Revenda, bilheteria, fiscalização | Só plateia |
| Streaming/assinatura | TV/casa + mudança contratual | Propaganda da marca como prova |
| Utilities (luz/água) | Falha de serviço / infraestrutura | Paisagem turística |
| POL bets/clubes | Publicidade/patrocínio + rito institucional | Só estádio |
| POL orçamento | Controle/transparência/tema da emenda | Planalto coringa |
| POL violência política | Proteção/investigação **sem** vítima exposta | Retrato, ameaça textual, endereço |
| POL povos/voto | Acesso, território, registro coletivo creditado | Ritual ornamentado; urna isolada |
| PLAT plataformas | Sede/governança/produto da plataforma | Memes ou UI fabricada |

## Ficha de avaliação (copiar por candidato)

```text
case_id:
candidate_url_or_path:
claim_fit:     /1
consequence:   /1
actor_fit:     /1
setting_fit:   /1
honesty:       /1
TOTAL:         /5
anti_pattern_risk: [none | proof-inversion | sector-prop | atmosphere-not-mechanism | logo-crutches | generic-brasilia | crowd-not-enforcement | spectacle-over-investigation | image-reuse]
uniqueness_check: [pass | fail — list colliding case_id(s)]
decision: [accept | reject | og-fallback]
notes:
```

## Unicidade na rubrica

`Honesty` = 0 automaticamente se houver colisão de `photo`, `photo_source` ou quase-duplicata com outro ID — mesmo que Claim Fit seja alto. Sem unicidade não há `accept`.
