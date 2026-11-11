# Falhas típicas do LLM — ilustração CasoAberto

Espelho de `casoaberto-pt-br-tom/llm-failure-modes.md`: quando o modelo “ajuda demais”, a imagem quebra o produto. Detectar → nomear → voltar à fórmula.

| Falha | Sintoma | Correção |
|---|---|---|
| **Stock-coringa** | Mesma Brasília / urna / estádio / plateia para vários IDs | `VISUAL_NOUN` do mecanismo; foto exclusiva |
| **Prova invertida** | Foto prova o oposto do headline | Trocar cena; não “explicar no credit” |
| **Logo-muleta** | Fit fraco justificado pelo chip de marca | Teste sem logo; rejeitar se só o logo salva |
| **Categoria ≠ claim** | “É compras online → pacote” / “É política → Congresso” | Ler o verbo do dossiê, não a tag |
| **Reuso silencioso** | Mesmo path ou mesmo Commons File em dois IDs | Hard fail `image-reuse`; novo arquivo + nova fonte |
| **Crop cosmético** | Mesma cena, outro enquadramento, “agora é outra” | Continua reuso; escolher outra cena |
| **Bonito demais** | Foto turística / RP / folder que ameniza o risco | Preferir consequência e cobrança visual |
| **Drama sem documento** | Ritual, sangue, close íntimo, ameaça textual na imagem | Segurança + registro coletivo creditado ou OG |
| **Retrato fabricado** | Gerar rosto de vítima / ameaçado / cliente | Stop absoluto |
| **Incidente falso** | `is_incident_photo: true` em stock | Manter `false` + credit de ilustração |
| **Só um caso caprichado** | Florense/CA-001 ok; resto genérico | Régua de plataforma — falhou o skill |
| **Absolvição visual** | Imagem que “tudo resolvido / marca feliz” contra status aberto | Sustentar a pergunta confrontacional |
| **Confundir skills** | Trocar gráfico/KPI quando pediram capa | Rotear para visual-data-storytelling; aqui só foto |

## Frases do agente que já sinalizam falha

- “Usei uma imagem genérica do setor por enquanto”
- “O logo deixa claro que é da empresa”
- “É o mesmo Congresso, mas serve para os dois”
- “Gerei um rosto ilustrativo”
- “Qualquer foto de show funciona para ingresso”

Apagar a escolha. Regenerar pela Lei #0 + fórmula + checklist da skill.
