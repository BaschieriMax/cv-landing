# Landing page — CV writing e career coaching

Progetto React + Vite con la landing page e il form di raccolta contatti,
collegato a [Web3Forms](https://web3forms.com) per ricevere le richieste
via email senza bisogno di un backend.

## Come avviarlo

1. Apri la cartella in VS Code.
2. Installa le dipendenze:
   ```
   npm install
   ```
3. Copia il file di esempio delle variabili d'ambiente:
   ```
   cp .env.example .env
   ```
4. Vai su [web3forms.com](https://web3forms.com), inserisci la tua email
   e copia la access key che ricevi.
5. Apri `.env` e sostituisci il valore di `VITE_WEB3FORMS_ACCESS_KEY` con
   la tua chiave.
6. Avvia il progetto in locale:
   ```
   npm run dev
   ```
   Si apre su `http://localhost:5173`.

## L'URL da inserire su Web3Forms

Web3Forms non richiede un URL da registrare in anticipo: la access key
funziona da qualunque dominio da cui parte la richiesta. Quando pubblichi
il sito (vedi sotto), le email arriveranno comunque alla stessa casella,
indipendentemente dall'URL del sito.

Se in futuro vuoi limitare da quali domini può arrivare il form (opzione
disponibile nella dashboard di Web3Forms, sezione "Allowed domains"),
inserisci lì l'URL definitivo del sito una volta pubblicato.

## Come pubblicarlo online (gratis)

1. Crea la build di produzione:
   ```
   npm run build
   ```
   Viene generata la cartella `dist/`.
2. Vai su [app.netlify.com/drop](https://app.netlify.com/drop) e trascina
   la cartella `dist/`: in pochi secondi ottieni un URL pubblico
   (es. `nomecasuale.netlify.app`).
3. In alternativa, pubblica l'intero progetto su GitHub e collega il
   repository a Netlify o Vercel per il deploy automatico a ogni modifica.
4. Se acquisti un dominio personalizzato (es. `tuonome.it`), puoi collegarlo
   in pochi minuti dalle impostazioni di Netlify/Vercel.

## Struttura del progetto

```
src/
  App.jsx       componente principale (hero, pacchetti, form)
  App.css       stili della pagina
  index.css     reset e variabili globali
  main.jsx      entry point React
.env.example    modello per la access key Web3Forms (copialo in .env)
```

## Personalizzazione rapida

- Testi di hero, pacchetti e form: modifica direttamente `src/App.jsx`.
- Colori e font: modifica le variabili in cima a `src/index.css`.
- Campi del form: aggiungi o rimuovi voci nell'oggetto `EMPTY_FORM` e nel
  relativo blocco `<Field>` in `src/App.jsx`.
