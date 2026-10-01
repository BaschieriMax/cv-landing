# CLAUDE.md — zunstant.test

Contesto di progetto per Claude Code. Leggi questo file prima di lavorare
su qualsiasi richiesta relativa a questo repository.

## Cos'è questo progetto

`zunstant.test` è l'evoluzione di **cv-landing**, la landing page per
l'attività di CV writing e career coaching di Massimo Baschieri
(Sassuolo, MO), convertita a TypeScript. Una versione precedente di
questo progetto proteggeva "/questionario" con un login/signup via
Supabase: rimosso (DEC-007 nel Decision Log, `docs/decision-log.md`)
perché obbligare un cliente già contattato a creare un account per
compilare un questionario una tantum era una frizione ingiustificata,
senza alcun beneficio reale. Oggi tutte le route sono pubbliche.

Sito gemello senza TypeScript: https://cvbaschieridev.netlify.app/

## Stack tecnico

- **React 19 + Vite + TypeScript** — a differenza di cv-landing (JS
  puro), qui tutto è tipizzato: pagine, form, store, schema
- **react-router v8** (`createBrowserRouter` + `RouterProvider` da
  `react-router` / `react-router/dom`) — non `react-router-dom` con
  `BrowserRouter` come nel progetto originale
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
  index.css                    reset globale, importa variables.css
  variables.css                 variabili CSS globali: palette colori + raggi
                                 (--radius-sm/md/lg) — unica fonte di questi valori
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
  routes/
    router.tsx                  definizione route (createBrowserRouter), tutte pubbliche
    lazy-pages.ts                React.lazy() delle pagine
    with-suspense.tsx            helper che avvolge una pagina lazy in <Suspense>
  components/
    Button.tsx                   bottone base riusato ovunque
  utils/
    react-query.ts                istanza QueryClient
public/
  favicon.ico, favicon-32.png, favicon.svg, apple-touch-icon.png    icone del sito
  og-image.png                   immagine di anteprima per condivisioni social
  curriculum-vitae.png            asset grafico (verificare dove/se è referenziato)
  icons.svg                       sprite icone
  _redirects                      redirect Netlify (SPA fallback su index.html)
  robots.txt                      Disallow su /questionario (va condivisa solo con clienti
                                 già contattati, non indicizzata nonostante sia pubblica)
  sitemap.xml                      solo "/", aggiornare se si aggiungono altre route pubbliche
