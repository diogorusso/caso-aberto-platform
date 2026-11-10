# CasoAberto — Civic operating system, research institute and digital autonomy school

Status: public institute, curated education catalog and an **individual local-first Cause Workspace** ship through Astro/React on Cloudflare Pages. The private Cause Collaboration API candidate (`services/cause-api/`) and the offline premium-course packager ship in-repo with fail-closed tests; they are **not** live production services. No public server-side login, uploads, autonomous agents or behavioral profiling are attached to the Astro site. Owner-authorized Cloudflare Access/D1/Stripe launch remains an ops checklist outside the public backlog.

## Product mandate

Build public capacity for **investigation, self-defense, organization, evidence-grounded accountability, and independent digital participation**. Three connected products:

1. **Institute:** source-led case dossier, datasets, research protocols, audit logs, repeatable public findings. Scope spans consumer, local community, platform governance and institutional decisions.
2. **Citizen organization:** verified requests, collective coordination by consent, public action materials, deadlines, response tracking and correction/appeal. Legal civic pressure is not harassment, flooding inboxes, identity exposure, impersonation or fabricated consensus.
3. **Digital autonomy school:** stepwise curriculum, practical labs, printable self-audits, teach-the-teacher, advanced technical reference; self-defense and understanding platform power. Based on Douglas Rushkoff's original 10 lenses (time, place, choice, complexity, scale, identity, social, fact, openness, purpose) and newer AI-relevant analyses, not a claim that our reinterpretations are verbatim quotes.

### Audience and differentiated journeys

- **Individual:** verify problem → preserve evidence → request remedy → publish only consenting material → track response.
- **Community:** define common problem → consent/roles → joint evidence ledger → vote/approve neutral public requests → distribute → record outcomes.
- **Institutional accountability:** map laws/contracts/budgets/actions → public-data request and provenance → versioned findings → record official reply.
- **Digital rights / platforms:** document loss of access, moderation and ad transparency → categorize evidence/metrics → independent assessment and reproducibility → resource list and appeals.

Never infer anyone's party, religion, ideology, health, or other sensitive attributes from their involvement in a cause. No profiling for political influence, electoral microtargeting or undisclosed behavioral persuasion.

## Existing assets to reuse, not rebuild

- `src/data/casos.json`, `relatos.json`, `evidence-index.json`: case and evidence ledgers.
- `src/data/brands.json`, `company-profiles.json`, `precedents.json`: company and historical institutional context. The terms bankrupt, recovery, closure and a single complaint remain distinct.
- `src/data/action-scenarios.json`, `print-kits.json`: public response planning and printed action tools. `/kit-boca-a-boca/` already exists.
- `src/components/ImpactSimulator.tsx`: correctly isolates scenarios from observed outcomes. Do not reuse simulation results as facts.
- `src/data/platform-observatory.json`: selected dated records of external research and statements, with scope and limitations; **not** an original CasoAberto dataset or confirmed party-specific interference.
- Public routes `/instituto/`, `/organizar/`, `/autonomia-digital/`, `/autonomia-digital/diagnostico/`, `/observatorio/plataformas/` provide the initial static, readable surfaces.

## Primary source material held in the private wiki

Repository: `diogorusso/obsidian-to-html`. Do not publish the private wiki's full manuscripts directly; create fresh public PT-BR derivatives, confirm reuse rights for third-party material, verify live sources and add review dates.

| Capability | Research location |
| --- | --- |
| Full curriculum v0.9, 56 chapters | `wiki/playbooks/digital-autonomy-and-fraud-defense/index.md` |
| Fingerprinting and adtech | `.../03-tracking-adtech-and-fingerprinting.md`, `.../48-identification-engineering-and-fingerprint-mathematics.md` |
| Algorithms and experiments | `.../05-recommenders-feeds-and-algorithm-control.md`, `.../19-causal-algorithm-audit-research.md`, `.../44-algorithmic-path-dependence-and-feed-control.md` |
| AI permissions and model limits | `.../21-agentic-data-security-and-privacy-engineering.md`, `.../50-what-models-can-infer-memorize-and-prove.md` |
| Relational privacy and backfire | `.../39-revocation-is-a-distributed-state-change.md`, `.../53-privacy-without-participation-and-relational-exposure.md`, `.../55-the-privacy-audit-that-proves-the-wrong-thing.md` |
| Pedagogy, science, original references | `.../25-research-method-evidence-register-and-learning-assessment.md`, `.../_meta/source-map.md`, `.../38-algorithmic-literacy-equity-and-teaching-evidence.md` |
| Rushkoff and programming agency | `wiki/playbooks/past-data-future-creation/32-program-or-be-programmed-ten-digital-biases-in-ai.md`, `33-value-the-human-rushkoffs-eleventh-command.md` |

