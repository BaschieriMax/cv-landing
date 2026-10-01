# Decision Log — zunstant.test (ex cv-landing)

Voci ricostruite a posteriori da `CLAUDE.md` e dal codice esistente,
per adattare la skill `full-stack-project-architect` a questo progetto
già avviato. Da qui in avanti, ogni nuova decisione architetturale va
aggiunta in coda con lo stesso formato — non si cancellano le voci
passate, solo marcate `Superseded`.

## Formato

```text
Decision:
X

Date:
YYYY-MM-DD

Context:
...

Decision:
...

Alternatives:
...

Motivation:
...

Status:
Proposed / Approved / Superseded
```

## Voci

```text
Decision:
DEC-001 — CSS puro, nessun framework

Date:
2026-09-10 (retroattiva)

Context:
Landing page piccola, stile editoriale sobrio già definito (palette
ink/paper/gold, tipografia Source Serif 4 + IBM Plex Sans).

Decision:
CSS puro con variabili CSS (src/variables.css) per i design token,
nessun Tailwind/Bootstrap.

Alternatives:
Tailwind — più tooling del necessario per un progetto di questa
dimensione e stile.

Motivation:
Preferenza permanente del profilo per progetti piccoli; stile
editoriale non si presta a utility-first.

Status:
Approved
```

```text
Decision:
DEC-002 — React Router v8 con createBrowserRouter, non react-router-dom/BrowserRouter

Date:
2026-09-10 (retroattiva)

Context:
Evoluzione di cv-landing (JS puro, routing semplice) verso un progetto
TS con route protette da autenticazione.

Decision:
`createBrowserRouter` + `RouterProvider` da `react-router`/`react-router/dom`,
con layout dedicati (`AuthLayout`) e `errorElement` per route sensibili.

Alternatives:
`BrowserRouter` classico — meno adatto a gate di autenticazione e
error boundary per route.

Motivation:
Coerente con la preferenza permanente del profilo (routing con
createBrowserRouter, layout separati per area, ErrorBoundary dove
sensato).

Status:
Approved
```

```text
Decision:
DEC-003 — Autenticazione Supabase (non JWT custom) [Superseded da DEC-007]

Date:
2026-09-10 (retroattiva)

Context:
Serve proteggere /questionario dietro login senza costruire un
backend proprio per un progetto di questa dimensione.

Decision:
Supabase Auth (email/password) + tabella `users` collegata via
`auth_id`, stato in Zustand (`src/store/auth.ts`).

Alternatives:
JWT custom con backend ASP.NET Core — preferenza permanente del
profilo, ma qui aggiungerebbe un intero backend solo per
autenticazione su una landing page/wizard, sproporzionato.

Motivation:
Nessun bisogno di un backend applicativo per altro; Supabase copre
auth + persistenza minima (profilo utente) a costo/complessità
molto più bassi.

Status:
Superseded (vedi DEC-007)
```

```text
Decision:
DEC-004 — RLS tabella `users` ristretta a auth.uid() = auth_id

Date:
2026-09 (retroattiva, prima della data esatta non tracciata)

Context:
Policy SELECT iniziale era `qual: true` per il ruolo `public`:
chiunque avesse la chiave pubblica Supabase poteva leggere nome ed
email di tutti gli utenti registrati.

Decision:
`PolicyViewUser` (SELECT) ristretta a `auth.uid() = auth_id` per il
ruolo `authenticated`, simmetrica a INSERT/UPDATE.

Alternatives:
Nessuna: policy permissiva era un difetto di sicurezza, non una
scelta di design da confrontare con alternative.

Motivation:
Evitare esposizione di dati personali di tutti gli utenti registrati.

Status:
Approved
```

```text
Decision:
DEC-005 — Pagamento tramite bonifico, comunicato fuori banda

Date:
2026-09-03 (retroattiva)

Context:
Fase di validazione dell'attività di CV writing, prima di aprire
partita IVA.

Decision:
Pagamento tramite bonifico bancario, comunicato verbalmente durante
la call con il cliente — nessun metodo di pagamento visibile sul sito.

Alternatives:
PayPal/Stripe — rimandati a quando (e se) l'attività richiederà
partita IVA.

Motivation:
Testare l'attività senza costi/burocrazia iniziali finché non c'è
validazione del mercato. Vedi [[project_pagamento_bonifico]].

Status:
Approved
```

```text
Decision:
DEC-006 — GitHub Pages come deploy di backup temporaneo di Netlify

Date:
2026-09-15 (da commit "aggiunge deploy su GitHub Pages come backup
temporaneo di Netlify")

Context:
Netlify è l'hosting principale attuale; serve un canale di backup nel
caso di problemi con Netlify.

Decision:
Workflow GitHub Actions per deploy su GitHub Pages, con `basename` su
`createBrowserRouter` per servire correttamente da sottopercorso.

Alternatives:
Nessun backup — rischio di downtime totale se Netlify ha problemi.

Motivation:
Ridondanza a costo zero. Esplicitamente marcato "temporaneo": da
rivedere quale sarà il canale definitivo prima del lancio reale (vedi
Open Question in project-overview.md).

Status:
Approved (temporanea — rivedere, vedi TD-005)
```

```text
Decision:
DEC-007 — Rimozione autenticazione Supabase da /questionario (supersede DEC-003)

Date:
2026-10-01

Context:
/questionario era protetta da login/signup Supabase (DEC-003): un
cliente già contattato doveva creare un account con password per
compilare un questionario una tantum, senza alcun beneficio reale
(nessuna area utente/dashboard a cui tornare). Massimo ha segnalato che
è una frizione ingiustificata nel funnel di conversione.

Decision:
Rimossa completamente l'infrastruttura di autenticazione: `AuthLayout`,
`login-form-zod` (+ `form-zod`), `store/auth.ts`, `utils/supabase.ts`,
`utils/auth-errors.ts`, `model/user.ts`, `schema/login-form-schema.ts`,
e le dipendenze `@supabase/supabase-js`, `@supabase/ssr`, `zustand`,
`zod`, `react-hook-form`, `@hookform/resolvers` (nessun altro file le
usava). `/questionario` torna una route pubblica diretta in
`router.tsx`, come `/`. L'header del questionario perde il saluto
personalizzato e il pulsante "Esci", torna al testo statico originale
("Massimo Baschieri" + sottotitolo).

Alternatives:
(A) Togliere solo il gate, lasciare l'infra di auth spenta per un
eventuale uso futuro — scartata: tech debt senza beneficio attuale,
rischio di confusione futura su codice morto.
(B) Link monouso/token invece di un vero account — scartata:
sproporzionata per il volume attuale di clienti, richiede sviluppo
nuovo per risolvere un problema che si risolve rimuovendo il gate.

Motivation:
Nessun bisogno reale di un account utente per un form compilato una
sola volta dopo un contatto diretto già avvenuto (call/email). Rimuove
anche superficie di attacco, dipendenze e complessità non necessarie
per un progetto di questa dimensione.

Status:
Approved
```

## Note

Le decisioni sopra sono ricostruite dal codice/CLAUDE.md esistenti, non
prese in una sessione di Fase 1 con Massimo: se in una futura
conversazione emerge che il contesto reale era diverso, correggere la
voce invece di aggiungerne una nuova in conflitto.
