# Observatório de poder, dinheiro e direitos — CasoAberto

**Revisão inaugural:** 10/11/2026. Cada dossiê mantém também `reviewed_at` individual para que uma atualização de um caso não apareça como revisão de todos. **Destino:** repositório `diogorusso/caso-aberto-platform`, site estático Astro/Cloudflare Pages. A publicação de um registro não prova que o instituto conduziu investigação criminal ou contatou uma parte. É pesquisa documental sobre fontes públicas, com atualização editorial sob demanda.

## Arquitetura entregue

- Fonte estruturada: `src/data/political-observatory.json` — sete investigações, registro de fontes, índice de pessoas/instituições, vínculos documentais e fotografia histórica de 13 patrocínios da Série A.
- Índice SEO: `/observatorio/politica/`; páginas derivadas de `getStaticPaths()`: `/observatorio/politica/:slug/`.
- Reuso do `BaseLayout`, `CivicPageHeader`, identidade, utilitários Tailwind existentes, navegação institucional e links nos casos.
- Auditoria: `npm run verify:politics` valida IDs, datas, URLs, classificação das fontes, relações, cronologia, vigência histórica e exclusão de possíveis CPFs; `npm run verify:data` incorpora a checagem.
- Terminal offline: `npm run research:politics -- --list`, `--case POL-001` ou `--apply caminho/packet-revisado.json`.
- Três skills em `.cursor/skills/` para executar pesquisa, revisão e publicação ao solicitar pelo chat/agente.

## Dossiês e prioridades

| ID | Foco | Principais fatos | Sinal para próxima consulta |
| --- | --- | --- | --- |
| POL-001 | MP 1.394 e ADIs das bets | Proibição de apostas e patrocínios em 25/9, contestação judicial e tramitação parlamentar | Decisão ADIs; emendas e prazo legislativo de 23/11 |
| POL-002 | Flamengo, Betano e futebol | Contrato aprovado em 2025, operadora histórica Kaizen, pedido de `amicus curiae` | Admitido ou não na ADI; situação de contratos e publicidade após MP |
| POL-003 | Saída de Flávio Bolsonaro | Saída aos EUA reportada em 27/10; investigações no STF e versão do senador | Atos públicos da PF e STF, decisões e defesas |
| POL-004 | Ana Elisa e ameaças | Investigação da PF e proteção informada pelo MJSP | Desdobramentos oficiais sem detalhes operacionais de segurança |
| POL-005 | Violências pós-eleição a indígenas | Força-tarefa ministerial, denúncias atribuídas, 45 episódios do levantamento governamental | Procedimentos e resultados públicos, contagens com critérios comparáveis |
| POL-006 | Acessibilidade do voto indígena | Pedido do MPE sobre transporte e comunicação | Resposta e execução de providências do TSE |
| POL-007 | Emendas / ADPF 854 | Código único e auditorias de saúde conforme notícia do STF | Proposta e cronograma previstos para 30/11 |

### Entradas prioritárias ainda abertas

**Bets e clubes.** Cadastro de operadores antes da MP, identidade jurídica da marca, portarias e eventuais mudanças após a proibição; contratos máster e secundários; valores fixos versus variáveis versus repasses realizados; cláusulas de vigência e saída; presença de marcas substitutas; participação processual *efetivamente deferida*; sustentação oral; emendas parlamentares com autores e texto; resultado das ADIs. Para o Flamengo, distinguir a aprovação do acordo de 2025, posição do clube publicada em 30/9 e decisão posterior no processo. A lista dos 13 clubes foi extraída de reportagem de 18/9/2026: **não publicar como patrocinadores vigentes em novembro**.

**Quem está por trás?** Definir cadeia de evidência empresa → CNPJ/registro de regulador → marca → clube/contrato → ação judicial → fonte específica. A lista da Fazenda identifica Kaizen Gaming Brasil (CNPJ 46.786.961/0001-74) como operadora da Betano antes da MP. Isso não identifica, sozinho, o beneficiário final da empresa brasileira ou seus financiadores políticos. Uma cadeia de controle só deve ser adicionada depois de conferência de registro societário pertinente.

