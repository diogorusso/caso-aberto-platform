# Fontes, licença e segurança — capas CasoAberto

## Fontes preferidas (nessa ordem)

1. **Já citada no dossiê** — se a reportagem/órgão publicou foto reutilizável com crédito claro
2. **Wikimedia Commons** — API `commons.wikimedia.org/w/api.php` (ver `scripts/fetch-case-photos.mjs`)
3. **Agência Brasil / EBC** — CDN público com crédito do fotógrafo
4. **Material institucional da marca** já catalogado em `company-media.json` (loja/logo com `source_url`)
5. **OG tipográfico** gerado no repo — quando nenhuma foto ética passa a rubrica

User-Agent do bot local: `CasoAbertoBot/1.0 (civic research; media archival; contact via GitHub issues)`.

## Unicidade — nunca repetir imagem

Regra dura do manifesto (`case-visual-assets.json` notes): cada caso e cada história tem foto própria. **Nunca** repetir o mesmo arquivo entre entradas.

Conta como reuso proibido:

| Tipo | Exemplo | Ação |
| --- | --- | --- |
| Mesmo `photo` path | Dois IDs com `/media/institutions/congresso-photo.jpg` | Hard fail |
| Mesmo `photo_source` / File Commons | Dois IDs apontando para o mesmo `File:...` | Hard fail |
| Quase-duplicata | Mesmo Congresso/Planalto/estádio com crop diferente | Hard fail — escolher outra cena |
| Sobrescrita de arquivo | Gravar novo JPEG no path que outro ID já usa | Hard fail — novo path |
| Logo compartilhado | Vários casos Florense/Yeesco com o mesmo `logo` | **Permitido** (só logo) |
| OG tipográfico por slug | `/og/casos/:slug.png` distinto por entrada | OK (não é foto reutilizada) |

Antes de gravar: grepar o manifesto por `photo` e `photo_source` do candidato. Se já existir em outro `case_id`, descartar.

Anti-padrão: `image-reuse` (ver `anti-patterns.md`).

## Campos obrigatórios no manifesto

```json
{
  "case_id": "EXT-003",
  "photo": "/media/yeesco/yeesco-photo.jpg",
  "photo_source": "https://commons.wikimedia.org/wiki/File:...",
  "credit": "Descrição honesta + autor/origem + se é ilustração temática",
  "logo": "/media/yeesco/yeesco-logo.png",
  "logo_source": "https://...",
  "is_incident_photo": false
}
```

- `photo` e `photo_source` **exclusivos** no arquivo inteiro
- Nunca marcar `is_incident_photo: true` para Commons genérico ou ilustração temática
- No `credit`, dizer explicitamente quando **não** é o produto/incidente do relato

## Hard limits (AGENTS + pesquisa política)

- Não inventar vítima, rosto, deepfake ou “foto do cliente”
- Não publicar retrato de pessoa sob ameaça (ex.: violência política) nem dados de rotina/endereço
- Povos indígenas: só registro público coletivo com crédito e data; sem ornamentalizar ritual; sem localizar comunidade vulnerável além do já público e necessário
- Não reproduzir ameaças textuais na imagem
- Patrocínio de bets ≠ prova de crime; a foto ilustra relação econômica/publicitária documentada
- Não hotlink manuscript privado; não copiar foto jornalística sem base de reuso
- Paraphrase jornalismo; não reimprimir charge/foto de agência comercial sem direito

## Pipeline técnico

1. Escolher File: no Commons **ou** URL Agência Brasil
2. Adicionar job em `scripts/fetch-case-photos.mjs` **ou** baixar com sharp 1600×900 `cover`/`centre`
3. Gravar em `public/media/<pasta>/`
4. Atualizar `src/data/case-visual-assets.json`
5. `npm run verify:case-actions` (exige asset por caso de pesquisa; `is_incident_photo` false salvo verificado)
6. Conferir card em `CaseResearchExplorer` — a imagem vem de `entry.image` / `primaryImageForCase`

## Open Graph (`/og/`) — só meta social, nunca on-page

`/og/casos/:slug.png` exists for WhatsApp/X/LinkedIn share and `<meta property="og:image">` only. It is **not** an on-page cover. If you lack an ethical unique photo:

- keep searching Commons / Agência Brasil / institutional arenas that fit the claim
- reject unsafe candidates; pick another arena photo — do not publish OG as the dossier figure
- if the only strong visual would expose a threatened person, use a safe institutional arena instead

Better a hard search for a claim-fit licensed photo than a lying stock image or an on-page OG placeholder.

## Relação com logos

O chip de logo no canto **não** corrige foto errada. Teste sempre com logo coberto. Logo de bets em caso institucional genérico é `logo-crutches`. Brasão da República em todo POL-xxx é aceitável como identidade institucional, mas a **foto** ainda precisa diferenciar os sete dossiês.
