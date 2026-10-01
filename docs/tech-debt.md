# Technical Debt Log — zunstant.test (ex cv-landing)

Voci ricostruite a posteriori da `CLAUDE.md` (sezioni "Roadmap" e
"Prima del deploy in produzione") per adattare la skill
`full-stack-project-architect` a questo progetto già avviato.

## Formato

```text
ID: TD-001
Problema:
...

Motivo:
...

Impatto:
...

Soluzione futura:
...

Priorità:
Alta / Media / Bassa
```

## Voci

```text
ID: TD-001
Problema:
Manca VITE_WEB3FORMS_ACCESS_KEY in .env e nell'ambiente di build
Netlify in produzione.

Motivo:
Non ancora aggiunta; comportamento voluto (fallisce esplicitamente con
"Access key Web3Forms mancante") finché non viene configurata.

Impatto:
Form di contatto e questionario non funzionano finché la chiave non è
presente in entrambi gli ambienti (dev e produzione).

Soluzione futura:
Aggiungere la chiave a .env locale e a Netlify (Site configuration →
Environment variables), poi "Clear cache and deploy site" — non un
deploy normale, perché Vite la incorpora in build.

Priorità:
Alta (blocca il funzionamento dei form in produzione)
```

```text
ID: TD-002
Problema:
~~homepage.tsx e new-homepage.tsx duplicati~~

Stato: Chiuso — verificato il 2026-10-01 che in questo repository
`new-homepage.tsx` non è mai esistito in nessun commit; esisteva solo
come file locale non pushato su un'altra macchina di Massimo. Decisione
di Massimo: tenere questo `homepage.tsx` come definitivo. Nota: se le
modifiche fatte sull'altra macchina arrivano in futuro via push, vanno
confrontate manualmente con questo file prima di sovrascriverlo.

Priorità:
Chiuso
```

```text
ID: TD-003
Problema:
index.html (canonical, og:url) e public/sitemap.xml puntano a
https://cvbaschieridev.netlify.app/, non al dominio di produzione
definitivo di questo progetto.

Motivo:
Dominio di produzione non ancora deciso/confermato.

Impatto:
SEO e condivisioni social scorrette se il dominio reale sarà diverso.

Soluzione futura:
Aggiornare entrambi i file insieme non appena il dominio di
produzione è definito.

Priorità:
Media (bloccante solo al momento del lancio pubblico)
```

```text
ID: TD-004
Problema:
~~Advisor Supabase segnala "Leaked Password Protection Disabled" (WARN).~~

Stato: Chiuso (non applicabile) — DEC-007 ha rimosso l'autenticazione
Supabase da /questionario. Nessuna password gestita dal progetto.

Priorità:
Chiuso
```

```text
ID: TD-006
Problema:
Dopo DEC-007 (rimozione auth), restano residui lato Supabase non
ripuliti da codice: il progetto Supabase stesso (tabella `users`,
utenti già registrati durante i test), le variabili d'ambiente
VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY in .env locale e nei
secrets di GitHub Actions, e i Redirect URL configurati in Supabase
Auth.

Motivo:
La rimozione ha toccato solo il codice applicativo; la pulizia lato
infrastruttura (dashboard Supabase, secrets CI) è un passo manuale
separato.

Impatto:
Nessuno funzionale (il codice non chiama più Supabase), ma costo
cognitivo residuo: un progetto Supabase attivo senza scopo, secrets
inutilizzati nei workflow.

Soluzione futura:
Quando Massimo ha tempo: mettere in pausa o eliminare il progetto
Supabase, rimuovere le due variabili da .env e dai secrets GitHub
Actions, pulire i Redirect URL.

Priorità:
Bassa (nessun impatto funzionale, solo pulizia)
```

```text
ID: TD-005
Problema:
GitHub Pages è stato aggiunto come deploy "di backup temporaneo" di
Netlify (vedi DEC-006 in decision-log.md), ma non è chiaro quale sarà
il canale definitivo.

Motivo:
Decisione presa come soluzione provvisoria/ridondanza a costo zero,
non come scelta finale di hosting.

Impatto:
Due pipeline di deploy attive in parallelo; rischio di confusione su
quale sia la "fonte di verità" in produzione. (Il vincolo sui Redirect
URL di Supabase Auth non si applica più dopo DEC-007 — rimossa
l'autenticazione.)

Soluzione futura:
Decidere con Massimo l'hosting definitivo (Netlify vs GitHub Pages vs
dominio custom) e disattivare/documentare l'altro come solo backup
manuale, non pipeline automatica parallela.

Priorità:
Media (va chiusa prima del deploy in produzione reale)
```

## Revisione

Rivedi il log a ogni release e nella manutenzione periodica (Fase 5).
TD-001 è `Alta` e non può restare aperto alla release senza una
decisione esplicita di Massimo registrata nel Decision Log.