**Flávio Bolsonaro.** Arquivo público deve separar fato de viagem, medida cautelar, investigação sobre bets, investigação sobre filme e prova material. A imprensa relata Willer Tomaz, Alcazar Holdings e Daniel Vorcaro em contextos distintos; a proximidade de nomes não é culpa por associação. Registrar versões da defesa, esfera processual, número de cada procedimento quando público e eventual mudança de competência.

**Ameaças e direitos.** O caso da deputada eleita Ana Elisa deve privilegiar investigações e políticas de proteção sem publicar material que facilite perseguição. No caso indígena, apurar cada denúncia sem identificar vulneráveis, com notas dos ministérios e relatórios de organizações. O número de 13 denúncias referido na imprensa e os 45 episódios de violência política apresentados pelo governo possuem universo de coleta diferente; não somar. Acessibilidade do voto não é sinônimo de fraude eleitoral.

**Emendas.** Construir somente com dados públicos uma cadeia parlamentar → indicação → empenho → pagamento → recebedor → execução/entrega. Distinguir desvio documentado, uso não comprovado, recomposição administrativa e condenação final. Checar cada etapa em Siafi, Transferegov, ADPF 854 e notas de auditoria.

## Contrato de atualização sob demanda

O editor pode pedir diretamente no chat: **“Rode as atualizações do observatório político do CasoAberto: compare todos os casos com novas fontes, revise os dados, valide e publique no site estático.”** O agente deve acessar o GitHub no repositório, pesquisar as fontes externas atuais, comparar o registro e gravar somente alterações justificadas. A publicação ocorre por commit em `main` e a execução existente de GitHub Actions/Cloudflare Pages; não há monitor automático nem backend.

Exemplo de pacote de atualização revisado:

```json
{
  "case_id": "POL-001",
  "reviewed_at": "2026-11-10",
  "sources": [{
    "id": "ato-novo-id-unico",
    "title": "Órgão — nome e natureza do documento original",
    "url": "https://fonte-oficial.exemplo.gov.br/documento",
    "published_at": "2026-11-10",
    "kind": "Ato oficial"
  }],
  "facts": [{
    "finding": "Resumo rigoroso do que consta do documento, com sujeito, data, objeto e os limites da conclusão estabelecidos por um editor.",
    "source": "ato-novo-id-unico",
    "kind": "documentado"
  }],
  "timeline": [{
    "date": "2026-11-10",
    "title": "Novo ato publicado",
    "detail": "Descrição verificável do evento, sem presumir resultado além do ato documentado.",
    "source": "ato-novo-id-unico"
  }],
  "next_check": "Verificar o próximo ato oficial e sua data no registro de tramitação correspondente.",
  "editorial_review": {
    "approved": true,
    "reviewer": "IDENTIFICAÇÃO REAL DO EDITOR",
    "review_note": "Explicar quais fontes foram conferidas, quais limites aplicados e por que esta atualização pode ser publicada."
  }
}
```

O pacote é um **exemplo de estrutura, não uma alegação ou aprovação real**. A aprovação editorial do pacote é responsabilidade humana; scripts não verificam por si mesmos a autenticidade de uma fonte nem se o revisor é quem diz ser.

### Checagens antes de publicar

```bash
npm ci
npm run research:politics -- --list
npm run verify:politics
npm run verify:data
npm run check
npm run build
```

O script de revisão não liga para a rede, não faz buscas autônomas, não emite pedidos, não publica e não agenda monitoramento. Quando se realiza uma atualização efetiva via `--apply`, ele inclui fontes, fatos e eventos, ordena a cronologia e registra `revision_log`; a revisão visual, o commit e a confirmação do deploy são etapas separadas.

## Limites de uso cívico

A participação pública deve ser **voluntária e informativa**: links para fontes públicas, roteiros de pedido de informação e avaliação de respostas, sem coleta de preferência partidária, perfis políticos, campanhas de persuasão individualizada, assédio ou disparos em massa. A metodologia e direito de resposta continuam em `/sobre/criterios-de-publicacao/`. Proteção de vítimas, denunciantes e comunidades é requisito de publicação. A pesquisa histórica não equivale à situação em tempo real.
