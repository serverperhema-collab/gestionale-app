const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = process.env.DATA_DIR || __dirname;
const dbPath = path.resolve(dbDir, 'database.db');
const dbInstance = new sqlite3.Database(dbPath);

// Enable foreign keys support
dbInstance.run('PRAGMA foreign_keys = ON');

// Promisified database helpers
const db = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      dbInstance.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      dbInstance.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      dbInstance.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      dbInstance.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize database schema
async function initDatabase() {
  try {
    // 1. Table Candidati
    await db.exec(`
      CREATE TABLE IF NOT EXISTS candidati (
        id TEXT PRIMARY KEY,
        data_inserimento TEXT,
        cognome TEXT NOT NULL,
        nome TEXT NOT NULL,
        telefono TEXT,
        email TEXT,
        iban TEXT,
        residenza TEXT,
        competenze_chiave TEXT,
        disponibilita TEXT,
        link_cv TEXT,
        note_generali TEXT,
        valutazione_serieta INTEGER,
        valutazione_disponibilita INTEGER,
        valutazione_professionalita INTEGER,
        settore TEXT,
        link_documenti TEXT,
        codice_fiscale TEXT
      )
    `);

    // 2. Table Clienti
    await db.exec(`
      CREATE TABLE IF NOT EXISTS clienti (
        id TEXT PRIMARY KEY,
        nome_locale TEXT NOT NULL,
        piva TEXT,
        sede_legale TEXT,
        sede_lavoro TEXT,
        referente TEXT,
        email TEXT,
        telefono_mobile TEXT,
        telefono_fisso TEXT,
        data_inserimento TEXT,
        valutazione_serieta INTEGER,
        valutazione_disponibilita INTEGER,
        valutazione_interesse INTEGER,
        valutazione_selettivita INTEGER
      )
    `);

    // 3. Table Ricerche
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ricerche (
        id TEXT PRIMARY KEY,
        data_inserimento TEXT,
        azienda TEXT NOT NULL,
        consulente_commerciale TEXT,
        outbound TEXT,
        piva TEXT,
        sede_legale TEXT,
        sede_lavoro TEXT,
        referente TEXT,
        telefono_mobile TEXT,
        telefono_fisso TEXT,
        email TEXT,
        nr_risorse INTEGER,
        ruolo TEXT,
        ccnl_livello TEXT,
        retribuzione TEXT,
        competenze_tecniche TEXT,
        note TEXT,
        stato_ricerca TEXT,
        stato_approvazione_tl TEXT,
        note_team_leader TEXT,
        data_ultimo_resoconto TEXT,
        testo_annuncio TEXT,
        portali_annuncio TEXT,
        link_annuncio TEXT,
        data_inserimento_annuncio TEXT,
        valutazione_facilita INTEGER,
        data_scadenza_annuncio TEXT,
        stato_annuncio TEXT DEFAULT 'Attivo',
        settore TEXT,
        ore_lavoro INTEGER,
        orario_lavoro TEXT,
        ore_lavoro_tipo TEXT DEFAULT 'Settimanali'
      )
    `);

    // 3b. Table Annunci
    await db.exec(`
      CREATE TABLE IF NOT EXISTS annunci (
        id TEXT PRIMARY KEY,
        id_ricerca TEXT,
        testo_annuncio TEXT,
        portali_annuncio TEXT,
        link_annuncio TEXT,
        data_inserimento_annuncio TEXT,
        data_scadenza_annuncio TEXT,
        stato_annuncio TEXT DEFAULT 'Attivo',
        note TEXT
      )
    `);
    // 3c. Table Ricerche-Annunci (Junction)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ricerche_annunci (
        id_ricerca TEXT NOT NULL,
        id_annuncio TEXT NOT NULL,
        data_collegamento TEXT,
        PRIMARY KEY (id_ricerca, id_annuncio),
        FOREIGN KEY (id_ricerca) REFERENCES ricerche(id),
        FOREIGN KEY (id_annuncio) REFERENCES annunci(id)
      )
    `);

    // 4. Table Pipeline Assunzioni
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pipeline_assunzioni (
        id TEXT PRIMARY KEY,
        id_ricerca TEXT,
        id_candidato TEXT,
        stato_avanzamento TEXT,
        data_colloquio_cliente TEXT,
        feedback_candidato TEXT,
        feedback_cliente TEXT,
        stato_prova TEXT,
        inquadramento_proposto TEXT,
        mansione_effettiva TEXT,
        contratto_tipo TEXT,
        ore_contratto INTEGER,
        durata_contratto TEXT,
        retribuzione_accordata TEXT,
        costo_servizio_finale TEXT,
        note_amministrazione TEXT,
        data_invio_cv TEXT,
        data_inizio_prova TEXT,
        data_scadenza_prova TEXT,
        prova_contrattualizzata INTEGER DEFAULT 0,
        inviato_cliente INTEGER DEFAULT 0,
        feedback_stato TEXT DEFAULT 'In attesa di feedback',
        feedback_note TEXT,
        FOREIGN KEY (id_ricerca) REFERENCES ricerche(id) ON DELETE CASCADE,
        FOREIGN KEY (id_candidato) REFERENCES candidati(id) ON DELETE CASCADE
      )
    `);

    // 5. Table Appuntamenti
    await db.exec(`
      CREATE TABLE IF NOT EXISTS appuntamenti (
        id TEXT PRIMARY KEY,
        id_ricerca TEXT,
        id_candidato TEXT,
        candidato_nome TEXT,
        azienda_cliente TEXT,
        data_colloquio TEXT,
        ora_colloquio TEXT,
        tipo_colloquio TEXT,
        luogo TEXT,
        stato_appuntamento TEXT,
        note_dettagli TEXT,
        FOREIGN KEY (id_ricerca) REFERENCES ricerche(id) ON DELETE CASCADE,
        FOREIGN KEY (id_candidato) REFERENCES candidati(id) ON DELETE CASCADE
      )
    `);

    // 6. Table Storico (Unified Activities Logs)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS storico (
        id TEXT PRIMARY KEY,
        tipo_soggetto TEXT,
        id_soggetto TEXT,
        nome_soggetto TEXT,
        data_attivita TEXT,
        tipo_attivita TEXT,
        dettagli TEXT,
        id_ricerca_associata TEXT,
        soggetto_correlato TEXT
      )
    `);

    // 7. Table Commerciali (Sales agents)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS commerciali (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        data_nascita TEXT,
        telefono TEXT,
        password TEXT NOT NULL,
        stato_approvazione TEXT DEFAULT 'Da Approvare',
        data_registrazione TEXT
      )
    `);

    // 8. Table Configurazione Email (SMTP config)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS configurazione_email (
        chiave TEXT PRIMARY KEY,
        valore TEXT NOT NULL
      )
    `);

    // 9. Table Operatori (Outbound agents)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS operatori (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        attivo INTEGER DEFAULT 1
      )
    `);

    // 10. Table Emails (Archivio storico email inviate)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        data_invio TEXT NOT NULL,
        mittente TEXT NOT NULL,
        destinatario TEXT NOT NULL,
        oggetto TEXT NOT NULL,
        corpo TEXT NOT NULL,
        tipo TEXT NOT NULL,
        stato TEXT NOT NULL,
        id_candidato TEXT,
        id_ricerca TEXT,
        FOREIGN KEY (id_candidato) REFERENCES candidati(id) ON DELETE SET NULL,
        FOREIGN KEY (id_ricerca) REFERENCES ricerche(id) ON DELETE SET NULL
      )
    `);



    // Create CV upload folder if it doesn't exist
    const uploadsDir = path.resolve(__dirname, 'uploads', 'cv');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    // Create Doc upload folder if it doesn't exist
    const docsDir = path.resolve(__dirname, 'uploads', 'doc');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Migration checks for new columns
    try {
      await db.exec('ALTER TABLE candidati ADD COLUMN link_documenti TEXT');
    } catch(e) {}
    try {
      await db.exec("ALTER TABLE ricerche ADD COLUMN ore_lavoro_tipo TEXT DEFAULT 'Settimanali'");
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE candidati ADD COLUMN codice_fiscale TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE pipeline_assunzioni ADD COLUMN data_invio_cv TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE pipeline_assunzioni ADD COLUMN data_scadenza_prova TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE candidati ADD COLUMN settore TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE ricerche ADD COLUMN data_scadenza_annuncio TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE ricerche ADD COLUMN stato_annuncio TEXT DEFAULT \'Attivo\'');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE pipeline_assunzioni ADD COLUMN inviato_cliente INTEGER DEFAULT 0');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE pipeline_assunzioni ADD COLUMN feedback_stato TEXT DEFAULT \'In attesa di feedback\'');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE pipeline_assunzioni ADD COLUMN feedback_note TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE annunci ADD COLUMN note TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE ricerche ADD COLUMN settore TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE appuntamenti ADD COLUMN luogo TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE pipeline_assunzioni ADD COLUMN data_inizio_prova TEXT');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE pipeline_assunzioni ADD COLUMN prova_contrattualizzata INTEGER DEFAULT 0');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE ricerche ADD COLUMN ore_lavoro INTEGER');
    } catch(e) {}
    try {
      await db.exec('ALTER TABLE ricerche ADD COLUMN orario_lavoro TEXT');
    } catch(e) {}

    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS valutazioni_candidati (
          id_candidato TEXT PRIMARY KEY,
          pres_personale INTEGER,
          puntualita INTEGER,
          comunicazione INTEGER,
          educazione INTEGER,
          motivazione INTEGER,
          interesse_az INTEGER,
          esperienza_lav INTEGER,
          competenze_tec INTEGER,
          cap_apprendimento INTEGER,
          problem_solving INTEGER,
          cap_organizzativa INTEGER,
          team_work INTEGER,
          autonomia INTEGER,
          affidabilita INTEGER,
          flessibilita INTEGER,
          
          orario_full_time INTEGER DEFAULT 0,
          orario_part_time INTEGER DEFAULT 0,
          orario_turni INTEGER DEFAULT 0,
          orario_weekend INTEGER DEFAULT 0,
          orario_straordinari INTEGER DEFAULT 0,
          
          mob_automunito INTEGER DEFAULT 0,
          mob_trasferte INTEGER DEFAULT 0,
          mob_spostamenti INTEGER DEFAULT 0,
          
          disp_assunzione TEXT,
          
          punti_forza TEXT,
          aree_miglioramento TEXT,
          osservazioni TEXT,
          valutazione_finale TEXT,
          punteggio_complessivo INTEGER,
          FOREIGN KEY(id_candidato) REFERENCES candidati(id) ON DELETE CASCADE
        )
      `);
    } catch(e) {}

    try {
      // Migrate existing annunci to ricerche_annunci
      await db.exec(`
        INSERT INTO ricerche_annunci (id_ricerca, id_annuncio, data_collegamento)
        SELECT id_ricerca, id, data_inserimento_annuncio
        FROM annunci
        WHERE id NOT IN (SELECT id_annuncio FROM ricerche_annunci)
          AND id_ricerca IS NOT NULL
      `);
    } catch(e) {
      console.log("Migration annunci -> ricerche_annunci failed or already done:", e.message);
    }

    try {
      // Migrate annunci table schema to remove id_ricerca NOT NULL and FOREIGN KEY constraints
      // SQLite requires recreating the table to drop constraints
      const tableInfo = await db.all("PRAGMA table_info(annunci)");
      const idRicercaCol = tableInfo.find(c => c.name === 'id_ricerca');
      if (idRicercaCol && idRicercaCol.notnull === 1) {
        console.log("Migrating annunci table schema to remove constraints...");
        await db.exec('PRAGMA foreign_keys=off;');
        await db.exec('BEGIN TRANSACTION;');
        await db.exec(`
          CREATE TABLE IF NOT EXISTS annunci_new (
            id TEXT PRIMARY KEY,
            id_ricerca TEXT,
            testo_annuncio TEXT,
            portali_annuncio TEXT,
            link_annuncio TEXT,
            data_inserimento_annuncio TEXT,
            data_scadenza_annuncio TEXT,
            stato_annuncio TEXT DEFAULT 'Attivo',
            note TEXT
          )
        `);
        await db.exec(`INSERT INTO annunci_new SELECT * FROM annunci`);
        await db.exec(`DROP TABLE annunci`);
        await db.exec(`ALTER TABLE annunci_new RENAME TO annunci`);
        await db.exec('COMMIT;');
        await db.exec('PRAGMA foreign_keys=on;');
        console.log("Annunci table migration completed.");
      }
    } catch(e) {
      console.log("Annunci table schema migration failed:", e.message);
      // rollback in case of error
      try { await db.exec('ROLLBACK;'); await db.exec('PRAGMA foreign_keys=on;'); } catch(err) {}
    }

    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

module.exports = {
  db,
  initDatabase
};
