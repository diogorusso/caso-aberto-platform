# CasoAberto — embalagem privada de produto educacional

**Status:** ferramenta offline de criptografia para cursos concluídos e revisados em um ambiente privado. **Não é venda, matrícula, conta de aluno, entrega paga nem lançamento do curso.**

## Fronteira de segurança

A obra principal de 56 capítulos permanece no repositório privado e não é importada pelo site. Os materiais autorais revisados para cada produto precisam estar em um diretório privado FORA do checkout público. A saída criptografada também precisa permanecer FORA deste checkout, em outro diretório existente, separado da origem.

A chave de 32 bytes aleatórios de AES-256-GCM deve ser fornecida pela variável de ambiente CASOABERTO_EDUCATION_KEY_B64 (base64 canônico). Nunca escreva a chave em Git, em logs, em mensagens, no manifesto nem na linha de comando. Use um gerenciador de segredos e mantenha backups privados: a perda da chave impede a leitura dos materiais.

## Como preparar e testar uma release

O comando abaixo exige autorização explícita e dois caminhos absolutos fora do repositório público. Ajuste para os diretórios que já existem no seu computador, depois de concluir revisão editorial, direitos autorais, dados pessoais e acessibilidade.

    npm run course:package -- --product=pegadas-digitais --release=v1 --source=/diretorio/privado/curso-revisado --out=/diretorio/seguro/releases --approve-private-export

Para verificar o pacote sem escrever seus arquivos em texto claro:

    npm run course:verify -- --package=/diretorio/seguro/releases/pegadas-digitais-v1.enc.json --manifest=/diretorio/seguro/releases/pegadas-digitais-v1.manifest.json

A geração aplica limites de tamanho e tipo, não segue links simbólicos, rejeita arquivos ocultos, criptografa com AES-256-GCM e nonce aleatório, grava em modo 0600 e produz manifesto contendo apenas produto, versão, contagem de arquivos, tamanho e hash. A verificação autentica o pacote e confere os hashes internos. Arquivos individuais e conteúdo não aparecem nos logs.

**Limite operacional da v1:** até 300 arquivos, tamanho total de entrada até 64 MiB, tipologias de documentos, imagens e textos listadas em scripts/private-course-core.mjs. Não substitui criptografia e controle de acesso no servidor, auditoria externa, política de retenção ou revisão de privacidade.

## O que a ferramenta NÃO entrega

- Não vende, recebe pagamentos, cadastra estudantes, envia e-mails ou fornece URLs de download.
- Não gerencia direitos por aluno, cópias já entregues, revogação posterior, mecanismos de DRM ou reembolsos.
- Não cria materiais didáticos do nada; a origem precisa ser um produto revisado, não uma cópia automática do playbook.
- Não publica nenhuma release criptografada ou documento privado no Astro.

## Gate comercial antes de liberar matrícula

1. Concluir cada curso, direitos, fonte, exercícios, acessibilidade e atendimento ao aluno.
2. Preparar releases criptografadas verificadas em armazenamento privado, com backups.
3. Implementar identidade, login e entitlement de servidor por aluno/produto/versão, revogação e suporte.
4. Integrar checkout real e recebimento de eventos verificados no servidor, com idempotência, tributos e reembolso.
5. Entregar conteúdos protegidos mediante autorização efetiva, logs minimizados e URLs temporárias; avaliar segurança e LGPD.
6. Somente após as etapas anteriores, atualizar o catálogo público para anunciar disponibilidade comercial comprovada.

## Validação

- npm run verify:course-crypto — testes de criptografia autenticada, adulteração, chave incorreta e arquivos maliciosos.
- npm run build — executa o gate npm run verify:public-bundle depois do Astro build, impedindo arquivos internos e caminhos do playbook em dist/.

O gate técnico não substitui a avaliação editorial contra vazamento semântico do material premium.
