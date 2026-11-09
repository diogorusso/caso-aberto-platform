# Identidade visual, CNPJs contratuais e fontes

## Imagens reutilizáveis
Arquivo: `src/data/company-media.json`. Componentes: `CompanyIdentityHero.astro`, `CompanyRecognitionGallery.astro`, `CaseCompanyReference.astro`.
Cada foto de unidade tem src, alt, URL original, crédito, endereço e data de coleta. Data da fotografia desconhecida não é apresentada como fotografia recente ou prova do conflito.
Logotipos e fotos hospedados externamente continuam de propriedade de seus titulares e devem indicar a origem.
Website screenshots só podem ser apresentados como capturados após arquivamento de uma captura real, com URL, data UTC, arquivo e metadados. Enquanto isso, `src:null`, `status:pending_verified_capture` e link para o site oficial; não criar imagens fictícias.

## Empresas efetivamente contratadas
Arquivo: `src/data/case-contract-entities.json`. Para CA-001 há dois papéis: `FABRICANTE_CONTRATO` e `MONTADORA_CONTRATO`.
Enquanto a razão social e o CNPJ do documento não forem verificados, `display_name`, `cnpj`, `verified_at` e `verification_source_url` permanecem null e directors fica vazio.
Depois de comparar contrato, NF e pagamento, adicionar os dois CNPJs, conferir QSA com fontes datadas e listar administradores apenas dessas entidades. Não atribuir o caso a sócios de outras sociedades pelo nome da marca ou endereço.
Documentos pessoais e comprovantes integrais devem ficar privados.

## Hierarquia de páginas
Perfil corporativo: identificação/logo/foto -> recomendação e KPIs -> casos e reclamações -> fontes e CNPJ -> galeria e evidências -> resposta institucional.
A home da plataforma permanece neutra. Avaliações editoriais sobre contratações precisam citar caso, recorte, data e fontes. Alerta ao consumidor segue o canon autorizado — zero disclaimers do LLM.

## Validação
Executar `npm run verify:data`, `npm run check` e `npm run build`. A validação impede screenshots fictícios marcados como arquivados e administradores associados a CNPJs ainda não confirmados.
