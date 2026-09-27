const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const sqlite = require('sqlite3');
const root = path.resolve(__dirname, '..');
const testRoot = path.join(root, '.checkup');
fs.mkdirSync(testRoot, { recursive: true });
const dataDir = fs.mkdtempSync(path.join(testRoot, 'regression-'));
const results = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
(async () => {
  const port = await freePort();
  const base = 'http://127.0.0.1:' + port;
  let child, db, token, output = '', smtp, smtpReject = false;
  const smtpSockets = new Set();
  const mailBodies = [];
  const run = sql => new Promise((resolve, reject) => db.run(sql, error => error ? reject(error) : resolve()));
  const get = sql => new Promise((resolve, reject) => db.get(sql, (error, row) => error ? reject(error) : resolve(row)));
  const start = async () => {
    output = '';
    child = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: { ...process.env, NODE_ENV: 'test', PORT: String(port), DATA_DIR: dataDir, HR_LOGIN_PASSWORD: 'regression-login', HR_DOCUMENT_PASSWORD: 'regression-doc', PRECONTRACT_INGEST_TOKEN: 'regression-crm', CALLS_CRM_CALLBACK_URL: '', CALLS_CRM_CALLBACK_TOKEN: '', RESEARCH_PUBLIC_URL: base }, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const deadline = Date.now() + 15000;
    while (!output.includes('Server Express attivo') && Date.now() < deadline && child.exitCode === null) await wait(25);
    assert.match(output, /Server Express attivo/, output);
  };
  const stop = async () => {
    if (!child || child.exitCode !== null) return;
    const exited = new Promise(resolve => child.once('exit', resolve));
    child.kill(); await exited;
  };
  const api = async (route, method = 'GET', body, credentials = token) => {
    const response = await fetch(base + '/api' + route, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(credentials ? { Authorization: 'Bearer ' + credentials } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000) });
    const text = await response.text();
    let json; try { json = JSON.parse(text); } catch {}
    return { status: response.status, json, text };
  };
  const check = async (name, fn) => {
    try { await fn(); results.push({ name, result: 'PASS' }); console.log('PASS ' + name); }
    catch (error) { results.push({ name, result: 'FAIL', error: error.message }); throw error; }
  };
  try {
    await start();
    db = new sqlite.Database(path.join(dataDir, 'database.db'));
    await check('API interne bloccate senza sessione', async () => {
      for (const route of ['/candidati', '/ricerche', '/clienti', '/commerciali', '/configurazione-email', '/clienti/portale', '/emails', '/dashboard/pending']) assert.equal((await api(route, 'GET', undefined, null)).status, 401, route);
      assert.equal((await api('/auth/login', 'POST', { password: 'wrong' }, null)).status, 401);
      token = (await api('/auth/login', 'POST', { password: 'regression-login' }, null)).json.token;
      assert.ok(token);
      assert.equal((await api('/auth/session')).json.role, 'admin');
    });
    const r = (await api('/ricerche', 'POST', { azienda: 'REGRESSIONE', ruolo: 'Addetto', nr_risorse: 2 })).json.id;
    const c = (await api('/candidati', 'POST', { nome: 'Persona', cognome: 'Test', id_ricerca: r })).json.id;
    const detail = async () => (await api('/ricerche/' + r)).json.data;
    const pipe = async () => (await detail()).candidatiCollegati.find(item => item.idCandidato === c);
    const p = (await pipe()).idAssunzione;
    await check('Approvazione definitiva della riserva mantiene la fase raggiunta', async () => {
      for (const phase of ['Ricerca Inserita', 'Avviata', 'Chiuso/Assunto']) {
        const created = await api('/ricerche', 'POST', { azienda: 'RISERVA TEST ' + phase, ruolo: 'Addetto' });
        assert.equal(created.status, 200, created.text);
        const id = created.json.id;
        const reserved = await api('/ricerche/' + id, 'PUT', { stato_approvazione_tl: 'Approvata con Riserva', stato_ricerca: phase, motivazione: 'Riserva fittizia di collaudo' });
        assert.equal(reserved.status, 200, reserved.text);
        assert.equal((await api('/ricerche/' + id, 'PUT', { stato_approvazione_tl: 'Approvata', stato_ricerca: 'Ricerca Inserita' })).status, 200);
        const updated = (await api('/ricerche/' + id)).json.data.ricerca;
        assert.equal(updated.stato_approvazione_tl, 'Approvata');
        assert.equal(updated.stato_ricerca, phase);
      }
    });
    await check('Aggiornamenti parziali e validazioni dei campi', async () => {
      assert.equal((await api('/pipeline/' + p, 'PUT', { stato_avanzamento: 'Presentato' })).status, 200);
      assert.equal((await api('/pipeline/' + p, 'PUT', { note_amministrazione: 'Nota senza stato' })).status, 200);
      assert.equal((await pipe()).statoAvanzamento, 'Presentato');
      assert.equal((await api('/ricerche/' + r, 'PUT', { nr_risorse: '2abc' })).status, 400);
      assert.equal((await api('/pipeline/' + p, 'PUT', { data_inizio_prova: '2026-02-30' })).status, 400);
    });
    await check('Colloqui multipli, annullamento distinto e ripristino esatto', async () => {
      const a = (await api('/appuntamenti', 'POST', { id_ricerca: r, id_candidato: c, data: '2026-10-01', ora: '10:00' })).json.id;
      const b = (await api('/appuntamenti', 'POST', { id_ricerca: r, id_candidato: c, data: '2026-10-02', ora: '10:00' })).json.id;
      await api('/appuntamenti/' + a, 'PUT', { stato: 'Annullato' });
      assert.equal((await pipe()).statoAvanzamento, 'Colloquio Fissato');
      await api('/appuntamenti/' + b, 'PUT', { stato: 'Annullato' });
      assert.equal((await pipe()).statoAvanzamento, 'Colloquio Annullato');
      await api('/appuntamenti/' + a, 'DELETE');
      await api('/appuntamenti/' + b, 'DELETE');
      assert.equal((await pipe()).statoAvanzamento, 'Presentato');
    });
    await check('Colloquio storico senza fase: scelta obbligatoria prima della cancellazione', async () => {
      const a = (await api('/appuntamenti', 'POST', { id_ricerca: r, id_candidato: c, data: '2026-10-02', ora: '11:00' })).json.id;
      await run("UPDATE pipeline_assunzioni SET stato_pre_colloquio=NULL WHERE id='" + p + "'");
      const blocked = await api('/appuntamenti/' + a, 'DELETE');
      assert.equal(blocked.status, 409);
      assert.equal(blocked.json.code, 'PREVIOUS_STATE_REQUIRED');
      assert.ok((await detail()).appuntamenti.some(item => item.id === a || item.idAppuntamento === a));
      assert.equal((await api('/appuntamenti/' + a, 'DELETE', { stato_precedente: 'Presentato' })).status, 200);
      assert.equal((await pipe()).statoAvanzamento, 'Presentato');
    });
    await check('Un vecchio colloquio non annulla una prova già avviata', async () => {
      const a = (await api('/appuntamenti', 'POST', { id_ricerca: r, id_candidato: c, data: '2026-10-03', ora: '10:00' })).json.id;
      await api('/pipeline/' + p, 'PUT', { stato_avanzamento: 'In Prova' });
      await api('/appuntamenti/' + a, 'PUT', { stato: 'Annullato' });
      assert.equal((await pipe()).statoAvanzamento, 'In Prova');
      await api('/appuntamenti/' + a, 'DELETE');
      assert.equal((await pipe()).statoAvanzamento, 'In Prova');
    });
    await check('Scollegamento e colloqui richiedono conferma e sono atomici', async () => {
      const temp = (await api('/candidati', 'POST', { nome: 'Temporaneo', cognome: 'Test', id_ricerca: r })).json.id;
      const tempPipe = (await detail()).candidatiCollegati.find(item => item.idCandidato === temp).idAssunzione;
      await api('/appuntamenti', 'POST', { id_ricerca: r, id_candidato: temp, data: '2026-10-04', ora: '10:00' });
      assert.equal((await api('/pipeline/' + tempPipe, 'DELETE')).status, 409);
      assert.equal((await api('/pipeline/' + tempPipe, 'DELETE', { elimina_colloqui: true })).status, 200);
      const d = await detail();
      assert.ok(!d.appuntamenti.some(item => item.idCandidato === temp));
      assert.ok(!d.candidatiCollegati.some(item => item.idCandidato === temp));
    });
    let cv;
    await check('CV condivisibile solo con firma, documenti riservati', async () => {
      const form = new FormData();
      form.set('cvFile', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'cv.pdf');
      form.set('docIdFile', new Blob(['%PDF-1.4\nDocumento\n%%EOF'], { type: 'application/pdf' }), 'documento.pdf');
      const response = await fetch(base + '/api/candidati/' + c, { method: 'PUT', headers: { Authorization: 'Bearer ' + token }, body: form });
      assert.equal(response.status, 200);
      cv = (await pipe()).linkCV;
      assert.equal((await fetch(base + cv)).status, 200);
      assert.equal((await fetch(base + cv.split('?')[0])).status, 401);
      assert.equal((await fetch(base + cv.replace(/signature=./, 'signature=x'))).status, 401);
      const doc = (await api('/candidati/' + c)).json.data.link_documenti;
      assert.equal((await fetch(base + doc)).status, 401);
      assert.equal((await fetch(base + doc, { headers: { Authorization: 'Bearer ' + token } })).status, 200);
    });
    await check('Errore storico: candidato e file nuovi vengono annullati insieme', async () => {
      const before = (await api('/candidati')).json.data.length;
      await run("CREATE TRIGGER regression_failure BEFORE INSERT ON storico BEGIN SELECT RAISE(ABORT, 'errore sintetico'); END");
      try {
        const form = new FormData(); form.set('nome', 'Errore'); form.set('cognome', 'Sintetico');
        form.set('cvFile', new Blob(['test'], { type: 'application/pdf' }), 'rollback.pdf');
        const response = await fetch(base + '/api/candidati', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
        assert.equal(response.status, 500);
        assert.equal((await api('/candidati')).json.data.length, before);
        assert.ok(!fs.readdirSync(path.join(dataDir, 'uploads/cv')).some(name => name.includes('rollback')));
      } finally { await run('DROP TRIGGER regression_failure'); }
    });
    await check('Sessioni e firma CV restano valide dopo il riavvio', async () => {
      await stop(); await start();
      assert.equal((await api('/auth/session')).status, 200);
      assert.equal((await fetch(base + cv)).status, 200);
    });
    let commercialToken;
    await check('Password commerciali protette, compatibilità account esistenti', async () => {
      const created = await api('/commerciali', 'POST', { nome: 'Anna', cognome: 'Test', email: 'anna@example.invalid', password: 'existing-password' });
      assert.equal(created.status, 200);
      const user = await get("SELECT * FROM commerciali WHERE email = 'anna@example.invalid'");
      assert.match(user.password, /^scrypt:/);
      await run("UPDATE commerciali SET password = 'existing-password' WHERE email = 'anna@example.invalid'");
      commercialToken = (await api('/commerciali/login', 'POST', { email: 'anna@example.invalid', password: 'existing-password' }, null)).json.token;
      assert.ok(commercialToken);
      assert.match((await get("SELECT password FROM commerciali WHERE email = 'anna@example.invalid'")).password, /^scrypt:/);
      assert.equal((await api('/candidati', 'GET', undefined, commercialToken)).status, 403);
      assert.equal((await api('/configurazione-email', 'GET', undefined, commercialToken)).status, 403);
    });
    await check('Commerciale non può vedere o impersonare altri commerciali', async () => {
      const other = (await api('/ricerche', 'POST', { azienda: 'ALTRI', ruolo: 'Addetto', consulente_commerciale: 'Altro Utente' })).json.id;
      const own = await api('/ricerche', 'POST', { azienda: 'PROPRIA', ruolo: 'Addetto', consulente_commerciale: 'Altro Utente', da_approvare: false }, commercialToken);
      const ownDetail = (await api('/ricerche/' + own.json.id)).json.data.ricerca;
      assert.equal(ownDetail.consulente_commerciale, 'Anna Test');
      assert.equal(ownDetail.stato_approvazione_tl, 'In attesa di approvazione');
      const list = (await api('/commerciali/ricerche?nome=Altro%20Utente', 'GET', undefined, commercialToken)).json.data;
      assert.ok(list.some(item => item.id === own.json.id)); assert.ok(!list.some(item => item.id === other));
      assert.equal((await api('/timeline/' + other, 'GET', undefined, commercialToken)).status, 403);
    });
    await check('Cliente non può interrogare aziende differenti', async () => {
      const created = await api('/clienti/portale', 'POST', { nome_locale: 'CLIENTE PROTETTO', email: 'cliente@example.invalid', password: 'client-password', piva: 'TESTPIVA' });
      assert.equal(created.status, 200);
      const clientToken = (await api('/clienti/login', 'POST', { email: 'cliente@example.invalid', password: 'client-password' }, null)).json.token;
      assert.ok(clientToken);
      const inserted = await api('/clienti/portale/ricerche', 'POST', { azienda: 'REGRESSIONE', piva: 'FALSA', ruolo: 'Addetto' }, clientToken);
      assert.equal(inserted.status, 200);
      const list = (await api('/clienti/portale/ricerche?azienda=REGRESSIONE', 'GET', undefined, clientToken)).json.data;
      assert.ok(list.length > 0); assert.ok(list.every(item => item.azienda === 'CLIENTE PROTETTO' && item.piva === 'TESTPIVA'));
      assert.equal((await api('/clienti/portale', 'GET', undefined, clientToken)).status, 403);
    });
    await check('Scheda salvata e simulazione SMTP non conferma l’assunzione', async () => {
      await api('/pipeline/' + p, 'PUT', { stato_avanzamento: 'Idoneo', stato_prova: 'Prova Superata' });
      const sheet = { nome: 'Persona', cognome: 'Test', mansione: 'Addetto', oreContratto: '40', retribuzione: '1500', contrattoTipo: 'Full-time' };
      assert.equal((await api('/pipeline/' + p + '/hiring-sheet', 'PUT', { sheet })).status, 200);
      assert.equal((await pipe()).hiringSheet.retribuzione, '1500');
      assert.equal((await api('/pipeline/' + p, 'PUT', { stato_avanzamento: 'Assunto' })).status, 400);
      const response = await api('/email/assunzione', 'POST', { dest_email: 'amministrazione@example.invalid', htmlBody: '<p>Scheda</p>', id_candidato: c, id_ricerca: r, sheet });
      assert.equal(response.json.simulated, true);
      assert.equal((await pipe()).statoAvanzamento, 'Idoneo');
      assert.equal((await pipe()).hiringSentAt, null);
    });
    smtp = net.createServer(socket => {
      smtpSockets.add(socket); socket.on('close', () => smtpSockets.delete(socket));
      let buffer = '', inData = false, body = '';
      socket.write('220 localhost test SMTP\r\n');
      socket.on('data', chunk => {
        buffer += chunk.toString();
        while (buffer.includes('\r\n')) {
          const at = buffer.indexOf('\r\n'); const line = buffer.slice(0, at); buffer = buffer.slice(at + 2);
          if (inData) {
            if (line === '.') { inData = false; mailBodies.push(body); body = ''; socket.write(smtpReject ? '550 invio rifiutato\r\n' : '250 messaggio accettato\r\n'); }
            else body += line + '\r\n';
          } else if (/^EHLO|^HELO/.test(line)) socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');
          else if (/^AUTH/.test(line)) socket.write('235 autenticato\r\n');
          else if (line === 'DATA') { inData = true; socket.write('354 invia dati\r\n'); }
          else if (line === 'QUIT') socket.end('221 fine\r\n');
          else socket.write('250 OK\r\n');
        }
      });
    });
    await new Promise(resolve => smtp.listen(0, '127.0.0.1', resolve));
    await api('/configurazione-email', 'POST', { host: '127.0.0.1', port: smtp.address().port, user: 'smtp-test', pass: 'smtp-sentinel', secure: false });
    await check('SMTP oscurato nel frontend e preservato a modifica dei parametri', async () => {
      const config = await api('/configurazione-email'); assert.ok(!config.text.includes('smtp-sentinel')); assert.equal(config.json.data.has_password, true);
      await api('/configurazione-email', 'POST', { ...config.json.data, pass: '' });
      const stored = await get("SELECT valore FROM configurazione_email WHERE chiave='smtp_config'");
      assert.equal(JSON.parse(stored.valore).pass, 'smtp-sentinel');
    });
    const hiringBody = { dest_email: 'amministrazione@example.invalid', htmlBody: '<p>Scheda completa</p>', id_candidato: c, id_ricerca: r, candidato_nome: 'Test Persona', sheet: (await pipe()).hiringSheet };
    await check('Errore SMTP conserva Idoneo, invio riuscito conferma Assunto', async () => {
      smtpReject = true;
      assert.equal((await api('/email/assunzione', 'POST', hiringBody)).status, 500);
      assert.equal((await pipe()).statoAvanzamento, 'Idoneo');
      smtpReject = false;
      const sent = await api('/email/assunzione', 'POST', hiringBody);
      assert.equal(sent.status, 200, sent.text); assert.equal(sent.json.simulated, false);
      const hired = await pipe(); assert.equal(hired.statoAvanzamento, 'Assunto'); assert.ok(hired.hiringSentAt);
      assert.ok(mailBodies.at(-1).includes('Content-Disposition: attachment'));
    });
    await check('Mandato non si chiude da solo, chiusura manuale persistente', async () => {
      assert.notEqual((await detail()).ricerca.stato_ricerca, 'Chiuso/Assunto');
      assert.equal((await api('/ricerche/' + r, 'PUT', { stato_ricerca: 'Chiuso/Assunto' })).status, 200);
      assert.equal((await detail()).ricerca.stato_ricerca, 'Chiuso/Assunto');
      await api('/ricerche/' + r, 'PUT', { stato_ricerca: 'Avviata' });
      assert.equal((await detail()).ricerca.stato_ricerca, 'Avviata');
    });
    await check('Origine esterna bloccata e sessione revocata al logout', async () => {
      const blocked = await fetch(base + '/api/ricerche', { method: 'POST', headers: { Origin: 'https://attacker.invalid', Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ azienda: 'NO', ruolo: 'NO' }) });
      assert.equal(blocked.status, 403);
      assert.equal((await api('/auth/logout', 'POST')).status, 200);
      assert.equal((await api('/candidati')).status, 401);
    });
    await check('Integrità SQLite e disponibilità del database', async () => {
      assert.equal((await get('PRAGMA integrity_check')).integrity_check, 'ok');
      assert.equal(await get('PRAGMA foreign_key_check'), undefined);
      assert.equal((await fetch(base + '/healthz')).status, 200);
    });
  } finally {
    await stop();
    if (db) await new Promise(resolve => db.close(resolve));
    for (const socket of smtpSockets) socket.destroy();
    if (smtp) await new Promise(resolve => smtp.close(resolve));
    fs.writeFileSync(path.join(testRoot, 'regression-results.json'), JSON.stringify(results, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
