# Project Overview — zunstant.test (ex cv-landing)

Documento di riferimento per la skill `full-stack-project-architect`. A
differenza del template standard, questo progetto **non è nato con la
skill**: il documento è stato ricostruito a posteriori da `CLAUDE.md` e
dallo stato attuale del codice, per evitare di rifare la Discovery
(Fase 0) da zero a ogni richiamo della skill. Va aggiornato quando
cambiano decisioni architetturali — non serve riscriverlo da capo.

Data: 2026-10-01 · Dimensione: **piccolo** · Stato: Approvato (retroattivo)

## 1. PROJECT OVERVIEW
Landing page + area riservata per l'attività di CV writing e career
coaching di Massimo Baschieri (Sassuolo, MO). Evoluzione di
`cv-landing`: stesso contenuto/copy/design, con l'aggiunta di
un'autenticazione Supabase che protegge la route `/questionario`.
Sito originale senza auth: https://cvbaschieridev.netlify.app/

## 2. GOALS
Convertire visitatori in clienti paganti per i pacchetti di CV writing;
raccogliere i dati del cliente post-contatto tramite il questionario,
pubblico e raggiungibile via link diretto (DEC-007: nessun login
richiesto — vedi Decision Log).

## 3. TARGET USERS
Professionisti italiani in cerca di lavoro o cambio carriera.
Posizionamento: qualità professionale a prezzo accessibile, non
low-cost generico né coaching executive costoso.

## 4. USER JOURNEYS
- Visitatore → homepage (`/`) → form di contatto (Web3Forms) → contatto
  diretto con Massimo (call, pagamento bonifico comunicato a voce).
- Cliente già contattato → link diretto a `/questionario` → compila
  wizard a 6 step → invio via Web3Forms con messaggio strutturato.

## 5. FEATURES
- Homepage: hero, pacchetti/prezzi, form di contatto.
- Wizard questionario a 6 step (dati personali, obiettivo
  professionale, esperienze ripetibili, formazione, competenze, extra),
  pubblico — nessuna autenticazione (vedi DEC-007). Default
  precompilato su "Tipo di contratto" → "Tempo indeterminato"; gli
  altri campi a scelta soggettiva restano senza default per non
  falsare i dati che Massimo userà per il CV del cliente.
- Pagina 404 e gestione errori runtime per route.

Fuori scope per ora: pagamenti online, ruoli/permessi multipli,
dashboard admin.

## 6. PAGES
| Route | Accesso | Contenuto |
|---|---|---|
| `/` | Pubblica | Homepage, form di contatto |
| `/questionario` | Pubblica | Wizard a 6 step (vedi DEC-007) |
| `*` | Pubblica | 404 (`not-found.tsx`) |

## 7. FRONTEND ARCHITECTURE
React 19 + Vite + TypeScript (tipizzato, a differenza del cv-landing
originale in JS puro). React Router v8 (`createBrowserRouter` +
`RouterProvider`, non `react-router-dom`/`BrowserRouter`), tutte le
route pubbliche. TanStack React Query predisposto (provider in
`App.tsx`) ma non ancora usato per query specifiche — resta per
preferenza permanente del profilo, non per l'auth rimossa (DEC-007).
lucide-react per icone. Pagine lazy-loaded con helper `withSuspense`.
CSS puro, nessun framework. Dettaglio struttura cartelle: vedi
`CLAUDE.md` sezione "Struttura dei file".

