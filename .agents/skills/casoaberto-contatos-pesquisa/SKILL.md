---
name: casoaberto-contatos-pesquisa
description: Pesquisa documental profunda de contatos públicos e distribuição responsável para qualquer caso CasoAberto, com pacotes compactos para agentes de contexto pequeno.
---
# CasoAberto · investigação de canais e ações por caso

## Propósito e precedência
Repositório: `diogorusso/caso-aberto-platform`. Leia `AGENTS.md`, a skill `casoaberto-pt-br-tom` e a política de revisão do caso. A voz é incisiva, documental e baseada em fatos — nunca invente crime, insolvência, responsabilidade ou desfecho. Não substitua a revisão factual por uma frase impactante.

## Entrada mínima e harness
1. Selecione exatamente um ID de `src/lib/case-catalog.ts`; não carregue o arquivo integral dos 24 casos no contexto.
2. Execute `npm run contact:packet -- --case EXT-004`. A saída tem até ~6 KB, fontes iniciais e lacunas. Se não houver shell, leia apenas o registro relevante do arquivo canônico e a entrada da cobertura.
3. Carregue a cápsula de caso (`npm run case:review -- --case <ID>`) **somente se precisar** verificar fato/estágio ou material novo. Troque cápsula, não histórico completo.
4. Investigue via primárias por alvo: site institucional, rodapé, página contato, suporte, ouvidoria, comunicado, CNPJ correspondente, recuperação judicial e canais regulatórios/judiciais competentes. Vá a fontes independentes para contraponto, mas nunca aceite número de WhatsApp encontrado em agregador sem confirmar na fonte institucional.
5. Quando há lacuna, escreva `nenhum canal específico confirmado`; não preencha com perfil social homônimo, número pessoal, URL adivinhada ou e-mail sugerido.
6. Atualize `src/data/case-contact-directory.json` e, conforme caso, a base canônica de fatos. Registre `source_url`, `verified_at`, objetivo, tipo, natureza institucional e correspondência exata com o caso. Diferencie fabricante, franquia, contratante, serviço, administrador judicial e competência pública.
7. Execute `npm run verify:contact-directory && npm run verify:data && npm run check && npm run build` quando ambiente disponível. Publicação final apenas após revisão humana, commit e deploy verificados.

## Profundidade de investigação — trilhas verificáveis
- **Direto**: página oficial de contato, SAC, WhatsApp Business público (número verificado), endereço de suporte, e-mail institucional, portal de pedido, ouvidoria, imprensa/RI quando pertinente.
- **Indireto**: Procon por UF e município, consumidor.gov com empresa participante, órgão regulador, MPT/MP/defensoria quando COMPETENTES, tribunal/processo público real, administrador judicial e orientação a credores, pedidos de informação Fala.BR a órgão competente. Sem presumir competência.
- **Social**: conta verificada no domínio oficial; Instagram, Facebook, LinkedIn, X, YouTube, TikTok apenas quando há origem comprovada. Rede social não é substituta de SAC nem protocolo.
- **Conexões**: matriz parte contratante → empresa/marca → unidade → órgão competente → processo administrativo/judicial → fontes/alterações, cada aresta com prova e data; não atribuir culpa por laço societário.
- **Recortes**: situação histórica vs corrente, fato vs relato, reclamação vs decisão, compra nova vs crédito concursal, pessoa exposta/ameaçada vs órgão institucional.
- **Comunicação**: cinco ângulos da skill de tom, mas mensagens publicáveis só com afirmações ligadas à ficha. Todo texto pede providência ou pergunta específica e oferece o link completo. Modelos de atendimento em primeira pessoa exigem preenchimento pela pessoa que viveu o fato; compartilhamento público nunca finge ser vítima.
- **Design**: dados renderizados estaticamente; mensagem editável; WA prefill apenas em número oficial que aceita contato, bots iniciam com "Oi"; mailto com assunto/corpo; rede abre o perfil sem alegar que legenda foi postada; imagem 4:5 com URL verificável; texto copiado pelo visitante.

## Plano de investigação para agentes pequenos
Separar quatro passes sem inflar contexto: (A) identidade e fonte oficial; (B) canais e competência; (C) minuta pública/documental; (D) revisão adversarial (homônimo, número falso, estágio desatualizado, sujeito errado). Um agente entrega só `case_id`, URLs novas, trechos atribuídos, datas, campos alterados e pendências; o seguinte não precisa reabrir todo o repositório. Faça buscas adicionais quando faltar prova — teto de tokens é orçamento, não licença para invenção.

## Limites de distribuição
Não localizar contatos privados de pessoas físicas nem expor familiares, funcionários ou testemunhas; não criar listas de alvos para abordagens repetidas; não gerar exércitos de mensagens, autoenvio, publicação automática ou assédio coordenado. Os links iniciam **um rascunho voluntário**, não enviam mensagens. Os canais oficiais são para solicitações pertinentes, nunca para campanhas em massa. Para casos POL e ameaças, limitar ação a documentação, transparência e órgãos competentes, sem persuasão política personalizada.
