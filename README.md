# Gestionale Ricerca Personale - Locale

Questo è il gestionale per la ricerca e selezione di personale migrato da Google Sheets a un'applicazione locale Node.js (Express) + React (Vite) + SQLite.

## 🚀 Requisiti
- **Node.js** installato (consigliato v20+).

---

## 📥 Importare i tuoi dati attuali dal Foglio Google
Prima di avviare il gestionale, puoi importare tutti i candidati e i clienti correnti:
1. Apri la tua Web App di Google nel browser.
2. Aggiungi alla fine dell'URL il parametro **`?page=export`** (o sostituisci `?page=commerciale` con `?page=export`).
   * *Esempio:* `https://script.google.com/macros/s/AKfy.../exec?page=export`
3. Il browser scaricherà un file JSON.
4. Salva questo file con il nome **`export.json`** nella cartella principale di questo progetto (`gestionale_ricerca_locale/`).
5. Apri un terminale nella cartella principale ed esegui il comando:
   ```bash
   node migrate.js
   ```
6. Il database SQLite locale (`backend/database.db`) verrà popolato istantaneamente con tutti i tuoi candidati, clienti, ricerche e storici!

---

## 💻 Come avviare il gestionale in locale
Per avviare il gestionale sul tuo computer senza usare il terminale:
1. Fai doppio clic sul file **`avvia_gestionale.bat`**.
2. Il browser si aprirà automaticamente su **`http://localhost:5173`** mostrando il cruscotto.
3. Tieni aperta la finestra nera del terminale per tutto il tempo in cui usi il programma.

---

## 📱 Come condividere il Form Commerciale con i cellulari
Se il commerciale è fuori ufficio ed ha bisogno di inserire nuove ricerche dal cellulare:
1. Assicurati che **`avvia_gestionale.bat`** sia regolarmente in esecuzione.
2. Fai doppio clic sul file **`avvia_condivisione_cellulare.bat`**.
3. Verrà generato un indirizzo internet pubblico (es: `https://xxxx.localtunnel.me`).
4. Invia al commerciale questo indirizzo aggiungendo alla fine **`/commerciale`** (es: `https://xxxx.localtunnel.me/commerciale`).
5. Il commerciale potrà inserire nuove ricerche dal suo cellulare in tempo reale, che compariranno istantaneamente sulla tua dashboard come **"Da Approvare"**!

---

## 📁 Struttura del Progetto
* `backend/`: Server Express, logiche API e database SQLite.
  * `database.db`: File del database locale (creato all'avvio).
  * `uploads/cv/`: Cartella in cui verranno salvati fisicamente i file dei CV caricati.
  * `public/commerciale.html`: Pagina web per i dispositivi mobili del commerciale.
* `frontend/`: Applicazione a pagina singola React con design HSL premium e dark mode.
* `avvia_gestionale.bat`: Script di avvio automatico locale.
* `avvia_condivisione_cellulare.bat`: Script per rendere il form accessibile ai cellulari da remoto.
