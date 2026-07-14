const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('PRAGMA foreign_keys=off;');
  db.run('BEGIN TRANSACTION;');
  
  db.run(`
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

  db.run(`INSERT INTO annunci_new SELECT * FROM annunci`);
  db.run(`DROP TABLE annunci`);
  db.run(`ALTER TABLE annunci_new RENAME TO annunci`);
  
  db.run('COMMIT;', (err) => {
    if (err) {
      console.error("Migration failed:", err);
    } else {
      console.log("Migration successful!");
    }
    db.run('PRAGMA foreign_keys=on;');
    db.close();
  });
});
