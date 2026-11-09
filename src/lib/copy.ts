/**
 * CasoAberto — PT-BR copy deck for case and company surfaces.
 *
 * Voice: a consumer union in public dispute. Short, direct, collective ("nós", "junte-se"),
 * imperative calls to action. Pressure always lands on the company's obligation to answer.
 *
 * Legal skill (platform-wide tone — FTUE, app, every case, not one dossier):
 * `.cursor/skills/casoaberto-pt-br-tom/`
 * Example register: Florense/Roma canon lines. ZERO DISCLAIMERS — legal-only.
 *
 * Hard limits (AGENTS.md §5, §22, §26–27, §30) — aggressive ≠ invent:
 *  - consumer claims keep attribution ("segundo o consumidor", "relatado");
 *  - no "golpe", "fraude", "calote", "estelionato", crime or bad-faith imputation;
 *  - never assert as fact that a company went bankrupt without a decree;
 *  - rhetorical Roma risk on alert surfaces is authorized; LLM-made disclaimers are not;
 *  - a resolution gets the same prominence as the complaint.
 *
 * Markup owns layout; this file owns words. Components read from `copy.*`, never literals.
 */

const dmy = (iso: string) => iso.split('-').reverse().join('/');

export const copy = {
  /* ───────────── Case page ───────────── */
  case: {
    hero: {
      eyebrow: (id: string) => `COBRANÇA PÚBLICA · CASO ${id}`,
      primaryCta: 'Junte-se à cobrança',
      secondaryCta: 'Ver as provas',
      metrics: {
        paid: 'Pago pelo consumidor',
        paidNote: 'Valor relatado e documentado no dossiê',
        promised: 'Prazo prometido',
        status: (iso: string) => `Situação em ${dmy(iso)}`,
        notInformed: 'Não informado',
      },
    },
    summary: {
      eyebrow: 'O CASO',
      title: 'Pagou tudo. Ficou sem os móveis.',
      impactLabel: 'O prejuízo, segundo o consumidor:',
      timelineLink: 'Ver a cronologia, data por data',
    },
    status: {
      eyebrow: 'SITUAÇÃO ATUAL',
      body: (iso: string) => `Situação em ${dmy(iso)}. Se a empresa resolver, publicamos — com o mesmo destaque desta cobrança.`,
      laterDeadline: 'Nova previsão (contestada pelo consumidor)',
      procon: 'Procon/RJ',
      category: 'Categoria · Local',
    },
    demands: {
      eyebrow: 'EXIGIMOS',
      title: 'O que a empresa deve fazer. Sem rodeios.',
      description: 'Cada exigência tem base em documento. Quando for cumprida, registramos aqui.',
    },
    warning: {
      eyebrow: 'ALERTA AO CONSUMIDOR',
      title: 'Não compre enquanto este caso estiver aberto.',
    },
    discourse: {
      eyebrow: 'DISCURSO × REALIDADE',
      title: 'Nas entrevistas: 12% acima da meta e excelência no pós-venda. Na casa do consumidor: prazo estourado.',
      description: 'Falas oficiais, com data e fonte, lado a lado com as perguntas que este pedido deixou sem resposta. Marketing vende confiança. Na entrega, a empresa precisa demonstrá-la.',
    },
    others: {
      eyebrow: 'OUTRAS VOZES',
      title: 'Ele não é o único a reclamar.',
      description: 'Registros públicos de Ipanema e de outras unidades, cada um com sua situação — inclusive os resolvidos.',
      sourceLink: 'Fonte original',
      allLink: 'Ver todas as reclamações',
    },
    questions: {
      eyebrow: 'SEM RESPOSTA',
      title: 'A empresa ainda não respondeu. Perguntamos de novo.',
    },
    updates: {
      eyebrow: 'ÚLTIMAS MOVIMENTAÇÕES',
      title: 'O caso está vivo. E nós estamos acompanhando.',
      allLink: 'Histórico completo',
    },
    sections: {
      eyebrow: 'SIGA O CASO',
      title: 'Tudo o que sustenta esta cobrança.',
    },
    nextStep: 'Próximo passo',
  },

  /* ───────────── Verdict (case, brand, unit) ───────────── */
  verdict: {
    eyebrow: (subject: string, iso: string) => `NOSSA POSIÇÃO · ${subject} · ${dmy(iso)}`,
    scopeLabel: 'Vale para:',
    evidenceLink: 'Ver as provas',
    methodLink: 'Como decidimos',
    romaCaseLink: 'Processo de falência da Roma Mobili',
    romaVideoLink: 'Vídeo: o caso Roma',
    basisTitle: 'Por que dizemos não',
    basisTitleNeutral: 'Em que nos baseamos',
    triggersTitle: 'Para mudar essa posição, a empresa precisa:',
    footnote: '',
  },

  /* ───────────── Company and unit pages ───────────── */
  company: {
    hero: {
      titleSuffix: ': o histórico, os casos e quem responde.',
      primaryCta: 'Ver o caso documentado',
      secondaryCta: 'Ver as reclamações',
      kpis: {
        paid: 'Pago e não entregue (relatado)',
        paidNote: 'Nos casos abertos contra a marca',
        waiting: 'Dias de espera',
        waitingNote: 'Desde o pagamento, até a última revisão',
        complaints: 'Reclamações catalogadas',
        complaintsUnit: 'Contra a unidade',
        complaintsBrand: 'Nos casos vinculados',
        sources: 'Fontes independentes',
        sourcesNote: 'URLs distintas no dossiê',
      },
      photoPending: 'Imagem do estabelecimento em verificação',
    },
    why: {
      eyebrow: 'POR QUE ESSA POSIÇÃO',
      title: 'Nossa posição tem documento, data e condição para mudar.',
      body: 'O caso de Ipanema sustenta a posição atual. A marca que vende é a mesma. Prestígio não é garantia.',
    },
    unitWhy: {
      eyebrow: 'A UNIDADE · IPANEMA',
      title: (paid: string) => `${paid} pagos, segundo o consumidor. Os móveis? Até agora, não chegaram.`,
      body: (iso: string) => `Na revisão de ${dmy(iso)}, o consumidor relatava atraso, equipe que não apareceu e pendências mesmo depois de notificar a empresa. À vista ou parcelado, tanto faz: o problema é a entrega que não aconteceu.`,
      questionsTitle: 'Perguntas sem resposta',
    },
    matrix: {
      eyebrow: 'O HISTÓRICO',
      titleBrand: 'Casos abertos e reclamações contra a marca',
      titleUnit: 'Casos abertos e reclamações contra a unidade',
      description: 'Cada caso aberto tem dossiê próprio. Reclamações de outras plataformas aparecem separadas, com local, data e situação — sem somar o que não pode ser somado.',
      stats: { cases: 'Casos abertos', complaints: 'Reclamações externas', places: 'Localidades', reviewed: 'Última revisão' },
      paid: 'Pago, segundo o consumidor',
      status: 'Situação na última revisão',
      reviewed: 'Última revisão',
      caseLink: 'Abrir o caso',
    },
    profiles: {
      brandTitle: 'Quem está por trás da marca: CNPJs e sócios',
      unitTitle: 'Empresa registrada no endereço da loja — não necessariamente a que assinou o contrato',
    },
    ranking: {
      brandTitle: 'Onde a marca e suas unidades aparecem no nosso placar',
      unitTitle: 'Onde esta unidade aparece no nosso placar',
    },
    answer: {
      eyebrow: (brand: string) => `A PALAVRA É DA ${brand.toLocaleUpperCase('pt-BR')}`,
      title: (brand: string) => `${brand}, o consumidor está esperando. Nós também.`,
      body: 'As perguntas estão publicadas, com documentos. Qualquer resposta verificável, solução ou atualização será registrada aqui — com o mesmo destaque desta cobrança.',
      pressLink: 'Perguntas à empresa e kit de imprensa',
    },
    more: {
      eyebrow: 'CONTINUE',
      directory: 'Outras empresas avaliadas',
      notRecommended: 'Empresas que não recomendamos',
      topics: 'Problemas por tipo',
    },
  },

  /* ───────────── Shared blocks ───────────── */
  participation: {
    eyebrow: 'JUNTE-SE',
    title: 'Sozinho, você é um protocolo. Juntos, somos um problema que a empresa precisa resolver.',
    body: 'Também foi prejudicado por esta empresa? Conte o que aconteceu, com links públicos. Cada relato verificado aumenta a pressão. Publicamos só o que for revisado, com o seu consentimento e sem expor seus dados.',
    checklist: [
      'Você decide: anônimo ou identificado',
      'Links públicos primeiro (Reclame Aqui, Procon, notícias)',
      'Nada de documento privado por este canal',
    ],
    primaryCta: 'Quero entrar na cobrança',
    secondaryCta: 'Ver quem já reclamou',
    note: 'Canal provisório por e-mail. Apoios só entram na contagem depois de revisão humana — nunca inflamos números.',
  },
  share: {
    eyebrow: 'O SILÊNCIO PROTEGE A EMPRESA',
    title: 'Compartilhe. Cada pessoa avisada é um consumidor a menos correndo esse risco.',
    body: 'Mande para quem está pensando em comprar móveis planejados. Com fontes, sem boato.',
    share: 'Compartilhar o caso',
    whatsapp: 'Mandar no WhatsApp',
    copied: 'Link copiado ✓',
  },
  metrics: {
    complaints: 'Reclamações públicas indexadas',
    sources: 'Fontes primárias citadas',
    updates: 'Atualizações do caso',
    responses: 'Respostas da empresa até agora',
    supports: 'Apoios verificados',
    audience: 'Pageviews / visitantes',
    audiencePending: 'Ainda sem medição pública',
    note: 'Contadores de audiência só aparecem com exportação documentada — nunca números inventados.',
  },
  companyRef: {
    eyebrow: 'EMPRESA COBRADA NESTE CASO',
    link: 'Perfil, CNPJ e histórico da empresa',
    photoCaption: 'Imagem da unidade divulgada pela marca',
  },
  /* ───────────── Reconhecimento visual da marca (logo + loja + selo) ───────────── */
  recognition: {
    eyebrow: 'RECONHEÇA ANTES DE CONTRATAR',
    title: 'A marca e a loja que você precisa identificar.',
    description: 'Logotipo e fachada divulgados pela própria empresa, ao lado da nossa posição editorial. São imagens de referência — não são foto do conflito relatado.',
    badgeFallback: 'Não recomendamos',
    logoLabel: 'Logotipo da marca',
    storePending: 'Foto do estabelecimento em verificação. Não usamos imagem de outra loja para representar esta unidade.',
    photoCaption: 'Imagem de referência divulgada pela marca ou pela unidade. Não é fotografia do ocorrido.',
    photoDateUnknown: 'Data da fotografia não confirmada pela marca.',
    sourceLabel: 'Fonte da imagem',
    cta: 'Ver por que não recomendamos',
    disclaimer: '',
  },
  ratingCard: { link: 'Ver por quê', impact: 'Impacto em números', cases: (n: number) => `${n} caso(s) aberto(s)` },
  riskWarning: { kicker: 'ALERTA AO CONSUMIDOR', link: 'Ler o alerta completo' },

  /* ───────────── O risco documentado (sem palancas, sem previsão) ───────────── */
  risk: {
    eyebrow: 'O RISCO, DOCUMENTADO',
    title: 'Já vimos esse filme.',
    /** N and X come from src/lib/precedents.ts (bankruptcyDurationSummary), never typed here. */
    lead: (cases: number, avgDays: number) =>
      `Atrasos, remarcações e consumidor sem resposta. Em ${cases} casos do setor terminou em falência decretada — em média ${avgDays} dias depois do primeiro sinal público identificado em cada um.`,
    signalsTitle: 'Os sinais que antecederam o colapso estão documentados.',
    signalsBody: 'Roma Mobili, Lojas KD, Kitchens, Grupo Toky, Marabraz, Três Irmãos e Planearte. Veja quais desses sinais já aparecem neste caso.',
    paidQuestion: 'Pagou R$ 190 mil. Não recebeu. Não teve resposta. Você assumiria esse risco?',
    noBuy: 'Não compre enquanto este caso estiver aberto.',
    matrix: {
      eyebrow: 'SINAIS ANTES DO COLAPSO',
      title: 'Os mesmos sinais, lado a lado com quem quebrou.',
      description: 'Comparação de sinais públicos em empresas de móveis e decoração. Cada célula tem data e fonte — ou fica explicitamente em branco.',
      caption: 'Os mesmos sinais públicos. Roma quebrou. Será que você quer correr o risco? Melhor buscar outro fornecedor.',
      columnCase: 'Caso Florense Ipanema',
      documented: 'documentado',
      notDocumented: 'não documentado',
      sourceLabel: 'Fonte',
      openPrecedent: 'Ver o caso completo',
      barsTitle: 'Do primeiro sinal público ao desfecho',
      barsNote: 'Cada barra nomeia as duas datas verificadas. Estágios distintos: reclamação, recuperação judicial, encerramento, falência decretada.',
      days: (n: number) => `${n} dias`,
      noEndpoint: 'Sem decreto de falência no arquivo',
      endpointRecovery: 'deferimento da recuperação judicial',
      stageFalencia: 'falência decretada',
      stageRecuperacao: 'recuperação judicial',
      stageEncerramento: 'encerramento operacional',
    },
    escalation: {
      eyebrow: 'ESCALADA DA COBRANÇA',
      title: 'O que a empresa perde a cada degrau.',
      description: 'Não é previsão. É o que já está documentado e o que a lei e o histórico do setor mostram como possível.',
      daysWithoutReply: (n: number) => `${n} dias sem resposta`,
      daysLabel: 'Dias sem resposta até a última revisão',
      statusDone: 'já aconteceu',
      statusPossible: 'possibilidade documentada',
      losesLabel: 'O que a empresa perde',
      effectSource: 'Fonte do efeito',
    },
    headlines: [
      'Não assuma esse risco.',
      'Junte-se à cobrança.',
      'Nós cobramos. Você decide com os fatos.',
    ],
  },
} as const;

export type Copy = typeof copy;
