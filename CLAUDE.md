# CLAUDE.md — cv-landing

Contesto di progetto per Claude Code. Leggi questo file prima di lavorare
su qualsiasi richiesta relativa a questo repository.

## Cos'è questo progetto

Landing page per un'attività secondaria di CV writing e career coaching
gestita da Massimo Baschieri (Sassuolo, MO). Il sito raccoglie contatti
tramite un form che invia email via Web3Forms, senza backend.

Sito live: https://cvbaschieridev.netlify.app/

## Stack tecnico

- **React 19 + Vite**, nessun framework CSS (CSS puro, variabili custom)
- **Web3Forms** per l'invio del form (nessun backend, POST diretto all'API)
- **Deploy**: GitHub → Netlify, build automatica a ogni push su main
  (build command: `npm run build`, publish directory: `dist`)
- Non ci sono test automatici né TypeScript in questo progetto — mantienilo
  semplice, è un sito a una pagina gestito da una sola persona non tecnica
  a tempo pieno su questo (Massimo è uno junior web developer, quindi capisce
  il codice ma vuole soluzioni dirette, non over-engineering).

## Struttura dei file

```
index.html          meta tag, SEO, Open Graph, favicon
src/
  App.jsx            landing page "/": hero, pacchetti, form di contatto
  App.css            stili della landing page
  Questionario.jsx   wizard multi-step "/questionario" (raccolta dati cliente)
  Questionario.css   stili del wizard, riusa le variabili di src/index.css
  index.css          reset globale e variabili di colore/font (condiviso)
  main.jsx           entry point React + routing (react-router-dom)
public/
  favicon.ico, favicon-32.png, apple-touch-icon.png    icone del sito
  og-image.png        immagine di anteprima per condivisioni social
.env                 contiene VITE_WEB3FORMS_ACCESS_KEY (mai committato)
.env.example         modello per .env
```

## Route "/questionario"

Wizard a 6 step per raccogliere i dati del cliente dopo il primo contatto
(Dati personali, Obiettivo professionale, Esperienze lavorative —
ripetibili con "Aggiungi un'altra esperienza", Formazione, Competenze,
Extra e conferma finale). Invia via Web3Forms come il form della landing,
con un testo email strutturato per sezioni (funzione `buildMessage` in
`Questionario.jsx`). Usa react-router-dom (`BrowserRouter`) per la
navigazione tra "/" e "/questionario", introdotto insieme a questa
route — se aggiungi altre route in futuro, passa da lì.

In "Competenze" solo "Competenze tecniche", "Lingue parlate" e
"Software/strumenti" sono obbligatori; "Certificazioni" e "Soft skills"
sono facoltativi. Sotto i 760px il tag `<form>` ha un padding aggiuntivo
di 40px per evitare che i campi risultino attaccati ai bordi del
dispositivo (vedi media query in fondo a `Questionario.css`).

## Variabili d'ambiente

`VITE_WEB3FORMS_ACCESS_KEY` — access key di Web3Forms. Deve essere presente
sia in locale (file `.env`) sia su Netlify (Site configuration →
Environment variables), altrimenti il form fallisce in silenzio con
l'errore "Access key mancante". Vite la incorpora in fase di build, quindi
dopo averla aggiunta/modificata su Netlify serve un "Clear cache and
deploy site", non un deploy normale.

## Contesto business — pacchetti e prezzi attuali

| Pacchetto | Prezzo | Include |
|---|---|---|
| Base | 49€ | CV ATS-friendly, PDF + Word |
| Professional | 89€ | + adattamento al ruolo, lettera di presentazione |
| Professional + LinkedIn | 129€ | + ottimizzazione profilo LinkedIn |
| Career Boost | 179-229€ | + simulazione colloquio 1:1, cheat sheet domande HR |

Questi prezzi possono cambiare in base ai risultati dei primi clienti —
se l'utente chiede di aggiornarli, modifica sia `src/App.jsx` (sezione
`.service-grid`) sia qualunque altro punto del sito che li menzioni.

Target principale: professionisti italiani in cerca di lavoro o cambio
carriera. Posizionamento: qualità da professionista a prezzo accessibile,
tempi rapidi (48-72h), specializzazione per settore — non un servizio
low-cost generico né un coach executive costoso.

## Convenzioni per contenuti e copy

Vedi la skill `brand-voice` per le linee guida complete di tono e voce.
In sintesi: italiano, sentence case (mai Title Case o ALL CAPS nei
titoli), niente frasi motivazionali generiche, sempre concreto e
orientato al beneficio per il cliente.

## Convenzioni di design

Vedi la skill `design-system` per palette colori, font e principi
layout. In sintesi: palette ink/paper/gold definita in `src/index.css`,
font Source Serif 4 (titoli) + IBM Plex Sans (corpo testo), niente
gradienti, ombre o effetti decorativi — è uno stile editoriale sobrio,
non un template SaaS con card arrotondate ovunque.

## Cosa NON fare

- Non aggiungere librerie CSS (Tailwind, Bootstrap, ecc.) — il progetto
  usa CSS puro di proposito, resta così.
- Non introdurre un backend/database senza che l'utente lo chieda
  esplicitamente — il modello attuale (form → email) è voluto, non un
  compromesso temporaneo.
- Non cambiare la palette colori o i font senza conferma esplicita —
  fanno parte dell'identità visiva già scelta e testata.
- Non committare mai `.env` — è già in `.gitignore`, non toglierlo.

## Roadmap / prossimi step noti

1. Metodo di pagamento da integrare o almeno menzionare nel sito
   (bonifico, PayPal, link Stripe)
2. ~~Questionario esteso di raccolta dati clienti~~ — fatto: implementato
   come pagina nativa del sito su "/questionario" (non più
   Google Form/Typeform esterno come originariamente previsto), testato
   end-to-end incluso invio email reale.
3. Possibile pagina o sezione dedicata al pacchetto Career Boost con più
   dettaglio, se le richieste aumentano
