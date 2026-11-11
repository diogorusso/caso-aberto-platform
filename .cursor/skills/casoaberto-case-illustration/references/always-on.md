# Always-on — ilustração CasoAberto (todos os agentes)

**Canonical always-on for every host:** `AGENTS.md` §31b.

This file is the portable brief those hosts should treat as standing orders whenever editing cases, cards, media, or `case-visual-assets.json`. It is **not** Cursor-only.

| Host | How this stays on |
|---|---|
| Any agent reading the repo | `AGENTS.md` §31b (required) |
| Cursor | also `.cursor/rules/casoaberto-case-illustration.mdc` (adapter) |
| Claude Code / Codex / Antigravity / npx skills | discover skill via `.agents/skills/casoaberto-case-illustration/` (and/or `.cursor/skills/` sibling) |
| OpenAI Skills API | attach this skill package by path |

## Standing orders (execute — do not soften)

1. **Platform-wide:** same imagery discipline for every case and story — not only the featured investigation.
2. **Claim fit:** cover shows the documented mechanism/consequence. Category stock is failure.
3. **Never repeat:** one exclusive `photo` + `photo_source` per `case_id`/story. No shared path, Commons `File:`, or near-duplicate scene.
4. **Logo ≠ proof:** brand chip cannot rescue a mismatched photo. Same-brand logos may repeat; covers must not.
5. **Honesty:** credit + source required; `is_incident_photo` only for verified incident photos.
6. **Safety:** no invented faces, no threatened-person portraits, no ornamentalizing communities.
7. **Voice pair:** image sustains §31 confrontational question; never contradicts it.
8. **Real photo always on-page:** every case/story MUST have an exclusive `/media/` `photo` for catalog cards, heroes and dossier figures. **Never** ship OG typographic placeholders as the on-page image (POL/EXT/PLAT/histórias included). `/og/` is **share/meta only**.
9. **OG share cards embed the photo:** `npm run og:build` must composite the same exclusive `/media/` cover into every `/og/casos|historias/*.png` (plus logo plate when available) — never regenerate text-only share art when a photo exists.
10. **No ethical unique photo?** Keep searching Commons / Agência Brasil / institutional arenas that fit the claim — do not “solve” with OG on the page. If a candidate fails safety, choose another arena photo; only leave `photo` empty while actively sourcing (validators must fail publish).
11. **No apology credit:** if `credit` must say what the photo is *not* (wrong country, wrong organ, inverted proof), reject and replace — do not keep a StubHub/storefront/crowd mule for a Brazilian Senacon claim.
12. **No floating logo chip above the H1:** brand mark belongs in the photo figcaption / recognition plate, never as a white rectangle between eyebrow and headline.

Full workflow: parent `SKILL.md`. Anti-patterns: `anti-patterns.md`. Rubric: `selection-rubric.md`. Sources: `source-and-safety.md`.
