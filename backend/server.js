const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration (allow frontend port 5173 or any origin)
app.use(cors());
app.use(express.json());

const dataDir = process.env.DATA_DIR || __dirname;
const uploadsDir = path.join(dataDir, 'uploads');

// Create uploads directories if they don't exist
if (!fs.existsSync(path.join(uploadsDir, 'cv'))) {
  fs.mkdirSync(path.join(uploadsDir, 'cv'), { recursive: true });
}
if (!fs.existsSync(path.join(uploadsDir, 'doc'))) {
  fs.mkdirSync(path.join(uploadsDir, 'doc'), { recursive: true });
}
if (!fs.existsSync(path.join(uploadsDir, 'hiring_docs'))) {
  fs.mkdirSync(path.join(uploadsDir, 'hiring_docs'), { recursive: true });
}

// Serve uploads folder statically
app.use('/uploads', express.static(uploadsDir));

// Serve public folder and serve commercial mobile view
app.use(express.static(path.join(__dirname, 'public')));
app.get('/commerciale', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'commerciale.html'));
});

// Configure Multer for CV & Identity Documents uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = path.join(uploadsDir, 'cv');
    if (file.fieldname === 'docIdFile') {
      folder = path.join(uploadsDir, 'doc');
    }
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const cognome = req.body.cognome ? req.body.cognome.trim().replace(/\s+/g, '_') : 'Sconosciuto';
    const nome = req.body.nome ? req.body.nome.trim().replace(/\s+/g, '_') : '';
    const cleanNome = `${cognome}_${nome}`.replace(/_+$/, '');
    if (file.fieldname === 'docIdFile') {
      cb(null, `DOC_${cleanNome}_${Date.now()}${ext}`);
    } else {
      cb(null, `CV_${cleanNome}_${Date.now()}${ext}`);
    }
  }
});

const upload = multer({ storage: storage });

// Helper for dynamic email sending using SMTP config database table
async function inviaEmailHelper(dest, subject, body, attachments = []) {
  try {
    const configRow = await db.get("SELECT valore FROM configurazione_email WHERE chiave = 'smtp_config'");
    if (!configRow) {
      console.warn("Nessuna configurazione email trovata nel database.");
      return { success: false, simulated: true };
    }
    const config = JSON.parse(configRow.valore);
    if (!config.user || config.user.includes('inserisci-la-tua-mail')) {
      console.warn("SMTP non configurato. Invio simulato.");
      return { success: false, simulated: true };
    }
    
    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: parseInt(config.port || '465'),
      secure: config.secure === 'true' || config.secure === true || config.port === '465',
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
    
    await transporter.sendMail({
      from: `"HEMA WORK / MDI" <${config.user}>`,
      to: dest,
      subject: subject,
      text: body,
      attachments: attachments
    });
    return { success: true, simulated: false };
  } catch (err) {
    console.error("Errore nell'invio dell'email:", err);
    throw err;
  }
}