Archive of earlier deep research: **“Meta e as eleições brasileiras de 2026: linha do tempo documentada, arquivo de evidências e kit de publicação”**, closed 2026-10-23. The public observatory now carries **25 independently re-verified records** in `src/data/platform-observatory.json` (reviewed 2026-11-10), with evidence classes, review cadence, right-of-reply notes, JSON/CSV export and on-page filters. Private archive originals stay out of this checkout; each public row links only to HTTPS primary sources.

### Editorial method and publication contract

Each meaningful factual assertion has `claim_id`, `source_id`, `date_event`, `date_accessed`, `scope`, `unit/denominator`, `source_type`, `status`, `limitations`, `right_of_reply` and `review_due`. Distinguish:
- **Observed/documented** first-party record and third-party study.
- **Alleged/requested** claims in legal actions or complaints.
- **Official decision** with court, docket, instance and procedural stage.
- **Company response** with source and publication time.
- **Analysis** with explicit methodology and assumptions.
- **Simulation** with input controls and no implication of measurement.

Every published cause is versioned; amendments do not silently erase prior versions. Protected people can request correction, redaction and response. Public data is constrained by necessity, consent and verification—not everything legally accessible belongs on a searchable profile. Protect reporter safety, contacts and household relational data. Avoid leaking location, EXIF, phone, metadata or identity via files/QR codes.

## Target schema for the full organizing platform (NOT YET SHIPPED)

```text
Actor { id, public_alias, verified_private_identity?, roles, consent_receipts }
Organization { id, type, declared_purpose, moderation_policy, funding_disclosures }
Cause { id, title, domain, jurisdiction, status, owner_org_id, visibility, escalation_policy }
Membership { cause_id, actor_id, role, consent_scope, joined_at, revoked_at }
Claim { id, cause_id, subject_entity_id, kind, exact_text, status, date, reviewer_id }
Source { id, uri, retrieved_at, license, source_type, sha256, private_storage_ref? }
ClaimSource { claim_id, source_id, support_role, quote_location, uncertainty }
PublicRequest { id, cause_id, target_entity_id, published_at, questions, due_at }
Response { request_id, source_id, received_at, verified_status }
Action { id, cause_id, type, public_copy, consent_scope, approval_status, review_at }
Task { id, cause_id, assignee_id?, status, due_at, audit_event_id }
Correction { id, claim_id, action, public_reason, timestamp, reviewer_id }
ResearchRun { id, protocol_version, dataset_version, input_hash, code_ref, reviewer_id }
AuditEvent { id, actor_id, event_type, object_ref, diff_hash, time }
```

### AI-assisted workflows (human-governed)

Public sources ingestion → deduplication / URL provenance → PII redaction → classifier suggests event/claim type → extraction of exact source claims and dates → contradictory-source discovery → independent checks → **human approve** → publication build → monitored review due / corrigenda.

No LLM autonomous public accusation or mass distribution. No fake replies, fake signatures, bot floods, auto-DMs, scraping private groups, or AI-generated impersonation. AI can draft structured source-backed content and recommend different nonpartisan civic actions, but a real reviewer approves external dissemination. Tool permissions and publication controls must exist in deterministic code outside prompts.

### Later-stage infrastructure security gate

Do not bolt an accounts API onto the static public Pages app. A later authenticated private workspace requires separate service and threat model: per-tenant authorization at API/data/storage boundaries, explicit scopes and consent revocation, encrypted private data with retention controls, audit/event log, rate limits and abuse reporting, encrypted object storage, scoped AI connectors, async job queue, human checkpoints, breach response and independent security review. Keep public build separate from private case files. Maintain safe defaults for journalists, activists, whistleblowers and children.

## Private educational IP and content distribution — owner direction (2026-11-09)

**The entire 56-chapter playbook is the core information product.** It must stay private; publishing it section by section on the SEO site would cannibalize the offering. Do not bundle it, its exhaustive chapter synopses, instructor guides, complete labs, answer keys, advanced algorithms or original private PDFs into the public Astro build. The public repository cannot act as the premium vault.

A staged, multi-output research-to-content model:

