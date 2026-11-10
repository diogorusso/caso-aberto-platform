-- Private, access-controlled civic collaboration. No public publishing tables or uploads.
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS causes (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL,
 title TEXT NOT NULL,
 objective TEXT NOT NULL,
 domain TEXT NOT NULL CHECK(domain IN ('consumo','comunidade','servico-publico','plataformas','outro')),
 jurisdiction TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'em-preparacao' CHECK(status IN ('em-preparacao','em-acompanhamento','respondida','encerrada')),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 version INTEGER NOT NULL DEFAULT 1,
 privacy_class TEXT NOT NULL DEFAULT 'restricted' CHECK(privacy_class='restricted')
);
CREATE TABLE IF NOT EXISTS memberships (
 cause_id TEXT NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
 actor_id TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('owner','editor','viewer')),
 consented_at TEXT NOT NULL,
 consent_version TEXT NOT NULL DEFAULT 'v1',
 revoked_at TEXT,
 PRIMARY KEY (cause_id,actor_id)
);
CREATE INDEX IF NOT EXISTS membership_actor ON memberships(actor_id,revoked_at,cause_id);
CREATE TABLE IF NOT EXISTS cause_tasks (
 id TEXT PRIMARY KEY,
 cause_id TEXT NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 due_date TEXT,
 done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)),
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tasks_cause ON cause_tasks(cause_id,created_at);
CREATE TABLE IF NOT EXISTS cause_evidence (
 id TEXT PRIMARY KEY,
 cause_id TEXT NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 source_url TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('relato','documento','resposta','decisao','analise')),
 observation TEXT NOT NULL DEFAULT '',
 limitation TEXT NOT NULL DEFAULT '',
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS evidence_cause ON cause_evidence(cause_id,created_at);
CREATE TABLE IF NOT EXISTS cause_requests (
 id TEXT PRIMARY KEY,
 cause_id TEXT NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 institution TEXT NOT NULL,
 question TEXT NOT NULL,
 due_date TEXT,
 status TEXT NOT NULL DEFAULT 'rascunho' CHECK(status IN ('rascunho','enviada-externamente','respondida','encerrada')),
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS requests_cause ON cause_requests(cause_id,created_at);
CREATE TABLE IF NOT EXISTS cause_invites (
 token_hash TEXT PRIMARY KEY,
 cause_id TEXT NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role IN ('editor','viewer')),
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 used_at TEXT,
 used_by TEXT
);
CREATE INDEX IF NOT EXISTS invites_cause ON cause_invites(cause_id,expires_at,used_at);
CREATE TABLE IF NOT EXISTS audit_events (
 id TEXT PRIMARY KEY,
 cause_id TEXT NOT NULL REFERENCES causes(id) ON DELETE CASCADE,
 actor_id TEXT NOT NULL,
 action TEXT NOT NULL,
 object_id TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_cause ON audit_events(cause_id,created_at);
