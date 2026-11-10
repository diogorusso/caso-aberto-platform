---
name: casoaberto-investigacao-politica
description: Pesquisa documental e due diligence de casos públicos brasileiros, com agentes, empresas, clubes, contratos, processos, cronologias e contraditório.
---
# CasoAberto / investigação política profunda

## Quando executar
Ative quando o dono disser: "pesquise", "aprofundar", "investigar", "mapear os nomes", "quem está por trás", "bets", "poder político", "emendas", "violência política" ou "faça a due diligence" no CasoAberto.

**Repositório obrigatório:** `diogorusso/caso-aberto-platform`. Preserve a plataforma Astro estática e os dossiês existentes. Não use `diogorusso/obsidian-to-html` como destino. Inspecione README, AGENTS, `src/data/political-observatory.json`, rotas e validação antes da primeira alteração.

## Roteiro executável pela conversa
1. Fixe recorte e data de consulta, identifique nomes que parecem incorretos e confirme a pessoa em fontes independentes; nunca substitua um nome por hipótese silenciosamente. A fonte sobre segurança eleitoral de novembro de 2026 trata de **Ana Elisa Santos Silva**, não de alguém chamada "Anelisa".
2. Procure fonte primária de cada evento: diário oficial/Congresso, STF/TSE/MPF/PF/CGU/TCU, regulador, contratos de clubes, manifestações das partes. Pesquise notícias recentes para localizar atualizações, mas não trate reedição da mesma nota como fontes independentes.
3. Separe oito campos: documento, fato, data do fato, data de publicação, autor/emissor, interessado/contraditório, estágio (denúncia/inquérito/denúncia formal/decisão/recurso/trânsito) e limite da inferência.
4. Mapeie relações **com verbo e fonte**: "patrocinou", "registrado como operador", "apresentou pedido", "investiga", "afirmou". Proíba arestas vagas como "ligado a esquema" sem prova específica. Nomeie somente agentes públicos ou entidades cuja identificação é necessária e devidamente publicada.
5. No setor de bets, reconcilie marca, pessoa jurídica, CNPJ, registro da SPA **anterior** à MP, clube, contrato, vigência, publicidade, ação judicial, participação processual e efeito real. Não confunda patrocínio com crime; não presume que marca permaneceu após proibição.
6. Leia posições contrárias e manifeste conflito de fontes. Em violência eleitoral, não publique ameaças completas, dados de familiares, contatos, endereços ou rotinas de segurança. Evite generalizar responsabilização coletiva por partido.
7. Publique texto original em PT-BR: fatos verificáveis, perguntas abertas, cronologia, atores por papel, situação processual, ponto de checagem, fontes e limitações.
8. Execute o verificador dos dados e `npm run check && npm run build` em ambiente com Node/dependências. Alterações são feitas em `src/data/political-observatory.json`; não duplicar páginas manuais por caso.
9. Relate paths alterados, commit, verificação e se Cloudflare realmente publicou. Nunca diga que uma pendência foi solucionada apenas porque foi incluída no atlas.

## Entrega mínima
Dossiê por questão substanciado com pelo menos duas fontes rastreáveis, três fatos atribuídos, cronologia, papéis, perguntas relevantes e limites. A profundidade deve priorizar documentos sobre número de manchetes. Se a evidência é insuficiente, publique a questão como pergunta ou registre como lacuna de pesquisa, não como fato estabelecido.

## Pesquisa neutra e direitos
Ferramentas cívicas para consulta voluntária, respostas institucionais e acompanhamento por qualquer pessoa. Nada de perfilagem política, segmentação de eleitores, pressão automatizada ou mensagens dirigidas para perseguir indivíduos. Usar direito de resposta e correções com histórico.