- **Private source layer** — complete chapter content, historical notes, primary-source register, deep explanations, methods, advanced labs, exercise solutions, product lesson files, facilitator packs. Access restricted to approved editors.
- **Public discovery** — a unique user question plus original explanatory insight, one safe action, one limitation and traceable external sources. These snippets target discoverable search intent; they are not back-to-back extracts from the chapter.
- **Public lead magnets** — a one-page checklist, introductory worksheet, locally run self-audit or printable organizer. Do not require account or identity profiling; email opt-in is not implemented.
- **Educational products** — packaged progressive courses, differentiated outcomes, full practical labs, instructor guides, technical demonstrations, review exercises, practice data, recurring updated editions.
- **Distribution adaptations** — social cards, short clips scripts, newsletters, FAQs and community handouts derived from the PUBLIC insight, manually reviewed. `src/data/content-distribution-queue.json` has 12 draft angles, not published outreach.
- **Institution evidence** — still freely accessible: source-led public datasets, case accountability, factual corrections and essential civic-rights guidance.

The `scripts/validate-publications.mjs` gate caps public snippet size and verifies product mappings, sources, deadlines and the absence of paid checkouts. Content editorial QA must additionally check semantic overlap, appropriate attribution, privacy and research scope; automated size checks alone cannot prevent manuscript reconstruction.

Routes: `/academia/`, `/academia/:slug/`, `/autonomia-digital/guias/`, `/autonomia-digital/guias/:slug/`, `/autonomia-digital/ferramentas/:slug/`. Existing original free guides stay accessible.

**Future paid delivery is not shipped:** only release a complete course through a separate authenticated service with encrypted restricted artifacts, scoped entitlement, validated checkout, refunds and retention/legal disclosures. The public site may advertise verified products but never embed private full text, paid PDFs or license keys in JavaScript or HTML.

## Content factory: SEO, public tools, products and lead magnets

A content item is not a thin pSEO permutation. It has a distinct user question, research evidence, practical action and revision date. Example source-to-content graph:

```text
Evidence / wiki chapter (private) → source register and factual review
→ reviewed public insight + safe starter exercise
→ question-specific SEO articles + FAQ with original value
→ free printable worksheet / audit checklist / CSV / decision tree
→ protected full curriculum and differentiated educational products
→ correction and feedback → updated research source map
```

Initial free tool: `/autonomia-digital/diagnostico/`. Do not claim email lead capture, completed purchases, or live membership. For future opt-in email: double opt-in, limited purpose, opt-out and no sensitive political belief profiling. Keep essential rights guides freely available. Monetization candidates: professional training, research subscriptions with nonexclusive public findings, community workshops, transparent sponsorship and contract research with editorial independence rules.

### Roadmap and acceptance

**P0 — shipped in this branch:** public institute and organizing framing, accessible static content routes, primary-source-based Meta observatory, fingerprinting guide entry, self-assessment worksheet, navigation/home/footer, documentation. No behavior tracking or external-service dependency.

**P1 — research operations:** expand 25-event timeline *only after rechecking each link*, downloadable cited CSV, claim/source validation, correction history, case-topic template, print-ready PDF option, transparent contact/request workflow (manual first), original SEO explainers based on 56-chapter source map.

**P2 — consenting organizing spaces:** auth, protected intake, multi-cause workspaces, role review, evidence privacy views, member approvals, tasks, action calendar, request/reply ledger, data deletion/export. Gate on security and governance testing.

**P3 — reproducible institute + AI:** ingestion adapters, source provenance, datasets/code versioning, measurable algorithmic audits, lab protocol registry, editorial approvals and live status dashboards. Independent validation before impact or causal claims.

Release tests: `npm run verify:data && npm run check && npm run build`; keyboard navigation; no unexpected tracking; all external source links resolve; no private originals in Git; no broken previously published slugs; public claims dated/attributed; no “working” login or action buttons for unavailable functionality. Local commands must actually be run in a capable environment before merging.

## Local-first organization capabilities (shipped)

`/organizar/espaco-de-causa/` supports multiple user-owned causes, evidence links, public request drafts, status journal, shared task list/board/month calendar, JSON portability, opt-in localStorage backup and an editable prompt export for outside AI assistants. All task views share task IDs and deadlines. AI brief generation is **only text**; copying is an explicit user action. No app service receives this text. Do not copy sensitive data to an outside provider without independent user approval. Local browser storage is not an encrypted vault or a protected multi-user workspace.

## Secure collaboration backend foundation (source only, undeployed)

The cause-api service under services/cause-api/ now includes separate Worker+D1 source, database migration, Cloudflare Access JWT signature and audience checks, pseudonymous identities, per-cause read/edit roles, single-use hashed invitations, opt-in membership, revocation, local audit events, private evidence links, tasks and institutional request drafts. It has no deployed hostname or database. It is NOT wired into public Astro and cannot be used for real participation until consent, data deletion/retention, staging, moderation, operational security and independently verified private Access deployment are completed. Member causes and draft messages are never automatically published or distributed.

The public local-first Workspace remains useful without accounts and intentionally sends no data. This separate service is the first tested architectural boundary toward private multi-user work, not a finished social network.
