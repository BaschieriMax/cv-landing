# CLAUDE.md — zunstant.test

Contesto di progetto per Claude Code. Leggi questo file prima di lavorare
su qualsiasi richiesta relativa a questo repository.

## Cos'è questo progetto

`zunstant.test` è l'evoluzione di **cv-landing**, la landing page per
l'attività di CV writing e career coaching di Massimo Baschieri
(Sassuolo, MO). Il contenuto (copy, design, form di contatto e
questionario) proviene da lì; qui è stata aggiunta un'**autenticazione
via Supabase** che nel progetto originale non esisteva, per proteggere
la route "/questionario" dietro un login.

Sito originale (stesso contenuto, senza auth): https://cvbaschieridev.netlify.app/

## Stack tecnico

- **React 19 + Vite + TypeScript** — a differenza di cv-landing (JS
  puro), qui tutto è tipizzato: pagine, form, store, schema
- **react-router v8** (`createBrowserRouter` + `RouterProvider` da
  `react-router` / `react-router/dom`) — non `react-router-dom` con
  `BrowserRouter` come nel progetto originale
- **Supabase** (`@supabase/supabase-js`) per l'autenticazione
  email/password. Ogni utente auth ha un profilo nella tabella
  `users` (`id`, `name`, `email`, `auth_id`), creato al primo
  login/signup se non esiste ancora (vedi `ensureProfile` in
  `src/store/auth.ts`)
- **Zustand** per lo stato di autenticazione globale
  (`src/store/auth.ts`)
- **React Hook Form + Zod** (`@hookform/resolvers/zod`) per i form
  tipizzati di login/signup (`src/components/form/`)
- **TanStack React Query** predisposto (`QueryClientProvider` in
  `src/App.tsx`) ma non ancora usato per query specifiche
- **lucide-react** per icone (per ora solo lo spinner di caricamento
  delle route lazy)
- **Web3Forms** per l'invio del form di contatto e del questionario —
  invariato rispetto a cv-landing, nessun backend proprio per quella
  parte
- CSS puro, nessun framework CSS (Tailwind, Bootstrap, ecc.) — vale
  ancora la regola di cv-landing, non introdurne
- Lint: **oxlint** (non ESLint). Build: `tsc -b && vite build`
- Non ci sono ancora test automatici

## Struttura dei file

```
index.html                     meta tag, SEO, Open Graph, favicon
src/
  App.tsx                      root: QueryClientProvider + RouterProvider
  App.css                      stili della landing page (homepage)
  Questionario.css             stili del wizard questionario
  index.css                    reset globale e variabili di colore/font (condiviso)
  main.tsx                     entry point React (monta <App />)
  pages/
    homepage.tsx                landing page "/": hero, pacchetti, form di contatto
    new-homepage.tsx            copia praticamente identica di homepage.tsx — bozza
                                 di redesign, ancora da consolidare in un solo file
    questionario.tsx            wizard multi-step "/questionario" (raccolta dati cliente)
    not-found.tsx                pagina 404, route "*" in router.tsx
    route-error.tsx              errorElement per errori runtime nelle route (distingue
                                 404 da altri errori via isRouteErrorResponse)
    route-status.css             stile condiviso tra not-found.tsx e route-error.tsx
  layouts/
    AuthLayout.tsx               gate di autenticazione: mostra login/signup se non
                                 loggato, altrimenti barra utente + logout e <Outlet />
    AuthLayout.css
  routes/
    router.tsx                  definizione route (createBrowserRouter)
    lazy-pages.ts                React.lazy() delle pagine
    with-suspense.tsx            helper che avvolge una pagina lazy in <Suspense>
  components/
    Button.tsx                   bottone base riusato ovunque
    form/
      form-zod.tsx                form generico guidato da uno schema Zod + config campi
      login-form-zod.tsx          form di login/signup, usa form-zod.tsx + store/auth.ts
  schema/
    login-form-schema.ts         schema Zod login/signup + tipi dei campi del form
  store/
    auth.ts                       stato Zustand: user, loading, login/signup/logout/hydrate
  model/
    user.ts                       tipo UserProps (profilo utente)
  utils/
    supabase.ts                   client Supabase (createClient)
    react-query.ts                istanza QueryClient
public/
  favicon.ico, favicon-32.png, favicon.svg, apple-touch-icon.png    icone del sito
  og-image.png                   immagine di anteprima per condivisioni social
  curriculum-vitae.png            asset grafico (verificare dove/se è referenziato)
  icons.svg                       sprite icone
  _redirects                      redirect Netlify (SPA fallback su index.html)
  robots.txt                      Disallow su /questionario (dietro login, non va indicizzata)
  sitemap.xml                      solo "/", aggiornare se si aggiungono altre route pubbliche
.env                              VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
                                 (VITE_WEB3FORMS_ACCESS_KEY va aggiunta a parte, vedi sotto)
```

