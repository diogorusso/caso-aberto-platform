# CA-001 — preparo de documentos privados para análise

Este projeto publica somente **índices e referências**, não contratos ou comprovantes bancários originais. Os documentos do consumidor não devem ser enviados ao GitHub nem ao diretório `public/`.

## Estrutura local recomendada

Crie no computador do titular, fora do repositório público, uma pasta:

- `evidence-private/originais/contrato/`
- `evidence-private/originais/pagamentos/`
- `evidence-private/originais/cronologia/`
- `evidence-private/originais/mensagens/`
- `evidence-private/originais/notificacao/`
- `evidence-private/originais/custos/`
- `evidence-private/originais/protocolos/`

A pasta `evidence-private/` está no `.gitignore`. No entanto, **é preferível que os originais não fiquem dentro do repositório**; o gitignore não protege contra commits forçados ou compartilhamentos externos.

## Gerar manifesto SHA-256

```bash
node scripts/build-evidence-manifest.mjs /caminho/para/originais /caminho/privado/manifestos
```

O comando gera `.json` e `.csv` com nome relativo, tamanho, modificação do filesystem e hash SHA-256 de cada arquivo. O script não faz upload, rede nem modificação dos originais. O relatório de hashes serve para detectar alterações posteriores e não autentica os eventos narrados.

## Índice público de evidências

- Página: `/casos/florense-ipanema-rj-atraso-moveis-planejados/evidencias/`
- CSV estático: `/casos/florense-ipanema-rj-atraso-moveis-planejados/indice-evidencias.csv`
- IDs estáveis: `CA001-E001` a `CA001-E016`

O pacote de apoio à análise profissional diferencia:
- **A reunir:** originais privados que o titular ainda precisa separar.
- **Documento fornecido:** notificação apresentada no histórico; original integral não publicado.
- **Público localizado:** link de terceiro ou fonte oficial, sujeito a atualização.
- **Protocolo informado:** número fornecido pelo titular, pendente de comprovante documental.

## Exportações para imprensa e processo

Use a versão de impressão da página de evidências para salvar PDF pelo navegador, e o CSV para organizar documentos por ID. O kit de mídia inclui fact sheet TXT e SVGs em `public/media/`.

Nenhum desses arquivos substitui documento original, certidão, cópia autenticada ou trabalho pericial. Documentos privados devem circular apenas por canais autorizados com os dados pessoais pertinentes protegidos.

## Conferência da pessoa jurídica contratada

Antes de concluir a cadeia de responsabilidade, conferir razão social e CNPJ no contrato, na NF e no beneficiário do pagamento. Cadastro com endereço coincidente não é prova de que a empresa foi contratada. Fonte oficial para emissão de certidões CNPJ/QSA: https://www.gov.br/pt-br/servicos/consultar-cadastro-nacional-de-pessoas-juridicas
