# Gestionale Ricerca Personale

Applicazione React + Express + SQLite. La configurazione corrente prepara frontend e API sullo stesso servizio Render, mantenendo database e allegati sul disco persistente esistente.

## Requisiti

Node.js 22 o successivo. Installazione riproducibile tramite i lockfile npm.

## Build e avvio su Render

Dalla radice del repository:

```sh
node scripts/build-render.cjs
node backend/server.js
```

Root Directory deve essere la radice del repository, non `backend`. `render.yaml` definisce servizio, build, avvio, disco e controllo `/healthz`.

Conservare `DATA_DIR=/data` e il disco esistente. Configurare `HR_LOGIN_PASSWORD` e le altre credenziali nelle impostazioni del servizio, non nel codice. La build usa `/api` sullo stesso indirizzo. `REQUIRE_FRONTEND_BUILD=true` impedisce l'avvio senza interfaccia compilata.

Un push o un sync può avviare un deploy reale: prima collaudare e concordare la pubblicazione.

## Struttura utile

- `backend/`: API, autenticazione, database, documenti privati, portali e test.
- `frontend/src/`: interfaccia e logica React.
- `frontend/public/`: immagini, icone e risorse pubbliche.
- `scripts/build-render.cjs`: installazione e build coordinata.
- `docs/`: documentazione dell'integrazione precontratti.

## Avvio locale della copia di lavoro

Nella copia Windows preparata per il proprietario fare doppio clic su `GESTIONALE RICERCA DEFINITVO.bat`. Questo file e `scripts/avvia-locale.cjs` sono strumenti locali esclusi da Git, non componenti del deploy. Leggere `AVVIO LOCALE.md` nella stessa copia.

Il database locale stabile e la credenziale sono in `.locale/`; i collaudi usano `.checkup/`. Queste cartelle e il backup sono esclusi da Git e non devono essere caricati su Render.

Gli script `dev:backend` e `dev:frontend` restano disponibili per lo sviluppo. Impostare un `DATA_DIR` di prova e una password locale: non usare API o credenziali online nei test automatici.

## Registro delle novità

La voce **Aggiornamenti** del menu apre `/aggiornamenti`. Il contenuto si trova in `frontend/src/data/aggiornamenti.js`: aggiungere lì le nuove modifiche, con data e spiegazioni semplici, mantenendo lo storico. La pagina si aggiorna insieme alla nuova build del gestionale; non inventa automaticamente descrizioni dalle modifiche al codice. Le regole per i prossimi interventi sono in `AGENTS.md`.

## Verifiche automatiche

```sh
node backend/test-regression.cjs
node backend/test-unified-hosting.cjs
```

Il test di hosting richiede una build del frontend. Sono conservati anche `backend/test-crm-integration.cjs` e `backend/test-precontract-document.cjs`. Per mantenere le fixture in questa copia impostare `TEMP` e `TMP` a `.checkup/tmp`.

I test sono strumenti di sviluppo: non vengono eseguiti dal server di produzione né serviti ai visitatori. Il server pubblica soltanto l'interfaccia compilata, i portali e gli endpoint previsti, non il repository, il database o le credenziali.
