---
name: design-system
description: Palette colori, tipografia e principi di layout usati nel sito cv-landing. Usare ogni volta che si modifica lo stile, si aggiunge una sezione, o si crea un nuovo componente visivo nel progetto.
---

# Design system — cv-landing

## Filosofia

Stile editoriale sobrio: bordi sottili (1px), niente ombre, niente
gradienti, niente card con angoli molto arrotondati. L'ispirazione è più
vicina a un documento professionale curato che a un template SaaS. Il
colore oro (`--gold-deep`) è l'unico accento cromatico: va usato con
parsimonia, solo per numeri chiave, badge, o elementi che devono
davvero spiccare — mai come colore di sfondo diffuso.

## Palette (definita in src/index.css)

```css
--ink: #1e2a38;            /* testo principale, sfondo card in evidenza */
--ink-soft: #3e4a58;       /* testo secondario */
--paper: #efede5;          /* sfondo pagina */
--paper-raised: #f8f7f2;   /* sfondo card, input */
--gold: #a6772f;           /* accento chiaro (badge) */
--gold-deep: #7a5620;      /* accento scuro (numeri, focus, bordi enfatizzati) */
--line: rgba(30, 42, 56, 0.14);         /* bordi standard */
--line-strong: rgba(30, 42, 56, 0.28);  /* bordi enfatizzati */
--danger: #9a3324;         /* errori di validazione */
```

Non introdurre nuovi colori senza necessità reale — se serve un colore
di stato in più (es. successo), deriva da una tonalità già coerente con
questa palette (es. verde smorzato, non un verde acceso da UI kit).
Il verde già usato per i messaggi di successo è `#3b6d11`, non in
variabile ma inline in App.css — se diventa ricorrente, promuovilo a
variabile CSS.

## Tipografia

- **Titoli**: `'Source Serif 4', serif` — peso 500 (mai 600/700, risulta
  troppo pesante rispetto al resto)
- **Corpo testo, form, UI**: `'IBM Plex Sans', sans-serif`
- Caricati da Google Fonts nell'head di `index.html`, non serve
  aggiungerli altrove
- I numeri in evidenza (es. "48-72h", "13", "2" nella sezione hero-facts)
  usano il font serif in `--gold-deep`, non il sans — è la firma visiva
  della sezione statistiche

## Layout

- Larghezza massima contenuto: `960px` (classe `.wrap`), padding
  laterale `28px`
- Ogni sezione principale è separata da un bordo inferiore sottile
  (`border-bottom: 1px solid var(--line)`), non da spaziatura vuota o
  cambi di sfondo
- Il grid dei pacchetti (`.service-grid`) usa un bordo di 1px tra le
  card ottenuto con `gap: 1px` e `background: var(--line)` — non
  aggiungere bordi individuali alle card, romperebbe l'effetto
- Il pacchetto in evidenza (`.service-card.featured`) inverte i colori
  (sfondo `--ink`, testo chiaro) invece di usare un bordo colorato —
  è il pattern per segnalare "opzione consigliata" in questo progetto

## Responsive

Breakpoint unico a `760px` (vedi media query in fondo a App.css). Sotto
quella soglia: hero passa a colonna singola, la griglia pacchetti passa
a 1 colonna, il form passa a 1 colonna. Non aggiungere altri breakpoint
senza necessità — il sito è pensato per restare semplice.

## Cosa evitare esplicitamente

- Ombre (`box-shadow`) decorative — l'unico uso ammesso è un eventuale
  focus ring accessibile, non decorazione di card
- Gradienti di qualsiasi tipo
- Border-radius superiori a 2px sugli elementi attuali (input, bottoni,
  badge) — il sito usa angoli quasi vivi di proposito, è parte dello
  stile editoriale scelto
- Icone decorative superflue — il sito attualmente non ne usa nessuna,
  mantenerlo pulito piuttosto che aggiungerne per riempire spazio