## 8. BACKEND ARCHITECTURE
Nessun backend. Web3Forms gestisce l'invio email di contatto/
questionario come servizio esterno stateless. Nessun database (vedi
DEC-007: Supabase rimosso insieme all'autenticazione che lo usava).

## 9. DATABASE
Non applicabile — vedi DEC-007. (Residuo da ripulire lato
infrastruttura: tabella `users` ancora presente sul progetto Supabase,
non più referenziata dal codice; vedi Tech Debt TD-006.)

## 10. AUTHENTICATION
Non applicabile — rimossa con DEC-007. Vedi Decision Log per il
contesto storico (DEC-003, superseded).

## 11. AUTHORIZATION
Nessuna: tutte le route sono pubbliche, nessun ruolo né gate.

## 12. API CONTRACT
Non applicabile: nessuna API REST propria. Comunicazione diretta via
SDK Supabase (`@supabase/supabase-js`) e chiamate REST dirette a
Web3Forms.

## 13. UI / UX
Stile editoriale sobrio: palette ink/paper/gold (`src/variables.css`),
Source Serif 4 (titoli) + IBM Plex Sans (corpo). Niente gradienti,
ombre o effetti decorativi — vedi skill `design-system` per i dettagli
completi.

## 14. DESIGN DIRECTIONS
Form di login/signup ridisegnato via Claude Design (canvas "Login Form
Redesign") e implementato in `login-form-zod.tsx`/`.css`: card unica
con tab "Accedi"/"Registrati".

## 15. RESPONSIVE STRATEGY
Breakpoint principale a 760px (vedi media query in `App.css`). Punto
critico noto: regole di specificità su `form`/`.contact form` devono
restare allineate tra regola base e media query (vedi bug "variante
subdola" in `CLAUDE.md`).

## 16. ACCESSIBILITY
`FormZod` usa una regione `aria-live` (`statusSlot`) per i messaggi di
errore/successo di login/signup.

## 17. PERFORMANCE
Code splitting via `React.lazy()` per le pagine (`routes/lazy-pages.ts`)
con fallback centralizzato (`with-suspense.tsx`, spinner lucide-react).

## 18. SECURITY
Nessuna autenticazione/dato utente persistito (vedi DEC-007): superficie
di attacco minima. `.env` non committato (`.gitignore`).

## 19. COMPLIANCE, i18n, OBSERVABILITY
`/questionario` escluso da `robots.txt` (non va indicizzata).
`sitemap.xml` contiene solo `/`. Nessuna i18n: sito solo in italiano,
nessun piano multilingua. Nessun error tracking configurato.

## 20. TESTING
Nessun test automatico al momento. Lint: oxlint (non ESLint). Build:
`tsc -b && vite build`.

## 21. GIT
Repository: `BaschieriMax/cv-landing` su GitHub. Commit in italiano.
Branch `main`. Project claude.ai "CV Baschieri" collegato via
connettore GitHub, legge solo ciò che è stato pushato — vedi
[[reference_claude_project_github]].

## 22. DOCKER
Non applicabile: sito statico, nessun backend/database da
containerizzare.

## 23. DEPLOYMENT
Netlify come hosting principale (dominio dev attuale:
`cvbaschieridev.netlify.app`, `_redirects` per SPA fallback). GitHub
Pages aggiunto come backup temporaneo (commit recenti: workflow
`gh-pages`, `basename` su `createBrowserRouter` per servire da
sottopercorso). Da consolidare quale sia il canale definitivo prima
del deploy in produzione reale.

## 24. ENVIRONMENTS
`VITE_WEB3FORMS_ACCESS_KEY` è l'unica variabile ancora necessaria. In
produzione (Netlify) va aggiunta con "Clear cache and deploy site", non
un deploy normale. `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`
non servono più al codice (DEC-007) — rimozione da `.env`/secrets
tracciata in Tech Debt TD-006, nessuna fretta.

## 25. PROJECT STRUCTURE
Vedi `CLAUDE.md` sezione "Struttura dei file" — fonte aggiornata,
non duplicare qui per evitare drift.

## 26. IMPLEMENTATION PLAN
Vedi roadmap in `CLAUDE.md` ("Roadmap / prossimi step noti" e "Prima
del deploy in produzione"). Riassunto nei Tech Debt TD-001..TD-005.

## 27. RISKS
- Form di contatto/questionario falliscono silenziosamente in
  produzione finché manca `VITE_WEB3FORMS_ACCESS_KEY` (comportamento
  voluto, non bug — ma rischio se dimenticato prima del lancio).
- `/questionario` è ora pubblica e raggiungibile da chiunque abbia il
  link (non più dietro login): va condivisa solo con clienti già
  contattati, non linkata pubblicamente dal sito (resta `Disallow` in
  `robots.txt` per questo motivo).

## 28. ASSUMPTIONS
```text
ASSUNZIONE
Sto assumendo: il dominio di produzione definitivo non è stato ancora
scelto (Netlify vs GitHub Pages vs dominio custom).
Motivazione: CLAUDE.md menziona GitHub Pages come "backup temporaneo
di Netlify" ma non chiarisce quale sarà il canale definitivo.
```

## 29. OPEN QUESTIONS
- Dominio/hosting definitivo (Netlify vs GitHub Pages vs custom)?
- Quando aggiungere `VITE_WEB3FORMS_ACCESS_KEY`?
- Metodo di pagamento online da integrare in futuro (bonifico per ora,
  P.IVA solo se profittevole) — vedi [[project_pagamento_bonifico]].

## 30. DECISION LOG
Vedi `docs/decision-log.md`.

## 31. TECHNICAL DEBT
Vedi `docs/tech-debt.md`.