// Helper to write to historical activities log
async function logActivity(tipoSoggetto, idSoggetto, nomeSoggetto, tipoAttivita, dettagli, idRicerca = "", soggettoCorrelato = "") {
  try {
    const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await db.run(`
      INSERT INTO storico (id, tipo_soggetto, id_soggetto, nome_soggetto, data_attivita, tipo_attivita, dettagli, id_ricerca_associata, soggetto_correlato)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, tipoSoggetto, idSoggetto, nomeSoggetto, new Date().toISOString(), tipoAttivita, dettagli, idRicerca, soggettoCorrelato]);
  } catch (err) {
    console.error("Errore nel salvataggio del log storico:", err);
  }
}

// Helper to generate IDs
function generateID(prefix) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

// ----------------- API ENDPOINTS -----------------

// 1. RICERCHE (MANDATI)
app.get('/api/ricerche', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM ricerche ORDER BY data_inserimento DESC');
    
    // For each search, count candidates in pipeline
    const result = await Promise.all(list.map(async (r) => {
      const stats = await db.get(`
        SELECT 
          COUNT(CASE WHEN stato_avanzamento = 'CV Ricevuto' THEN 1 END) as cv_ricevuti,
          COUNT(CASE WHEN stato_avanzamento = 'In Prova' THEN 1 END) as in_prova,
          COUNT(CASE WHEN stato_avanzamento = 'Approvato/Assunto' THEN 1 END) as assunti
        FROM pipeline_assunzioni
        WHERE id_ricerca = ?
      `, [r.id]);
      
      return {
        ...r,
        stats: stats || { cv_ricevuti: 0, in_prova: 0, assunti: 0 }
      };
    }));
    
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Single Research detail (with pipeline and interviews)
app.get('/api/ricerche/:id', async (req, res) => {
  try {
    const ricerca = await db.get('SELECT * FROM ricerche WHERE id = ?', [req.params.id]);
    if (!ricerca) {
      return res.status(404).json({ success: false, error: 'Ricerca non trovata' });
    }
    
    // Get associated candidates in pipeline
    const pipeline = await db.all(`
      SELECT p.*, c.cognome, c.nome, c.telefono, c.email, c.link_cv, v.punteggio_complessivo
      FROM pipeline_assunzioni p
      JOIN candidati c ON p.id_candidato = c.id
      LEFT JOIN valutazioni_candidati v ON c.id = v.id_candidato
      WHERE p.id_ricerca = ?
    `, [req.params.id]);
    
    // Get interviews scheduled
    const appuntamenti = await db.all(`
      SELECT a.*, v.punteggio_complessivo
      FROM appuntamenti a
      LEFT JOIN valutazioni_candidati v ON a.id_candidato = v.id_candidato
      WHERE a.id_ricerca = ? 
      ORDER BY a.data_colloquio DESC, a.ora_colloquio DESC
    `, [req.params.id]);
    
    res.json({
      success: true,
      data: {
        ricerca,
        candidatiCollegati: pipeline.map(p => ({
          idAssunzione: p.id,
          idCandidato: p.id_candidato,
          nomeCompleto: `${p.cognome} ${p.nome}`,
          telefono: p.telefono,
          email: p.email,
          linkCV: p.link_cv,
          statoAvanzamento: p.stato_avanzamento,
          statoProva: p.stato_prova,
          noteAmministrazione: p.note_amministrazione,
          dataInvioCV: p.data_invio_cv,
          dataInizioProva: p.data_inizio_prova,
          dataScadenzaProva: p.data_scadenza_prova,
          provaContrattualizzata: p.prova_contrattualizzata,
          inviatoCliente: p.inviato_cliente,
          feedbackStato: p.feedback_stato,
          feedbackNote: p.feedback_note,
          punteggioComplessivo: p.punteggio_complessivo
        })),
        appuntamenti: appuntamenti.map(a => ({
          id: a.id,
          candidato: a.candidato_nome,
          data: a.data_colloquio,
          ora: a.ora_colloquio,
          tipo: a.tipo_colloquio,
          luogo: a.luogo,
          stato: a.stato_appuntamento,
          note: a.note_dettagli,
          idCandidato: a.id_candidato,
          punteggioComplessivo: a.punteggio_complessivo
        }))
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
app.get('/api/annunci', async (req, res) => {
  try {
    const list = await db.all(`
      SELECT a.*, GROUP_CONCAT(ra.id_ricerca) as ricerche_collegate
      FROM annunci a
      LEFT JOIN ricerche_annunci ra ON a.id = ra.id_annuncio
      GROUP BY a.id
      ORDER BY a.data_inserimento_annuncio DESC
    `);
    res.json({ success: true, annunci: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/ricerche/:id/annunci', async (req, res) => {
  try {
    const list = await db.all('SELECT a.*, ra.data_collegamento FROM annunci a JOIN ricerche_annunci ra ON a.id = ra.id_annuncio WHERE ra.id_ricerca = ? ORDER BY a.data_inserimento_annuncio DESC', [req.params.id]);
    res.json({ success: true, annunci: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});


app.post('/api/annunci', async (req, res) => {
  try {
    const { testo_annuncio, portali_annuncio, link_annuncio, data_inserimento_annuncio, data_scadenza_annuncio, note } = req.body;
    const id = generateID('ANN');
    
    await db.run(`
      INSERT INTO annunci (id, id_ricerca, testo_annuncio, portali_annuncio, link_annuncio, data_inserimento_annuncio, data_scadenza_annuncio, stato_annuncio, note)
      VALUES (?, NULL, ?, ?, ?, ?, ?, 'Attivo', ?)
    `, [id, testo_annuncio || '', portali_annuncio || '', link_annuncio || '', data_inserimento_annuncio || '', data_scadenza_annuncio || '', note || '']);
    
    res.json({ success: true, message: 'Annuncio creato con successo', id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/ricerche/:id/annunci-link', async (req, res) => {
  try {
    const { id_annuncio } = req.body;
    const id_ricerca = req.params.id;
    if (!id_annuncio) return res.status(400).json({ success: false, error: 'id_annuncio mancante' });

    // Controlla se  gi collegato
    const existing = await db.get('SELECT * FROM ricerche_annunci WHERE id_ricerca = ? AND id_annuncio = ?', [id_ricerca, id_annuncio]);
    if (existing) {
      return res.json({ success: true, message: 'Annuncio gi collegato' });
    }

    await db.run('INSERT INTO ricerche_annunci (id_ricerca, id_annuncio, data_collegamento) VALUES (?, ?, ?)', [id_ricerca, id_annuncio, new Date().toISOString()]);

    const ricerca = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
    const ann = await db.get('SELECT portali_annuncio FROM annunci WHERE id = ?', [id_annuncio]);

    if (ricerca) {
      await logActivity(
        'RICERCA', id_ricerca, ricerca.azienda, 
        'Collegamento Annuncio', 
        `Collegato annuncio esistente (${id_annuncio}). Portali: ${ann?.portali_annuncio || 'N/D'}`, 
        id_ricerca, id_annuncio
      );
    }
    
    res.json({ success: true, message: 'Annuncio collegato con successo' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/ricerche/:id/annunci-link/:id_annuncio', async (req, res) => {
  try {
    const id_ricerca = req.params.id;
    const id_annuncio = req.params.id_annuncio;

    await db.run('DELETE FROM ricerche_annunci WHERE id_ricerca = ? AND id_annuncio = ?', [id_ricerca, id_annuncio]);

    const ricerca = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
    const ann = await db.get('SELECT portali_annuncio FROM annunci WHERE id = ?', [id_annuncio]);

    if (ricerca) {
      await logActivity(
        'RICERCA', id_ricerca, ricerca.azienda, 
        'Scollegamento Annuncio', 
        `Scollegato annuncio (${id_annuncio}). Portali: ${ann?.portali_annuncio || 'N/D'}`, 
        id_ricerca, id_annuncio
      );
    }

    res.json({ success: true, message: 'Annuncio scollegato con successo' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/ricerche/:id/annunci', async (req, res) => {
  try {
    const { testo_annuncio, portali_annuncio, link_annuncio, data_inserimento_annuncio, data_scadenza_annuncio, note } = req.body;
    const id = generateID('ANN');
    
    // Crea l'annuncio globale
    await db.run(`
      INSERT INTO annunci (id, id_ricerca, testo_annuncio, portali_annuncio, link_annuncio, data_inserimento_annuncio, data_scadenza_annuncio, stato_annuncio, note)
      VALUES (?, NULL, ?, ?, ?, ?, ?, 'Attivo', ?)
    `, [id, testo_annuncio || '', portali_annuncio || '', link_annuncio || '', data_inserimento_annuncio || '', data_scadenza_annuncio || '', note || '']);
    
    // Collega l'annuncio alla ricerca
    await db.run('INSERT INTO ricerche_annunci (id_ricerca, id_annuncio, data_collegamento) VALUES (?, ?, ?)', [req.params.id, id, new Date().toISOString()]);
    
    const ricerca = await db.get('SELECT azienda, referente, piva FROM ricerche WHERE id = ?', [req.params.id]);
    let clientId = '';
    if (ricerca) {
      const cl = await db.get('SELECT id FROM clienti WHERE nome_locale = ? OR piva = ?', [ricerca.azienda, ricerca.piva]);
      if (cl) clientId = cl.id;
      
      await logActivity(
        'RICERCA', req.params.id, ricerca.azienda, 
        'Inserimento Annuncio', 
        `Nuovo annuncio creato e collegato (${id}). Portali: ${portali_annuncio || 'N/D'}. Link: ${link_annuncio || 'N/D'}. Scadenza: ${data_scadenza_annuncio || 'N/D'}`, 
        req.params.id, id
      );
    }
    
    res.json({ success: true, message: 'Annuncio creato e collegato con successo', id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/ricerche/:id_ricerca/annunci/:id_annuncio/collega', async (req, res) => {
  try {
    const { id_ricerca, id_annuncio } = req.params;
    
    const check = await db.get('SELECT 1 FROM ricerche_annunci WHERE id_ricerca = ? AND id_annuncio = ?', [id_ricerca, id_annuncio]);
    if (check) return res.status(400).json({ success: false, error: 'Annuncio già collegato a questa ricerca' });
    
    await db.run('INSERT INTO ricerche_annunci (id_ricerca, id_annuncio, data_collegamento) VALUES (?, ?, ?)', [id_ricerca, id_annuncio, new Date().toISOString()]);
    
    const ricerca = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
    const annuncio = await db.get('SELECT portali_annuncio FROM annunci WHERE id = ?', [id_annuncio]);
    
    await logActivity(
      'RICERCA', id_ricerca, ricerca ? ricerca.azienda : 'N/D',
      'Annuncio Collegato', 
      `L'annuncio (${id_annuncio}) sui portali [${annuncio ? annuncio.portali_annuncio : 'N/D'}] è stato collegato a questa ricerca.`, 
      id_ricerca, id_annuncio
    );
    
    res.json({ success: true, message: 'Annuncio collegato con successo' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/ricerche/:id_ricerca/annunci/:id_annuncio/scollega', async (req, res) => {
  try {
    const { id_ricerca, id_annuncio } = req.params;
    
    await db.run('DELETE FROM ricerche_annunci WHERE id_ricerca = ? AND id_annuncio = ?', [id_ricerca, id_annuncio]);
    
    const ricerca = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
    
    await logActivity(
      'RICERCA', id_ricerca, ricerca ? ricerca.azienda : 'N/D',
      'Annuncio Scollegato', 
      `L'annuncio (${id_annuncio}) è stato scollegato da questa ricerca.`, 
      id_ricerca, id_annuncio
    );
    
    res.json({ success: true, message: 'Annuncio scollegato con successo' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/annunci/:id', async (req, res) => {
  try {
    const { testo_annuncio, portali_annuncio, link_annuncio, data_inserimento_annuncio, data_scadenza_annuncio, stato_annuncio, note, motivazione_stato } = req.body;
    
    const annuncio = await db.get('SELECT * FROM annunci WHERE id = ?', [req.params.id]);
    if (!annuncio) return res.status(404).json({ success: false, error: 'Annuncio non trovato' });
    
    const ricerca = await db.get('SELECT azienda, referente, piva FROM ricerche WHERE id = ?', [annuncio.id_ricerca]);
    let clientId = '';
    if (ricerca) {
      const cl = await db.get('SELECT id FROM clienti WHERE nome_locale = ? OR piva = ?', [ricerca.azienda, ricerca.piva]);
      if (cl) clientId = cl.id;
    }
    
    if (stato_annuncio && stato_annuncio !== annuncio.stato_annuncio) {
      const details = `Stato annuncio (${req.params.id}) modificato da '${annuncio.stato_annuncio}' a '${stato_annuncio}'. Motivazione: ${motivazione_stato || 'N/D'}`;
      await logActivity(
        'ANNUNCIO', req.params.id, 'N/D', 
        'Stato Annuncio', details, 
        null, req.params.id
      );
    }
    
    const newLink = link_annuncio !== undefined ? link_annuncio : annuncio.link_annuncio;
    const newScadenza = data_scadenza_annuncio !== undefined ? data_scadenza_annuncio : annuncio.data_scadenza_annuncio;
    const newPubblicazione = data_inserimento_annuncio !== undefined ? data_inserimento_annuncio : annuncio.data_inserimento_annuncio;
    
    if (newLink !== annuncio.link_annuncio || newScadenza !== annuncio.data_scadenza_annuncio || newPubblicazione !== annuncio.data_inserimento_annuncio || testo_annuncio !== annuncio.testo_annuncio || note !== annuncio.note) {
      await logActivity(
        'ANNUNCIO', req.params.id, 'N/D', 
        'Aggiornamento Annuncio', 
        `Aggiornato dettagli annuncio (${req.params.id}). Link: ${newLink || 'N/D'}. Pubblicazione: ${newPubblicazione || 'N/D'}. Scadenza: ${newScadenza || 'N/D'}`, 
        null, req.params.id
      );
    }
    
    await db.run(`
      UPDATE annunci 
      SET testo_annuncio = COALESCE(?, testo_annuncio),
          portali_annuncio = COALESCE(?, portali_annuncio),
          link_annuncio = COALESCE(?, link_annuncio),
          data_inserimento_annuncio = COALESCE(?, data_inserimento_annuncio),
          data_scadenza_annuncio = COALESCE(?, data_scadenza_annuncio),
          stato_annuncio = COALESCE(?, stato_annuncio),
          note = COALESCE(?, note)
      WHERE id = ?
    `, [
      testo_annuncio !== undefined ? testo_annuncio : null, 
      portali_annuncio !== undefined ? portali_annuncio : null, 
      link_annuncio !== undefined ? link_annuncio : null, 
      data_inserimento_annuncio !== undefined ? data_inserimento_annuncio : null, 
      data_scadenza_annuncio !== undefined ? data_scadenza_annuncio : null, 
      stato_annuncio !== undefined ? stato_annuncio : null, 
      note !== undefined ? note : null, 
      req.params.id
    ]);
    
    res.json({ success: true, message: 'Annuncio aggiornato con successo' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/annunci/:id', async (req, res) => {
  try {
    const annuncio = await db.get('SELECT * FROM annunci WHERE id = ?', [req.params.id]);
    if (!annuncio) return res.status(404).json({ success: false, error: 'Annuncio non trovato' });

    const ricerca = await db.get('SELECT azienda, referente, piva FROM ricerche WHERE id = ?', [annuncio.id_ricerca]);
    let clientId = '';
    if (ricerca) {
      const cl = await db.get('SELECT id FROM clienti WHERE nome_locale = ? OR piva = ?', [ricerca.azienda, ricerca.piva]);
      if (cl) clientId = cl.id;
    }

    await db.run('DELETE FROM ricerche_annunci WHERE id_annuncio = ?', [req.params.id]);
    await db.run('DELETE FROM annunci WHERE id = ?', [req.params.id]);

    await logActivity(
      'ANNUNCIO', req.params.id, 'N/D', 
      'Eliminazione Annuncio', 
      `Eliminato annuncio di lavoro (${req.params.id}). Portali: ${annuncio.portali_annuncio || 'N/D'}`, 
      null, req.params.id
    );

    res.json({ success: true, message: 'Annuncio eliminato con successo' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/ricerche', async (req, res) => {
  try {
    const { 
      azienda, ruolo, referente, telefono_mobile, telefono_fisso, email, sede_lavoro, 
      nr_risorse, ccnl_livello, retribuzione, competenze_tecniche, note, 
      consulente_commerciale, outbound, piva, sede_legale, settore,
      ore_lavoro, orario_lavoro, ore_lavoro_tipo
    } = req.body;
    if (!azienda || !ruolo) {
      return res.status(400).json({ success: false, error: 'Azienda e Ruolo sono obbligatori' });
    }
    
    const id = generateID('R');
    const daApprovare = req.body.da_approvare === true || req.body.da_approvare === 'true';
    const approvazione = daApprovare ? 'In attesa di approvazione' : 'Approvata';
    const statoRic = daApprovare ? '' : 'Ricerca Inserita';
    
    await db.run(`
      INSERT INTO ricerche (
        id, data_inserimento, azienda, ruolo, referente, telefono_mobile, telefono_fisso, email, 
        sede_lavoro, nr_risorse, ccnl_livello, retribuzione, competenze_tecniche, 
        note, stato_ricerca, stato_approvazione_tl, consulente_commerciale, outbound, piva, 
        sede_legale, settore, ore_lavoro, orario_lavoro, ore_lavoro_tipo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, 
      new Date().toISOString().substring(0, 10), 
      azienda, 
      ruolo, 
      referente || '', 
      telefono_mobile || '', 
      telefono_fisso || '', 
      email || '', 
      sede_lavoro || '', 
      nr_risorse ? parseInt(nr_risorse) : 1, 
      ccnl_livello || '', 
      retribuzione || '', 
      competenze_tecniche || '', 
      note || '',
      statoRic,
      approvazione,
      consulente_commerciale || '',
      outbound || '',
      piva || '',
      sede_legale || '',
      settore || '',
      ore_lavoro ? parseInt(ore_lavoro) : null,
      orario_lavoro || '',
      ore_lavoro_tipo || 'Settimanali'
    ]);
    
    // Auto-create client entry if approved immediately
    if (approvazione === 'Approvata') {
      let clientExists = null;
      if (piva) {
        clientExists = await db.get('SELECT id FROM clienti WHERE piva = ?', [piva]);
      } else {
        clientExists = await db.get('SELECT id FROM clienti WHERE nome_locale = ?', [azienda]);
      }
      
      if (!clientExists) {
        const clId = generateID('PC');
        await db.run(`
          INSERT INTO clienti (id, data_inserimento, nome_locale, piva, sede_legale, sede_lavoro, referente, email, telefono_mobile)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          clId,
          new Date().toISOString().substring(0, 10),
          azienda,
          piva || '',
          sede_legale || '',
          sede_lavoro || '',
          referente || '',
          email || '',
          telefono_mobile || ''
        ]);
      }
    }
    
    await logActivity('CLIENTE', id, azienda, 'Nuovo Mandato', `Aperta ricerca per ruolo ${ruolo} da commerciale ${consulente_commerciale || 'Operativo'}`, id, referente);
    
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/ricerche/:id', async (req, res) => {
  try {
    const { 
      testo_annuncio, portali_annuncio, link_annuncio, data_inserimento_annuncio, 
      facilita, stato_ricerca, stato_approvazione_tl, motivazione,
      data_scadenza_annuncio, stato_annuncio, motivazione_stato, settore,
      ore_lavoro, orario_lavoro, ore_lavoro_tipo
    } = req.body;
    
    const ricerca = await db.get('SELECT * FROM ricerche WHERE id = ?', [req.params.id]);
    if (!ricerca) return res.status(404).json({ success: false, error: 'Ricerca non trovata' });
    
    // Look up client ID
    let clientId = '';
    const cl = await db.get('SELECT id FROM clienti WHERE nome_locale = ? OR piva = ?', [ricerca.azienda, ricerca.piva]);
    if (cl) clientId = cl.id;
    
    // Log announcement changes
    const newLink = link_annuncio !== undefined ? link_annuncio : ricerca.link_annuncio;
    const newScadenza = data_scadenza_annuncio !== undefined ? data_scadenza_annuncio : ricerca.data_scadenza_annuncio;
    const newPubblicazione = data_inserimento_annuncio !== undefined ? data_inserimento_annuncio : ricerca.data_inserimento_annuncio;
    
    if (newLink !== ricerca.link_annuncio || newScadenza !== ricerca.data_scadenza_annuncio || newPubblicazione !== ricerca.data_inserimento_annuncio) {
      await logActivity(
        'CLIENTE', clientId || req.params.id, ricerca.azienda, 
        'Aggiornamento Annuncio', 
        `Aggiornato annuncio di lavoro. Link: ${newLink || 'N/D'}. Pubblicazione: ${newPubblicazione || 'N/D'}. Scadenza: ${newScadenza || 'N/D'}`, 
        ricerca.id, ricerca.referente
      );
    }
    
    // Log announcement status changes
    if (stato_annuncio && stato_annuncio !== ricerca.stato_annuncio) {
      const details = `Stato annuncio modificato da '${ricerca.stato_annuncio || 'Attivo'}' a '${stato_annuncio}'. Motivazione: ${motivazione_stato || 'N/D'}`;
      await logActivity(
        'CLIENTE', clientId || req.params.id, ricerca.azienda, 
        'Stato Annuncio', details, 
        ricerca.id, ricerca.referente
      );
    }

    let noteAggiornate = ricerca.note;
    if (motivazione) {
      const dataCorrente = new Date().toLocaleDateString('it-IT');
      const prefix = stato_approvazione_tl === 'Cestinato' ? 'MOTIVAZIONE CESTINAMENTO' 
                   : stato_approvazione_tl === 'In Pausa' ? 'MOTIVAZIONE MESSA IN PAUSA'
                   : 'MOTIVAZIONE RISERVA';
      noteAggiornate = `${ricerca.note ? ricerca.note + '\n' : ''}[${dataCorrente} - ${prefix}]: ${motivazione}`;
    }
    
    await db.run(`
      UPDATE ricerche 
      SET testo_annuncio = COALESCE(?, testo_annuncio),
          portali_annuncio = COALESCE(?, portali_annuncio),
          link_annuncio = COALESCE(?, link_annuncio),
          data_inserimento_annuncio = COALESCE(?, data_inserimento_annuncio),
          valutazione_facilita = COALESCE(?, valutazione_facilita),
          stato_ricerca = COALESCE(?, stato_ricerca),
          stato_approvazione_tl = COALESCE(?, stato_approvazione_tl),
          data_scadenza_annuncio = COALESCE(?, data_scadenza_annuncio),
          stato_annuncio = COALESCE(?, stato_annuncio),
          note = ?,
          settore = COALESCE(?, settore),
          ore_lavoro = COALESCE(?, ore_lavoro),
          orario_lavoro = COALESCE(?, orario_lavoro),
          ore_lavoro_tipo = COALESCE(?, ore_lavoro_tipo)
      WHERE id = ?
    `, [
      testo_annuncio,
      portali_annuncio,
      link_annuncio,
      data_inserimento_annuncio,
      facilita ? parseInt(facilita) : null,
      stato_ricerca,
      stato_approvazione_tl,
      data_scadenza_annuncio,
      stato_annuncio,
      noteAggiornate,
      settore,
      ore_lavoro !== undefined ? (ore_lavoro ? parseInt(ore_lavoro) : null) : undefined,
      orario_lavoro,
      ore_lavoro_tipo,
      req.params.id
    ]);
    
    // Auto-create client entry if approved
    if ((stato_approvazione_tl === 'Approvata' || stato_approvazione_tl === 'Approvata con Riserva') && ricerca.stato_approvazione_tl !== stato_approvazione_tl) {
      let clientExists = null;
      if (ricerca.piva) {
        clientExists = await db.get('SELECT id FROM clienti WHERE piva = ?', [ricerca.piva]);
      } else {
        clientExists = await db.get('SELECT id FROM clienti WHERE nome_locale = ?', [ricerca.azienda]);
      }
      
      if (!clientExists) {
        const clId = generateID('PC');
        await db.run(`
          INSERT INTO clienti (id, data_inserimento, nome_locale, piva, sede_legale, sede_lavoro, referente, email, telefono_mobile)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          clId,
          new Date().toISOString().substring(0, 10),
          ricerca.azienda,
          ricerca.piva || '',
          ricerca.sede_legale || '',
          ricerca.sede_lavoro || '',
          ricerca.referente || '',
          ricerca.email || '',
          ricerca.telefono_mobile || ''
        ]);
      }
    }
    
    // Activity logger for approval status transitions
    if (stato_approvazione_tl && stato_approvazione_tl !== ricerca.stato_approvazione_tl) {
      let dettagliLog = `Stato approvazione modificato da '${ricerca.stato_approvazione_tl || 'N/D'}' a '${stato_approvazione_tl}'`;
      if (motivazione) {
        dettagliLog += `. Motivazione inserita: "${motivazione}"`;
      }
      await logActivity('CLIENTE', req.params.id, ricerca.azienda, 'Cambio Approvazione', dettagliLog, req.params.id, ricerca.referente);
    }
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/ricerche/:id/note', async (req, res) => {
  try {
    const { nota } = req.body;
    if (!nota || !nota.trim()) {
      return res.status(400).json({ success: false, error: 'Nota vuota' });
    }

    const ricerca = await db.get('SELECT * FROM ricerche WHERE id = ?', [req.params.id]);
    if (!ricerca) return res.status(404).json({ success: false, error: 'Ricerca non trovata' });

    const dataCorrente = new Date().toLocaleDateString('it-IT');
    const noteAggiornate = `${ricerca.note ? ricerca.note + '\n' : ''}[${dataCorrente} - NOTA DI RICERCA]: ${nota}`;

    await db.run('UPDATE ricerche SET note = ? WHERE id = ?', [noteAggiornate, req.params.id]);

    // Save to storico logs
    await logActivity('CLIENTE', req.params.id, ricerca.azienda, 'Nota Ricerca', nota.trim(), req.params.id, ricerca.referente);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 2. CANDIDATI (DATABASE & FILTERS)
app.get('/api/candidati', async (req, res) => {
  try {
    const { q, cap, mansione } = req.query;
    let query = `
      SELECT c.*, v.punteggio_complessivo 
      FROM candidati c
      LEFT JOIN valutazioni_candidati v ON c.id = v.id_candidato
      WHERE 1=1
    `;
    const params = [];
    
    if (q) {
      query += ' AND (c.cognome LIKE ? OR c.nome LIKE ? OR c.competenze_chiave LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    
    if (cap) {
      query += ' AND c.residenza LIKE ?';
      params.push(`%${cap}%`);
    }
    
    if (mansione) {
      query += ' AND c.competenze_chiave LIKE ?';
      params.push(`%${mansione}%`);
    }
    
    query += ' ORDER BY c.cognome ASC, c.nome ASC';
    
    const list = await db.all(query, params);
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Upload/Update just the CV for an existing candidate
app.post('/api/candidati/:id/cv', upload.single('cvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file inviato' });
    }
    const cand = await db.get('SELECT * FROM candidati WHERE id = ?', [req.params.id]);
    if (!cand) return res.status(404).json({ success: false, error: 'Candidato non trovato' });
    
    if (cand.link_cv && cand.link_cv.startsWith('/uploads')) {
      const oldPath = path.join(__dirname, cand.link_cv);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    
    const linkCV = `/uploads/cv/${req.file.filename}`;
    await db.run('UPDATE candidati SET link_cv = ? WHERE id = ?', [linkCV, req.params.id]);
    
    // Log the activity
    await logActivity('CANDIDATO', req.params.id, `${cand.cognome} ${cand.nome}`, 'Aggiornamento CV', 'Caricato nuovo Curriculum Vitae');
    
    res.json({ success: true, link_cv: linkCV });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create candidate with CV and doc upload
app.post('/api/candidati', upload.fields([{ name: 'cvFile', maxCount: 1 }, { name: 'docIdFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { cognome, nome, telefono, email, residenza, competenze_chiave, disponibilita, note_generali, id_ricerca, iban, settore, codice_fiscale } = req.body;
    if (!cognome || !nome) {
      return res.status(400).json({ success: false, error: 'Cognome e Nome sono obbligatori' });
    }
    
    const id = generateID('C');
    let linkCV = '';
    let linkDocumenti = '';
    
    if (req.files) {
      if (req.files.cvFile && req.files.cvFile[0]) {
        linkCV = `/uploads/cv/${req.files.cvFile[0].filename}`;
      }
      if (req.files.docIdFile && req.files.docIdFile[0]) {
        linkDocumenti = `/uploads/doc/${req.files.docIdFile[0].filename}`;
      }
    }
    
    await db.run(`
      INSERT INTO candidati (id, data_inserimento, cognome, nome, telefono, email, residenza, competenze_chiave, disponibilita, link_cv, note_generali, iban, settore, codice_fiscale, link_documenti)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      new Date().toISOString().substring(0, 10),
      cognome,
      nome,
      telefono || '',
      email || '',
      residenza || '',
      competenze_chiave || '',
      disponibilita || 'Immediata',
      linkCV,
      note_generali || '',
      iban || '',
      settore || '',
      codice_fiscale || '',
      linkDocumenti
    ]);
    
    await logActivity('CANDIDATO', id, `${cognome} ${nome}`, 'Inserimento CV', `Profilo inserito nel database. Mansione: ${competenze_chiave}`);
    
    // If id_ricerca was provided, link immediately in pipeline
    if (id_ricerca) {
      const idAssunzione = generateID('A');
      await db.run(`
        INSERT INTO pipeline_assunzioni (id, id_ricerca, id_candidato, stato_avanzamento)
        VALUES (?, ?, ?, 'CV Ricevuto')
      `, [idAssunzione, id_ricerca, id]);
      
      const r = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
      if (r) {
        await logActivity('CLIENTE', id_ricerca, r.azienda, 'Ricezione CV', `Presentato CV del candidato ${cognome} ${nome}`, id_ricerca, `${cognome} ${nome}`);
      }
    }
    
    res.json({ success: true, id, linkCV });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/candidati/:id', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM candidati WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, error: 'Candidato non trovato' });
    res.json({ success: true, data: row });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/candidati/:id', upload.fields([{ name: 'cvFile', maxCount: 1 }, { name: 'docIdFile', maxCount: 1 }]), async (req, res) => {
  try {
    const { cognome, nome, telefono, email, residenza, competenze_chiave, disponibilita, note_generali, valutazione_serieta, valutazione_disponibilita, valutazione_professionalita, iban, settore, codice_fiscale } = req.body;
    
    const cand = await db.get('SELECT * FROM candidati WHERE id = ?', [req.params.id]);
    if (!cand) return res.status(404).json({ success: false, error: 'Candidato non trovato' });
    
    let linkCV = cand.link_cv;
    let linkDocumenti = cand.link_documenti;
    
    if (req.files) {
      if (req.files.cvFile && req.files.cvFile[0]) {
        linkCV = `/uploads/cv/${req.files.cvFile[0].filename}`;
        if (cand.link_cv && cand.link_cv.startsWith('/uploads')) {
          const oldPath = path.join(__dirname, cand.link_cv);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
      if (req.files.docIdFile && req.files.docIdFile[0]) {
        linkDocumenti = `/uploads/doc/${req.files.docIdFile[0].filename}`;
        if (cand.link_documenti && cand.link_documenti.startsWith('/uploads')) {
          const oldPath = path.join(__dirname, cand.link_documenti);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }
    }
    
    await db.run(`
      UPDATE candidati
      SET cognome = COALESCE(?, cognome),
          nome = COALESCE(?, nome),
          telefono = COALESCE(?, telefono),
          email = COALESCE(?, email),
          residenza = COALESCE(?, residenza),
          competenze_chiave = COALESCE(?, competenze_chiave),
          disponibilita = COALESCE(?, disponibilita),
          link_cv = COALESCE(?, link_cv),
          note_generali = COALESCE(?, note_generali),
          valutazione_serieta = COALESCE(?, valutazione_serieta),
          valutazione_disponibilita = COALESCE(?, valutazione_disponibilita),
          valutazione_professionalita = COALESCE(?, valutazione_professionalita),
          iban = COALESCE(?, iban),
          settore = COALESCE(?, settore),
          codice_fiscale = COALESCE(?, codice_fiscale),
          link_documenti = COALESCE(?, link_documenti)
      WHERE id = ?
    `, [
      cognome,
      nome,
      telefono,
      email,
      residenza,
      competenze_chiave,
      disponibilita,
      linkCV,
      note_generali,
      valutazione_serieta ? parseInt(valutazione_serieta) : null,
      valutazione_disponibilita ? parseInt(valutazione_disponibilita) : null,
      valutazione_professionalita ? parseInt(valutazione_professionalita) : null,
      iban,
      settore,
      codice_fiscale,
      linkDocumenti,
      req.params.id
    ]);
    
    res.json({ success: true, linkCV, linkDocumenti });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/candidati/:id/valutazione', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM valutazioni_candidati WHERE id_candidato = ?', [req.params.id]);
    if (!row) {
      return res.json({
        success: true,
        data: {
          id_candidato: req.params.id,
          pres_personale: null,
          puntualita: null,
          comunicazione: null,
          educazione: null,
          motivazione: null,
          interesse_az: null,
          esperienza_lav: null,
          competenze_tec: null,
          cap_apprendimento: null,
          problem_solving: null,
          cap_organizzativa: null,
          team_work: null,
          autonomia: null,
          affidabilita: null,
          flessibilita: null,
          orario_full_time: 0,
          orario_part_time: 0,
          orario_turni: 0,
          orario_weekend: 0,
          orario_straordinari: 0,
          mob_automunito: 0,
          mob_trasferte: 0,
          mob_spostamenti: 0,
          disp_assunzione: '',
          punti_forza: '',
          aree_miglioramento: '',
          osservazioni: '',
          valutazione_finale: '',
          punteggio_complessivo: null
        }
      });
    }
    res.json({ success: true, data: row });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/candidati/:id/valutazione', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      pres_personale, puntualita, comunicazione, educazione, motivazione,
      interesse_az, esperienza_lav, competenze_tec, cap_apprendimento,
      problem_solving, cap_organizzativa, team_work, autonomia, affidabilita, flessibilita,
      orario_full_time, orario_part_time, orario_turni, orario_weekend, orario_straordinari,
      mob_automunito, mob_trasferte, mob_spostamenti,
      disp_assunzione, punti_forza, aree_miglioramento, osservazioni, valutazione_finale
    } = req.body;

    const cand = await db.get('SELECT * FROM candidati WHERE id = ?', [id]);
    if (!cand) return res.status(404).json({ success: false, error: 'Candidato non trovato' });

    const params15 = [
      pres_personale, puntualita, comunicazione, educazione, motivazione,
      interesse_az, esperienza_lav, competenze_tec, cap_apprendimento,
      problem_solving, cap_organizzativa, team_work, autonomia, affidabilita, flessibilita
    ];
    
    let completed = true;
    let sum = 0;
    for (const val of params15) {
      if (val === undefined || val === null || val === '') {
        completed = false;
        break;
      }
      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 5) {
        completed = false;
        break;
      }
      sum += num;
    }

    let punteggio_complessivo = null;
    if (completed) {
      punteggio_complessivo = Math.round((sum / 75) * 100);
    }

    const existing = await db.get('SELECT id_candidato FROM valutazioni_candidati WHERE id_candidato = ?', [id]);
    if (existing) {
      await db.run(`
        UPDATE valutazioni_candidati
        SET pres_personale = ?, puntualita = ?, comunicazione = ?, educazione = ?, motivazione = ?,
            interesse_az = ?, esperienza_lav = ?, competenze_tec = ?, cap_apprendimento = ?,
            problem_solving = ?, cap_organizzativa = ?, team_work = ?, autonomia = ?,
            affidabilita = ?, flessibilita = ?,
            orario_full_time = ?, orario_part_time = ?, orario_turni = ?, orario_weekend = ?, orario_straordinari = ?,
            mob_automunito = ?, mob_trasferte = ?, mob_spostamenti = ?,
            disp_assunzione = ?, punti_forza = ?, aree_miglioramento = ?, osservazioni = ?, valutazione_finale = ?,
            punteggio_complessivo = ?
        WHERE id_candidato = ?
      `, [
        pres_personale || null, puntualita || null, comunicazione || null, educazione || null, motivazione || null,
        interesse_az || null, esperienza_lav || null, competenze_tec || null, cap_apprendimento || null,
        problem_solving || null, cap_organizzativa || null, team_work || null, autonomia || null,
        affidabilita || null, flessibilita || null,
        orario_full_time ? 1 : 0, orario_part_time ? 1 : 0, orario_turni ? 1 : 0, orario_weekend ? 1 : 0, orario_straordinari ? 1 : 0,
        mob_automunito ? 1 : 0, mob_trasferte ? 1 : 0, mob_spostamenti ? 1 : 0,
        disp_assunzione || '', punti_forza || '', aree_miglioramento || '', osservazioni || '', valutazione_finale || '',
        punteggio_complessivo, id
      ]);
    } else {
      await db.run(`
        INSERT INTO valutazioni_candidati (
          id_candidato, pres_personale, puntualita, comunicazione, educazione, motivazione,
          interesse_az, esperienza_lav, competenze_tec, cap_apprendimento,
          problem_solving, cap_organizzativa, team_work, autonomia, affidabilita, flessibilita,
          orario_full_time, orario_part_time, orario_turni, orario_weekend, orario_straordinari,
          mob_automunito, mob_trasferte, mob_spostamenti,
          disp_assunzione, punti_forza, aree_miglioramento, osservazioni, valutazione_finale,
          punteggio_complessivo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        pres_personale || null, puntualita || null, comunicazione || null, educazione || null, motivazione || null,
        interesse_az || null, esperienza_lav || null, competenze_tec || null, cap_apprendimento || null,
        problem_solving || null, cap_organizzativa || null, team_work || null, autonomia || null,
        affidabilita || null, flessibilita || null,
        orario_full_time ? 1 : 0, orario_part_time ? 1 : 0, orario_turni ? 1 : 0, orario_weekend ? 1 : 0, orario_straordinari ? 1 : 0,
        mob_automunito ? 1 : 0, mob_trasferte ? 1 : 0, mob_spostamenti ? 1 : 0,
        disp_assunzione || '', punti_forza || '', aree_miglioramento || '', osservazioni || '', valutazione_finale || '',
        punteggio_complessivo
      ]);
    }

    await logActivity('CANDIDATO', id, `${cand.cognome} ${cand.nome}`, 'Valutazione', 
      punteggio_complessivo !== null ? `Valutazione completata. Punteggio: ${punteggio_complessivo}/100` : `Scheda di valutazione salvata (Incompleta)`);

    res.json({ success: true, punteggio_complessivo });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/candidati/:id/storico', async (req, res) => {
  try {
    const id = req.params.id;
    
    const pipeline = await db.all(`
      SELECT p.*, r.azienda, r.ruolo 
      FROM pipeline_assunzioni p
      JOIN ricerche r ON p.id_ricerca = r.id
      WHERE p.id_candidato = ?
    `, [id]);
    
    const appuntamenti = await db.all(`
      SELECT a.*, r.azienda, r.ruolo 
      FROM appuntamenti a
      LEFT JOIN ricerche r ON a.id_ricerca = r.id
      WHERE a.id_candidato = ?
      ORDER BY a.data_colloquio DESC, a.ora_colloquio DESC
    `, [id]);
    
    const logs = await db.all(`
      SELECT * FROM storico_attivita 
      WHERE entita_id = ? OR entita_id IN (
        SELECT id FROM pipeline_assunzioni WHERE id_candidato = ?
      )
      ORDER BY data_ora DESC
    `, [id, id]);

    res.json({
      success: true,
      data: {
        pipeline,
        appuntamenti,
        logs
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. PIPELINE ASSUNZIONI (LINK CANDIDATE TO RESEARCH)
app.post('/api/pipeline', async (req, res) => {
  try {
    const { id_ricerca, id_candidato, inviato_cliente, feedback_stato, feedback_note, stato_avanzamento } = req.body;
    if (!id_ricerca || !id_candidato) {
      return res.status(400).json({ success: false, error: 'Dati incompleti' });
    }
    
    const existing = await db.get('SELECT id FROM pipeline_assunzioni WHERE id_ricerca = ? AND id_candidato = ?', [id_ricerca, id_candidato]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Candidato già associato a questa ricerca' });
    }
    
    const id = generateID('A');
    const invCliente = inviato_cliente !== undefined ? parseInt(inviato_cliente) : 0;
    const feedStato = feedback_stato || 'In attesa di feedback';
    const feedNote = feedback_note || '';
    const statoAvanzamento = stato_avanzamento || 'CV Ricevuto';
    
    await db.run(`
      INSERT INTO pipeline_assunzioni (id, id_ricerca, id_candidato, stato_avanzamento, inviato_cliente, feedback_stato, feedback_note, data_invio_cv)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, id_ricerca, id_candidato, statoAvanzamento, invCliente, feedStato, feedNote, new Date().toISOString().substring(0,10)]);
    
    const r = await db.get('SELECT azienda, ruolo FROM ricerche WHERE id = ?', [id_ricerca]);
    const c = await db.get('SELECT cognome, nome FROM candidati WHERE id = ?', [id_candidato]);
    
    if (r && c) {
      const nomeCompleto = `${c.cognome} ${c.nome}`;
      const details = `Candidato inserito. Inviato Cliente: ${invCliente === 1 ? 'Sì' : 'No'}. Stato: ${feedStato}`;
      await logActivity('CLIENTE', id_ricerca, r.azienda, 'Presentazione CV', `Candidato ${nomeCompleto}: ${details}`, id_ricerca, nomeCompleto);
      await logActivity('CANDIDATO', id_candidato, nomeCompleto, 'Associazione Ricerca', `Associato alla ricerca di ${r.azienda} (${r.ruolo}): ${details}`, id_ricerca, r.azienda);
    }
    
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/pipeline/:id', async (req, res) => {
  try {
    const { 
      stato_avanzamento, stato_prova, note_amministrazione, data_invio_cv, data_inizio_prova, data_scadenza_prova,
      prova_contrattualizzata, inviato_cliente, feedback_stato, feedback_note, escludi_ricerca
    } = req.body;
    
    const pipe = await db.get('SELECT * FROM pipeline_assunzioni WHERE id = ?', [req.params.id]);
    if (!pipe) return res.status(404).json({ success: false, error: 'Record pipeline non trovato' });
    
    let targetStatoAvanzamento = stato_avanzamento;
    if (escludi_ricerca === true || escludi_ricerca === 'true') {
      targetStatoAvanzamento = 'Escluso';
    }
    
    await db.run(`
      UPDATE pipeline_assunzioni
      SET stato_avanzamento = COALESCE(?, stato_avanzamento),
          stato_prova = COALESCE(?, stato_prova),
          note_amministrazione = COALESCE(?, note_amministrazione),
          data_invio_cv = COALESCE(?, data_invio_cv),
          data_inizio_prova = COALESCE(?, data_inizio_prova),
          data_scadenza_prova = COALESCE(?, data_scadenza_prova),
          prova_contrattualizzata = COALESCE(?, prova_contrattualizzata),
          inviato_cliente = COALESCE(?, inviato_cliente),
          feedback_stato = COALESCE(?, feedback_stato),
          feedback_note = COALESCE(?, feedback_note)
      WHERE id = ?
    `, [
      targetStatoAvanzamento, 
      stato_prova, 
      note_amministrazione, 
      data_invio_cv, 
      data_inizio_prova,
      data_scadenza_prova,
      prova_contrattualizzata !== undefined ? parseInt(prova_contrattualizzata) : null,
      inviato_cliente !== undefined ? parseInt(inviato_cliente) : null,
      feedback_stato,
      feedback_note,
      req.params.id
    ]);
    
    const r = await db.get('SELECT azienda, ruolo FROM ricerche WHERE id = ?', [pipe.id_ricerca]);
    const c = await db.get('SELECT cognome, nome FROM candidati WHERE id = ?', [pipe.id_candidato]);
    
    if (r && c) {
      const nomeCompleto = `${c.cognome} ${c.nome}`;
      
      // Log feedback changes
      if (feedback_stato && feedback_stato !== pipe.feedback_stato) {
        const details = `Modificato stato feedback a '${feedback_stato}'. Note: ${feedback_note || 'N/D'}`;
        await logActivity('CLIENTE', pipe.id_ricerca, r.azienda, 'Feedback CV', `Candidato ${nomeCompleto}: ${details}`, pipe.id_ricerca, nomeCompleto);
        await logActivity('CANDIDATO', pipe.id_candidato, nomeCompleto, 'Feedback CV', `Ricerca ${r.azienda} (${r.ruolo}): ${details}`, pipe.id_ricerca, r.azienda);
      }
      
      // Log exclusions
      if (targetStatoAvanzamento === 'Escluso' && pipe.stato_avanzamento !== 'Escluso') {
        await logActivity('CLIENTE', pipe.id_ricerca, r.azienda, 'Esclusione Candidato', `Candidato ${nomeCompleto} escluso dalla ricerca. Note: ${feedback_note || 'N/D'}`, pipe.id_ricerca, nomeCompleto);
        await logActivity('CANDIDATO', pipe.id_candidato, nomeCompleto, 'Esclusione Ricerca', `Escluso dalla ricerca di ${r.azienda} (${r.ruolo}). Note: ${feedback_note || 'N/D'}`, pipe.id_ricerca, r.azienda);
      }
      
      // Log other progress changes
      if (stato_avanzamento && stato_avanzamento !== pipe.stato_avanzamento && stato_avanzamento !== 'Escluso') {
        await logActivity('CLIENTE', pipe.id_ricerca, r.azienda, 'Stato Candidato Modificato', `Candidato ${nomeCompleto} impostato a ${stato_avanzamento}`, pipe.id_ricerca, nomeCompleto);
        await logActivity('CANDIDATO', pipe.id_candidato, nomeCompleto, 'Stato Ricerca Modificato', `Stato per la ricerca di ${r.azienda} modificato in ${stato_avanzamento}`, pipe.id_ricerca, r.azienda);
      }
    }
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/pipeline/:id', async (req, res) => {
  try {
    const pipe = await db.get('SELECT * FROM pipeline_assunzioni WHERE id = ?', [req.params.id]);
    if (!pipe) return res.status(404).json({ success: false, error: 'Record pipeline non trovato' });
    
    await db.run('DELETE FROM pipeline_assunzioni WHERE id = ?', [req.params.id]);
    
    const r = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [pipe.id_ricerca]);
    const c = await db.get('SELECT cognome, nome FROM candidati WHERE id = ?', [pipe.id_candidato]);
    if (r && c) {
      const nomeCompleto = `${c.cognome} ${c.nome}`;
      await logActivity('CLIENTE', pipe.id_ricerca, r.azienda, 'Candidato Scollegato', `Candidato ${nomeCompleto} rimosso dalla ricerca`, pipe.id_ricerca, nomeCompleto);
      await logActivity('CANDIDATO', pipe.id_candidato, nomeCompleto, 'Scollegato da Ricerca', `Rimosso dalla ricerca di ${r.azienda}`, pipe.id_ricerca, r.azienda);
    }
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 4. INTERVIEWS (APPUNTAMENTI)
app.post('/api/appuntamenti', async (req, res) => {
  try {
    const { id_ricerca, id_candidato, data, ora, tipo, luogo, note } = req.body;
    if (!id_ricerca || !id_candidato || !data || !ora) {
      return res.status(400).json({ success: false, error: 'Dati incompleti' });
    }
    
    const r = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
    const c = await db.get('SELECT cognome, nome FROM candidati WHERE id = ?', [id_candidato]);
    if (!r || !c) return res.status(404).json({ success: false, error: 'Ricerca o Candidato non trovati' });
    
    const id = generateID('AP');
    const nomeCompleto = `${c.cognome} ${c.nome}`;
    
    await db.run(`
      INSERT INTO appuntamenti (id, id_ricerca, id_candidato, candidato_nome, azienda_cliente, data_colloquio, ora_colloquio, tipo_colloquio, luogo, stato_appuntamento, note_dettagli)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Programmato', ?)
    `, [id, id_ricerca, id_candidato, nomeCompleto, r.azienda, data, ora, tipo || 'In presenza', luogo || 'Presso nostra sede', note || '']);
    
    // Auto-update candidate pipeline status to "Colloquio Fissato"
    await db.run(`
      UPDATE pipeline_assunzioni 
      SET stato_avanzamento = 'Colloquio Fissato' 
      WHERE id_ricerca = ? AND id_candidato = ?
    `, [id_ricerca, id_candidato]);
    
    // Log activities
    const logDetails = `Fissato colloquio (${tipo} | ${luogo}) con il candidato ${nomeCompleto} il ${data} alle ${ora}`;
    await logActivity('CLIENTE', id_ricerca, r.azienda, 'Colloquio Programmato', logDetails, id_ricerca, nomeCompleto);
    await logActivity('CANDIDATO', id_candidato, nomeCompleto, 'Colloquio Programmato', `Fissato colloquio (${tipo} | ${luogo}) con il cliente ${r.azienda} il ${data} alle ${ora}`, id_ricerca, r.azienda);
    
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/appuntamenti/:id', async (req, res) => {
  try {
    const { data, ora, tipo, luogo, stato, note, motivazione_stato } = req.body;
    const appuntamento = await db.get('SELECT * FROM appuntamenti WHERE id = ?', [req.params.id]);
    if (!appuntamento) return res.status(404).json({ success: false, error: 'Appuntamento non trovato' });

    const oldData = appuntamento.data_colloquio;
    const oldOra = appuntamento.ora_colloquio;
    const oldTipo = appuntamento.tipo_colloquio;
    const oldLuogo = appuntamento.luogo;
    const oldStato = appuntamento.stato_appuntamento;

    await db.run(`
      UPDATE appuntamenti
      SET data_colloquio = COALESCE(?, data_colloquio),
          ora_colloquio = COALESCE(?, ora_colloquio),
          tipo_colloquio = COALESCE(?, tipo_colloquio),
          luogo = COALESCE(?, luogo),
          stato_appuntamento = COALESCE(?, stato_appuntamento),
          note_dettagli = COALESCE(?, note_dettagli)
      WHERE id = ?
    `, [data, ora, tipo, luogo, stato, note, req.params.id]);

    // If rescheduled or type/luogo changed
    if ((data && data !== oldData) || (ora && ora !== oldOra) || (tipo && tipo !== oldTipo) || (luogo && luogo !== oldLuogo)) {
      const details = `Riprogrammato/aggiornato colloquio con ${appuntamento.candidato_nome}. Info: ${tipo || oldTipo} | ${luogo || oldLuogo} il ${data || oldData} alle ${ora || oldOra} (precedente: ${oldTipo} | ${oldLuogo} il ${oldData} alle ${oldOra})`;
      await logActivity('CLIENTE', appuntamento.id_ricerca, appuntamento.azienda_cliente, 'Riprogrammazione Colloquio', details, appuntamento.id_ricerca, appuntamento.candidato_nome);
      await logActivity('CANDIDATO', appuntamento.id_candidato, appuntamento.candidato_nome, 'Riprogrammazione Colloquio', details, appuntamento.id_ricerca, appuntamento.azienda_cliente);
    }

    // If status changed
    if (stato && stato !== oldStato) {
      let details = `Esito colloquio di ${appuntamento.candidato_nome} modificato in '${stato}'`;
      if (motivazione_stato) details += `. Nota esito: ${motivazione_stato}`;
      await logActivity('CLIENTE', appuntamento.id_ricerca, appuntamento.azienda_cliente, 'Esito Colloquio', details, appuntamento.id_ricerca, appuntamento.candidato_nome);
      await logActivity('CANDIDATO', appuntamento.id_candidato, appuntamento.candidato_nome, 'Esito Colloquio', details, appuntamento.id_ricerca, appuntamento.azienda_cliente);

      // Auto-update candidate pipeline status based on interview outcome
      let pipelineStatus = null;
      if (stato === 'Eseguito') {
        pipelineStatus = 'Colloquio Superato';
      } else if (stato === 'Non Presentato' || stato === 'Annullato') {
        pipelineStatus = 'Colloquio Assente';
      }
      
      if (pipelineStatus) {
        await db.run(`
          UPDATE pipeline_assunzioni 
          SET stato_avanzamento = ? 
          WHERE id_ricerca = ? AND id_candidato = ?
        `, [pipelineStatus, appuntamento.id_ricerca, appuntamento.id_candidato]);
      }
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/appuntamenti/:id', async (req, res) => {
  try {
    const appuntamento = await db.get('SELECT * FROM appuntamenti WHERE id = ?', [req.params.id]);
    if (!appuntamento) return res.status(404).json({ success: false, error: 'Appuntamento non trovato' });

    await db.run('DELETE FROM appuntamenti WHERE id = ?', [req.params.id]);

    // Log deletion
    const details = `Eliminato colloquio del ${appuntamento.data_colloquio} alle ${appuntamento.ora_colloquio} con ${appuntamento.candidato_nome}`;
    await logActivity('CLIENTE', appuntamento.id_ricerca, appuntamento.azienda_cliente, 'Eliminazione Colloquio', details, appuntamento.id_ricerca, appuntamento.candidato_nome);
    await logActivity('CANDIDATO', appuntamento.id_candidato, appuntamento.candidato_nome, 'Eliminazione Colloquio', details, appuntamento.id_ricerca, appuntamento.azienda_cliente);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 5. TIMELINE TIMELINE HISTORICAL LOGS
app.get('/api/timeline/:idRicerca', async (req, res) => {
  try {
    const list = await db.all(`
      SELECT * FROM storico 
      WHERE id_ricerca_associata = ?
      ORDER BY data_attivita DESC
    `, [req.params.idRicerca]);
    
    const formatted = list.map(item => {
      const d = new Date(item.data_attivita);
      const dataStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      
      return {
        id: item.id,
        dataStr,
        tipo: item.tipo_soggetto === 'CANDIDATO' ? `Dipendente: ${item.nome_soggetto}` : `Cliente: ${item.nome_soggetto}`,
        attivita: item.tipo_attivita,
        dettagli: item.dettagli
      };
    });
    
    res.json({ success: true, timeline: formatted });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 5b. TIMELINE FOR SUBJECTS (CANDIDATES & CLIENTS)
app.get('/api/timeline/soggetto/:tipoSoggetto/:idSoggetto', async (req, res) => {
  try {
    const { tipoSoggetto, idSoggetto } = req.params;
    const list = await db.all(`
      SELECT * FROM storico 
      WHERE tipo_soggetto = ? AND id_soggetto = ?
      ORDER BY data_attivita DESC
    `, [tipoSoggetto.toUpperCase(), idSoggetto]);
    
    const formatted = list.map(item => {
      const d = new Date(item.data_attivita);
      const dataStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      
      return {
        id: item.id,
        dataStr,
        tipo: item.tipo_soggetto,
        attivita: item.tipo_attivita,
        dettagli: item.dettagli
      };
    });
    
    res.json({ success: true, timeline: formatted });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/timeline/candidato/:idCandidato/ricerca/:idRicerca', async (req, res) => {
  try {
    const list = await db.all(`
      SELECT * FROM storico 
      WHERE tipo_soggetto = 'CANDIDATO' AND id_soggetto = ? AND id_ricerca_associata = ?
      ORDER BY data_attivita DESC
    `, [req.params.idCandidato, req.params.idRicerca]);
    
    const formatted = list.map(item => {
      const d = new Date(item.data_attivita);
      const dataStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return {
        id: item.id,
        dataStr,
        tipo: item.tipo_soggetto,
        attivita: item.tipo_attivita,
        dettagli: item.dettagli
      };
    });
    res.json({ success: true, timeline: formatted });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 5c. GLOBAL DASHBOARD PENDING CHECKLIST
app.get('/api/dashboard/pending', async (req, res) => {
  try {
    const pendingList = [];

    // 1. Pending CV & Trial Outcomes
    const pipeline = await db.all(`
      SELECT p.*, c.cognome, c.nome, r.azienda, r.ruolo
      FROM pipeline_assunzioni p
      JOIN candidati c ON p.id_candidato = c.id
      JOIN ricerche r ON p.id_ricerca = r.id
      WHERE p.feedback_stato = 'In attesa di feedback' OR p.stato_avanzamento = 'In Prova'
    `);

    const todayStr = new Date().toISOString().substring(0, 10);
    const today = new Date();
    today.setHours(0,0,0,0);

    pipeline.forEach(item => {
      const nomeCompleto = `${item.cognome} ${item.nome}`;
      
      // CV Pending (Inviato al cliente da >= 3 giorni)
      if (item.inviato_cliente === 1 && item.feedback_stato === 'In attesa di feedback' && item.data_invio_cv) {
        const sendDate = new Date(item.data_invio_cv);
        sendDate.setHours(0,0,0,0);
        const diffTime = today - sendDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 3) {
          pendingList.push({
            id: `cv-${item.id}`,
            tipo: 'CV',
            idRicerca: item.id_ricerca,
            testo: `CV inviato da ${diffDays} giorni per ${nomeCompleto} (${item.azienda} - ${item.ruolo}), inserire feedback.`
          });
        }
      }

      // Trial Pending
      if (item.stato_avanzamento === 'In Prova' && item.data_scadenza_prova) {
        const limitDate = new Date(item.data_scadenza_prova);
        limitDate.setHours(0,0,0,0);
        if (today >= limitDate) {
          pendingList.push({
            id: `prova-${item.id}`,
            tipo: 'PROVA',
            idRicerca: item.id_ricerca,
            testo: `Periodo di prova scaduto per ${nomeCompleto} (${item.azienda} - ${item.ruolo}): termine previsto il ${item.data_scadenza_prova}.`
          });
        }
      }
    });

    // 2. Pending Interview Outcomes
    const appuntamenti = await db.all(`
      SELECT a.*, r.azienda, r.ruolo
      FROM appuntamenti a
      JOIN ricerche r ON a.id_ricerca = r.id
      WHERE a.stato_appuntamento = 'Programmato'
    `);

    appuntamenti.forEach(a => {
      if (a.data_colloquio) {
        const intDate = new Date(a.data_colloquio);
        intDate.setHours(0,0,0,0);
        if (today > intDate) {
          const diffTime = today - intDate;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          pendingList.push({
            id: `int-${a.id}`,
            tipo: 'COLLOQUIO',
            idRicerca: a.id_ricerca,
            testo: `Esito colloquio in sospeso per ${a.candidato_nome} (${a.azienda_cliente} - ${a.ruolo}): programmato il ${a.data_colloquio} (${diffDays} giorni fa).`
          });
        }
      }
    });

    // 3. Pending Commercial Accounts to Approve
    const commercials = await db.all(`
      SELECT * FROM commerciali WHERE stato_approvazione = 'Da Approvare'
    `);
    commercials.forEach(c => {
      pendingList.push({
        id: `account-${c.id}`,
        tipo: 'ACCOUNT',
        testo: `Richiesta di abilitazione account per il commerciale ${c.nome} ${c.cognome} (${c.email}) in attesa di approvazione.`
      });
    });

    // 4. Pending Mandates to Approve
    const researches = await db.all(`
      SELECT * FROM ricerche WHERE stato_approvazione_tl = 'In attesa di approvazione'
    `);
    researches.forEach(r => {
      pendingList.push({
        id: `mandato-${r.id}`,
        tipo: 'MANDATO',
        idRicerca: r.id,
        testo: `Nuova richiesta di mandato da approvare: ${r.azienda} (Ruolo: ${r.ruolo}).`
      });
    });

    // 5. Expiration of Advertisements (Alert starting from the day before)
    const activeAds = await db.all(`
      SELECT a.id, r.azienda, r.ruolo, a.data_scadenza_annuncio, a.link_annuncio, a.id_ricerca
      FROM annunci a
      JOIN ricerche r ON a.id_ricerca = r.id
      WHERE a.link_annuncio IS NOT NULL 
        AND a.link_annuncio != '' 
        AND a.data_scadenza_annuncio IS NOT NULL 
        AND a.data_scadenza_annuncio != ''
        AND (a.stato_annuncio = 'Attivo' OR a.stato_annuncio IS NULL OR a.stato_annuncio = '')
    `);

    activeAds.forEach(ad => {
      const expDate = new Date(ad.data_scadenza_annuncio);
      expDate.setHours(0,0,0,0);
      
      const dayBefore = new Date(expDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      if (today >= dayBefore && today <= expDate) {
        pendingList.push({
          id: `ad-scadenza-${ad.id}`,
          tipo: 'ANNUNCIO_SCADENZA',
          idRicerca: ad.id_ricerca,
          testo: `L'annuncio di lavoro per ${ad.azienda} (${ad.ruolo}) scade a breve: termine previsto il ${ad.data_scadenza_annuncio}.`
        });
      }
    });

    res.json({ success: true, pending: pendingList });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 6. CLIENTS (ANAGRAFICA CLIENTI GENERALI)
app.get('/api/clienti', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM clienti ORDER BY nome_locale ASC');
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/clienti', async (req, res) => {
  try {
    const { nome_locale, piva, sede_legale, sede_lavoro, referente, email, telefono_mobile, telefono_fisso } = req.body;
    if (!nome_locale) {
      return res.status(400).json({ success: false, error: 'Nome locale è obbligatorio' });
    }
    
    const id = generateID('PC');
    await db.run(`
      INSERT INTO clienti (id, data_inserimento, nome_locale, piva, sede_legale, sede_lavoro, referente, email, telefono_mobile, telefono_fisso)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      new Date().toISOString().substring(0, 10),
      nome_locale,
      piva || '',
      sede_legale || '',
      sede_lavoro || '',
      referente || '',
      email || '',
      telefono_mobile || '',
      telefono_fisso || ''
    ]);
    
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 7. EMAIL SENDING (WITH DIRECT PHYSICAL ATTACHMENTS)
app.post('/api/email', async (req, res) => {
  try {
    const { id_ricerca, id_candidato, dest_email, subject, body } = req.body;
    if (!id_ricerca || !id_candidato || !dest_email) {
      return res.status(400).json({ success: false, error: 'Dati incompleti per invio email' });
    }
    
    const r = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
    const c = await db.get('SELECT cognome, nome, link_cv FROM candidati WHERE id = ?', [id_candidato]);
    if (!r || !c) return res.status(404).json({ success: false, error: 'Ricerca o Candidato non trovati' });
    
    const nomeCompleto = `${c.cognome} ${c.nome}`;
    const attachments = [];
    
    if (c.link_cv && c.link_cv.startsWith('/uploads')) {
      const filePath = path.join(__dirname, c.link_cv);
      if (fs.existsSync(filePath)) {
        attachments.push({
          filename: path.basename(filePath),
          path: filePath
        });
      }
    }
    
    const emailResult = await inviaEmailHelper(dest_email, subject, body, attachments);
    const stato = emailResult.success ? 'Inviata' : (emailResult.simulated ? 'Simulata' : 'Fallita');
    const id = generateID('EM');
    const dataInvio = new Date().toISOString();
    let mittente = 'HEMA Selezione';
    const configRow = await db.get("SELECT valore FROM configurazione_email WHERE chiave = 'smtp_config'");
    if (configRow) {
      const config = JSON.parse(configRow.valore);
      if (config.user) mittente = config.user;
    }
    await db.run(`
      INSERT INTO emails (id, data_invio, mittente, destinatario, oggetto, corpo, tipo, stato, id_candidato, id_ricerca)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, dataInvio, mittente, dest_email, subject, body, 'cv_presentazione', stato, id_candidato, id_ricerca]);
    
    await logActivity('CLIENTE', id_ricerca, r.azienda, 'Inviata Email (con Allegato)', `Trasmesso CV del candidato ${nomeCompleto} a ${dest_email}. Oggetto: ${subject}`, id_ricerca, nomeCompleto);
    await logActivity('CANDIDATO', id_candidato, nomeCompleto, 'CV Inviato a Cliente (Email)', `CV inviato via email a ${r.azienda} (${dest_email})`, id_ricerca, r.azienda);
    
    const today = new Date().toISOString().substring(0, 10);
    await db.run('UPDATE pipeline_assunzioni SET data_invio_cv = ?, inviato_cliente = 1 WHERE id_ricerca = ? AND id_candidato = ?', [today, id_ricerca, id_candidato]);
    
    res.json({ 
      success: true, 
      simulated: emailResult.simulated, 
      message: emailResult.simulated ? "Simulazione invio completata. Configura le credenziali SMTP nel pannello di controllo." : "Email inviata con successo!" 
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 7b. SEND HIRING SHEET TO ADMINISTRATION EMAIL
app.post('/api/email/assunzione', async (req, res) => {
  try {
    const { dest_email, subject, htmlBody, id_candidato, candidato_nome, id_ricerca } = req.body;
    if (!dest_email || !htmlBody) {
      return res.status(400).json({ success: false, error: 'Dati incompleti per invio scheda assunzione' });
    }
    
    const emailResult = await inviaEmailHelper(dest_email, subject || 'Nuova Scheda Assunzione - HEMA FOOD', htmlBody);
    const stato = emailResult.success ? 'Inviata' : (emailResult.simulated ? 'Simulata' : 'Fallita');
    const id = generateID('EM');
    const dataInvio = new Date().toISOString();
    let mittente = 'HEMA Selezione';
    const configRow = await db.get("SELECT valore FROM configurazione_email WHERE chiave = 'smtp_config'");
    if (configRow) {
      const config = JSON.parse(configRow.valore);
      if (config.user) mittente = config.user;
    }
    await db.run(`
      INSERT INTO emails (id, data_invio, mittente, destinatario, oggetto, corpo, tipo, stato, id_candidato, id_ricerca)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, dataInvio, mittente, dest_email, subject || 'Nuova Scheda Assunzione - HEMA FOOD', htmlBody, 'scheda_assunzione', stato, id_candidato || null, id_ricerca || null]);
    
    if (id_candidato) {
      await logActivity('CANDIDATO', id_candidato, candidato_nome, 'Scheda Assunzione Trasmessa', `Trasmessa scheda assunzione all'amministrazione (${dest_email}) per la ricerca ${id_ricerca || ''}`, id_ricerca || '');
    }
    
    res.json({ 
      success: true, 
      simulated: emailResult.simulated, 
      message: emailResult.simulated ? "Simulazione invio completata. Configura le credenziali SMTP nel pannello di controllo." : "Scheda assunzione inviata all'amministrazione con successo!" 
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 8. WHATSAPP HISTORY LOGGER
app.post('/api/whatsapp', async (req, res) => {
  try {
    const { id_ricerca, id_candidato } = req.body;
    if (!id_ricerca || !id_candidato) {
      return res.status(400).json({ success: false, error: 'Dati incompleti per log WA' });
    }
    
    const r = await db.get('SELECT azienda, ruolo FROM ricerche WHERE id = ?', [id_ricerca]);
    const c = await db.get('SELECT cognome, nome FROM candidati WHERE id = ?', [id_candidato]);
    if (!r || !c) return res.status(404).json({ success: false, error: 'Ricerca o Candidato non trovati' });
    
    const nomeCompleto = `${c.cognome} ${c.nome}`;
    
    await logActivity('CLIENTE', id_ricerca, r.azienda, 'Inviato CV (WhatsApp)', `Inviato CV di ${nomeCompleto} via WhatsApp a referente per ruolo ${r.ruolo}`, id_ricerca, nomeCompleto);
    await logActivity('CANDIDATO', id_candidato, nomeCompleto, 'CV Inviato a Cliente (WA)', `CV inviato via WhatsApp a ${r.azienda} per ruolo ${r.ruolo}`, id_ricerca, r.azienda);
    
    const today = new Date().toISOString().substring(0, 10);
    await db.run('UPDATE pipeline_assunzioni SET data_invio_cv = ? WHERE id_ricerca = ? AND id_candidato = ?', [today, id_ricerca, id_candidato]);
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});




// 11. COMMERCIALI (AUTHENTICATION & APPROVALS)
app.get('/api/commerciali/ricerche', async (req, res) => {
  try {
    const { nome } = req.query;
    if (!nome) {
      return res.status(400).json({ success: false, error: 'Nome commerciale obbligatorio' });
    }
    
    const list = await db.all('SELECT * FROM ricerche WHERE consulente_commerciale = ? ORDER BY data_inserimento DESC', [nome]);
    
    // For each search, count candidates in pipeline
    const result = await Promise.all(list.map(async (r) => {
      const stats = await db.get(`
        SELECT 
          COUNT(CASE WHEN stato_avanzamento = 'CV Ricevuto' THEN 1 END) as cv_ricevuti,
          COUNT(CASE WHEN stato_avanzamento = 'In Prova' THEN 1 END) as in_prova,
          COUNT(CASE WHEN stato_avanzamento = 'Approvato/Assunto' THEN 1 END) as assunti
        FROM pipeline_assunzioni
        WHERE id_ricerca = ?
      `, [r.id]);
      
      return {
        ...r,
        stats: stats || { cv_ricevuti: 0, in_prova: 0, assunti: 0 }
      };
    }));
    
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});
app.post('/api/commerciali', async (req, res) => {
  try {
    const { nome, cognome, email, data_nascita, telefono, password, stato_approvazione } = req.body;
    if (!nome || !cognome || !email || !password) {
      return res.status(400).json({ success: false, error: 'Dati incompleti' });
    }
    const existing = await db.get('SELECT id FROM commerciali WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Questa e-mail è già registrata' });
    }
    const id = generateID('COM');
    const status = stato_approvazione || 'Approvato';
    await db.run(`
      INSERT INTO commerciali (id, nome, cognome, email, data_nascita, telefono, password, stato_approvazione, data_registrazione)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, nome, cognome, email, data_nascita || '', telefono || '', password, status, new Date().toISOString()
    ]);
    
    res.json({ success: true, message: 'Commerciale creato con successo' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/commerciali/registra', async (req, res) => {
  try {
    const { nome, cognome, email, data_nascita, telefono, password } = req.body;
    if (!nome || !cognome || !email || !password) {
      return res.status(400).json({ success: false, error: 'Dati incompleti per la registrazione' });
    }
    
    // Check if email already registered
    const existing = await db.get('SELECT id FROM commerciali WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Questa e-mail è già stata registrata' });
    }
    
    const id = generateID('COM');
    await db.run(`
      INSERT INTO commerciali (id, nome, cognome, email, data_nascita, telefono, password, stato_approvazione, data_registrazione)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Da Approvare', ?)
    `, [
      id, nome, cognome, email, data_nascita || '', telefono || '', password, new Date().toISOString()
    ]);
    
    res.json({ success: true, message: 'Registrazione completata. Il Team Leader esaminerà la tua richiesta.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/commerciali/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Inserisci email e password' });
    }
    
    const user = await db.get('SELECT * FROM commerciali WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Credenziali non valide o utente non trovato' });
    }
    
    if (user.password !== password) {
      return res.status(400).json({ success: false, error: 'Password errata' });
    }
    
    if (user.stato_approvazione === 'Da Approvare') {
      return res.status(400).json({ success: false, error: 'Il tuo account è in attesa di approvazione da parte del Team Leader.' });
    }
    
    if (user.stato_approvazione === 'Rifiutato') {
      return res.status(400).json({ success: false, error: 'La tua richiesta di registrazione è stata rifiutata dal Team Leader.' });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        nome: user.nome,
        cognome: user.cognome,
        email: user.email
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/commerciali', async (req, res) => {
  try {
    const list = await db.all('SELECT id, nome, cognome, email, data_nascita, telefono, password, stato_approvazione, data_registrazione FROM commerciali ORDER BY data_registrazione DESC');
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.put('/api/commerciali/:id/stato', async (req, res) => {
  try {
    const { stato_approvazione } = req.body;
    if (!stato_approvazione) {
      return res.status(400).json({ success: false, error: 'Stato di approvazione obbligatorio' });
    }
    
    const user = await db.get('SELECT * FROM commerciali WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Commerciale non trovato' });
    }
    
    await db.run('UPDATE commerciali SET stato_approvazione = ? WHERE id = ?', [stato_approvazione, req.params.id]);
    
    // If approved, send confirmation email!
    if (stato_approvazione === 'Approvato') {
      try {
        const mailSubject = 'HEMA WORK - Account Approvato!';
        const mailBody = `Gentile ${user.nome} ${user.cognome},\n\nil tuo account commerciale sul nostro portale è stato approvato dal Team Leader!\n\nDa questo momento puoi effettuare l'accesso e inserire i tuoi mandati di ricerca.\n\nCordiali saluti,\nTeam Selezione`;
        await inviaEmailHelper(user.email, mailSubject, mailBody);
      } catch (mailErr) {
        console.error("Errore nell'invio della mail di conferma approvazione:", mailErr);
      }
    }
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/commerciali/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM commerciali WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 11b. OPERATORI (OUTBOUND AGENTS)
app.get('/api/operatori', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM operatori ORDER BY cognome ASC, nome ASC');
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/operatori', async (req, res) => {
  try {
    const { nome, cognome } = req.body;
    if (!nome || !cognome) {
      return res.status(400).json({ success: false, error: 'Nome e cognome sono obbligatori' });
    }
    const id = 'OP' + Date.now();
    await db.run('INSERT INTO operatori (id, nome, cognome, attivo) VALUES (?, ?, ?, 1)', [id, nome, cognome]);
    res.json({ success: true, id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete('/api/operatori/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM operatori WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 12. CONFIGURAZIONE EMAIL
app.get('/api/configurazione-email', async (req, res) => {
  try {
    const row = await db.get("SELECT valore FROM configurazione_email WHERE chiave = 'smtp_config'");
    if (row) {
      res.json({ success: true, data: JSON.parse(row.valore) });
    } else {
      res.json({ 
        success: true, 
        data: {
          host: 'smtp.gmail.com',
          port: '465',
          user: '',
          pass: '',
          secure: true
        }
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/configurazione-email', async (req, res) => {
  try {
    const { host, port, user, pass, secure } = req.body;
    if (!host || !port || !user) {
      return res.status(400).json({ success: false, error: 'Dati SMTP incompleti' });
    }
    
    const valore = JSON.stringify({ host, port, user, pass: pass || '', secure });
    
    // Check if configuration already exists
    const existing = await db.get("SELECT chiave FROM configurazione_email WHERE chiave = 'smtp_config'");
    if (existing) {
      await db.run("UPDATE configurazione_email SET valore = ? WHERE chiave = 'smtp_config'", [valore]);
    } else {
      await db.run("INSERT INTO configurazione_email (chiave, valore) VALUES ('smtp_config', ?)", [valore]);
    }
    
    res.json({ success: true, message: 'Configurazione SMTP salvata con successo!' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/report', async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    
    let startIso = '';
    let endIso = new Date().toISOString();
    
    const now = new Date();
    if (range === 'week') {
      const d = new Date();
      d.setDate(now.getDate() - 7);
      startIso = d.toISOString();
    } else if (range === 'month') {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      startIso = d.toISOString();
    } else if (range === '3months') {
      const d = new Date();
      d.setDate(now.getDate() - 90);
      startIso = d.toISOString();
    } else if (range === 'custom' && startDate && endDate) {
      startIso = new Date(startDate).toISOString();
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      endIso = eDate.toISOString();
    } else {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      startIso = d.toISOString();
    }

    const metrics = await db.get(`
      SELECT 
        COUNT(CASE WHEN tipo_attivita = 'Nuovo Mandato' THEN 1 END) as ricercheAperte,
        COUNT(CASE WHEN tipo_attivita = 'Inserimento CV' THEN 1 END) as nuoviCandidati,
        COUNT(CASE WHEN tipo_attivita = 'Associazione Ricerca' THEN 1 END) as candidatiPresentati,
        COUNT(CASE WHEN tipo_attivita = 'Colloquio Programmato' THEN 1 END) as colloquiProgrammati,
        COUNT(CASE WHEN tipo_attivita = 'Avvio Prova' THEN 1 END) as proveAvviate,
        COUNT(CASE WHEN tipo_attivita = 'Inviata Email (con Allegato)' OR tipo_attivita = 'Inviato CV (WhatsApp)' THEN 1 END) as cvInviati,
        COUNT(CASE WHEN tipo_attivita = 'Stato Candidato Modificato' AND dettagli LIKE '%Approvato/Assunto%' THEN 1 END) as assunti,
        COUNT(CASE WHEN tipo_attivita = 'Scheda Assunzione Trasmessa' THEN 1 END) as assunzioniTrasmesse
      FROM storico
      WHERE data_attivita >= ? AND data_attivita <= ?
    `, [startIso, endIso]);

    const detailedLogs = await db.all(`
      SELECT * 
      FROM storico 
      WHERE data_attivita >= ? AND data_attivita <= ? 
      ORDER BY data_attivita DESC
    `, [startIso, endIso]);

    res.json({
      success: true,
      data: {
        startDate: startIso,
        endDate: endIso,
        metrics: {
          ricercheAperte: metrics.ricercheAperte || 0,
          nuoviCandidati: metrics.nuoviCandidati || 0,
          candidatiPresentati: metrics.candidatiPresentati || 0,
          colloquiProgrammati: metrics.colloquiProgrammati || 0,
          proveAvviate: metrics.proveAvviate || 0,
          cvInviati: metrics.cvInviati || 0,
          assunti: metrics.assunti || 0,
          assunzioniTrasmesse: metrics.assunzioniTrasmesse || 0
        },
        logs: detailedLogs
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 12. GESTIONE E-MAIL CLIENT (STORICO E INVIO)
app.get('/api/emails', async (req, res) => {
  try {
    const list = await db.all('SELECT * FROM emails ORDER BY data_invio DESC');
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post('/api/emails/send', async (req, res) => {
  try {
    const { destinatario, oggetto, corpo, id_candidato, id_ricerca, tipo } = req.body;
    if (!destinatario || !oggetto || !corpo) {
      return res.status(400).json({ success: false, error: 'Dati incompleti per invio e-mail' });
    }
    
    // Get sender info from SMTP configuration
    let mittente = 'HEMA Selezione';
    const configRow = await db.get("SELECT valore FROM configurazione_email WHERE chiave = 'smtp_config'");
    if (configRow) {
      const config = JSON.parse(configRow.valore);
      if (config.user) {
        mittente = config.user;
      }
    }

    const emailResult = await inviaEmailHelper(destinatario, oggetto, corpo);
    const stato = emailResult.success ? 'Inviata' : (emailResult.simulated ? 'Simulata' : 'Fallita');
    const id = generateID('EM');
    const dataInvio = new Date().toISOString();

    await db.run(`
      INSERT INTO emails (id, data_invio, mittente, destinatario, oggetto, corpo, tipo, stato, id_candidato, id_ricerca)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, dataInvio, mittente, destinatario, oggetto, corpo, tipo || 'custom', stato, id_candidato || null, id_ricerca || null]);

    if (id_ricerca) {
      const r = await db.get('SELECT azienda FROM ricerche WHERE id = ?', [id_ricerca]);
      const azienda = r ? r.azienda : 'Azienda';
      await logActivity('CLIENTE', id_ricerca, azienda, 'Email Trasmessa', `Inviata email a <${destinatario}> Oggetto: "${oggetto}"`, id_ricerca, destinatario);
    }
    if (id_candidato) {
      const c = await db.get('SELECT nome, cognome FROM candidati WHERE id = ?', [id_candidato]);
      const nomeCompleto = c ? `${c.cognome} ${c.nome}` : 'Candidato';
      await logActivity('CANDIDATO', id_candidato, nomeCompleto, 'Email Ricevuta', `Inviata email con Oggetto: "${oggetto}"`, id_ricerca || null, destinatario);
    }

    res.json({ success: true, id, stato });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});



// DELETE Candidato
app.delete('/api/candidati/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.run('DELETE FROM candidati WHERE id = ?', [id]);
    res.json({ success: true, message: 'Candidato eliminato' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// DELETE Cliente
app.delete('/api/clienti/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.run('DELETE FROM anagrafica_clienti WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cliente eliminato' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server Express attivo sulla porta ${PORT}`);
  });
});