## Routing e autenticazione

Route definite in `src/routes/router.tsx`:

- `/` — pubblica, `homepage.tsx` (landing + form di contatto), nessun
  login richiesto
- `/questionario` — protetta da `AuthLayout` (`src/layouts/AuthLayout.tsx`):
  - `loading` → messaggio di caricamento
  - nessun `user` → mostra `LoginFormZod` (login/signup), il
    questionario non viene renderizzato
  - `user` presente → barra con nome utente + logout, poi `<Outlet />`
    con `questionario.tsx`

`useAuthStore` (`src/store/auth.ts`) espone `login`, `signup`,
`logout`, `modifyName`, `hydrate`. `hydrate()` va chiamato una volta
all'avvio (lo fa `AuthLayout` in un `useEffect`) per leggere la sessione
Supabase esistente e sottoscriversi a `onAuthStateChange`; ritorna la
funzione di unsubscribe.

Se in futuro altre route devono richiedere login, vanno annidate come
children di `{ element: <AuthLayout />, children: [...] }` in
`router.tsx`, non duplicare la logica di gate altrove.

Una route `path: "*"` in coda a `router.tsx` cattura ogni URL sconosciuto
e mostra `not-found.tsx` (404 in stile col resto del sito, non l'errore
grezzo di default di React Router). `/` e il gruppo `AuthLayout` hanno
inoltre un `errorElement: <RouteError />` per gli errori runtime nei
componenti (`route-error.tsx`, distingue 404 da altri errori tramite
`isRouteErrorResponse`). Se si aggiungono nuove route, valutare se
serve lo stesso `errorElement`.

## Route "/questionario" — dettaglio wizard

Wizard a 6 step per raccogliere i dati del cliente dopo il primo contatto
(Dati personali, Obiettivo professionale, Esperienze lavorative —
ripetibili con "Aggiungi un'altra esperienza", Formazione, Competenze,
Extra e conferma finale). Invia via Web3Forms come il form della
homepage, con un testo email strutturato per sezioni (funzione
`buildMessage` in `questionario.tsx`).

In "Competenze" solo "Competenze tecniche", "Lingue parlate" e
"Software/strumenti" sono obbligatori; "Certificazioni" e "Soft skills"
sono facoltativi. Sotto i 760px il tag `<form>` ha padding aggiuntivo
per evitare che i campi risultino attaccati ai bordi del dispositivo
(vedi media query in fondo a `Questionario.css`).

## Variabili d'ambiente

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — necessarie per
  qualunque funzionalità di autenticazione (login, signup, hydrate).
  Senza queste il client Supabase non si inizializza correttamente.
- `VITE_WEB3FORMS_ACCESS_KEY` — access key di Web3Forms per il form di
  contatto e il questionario. **Non è presente nel `.env` attuale**:
  finché non viene aggiunta, entrambi i form falliscono con "Access key
  Web3Forms mancante" (comportamento voluto, non un bug — vedi
  `handleSubmit`/`submitQuestionario`). Deve essere presente anche
  nell'ambiente di build in produzione (Netlify: Site configuration →
  Environment variables → "Clear cache and deploy site" dopo averla
  aggiunta, non un deploy normale, perché Vite la incorpora in build).

## Contesto business — pacchetti e prezzi attuali

| Pacchetto | Prezzo | Include |
|---|---|---|
| Base | 49€ | CV ATS-friendly, PDF + Word |
| Professional | 89€ | + adattamento al ruolo, lettera di presentazione |
| Professional + LinkedIn | 129€ | + ottimizzazione profilo LinkedIn |
| Career Boost | 179-229€ | + simulazione colloquio 1:1, cheat sheet domande HR |

Questi prezzi possono cambiare in base ai risultati dei primi clienti —
se l'utente chiede di aggiornarli, modifica sia `homepage.tsx` che
`new-homepage.tsx` (sezione `.service-grid`, attualmente duplicata in
entrambi i file) sia qualunque altro punto del sito che li menzioni.

