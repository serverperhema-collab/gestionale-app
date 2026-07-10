const fs = require('fs');
const path = require('path');
const { db, initDatabase } = require('./backend/database');

const jsonPath = path.resolve(__dirname, 'export.json');

if (!fs.existsSync(jsonPath)) {
  console.error("Errore: Il file 'export.json' non esiste. Scaricalo dalla Web App (?page=export) e posizionalo in questa cartella.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function startMigration() {
  try {
    console.log("Inizializzazione database...");
    await initDatabase();
    
    // Svuota tabelle per evitare duplicati
    await db.exec('DELETE FROM storico');
    await db.exec('DELETE FROM appuntamenti');
    await db.exec('DELETE FROM pipeline_assunzioni');
    await db.exec('DELETE FROM ricerche');
    await db.exec('DELETE FROM clienti');
    await db.exec('DELETE FROM candidati');
    
    console.log("Pulizia tabelle esistenti completata.");

    // 1. Migrazione Candidati
    if (data.Candidati) {
      for (const c of data.Candidati) {
        await db.run(`
          INSERT INTO candidati (
            id, data_inserimento, cognome, nome, telefono, email, iban, residenza,
            competenze_chiave, disponibilita, link_cv, note_generali,
            valutazione_serieta, valutazione_disponibilita, valutazione_professionalita
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          c['ID Candidato'] || '',
          c['Data Inserimento'] || '',
          c['Cognome'] || '',
          c['Nome'] || '',
          c['Telefono'] || '',
          c['Email'] || '',
          c['IBAN'] || '',
          c['Zona/Residenza / Domicilio'] || '',
          c['Competenze Chiave'] || '',
          c['Disponibilità'] || '',
          c['Link CV (Google Drive)'] || '',
          c['Note Generali'] || '',
          c['Valutazione Serietà'] ? parseInt(c['Valutazione Serietà']) : null,
          c['Valutazione Disponibilità'] ? parseInt(c['Valutazione Disponibilità']) : null,
          c['Valutazione Professionalità'] ? parseInt(c['Valutazione Professionalità']) : null
        ]);
      }
      console.log(`Migrati ${data.Candidati.length} candidati.`);
    }

    // 2. Migrazione Clienti
    if (data.Potenziali_Clienti) {
      for (const cl of data.Potenziali_Clienti) {
        await db.run(`
          INSERT INTO clienti (
            id, nome_locale, piva, sede_legale, sede_lavoro, referente, email,
            telefono_mobile, telefono_fisso, data_inserimento,
            valutazione_serieta, valutazione_disponibilita, valutazione_interesse, valutazione_selettivita
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          cl['ID Potenziale Cliente'] || '',
          cl['Nome Locale / Azienda'] || '',
          cl['P.IVA'] || '',
          cl['Sede Legale'] || '',
          cl['Sede di Lavoro'] || '',
          cl['Referente Potenziale Cliente'] || '',
          cl['Email Potenziale Cliente'] || '',
          cl['Telefono Mobile'] || '',
          cl['Telefono Fisso'] || '',
          cl['Data Inserimento'] || '',
          cl['Valutazione Serietà'] ? parseInt(cl['Valutazione Serietà']) : null,
          cl['Valutazione Disponibilità'] ? parseInt(cl['Valutazione Disponibilità']) : null,
          cl['Valutazione Interesse'] ? parseInt(cl['Valutazione Interesse']) : null,
          cl['Valutazione Selettività'] ? parseInt(cl['Valutazione Selettività']) : null
        ]);
      }
      console.log(`Migrati ${data.Potenziali_Clienti.length} clienti.`);
    }

    // 3. Migrazione Ricerche
    if (data.Ricerche) {
      for (const r of data.Ricerche) {
        await db.run(`
          INSERT INTO ricerche (
            id, data_inserimento, azienda, consulente_commerciale, outbound, piva,
            sede_legale, sede_lavoro, referente, telefono_mobile, telefono_fisso, email,
            nr_risorse, ruolo, ccnl_livello, retribuzione, competenze_tecniche, note,
            stato_ricerca, stato_approvazione_tl, note_team_leader, data_ultimo_resoconto,
            testo_annuncio, portali_annuncio, link_annuncio, data_inserimento_annuncio, valutazione_facilita
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          r['ID Ricerca'] || '',
          r['Data Inserimento'] || '',
          r['Società'] || r['Nome Locale / Azienda'] || '',
          r['Consulente Commerciale'] || '',
          r['Outbound'] || '',
          r['P.IVA'] || '',
          r['Sede Legale'] || '',
          r['Sede di Lavoro'] || '',
          r['Referente Potenziale Cliente'] || '',
          r['Telefono Mobile'] || '',
          r['Telefono Fisso'] || '',
          r['Email Potenziale Cliente'] || '',
          r['Nr. Risorse'] ? parseInt(r['Nr. Risorse']) : 1,
          r['Ruolo'] || '',
          r['CCNL + Livello'] || '',
          r['Retribuzione Mensile + Costo Servizio (+ IVA)'] || '',
          r['Competenze Tecniche'] || '',
          r['Note (Specificità Accordi Economici: Straordinari, Ferie, Festivi)'] || '',
          r['Stato Ricerca'] || '',
          r['Stato Approvanzione TL'] || r['Stato Approvazione TL'] || '',
          r['Note Team Leader'] || '',
          r['Data Ultimo Resoconto'] || '',
          r['Testo Annuncio'] || '',
          r['Portali Annuncio'] || '',
          r['Link Annuncio'] || '',
          r['Data Inserimento Annuncio'] || '',
          r['Valutazione Facilità'] ? parseInt(r['Valutazione Facilità']) : null
        ]);
      }
      console.log(`Migrate ${data.Ricerche.length} ricerche.`);
    }

    // 4. Migrazione Pipeline Assunzioni
    if (data.Assunzioni_Pipeline) {
      for (const p of data.Assunzioni_Pipeline) {
        await db.run(`
          INSERT INTO pipeline_assunzioni (
            id, id_ricerca, id_candidato, stato_avanzamento, data_colloquio_cliente,
            feedback_candidato, feedback_cliente, stato_prova, inquadramento_proposto,
            mansione_effettiva, contratto_tipo, ore_contratto, durata_contratto,
            retribuzione_accordata, costo_servizio_finale, note_amministrazione
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          p['ID Assunzione'] || '',
          p['ID Ricerca'] || '',
          p['ID Candidato'] || '',
          p['Stato Avanzamento'] || '',
          p['Data Colloquio Cliente'] || '',
          p['Feedback Candidato'] || '',
          p['Feedback Cliente'] || '',
          p['Stato Prova'] || '',
          p['Inquadramento Proposto'] || '',
          p['Mansione Effettiva'] || '',
          p['Contratto Part-Time/Full-Time'] || '',
          p['Ore Contratto'] ? parseInt(p['Ore Contratto']) : null,
          p['Durata (Data Inizio / Data Fine)'] || '',
          p['Retribuzione Accordata'] || '',
          p['Costo Servizio Finale'] || '',
          p['Note Amministrazione'] || ''
        ]);
      }
      console.log(`Migrati ${data.Assunzioni_Pipeline.length} record in pipeline.`);
    }

    // 5. Migrazione Appuntamenti
    if (data.Appuntamenti_Colloqui) {
      for (const a of data.Appuntamenti_Colloqui) {
        await db.run(`
          INSERT INTO appuntamenti (
            id, id_ricerca, id_candidato, candidato_nome, azienda_cliente,
            data_colloquio, ora_colloquio, tipo_colloquio, stato_appuntamento, note_dettagli
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          a['ID Appuntamento'] || '',
          a['ID Ricerca'] || '',
          a['ID Candidato'] || '',
          a['Cognome Nome Candidato'] || '',
          a['Azienda Cliente'] || '',
          a['Data Colloquio'] || '',
          a['Ora Colloquio'] || '',
          a['Tipo Colloquio'] || '',
          a['Stato Appuntamento'] || '',
          a['Note/Dettagli'] || ''
        ]);
      }
      console.log(`Migrati ${data.Appuntamenti_Colloqui.length} appuntamenti colloquio.`);
    }

    // 6. Migrazione Storico Candidati
    if (data.Storico_Candidati) {
      for (const s of data.Storico_Candidati) {
        await db.run(`
          INSERT INTO storico (
            id, tipo_soggetto, id_soggetto, nome_soggetto, data_attivita, tipo_attivita, dettagli, id_ricerca_associata, soggetto_correlato
          ) VALUES (?, 'CANDIDATO', ?, ?, ?, ?, ?, ?, ?)
        `, [
          s['ID Record'] || '',
          s['ID Candidato'] || '',
          s['Cognome Nome Candidato'] || '',
          s['Data Attività'] || '',
          s['Tipo Attività'] || '',
          s['Dettagli/Note'] || '',
          s['ID Ricerca Associata'] || '',
          s['Potenziale Cliente'] || ''
        ]);
      }
      console.log(`Migrati ${data.Storico_Candidati.length} record di storico candidati.`);
    }

    // 7. Migrazione Storico Clienti
    if (data.Storico_Potenziali_Clienti) {
      for (const s of data.Storico_Potenziali_Clienti) {
        await db.run(`
          INSERT INTO storico (
            id, tipo_soggetto, id_soggetto, nome_soggetto, data_attivita, tipo_attivita, dettagli, id_ricerca_associata, soggetto_correlato
          ) VALUES (?, 'CLIENTE', ?, ?, ?, ?, ?, ?, ?)
        `, [
          s['ID Record'] || '',
          s['ID Potenziale Cliente'] || '',
          s['Nome Locale / Azienda'] || '',
          s['Data Attività'] || '',
          s['Tipo Attività'] || '',
          s['Dettagli/Note'] || '',
          s['ID Ricerca Associata'] || '',
          s['Candidato Associato'] || ''
        ]);
      }
      console.log(`Migrati ${data.Storico_Potenziali_Clienti.length} record di storico clienti.`);
    }

    console.log("MIGRAZIONE COMPLETATA CON SUCCESSO! Il database SQLite locale è stato popolato.");
    process.exit(0);
  } catch (err) {
    console.error("ERRORE DURANTE LA MIGRAZIONE:", err);
    process.exit(1);
  }
}

startMigration();
