// Add future releases at the beginning. Keep previous entries as history.
// Describe only implemented changes, in simple Italian, without secrets or personal data.
export const aggiornamenti = [
  {
    id: '2026-09-27',
    data: '2026-09-27',
    titolo: 'Un gestionale più chiaro e più sicuro',
    descrizione: 'Abbiamo sistemato diversi passaggi e preparato la nuova versione. Qui trovi cosa cambia, spiegato in parole semplici.',
    sezioni: [
      {
        titolo: 'Colloqui e candidati',
        modifiche: [
          'Se elimini l’ultimo colloquio, il candidato torna alla fase in cui era prima di fissarlo.',
          'Per un vecchio colloquio, se non sappiamo quale fosse la fase precedente, il gestionale te la chiede. Non la sceglie da solo.',
          'Un colloquio annullato è diverso da un colloquio a cui il candidato non si è presentato.',
          'Se ci sono più colloqui, il gestionale li considera tutti prima di cambiare la fase del candidato.',
          'Se il candidato è già passato alla prova, modificare un vecchio colloquio non lo fa tornare indietro.',
          'Se scolleghi un candidato che ha dei colloqui, ti viene chiesta conferma prima di togliere anche quei colloqui. Lo storico delle attività rimane.'
        ]
      },
      {
        titolo: 'Prove, assunzioni e chiusura della ricerca',
        modifiche: [
          'Quando una prova va bene, il candidato diventa “Idoneo”. Non è ancora segnato come assunto.',
          'Il candidato diventa “Assunto” quando il server di posta accetta l’invio della scheda all’amministrazione. Questo non significa che l’amministrazione l’abbia già letta.',
          'Se l’invio della scheda fallisce, o è soltanto una prova di invio, il candidato non viene segnato come assunto.',
          'Puoi salvare la scheda di assunzione come bozza e riaprirla per finirla dopo.',
          'La ricerca non si chiude da sola: la chiudi tu con il pulsante e una conferma.',
          'Quando approvi definitivamente un mandato in riserva, la ricerca mantiene la fase raggiunta. Se era “Avviata”, resta “Avviata”.'
        ]
      },
      {
        titolo: 'WhatsApp, CV e documenti',
        modifiche: [
          'Aprire WhatsApp non significa aver inviato il CV. Ora il gestionale ti chiede se lo hai davvero inviato prima di segnarlo come inviato.',
          'I CV da mandare ai clienti hanno un link protetto. Il cliente può aprirlo senza entrare nell’area interna.',
          'I documenti d’identità restano nell’area interna: non si aprono liberamente come i CV condivisi.',
          'Abbiamo aggiunto controlli sui file caricati e sui loro nomi, per evitare che un nuovo allegato sostituisca un altro file per sbaglio.',
          'Se un documento non viene caricato, la finestra resta aperta e mostra il problema.'
        ]
      },
      {
        titolo: 'Accessi e posta elettronica',
        modifiche: [
          'La password viene controllata dal server, non soltanto dalla pagina sullo schermo.',
          'Anche gli accessi di clienti e commerciali vengono controllati dal server. Gli account già presenti restano utilizzabili.',
          'Le password degli account esterni vengono conservate in una forma che non si legge come una normale password.',
          'La password della posta non viene mostrata quando apri la configurazione. Se lasci vuoto quel campo mentre modifichi gli altri dati, la password già salvata rimane.',
          'Se l’accesso scade, il gestionale te lo segnala. Quando esci, i dati caricati vengono tolti dalla sessione della pagina.'
        ]
      },
      {
        titolo: 'Salvataggi e collegamento con il gestionale Chiamate',
        modifiche: [
          'Le parti di uno stesso salvataggio vengono gestite insieme: se una parte fallisce, non lasciamo il lavoro salvato a metà nel database.',
          'Se arrivano più richieste insieme, il gestionale le gestisce in ordine per ridurre i conflitti.',
          'Abbiamo aggiunto controlli su date, orari, numero di persone richieste e fasi.',
          'Modificare una nota o un singolo campo non cancella la fase del candidato.',
          'Se passi velocemente da un mandato all’altro, i dati del primo non devono comparire nel secondo.',
          'Gli errori di caricamento e le richieste che impiegano troppo tempo vengono segnalati.',
          'I messaggi di aggiornamento verso il gestionale Chiamate partono dopo che il salvataggio è stato completato.',
          'Abbiamo verificato con dati finti i passaggi dei precontratti, degli allegati e dei resoconti tra i due gestionali.'
        ]
      },
      {
        titolo: 'Preparazione per lavorare e pubblicare',
        modifiche: [
          'La nuova versione fa funzionare pagina e server insieme su Render. Non serve una pubblicazione separata su Vercel: per entrare basta usare l’indirizzo del gestionale su Render.',
          'Nella copia locale c’è un file da aprire con un doppio clic per avviare il gestionale.',
          'Le prove usano dati locali separati: non sostituiscono il database online.',
          'I vecchi strumenti, le vecchie configurazioni di Vercel e le vecchie sessioni WhatsApp sono stati tolti dalla pubblicazione. Il materiale da conservare è nell’archivio locale.',
          'Il backup rimane separato dalla cartella di lavoro e non viene pubblicato.',
          'Abbiamo aggiornato i componenti del programma e aggiunto prove automatiche. I test aiutano a trovare errori, ma non possono garantire che non esista mai un problema.',
          'Se il database non può essere aperto correttamente, il server si ferma invece di continuare come se tutto andasse bene.'
        ]
      },
      {
        titolo: 'Questa pagina degli aggiornamenti',
        modifiche: [
          'Nel menu a sinistra trovi la nuova voce “Aggiornamenti”.',
          'Le novità sono ordinate per data, con le più recenti in alto.',
          'Per le prossime modifiche aggiungeremo una nuova spiegazione qui, senza cancellare quelle precedenti.'
        ]
      }
    ]
  }
];
