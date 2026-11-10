# CasoAberto — Civic operating system, research institute and digital autonomy school

Status: first public vertical slice implemented on branch `feat/civic-platform-institute-and-digital-autonomy` · 2026-11-09. Implementation details below are a **roadmap** unless marked shipped. The platform currently ships static HTML via Astro / Cloudflare Pages; it has no runtime user accounts, database, uploads, cause workspaces, agents or personal analytics.

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

Archive of earlier deep research: **“Meta e as eleições brasileiras de 2026: linha do tempo documentada, arquivo de evidências e kit de publicação”**, closed 2026-10-23. It describes 25 dated entries and classes A–D. The public observatory starts with a smaller five-source sample independently cross-checked on 2026-11-09, including a Meta statement updated 2026-11-06. Do not pretend the 25-entry CSV was imported or its files are present here.

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

## Content factory: SEO, public tools, products and lead magnets

A content item is not a thin pSEO permutation. It has a distinct user question, research evidence, practical action and revision date. Example source-to-content graph:

```text
Evidence / wiki chapter (private) → source register and factual review
→ canonical public explainer + reproducible mini-lab
→ question-specific SEO articles + FAQ with original value
→ free printable worksheet / audit checklist / CSV / decision tree
→ optional workshop, advanced research pack or paid service
→ correction and feedback → updated research source map
```

Initial free tool: `/autonomia-digital/diagnostico/`. Do not claim email lead capture, completed purchases, or live membership. For future opt-in email: double opt-in, limited purpose, opt-out and no sensitive political belief profiling. Keep essential rights guides freely available. Monetization candidates: professional training, research subscriptions with nonexclusive public findings, community workshops, transparent sponsorship and contract research with editorial independence rules.

### Roadmap and acceptance

**P0 — shipped in this branch:** public institute and organizing framing, accessible static content routes, primary-source-based Meta observatory, fingerprinting guide entry, self-assessment worksheet, navigation/home/footer, documentation. No behavior tracking or external-service dependency.

**P1 — research operations:** expand 25-event timeline *only after rechecking each link*, downloadable cited CSV, claim/source validation, correction history, case-topic template, print-ready PDF option, transparent contact/request workflow (manual first), original SEO explainers based on 56-chapter source map.

**P2 — consenting organizing spaces:** auth, protected intake, multi-cause workspaces, role review, evidence privacy views, member approvals, tasks, action calendar, request/reply ledger, data deletion/export. Gate on security and governance testing.

**P3 — reproducible institute + AI:** ingestion adapters, source provenance, datasets/code versioning, measurable algorithmic audits, lab protocol registry, editorial approvals and live status dashboards. Independent validation before impact or causal claims.

Release tests: `npm run verify:data && npm run check && npm run build`; keyboard navigation; no unexpected tracking; all external source links resolve; no private originals in Git; no broken previously published slugs; public claims dated/attributed; no “working” login or action buttons for unavailable functionality. Local commands must actually be run in a capable environment before merging.
