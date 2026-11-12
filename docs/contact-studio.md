# CasoAberto · diretório de contatos e ações por caso

**Revisão inicial:** 12/11/2026. **Arquitetura:** Astro estático; sem backend, automação de envio, armazenamento de usuários ou credenciais.

## Superfícies
- `src/data/case-contact-directory.json`: endereços institucionais com origem, data, papel, escopo e associação por caso. Todos os 24 casos têm linha de auditoria; `partial` não significa esgotamento das buscas.
- `src/lib/case-contacts.ts`: gera, para cada ID, texto público atribuído, rascunho de atendimento, legenda Instagram e imagem 4:5.
- `src/components/islands/ActionDrawer.tsx`: edição local das mensagens, WhatsApp/Email de instituição verificada, perfis oficiais, protocolos e exportação. O navegador não envia nada sozinho.
- `scripts/generate-og-images.mjs`: gera no **build** `/share/instagram/<slug>.png` (1080×1350) para os 24 casos, usando as fotos exclusivas já creditadas no repositório.
- `scripts/case-contact-packet.mjs`: cápsula de pesquisa por ID para agente de janela pequena.
- `scripts/validate-case-contacts.mjs`: referências e formatos; use `npm run verify:contact-directory`.

## Etiquetas de escopo
**WhatsApp** só com número institucional identificado em fonte primária; bots podem requerer "Oi" antes de aceitar atendimento. **Email** só endereço institucional expresso. **Instagram** abre a conta: não existe API web de pré-preencher DM, comentário ou publicação arbitrária. Para postar o card, a pessoa salva o PNG e copia a legenda. **Portal** exige autenticação em alguns casos e não aceita texto pré-inserido; disponibilize um modelo copiável. **Órgãos públicos** estão no diretório `case-action-channels.json` e têm regras de competência específicas. **Processos judiciais** exigem consulta a número/tribunal reais, nunca roteamento por associação vaga.

## Lacunas reais
Os contatos encontrados inicialmente incluem Florense Ipanema, Enel, Light, Novo Mundo, Grão de Gente, 123milhas, Corsan, Ticketmaster, Tok&Stok, Mobly, Casas Bahia, Prime Video, viagogo, Yeesco e Grupo Lado. Os canais são de natureza distinta: formulário de SAC não é ouvidoria, telefone corporativo não é WhatsApp. Outros casos têm apenas rotas públicas regionais já registradas; não se criaram números ou perfis fictícios para preencher os 24. Os 7 casos POL e PLAT usam Fala.BR para informação pública no fluxo existente, quando houver órgão federal competente; os detalhes de cada órgão devem ser investigados individualmente.

## Fontes oficiais de contatos desta rodada
- Florense Ipanema: https://florense.com.br/franquias/ipanema
- Enel SP: https://www.enel.com.br/pt-saopaulo/atendimento.html
- Light: https://www.light.com.br/SitePages/home.aspx
- Corsan: https://www.corsan.com.br/canais-de-relacionamento/
- Novo Mundo: https://www.novomundo.com.br/atendimento
- Grão de Gente: https://www.graodegente.com.br/institucional/comunicado-ao-mercado/
- 123milhas: https://123milhas.custhelp.com/app/home
- 123milhas recuperação judicial: https://123milhas.custhelp.com/app/answers/detail/a_id/1223/~/como-fica-o-atendimento-ao-consumidor-durante-o-per%C3%ADodo-da-recupera%C3%A7%C3%A3o-judicial%3F
- viagogo: https://support.viagogo.com/br/articles/61000309344-falar-com-o-atendimento-ao-cliente

## Ação segura e preservação de evidência
Texto social atribui situação ao dossiê e indica data; uma decisão judicial antiga não vira acusação atual. E-mails de solicitação pedem resposta documentada de fato pessoal preenchido pelo remetente. A imagem é mídia de pesquisa, não retrato do incidente. Sem IP tracking, listas pessoais, envio automático, disparos em lote, uso indevido de canais de ética ou pressão sobre pessoas físicas. Monitorar correções e encerramentos pelo fluxo já existente.

- Yeesco (ouvidoria, não SAC comum): https://ouvidoria.yeesco.com.br/
- Lado Fit e Grupo Lado: https://www.ladofit.com.br/ e https://ladohelp.com.br/
- Mobly: https://www.mobly.com.br/auto-atendimento