Target principale: professionisti italiani in cerca di lavoro o cambio
carriera. Posizionamento: qualità da professionista a prezzo accessibile,
tempi rapidi (48-72h), specializzazione per settore — non un servizio
low-cost generico né un coach executive costoso.

## Convenzioni per contenuti e copy

Vedi la skill `brand-voice` per le linee guida complete di tono e voce.
In sintesi: italiano, sentence case (mai Title Case o ALL CAPS nei
titoli), niente frasi motivazionali generiche, sempre concreto e
orientato al beneficio per il cliente. Valgono anche per i testi di
login/signup e per i messaggi di errore dell'autenticazione (es. errori
Supabase): stesso registro diretto, senza "Errore:" davanti.

## Convenzioni di design

Vedi la skill `design-system` per palette colori, font e principi
layout. In sintesi: palette ink/paper/gold definita in `src/index.css`,
font Source Serif 4 (titoli) + IBM Plex Sans (corpo testo), niente
gradienti, ombre o effetti decorativi — è uno stile editoriale sobrio,
non un template SaaS con card arrotondate ovunque. Vale anche per
`AuthLayout` e per i form di login/signup: niente stile "card SaaS" con
ombre o angoli molto arrotondati, restare coerenti con il resto del sito.

## Cosa NON fare

- Non aggiungere librerie CSS (Tailwind, Bootstrap, ecc.) — il progetto
  usa CSS puro di proposito, resta così.
- Non introdurre un backend/database aggiuntivo oltre a Supabase senza
  che l'utente lo chieda esplicitamente.
- Non rimuovere o bypassare `AuthLayout` per "semplificare" l'accesso a
  "/questionario" — il gate è voluto, non un compromesso temporaneo.
- Non cambiare la palette colori o i font senza conferma esplicita —
  fanno parte dell'identità visiva già scelta e testata.
- Non committare mai `.env` — è già in `.gitignore`, non toglierlo.
- Non duplicare ulteriormente `homepage.tsx`/`new-homepage.tsx` — sono
  identici di proposito in questa fase; se si sceglie una versione
  definitiva, l'altra va rimossa, non tenerle entrambe "per sicurezza".

## Roadmap / prossimi step noti

1. Consolidare `homepage.tsx` e `new-homepage.tsx` in un solo file
   quando il redesign è considerato definitivo.
2. Aggiungere `VITE_WEB3FORMS_ACCESS_KEY` a `.env` (e all'ambiente di
   build in produzione) per far funzionare l'invio dei form.
3. Metodo di pagamento da integrare o almeno menzionare nel sito
   (bonifico, PayPal, link Stripe).
4. Possibile pagina o sezione dedicata al pacchetto Career Boost con più
   dettaglio, se le richieste aumentano.

## Prima del deploy in produzione

- **Il progetto non è ancora un repository Git** — prerequisito per
  collegare Netlify (che si aspetta un repo GitHub/GitLab per il
  deploy automatico ad ogni push, come descritto sopra). Da fare prima
  di qualunque altro step di deploy.
- ~~Policy RLS della tabella `users` troppo permissiva in lettura~~ —
  **risolto**: `PolicyViewUser` (SELECT) è stata ristretta a
  `auth.uid() = auth_id` per il ruolo `authenticated`, simmetrica a
  INSERT/UPDATE (in precedenza era `qual: true` per `public`, quindi
  chiunque avesse la chiave pubblica poteva leggere nome ed email di
  tutti gli utenti registrati).
- Il "Site URL"/"Redirect URLs" dell'Auth Supabase va aggiornato dal
  dominio di sviluppo al dominio reale di produzione prima del deploy,
  altrimenti i link nelle email di conferma non funzionano per gli
  utenti finali.
- Advisor Supabase segnala anche "Leaked Password Protection Disabled"
  (WARN, non bloccante): si attiva con un toggle nel dashboard Auth →
  Policies, verifica le password contro HaveIBeenPwned al login/signup.
  Non applicato — è una scelta di prodotto, non un fix di codice.
- `index.html` (canonical, og:url) e `public/sitemap.xml` puntano
  entrambi a `https://cvbaschieridev.netlify.app/`: se il dominio di
  produzione di questo progetto sarà diverso, vanno aggiornati insieme.
