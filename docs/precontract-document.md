# Collegamento precontratti CRM ↔ Ricerca

Quando nel gestionale Chiamate viene firmata una scheda precontratto, il CRM registra una consegna pendente, genera il PDF della scheda e invia dati e PDF al backend Ricerca tramite `POST /api/integrations/precontracts`. Il token bearer è `PRECONTRACT_INGEST_TOKEN`. Il backend riconosce i tentativi ripetuti tramite l'ID precontratto, crea un mandato con stato `In attesa di approvazione` e conserva il PDF sul disco persistente in `DATA_DIR/private/precontracts`, fuori da `/uploads`.

Il mandato compare in **Mandati da Approvare** con il PDF allegato. Il download del PDF richiede `HR_DOCUMENT_PASSWORD`; anche la modifica dello stato di approvazione dei mandati importati richiede questa password sul backend, oltre al prompt dell'interfaccia. Le ricerche native mantengono il proprio flusso attuale.

Alla prima approvazione di un mandato importato, il backend crea una pagina `/mandato/<token>` di sola lettura con password casuale separata per il mandato. Il token del link non concede accesso ai dati senza la password. La password viene conservata in hash `scrypt` sul server e il link/password sono inviati al CRM con una callback autenticata. Se il mandato viene cestinato, il CRM riceve invece la motivazione del rifiuto; il precontratto non viene annullato automaticamente. Il CRM, secondo la richiesta funzionale, conserva anche la password in una nota dell'attività precontratto: chi può leggere quella scheda può leggerla. La pagina non permette modifiche e mostra i report settimanali.

Nella scheda Ricerca è disponibile un modulo per il report della settimana. Un addetto scrive e salva un solo report per settimana; il sistema lo mette in coda e lo recapita al CRM come nuova attività del precontratto. I messaggi di accettazione e report restano in `crm_outbox` finché il CRM non conferma la consegna; il backend ritenta ogni minuto. I tentativi duplicati non devono creare doppie attività nel CRM.

## Variabili Render

Sul servizio `gestionale-backend`:

- `PRECONTRACT_INGEST_TOKEN` = stesso valore di `RESEARCH_INTEGRATION_TOKEN` nel CRM;
- `HR_DOCUMENT_PASSWORD` = password amministrativa per PDF, approvazioni dei mandati importati e report;
- `CALLS_CRM_CALLBACK_URL` = URL HTTPS del CRM con percorso `/api/integrations/research`;
- `CALLS_CRM_CALLBACK_TOKEN` = stesso valore di `RESEARCH_CALLBACK_TOKEN` nel CRM;
- `RESEARCH_PUBLIC_URL` = URL HTTPS pubblico di `gestionale-backend`.

Sul servizio `gestionale-web`:

- `RESEARCH_API_URL` = URL HTTPS pubblico di `gestionale-backend`;
- `RESEARCH_INTEGRATION_TOKEN` = token condiviso per l'importazione;
- `RESEARCH_CALLBACK_TOKEN` = token condiviso per le callback;
- `RESEARCH_DISPATCH_TOKEN` = token interno per il job di ritentativo del CRM.

Non mettere mai i valori dei token nel repository o nei log. Le variabili sono state create manualmente in Render con **Save only**: saranno attive alla prossima distribuzione dei rispettivi servizi.

## Verifiche e limiti

Test locale: `node backend/test-precontract-document.cjs` e `node backend/test-crm-integration.cjs` usano SQLite temporaneo, senza dati di produzione. La build del frontend si esegue in `frontend/` con `npm run build`.

Le nuove rotte di integrazione e la vista `/mandato` sono protette, ma le API generali preesistenti del gestionale Ricerca non hanno una sessione server-side: il login principale è ancora controllato nel frontend. Per proteggere *tutti* i dati del gestionale, occorre un intervento separato di autenticazione/autorizzazione sull'intero backend.