.env                              VITE_WEB3FORMS_ACCESS_KEY (vedi sotto)
```

## Routing

Route definite in `src/routes/router.tsx`, tutte pubbliche:

- `/` — `homepage.tsx` (landing + form di contatto)
- `/questionario` — `questionario.tsx` (wizard), raggiungibile solo via
  link diretto condiviso da Massimo dopo il primo contatto (vedi
  `robots.txt`: non indicizzata)
- `*` — `not-found.tsx` (404 in stile col resto del sito, non l'errore
  grezzo di default di React Router)

`/` e `/questionario` hanno entrambe un `errorElement: <RouteError />`
per gli errori runtime nei componenti (`route-error.tsx`, distingue 404
da altri errori tramite `isRouteErrorResponse`). Se si aggiungono nuove
route, valutare se serve lo stesso `errorElement`.

Se in futuro serve di nuovo un gate di autenticazione su qualche route
(contesto storico: rimosso con DEC-007 in `docs/decision-log.md`, era
Supabase Auth), valutare prima se il bisogno reale lo giustifica — vedi
le alternative scartate nella stessa decisione.

## Route "/questionario" — dettaglio wizard

Wizard a 6 step per raccogliere i dati del cliente dopo il primo contatto
(Dati personali, Obiettivo professionale, Esperienze lavorative —
ripetibili con "Aggiungi un'altra esperienza", Formazione, Competenze,
Extra e conferma finale). Invia via Web3Forms come il form della
homepage, con un testo email strutturato per sezioni (funzione
`buildMessage` in `questionario.tsx`).

In "Competenze" solo "Competenze tecniche", "Lingue parlate" e
"Software/strumenti" sono obbligatori; "Certificazioni" e "Soft skills"
sono facoltativi.

Il padding di `.q-body` (contenitore di progress bar + form, in
`Questionario.css`) va scritto come `.wrap.q-body { padding: 28px; }`,
non come `.q-body { padding: ... }` da solo. Motivo: `homepage.tsx` e
`questionario.tsx` sono pagine lazy-loaded (vedi `routes/lazy-pages.ts`),
quindi i loro CSS vengono iniettati nel `<head>` nell'ordine in cui le
pagine vengono effettivamente visitate, non in un ordine fisso di build.
`.wrap` esiste in entrambi i CSS (stessa classe, stesso nome) con
`padding: 0 28px`; se `.q-body` ha la stessa specificità di `.wrap`
(un solo selettore di classe), a vincere è quello iniettato per ultimo
nel DOM — cosa che cambia a seconda che l'utente arrivi su
`/questionario` direttamente o ci torni dopo aver visitato "/" (es. col
pulsante "indietro" del browser dopo aver cliccato l'icona home nel
wizard), causando un bug intermittente di padding mancante. Il
selettore composto `.wrap.q-body` ha specificità maggiore della singola
`.wrap` e vince sempre, a prescindere dall'ordine di caricamento. Se in
futuro si aggiungono altre combinazioni di classi condivise tra pagine
lazy diverse, applicare lo stesso pattern (selettore composto) invece di
affidarsi all'ordine del CSS.

**Stessa classe di bug, variante più subdola**: `App.css` (homepage)
aveva un selettore `form { display: grid; grid-template-columns: 1fr
1fr; ... }` **non scoperto a nessuna classe**, pensato solo per il form
di contatto dentro `.contact`. Una volta caricato il CSS della homepage,
quel selettore si applicava a *qualsiasi* `<form>` della pagina, incluso
quello del questionario, che diventava una grid a 2 colonne e appariva
"compattato" nella prima colonna dopo essere tornati da "/" (stesso
percorso di navigazione del bug precedente: icona home nel questionario
poi pulsante indietro del browser). Corretto scopandolo a
`.contact form` — nessun effetto visivo sulla homepage, dato che il
form è sempre dentro `.contact` lì. Occhio: quando si alza la
specificità di una regola base, va alzata allo stesso modo l'eventuale
override nella media query sotto i 760px, altrimenti quello con
specificità più bassa smette di vincere e si perde il comportamento
responsive (è successo proprio con questa regola: `.contact form`
aveva più specificità del vecchio `form` nella media query, che quindi
non riusciva più a forzare `grid-template-columns: 1fr` su mobile —
corretto scopando anche quello a `.contact form`). **Lezione
generale**: in `App.css`
non lasciare selettori di elemento HTML nudi (`form`, `header`,
`footer`, ecc.) che si applicano solo a una sezione specifica della
homepage — vanno sempre scoperti a una classe di quella sezione (es.
`.contact form`), perché entrambi i CSS delle pagine lazy convivono
nello stesso documento non appena l'utente ha visitato sia "/" che
"/questionario" nella stessa sessione del browser.

**Regola pratica per tutto il progetto**: qualunque `<button>` con una
classe propria che deve avere un hover diverso da quello generico va
scritto come `.classe:hover:not(:disabled)`, mai solo `.classe:hover`
— altrimenti rischia di pareggiare in specificità con
`button:hover:not(:disabled)` e perdere lo spareggio sul numero di
elementi HTML nel selettore (`Button.css` segue già questo pattern su
`.btn-primary`/`.btn-secondary`/`.btn-link`).

## Variabili d'ambiente

- `VITE_WEB3FORMS_ACCESS_KEY` — access key di Web3Forms per il form di
  contatto e il questionario, presente nel `.env` locale. Deve essere
  presente anche nell'ambiente di build in produzione (Netlify: Site
  configuration → Environment variables → "Clear cache and deploy
  site" dopo averla aggiunta, non un deploy normale, perché Vite la
  incorpora in build) — senza, entrambi i form falliscono con "Access
  key Web3Forms mancante" (comportamento voluto, non un bug — vedi
  `handleSubmit`/`submitQuestionario`).

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
orientato al beneficio per il cliente.

Il footer di `homepage.tsx` mostra solo copyright ed email di contatto —
la città ("Sassuolo (MO)") è stata rimossa perché già presente
nell'header ("Sassuolo, Modena") sulla stessa pagina, quindi era pura
ridondanza. Non riaggiungerla nel footer senza un motivo concreto.

## Convenzioni di design

Vedi la skill `design-system` per palette colori, font e principi
layout. In sintesi: palette ink/paper/gold definita in `src/variables.css`
(importata da `src/index.css`), font Source Serif 4 (titoli) + IBM Plex
Sans (corpo testo), niente gradienti, ombre o effetti decorativi — è
uno stile editoriale sobrio, non un template SaaS con card arrotondate
ovunque.

Il raggio degli angoli non è più un valore fisso: `src/variables.css`
definisce `--radius-sm` (4px), `--radius-md` (8px, quello in uso oggi
su bottoni, input/select/textarea, service-card) e `--radius-lg` (12px).
Ogni `border-radius` va scritto con una di queste variabili, mai un
valore in px a mano — anche se numericamente coincidesse.

## Cosa NON fare

- Non aggiungere librerie CSS (Tailwind, Bootstrap, ecc.) — il progetto
  usa CSS puro di proposito, resta così.
- Non introdurre un backend/database senza che l'utente lo chieda
  esplicitamente — il modello attuale (form → email via Web3Forms) è
  voluto, non un compromesso temporaneo (vedi DEC-007: un'autenticazione
  Supabase c'era già stata ed è stata rimossa per questo).
- Non cambiare la palette colori, i font o le variabili di raggio
  (`--radius-sm/md/lg` in `src/variables.css`) senza conferma esplicita
  — fanno parte dell'identità visiva già scelta e testata.
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

- `index.html` (canonical, og:url) e `public/sitemap.xml` puntano
  entrambi a `https://cvbaschieridev.netlify.app/`: se il dominio di
  produzione di questo progetto sarà diverso, vanno aggiornati insieme.
- Residuo lato infrastruttura dopo la rimozione dell'autenticazione
  (DEC-007): il progetto Supabase usato per login/signup è ancora
  attivo (tabella `users`, utenti di test) ma non più referenziato dal
  codice. Da mettere in pausa/eliminare quando c'è tempo — nessuna
  fretta, nessun impatto funzionale (vedi `docs/tech-debt.md`, TD-006).
