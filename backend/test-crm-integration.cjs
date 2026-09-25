const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ricerca-crm-test-'));
  const port = await freePort();
  const callbackPort = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const calls = [];
  const callback = require('http').createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => { calls.push(JSON.parse(body)); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"success":true}'); });
  });
  await new Promise(resolve => callback.listen(callbackPort, '127.0.0.1', resolve));
  const child = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(port), DATA_DIR: dir, PRECONTRACT_INGEST_TOKEN: 'test-ingest', HR_DOCUMENT_PASSWORD: 'test-admin', CALLS_CRM_CALLBACK_URL: `http://127.0.0.1:${callbackPort}/callback`, CALLS_CRM_CALLBACK_TOKEN: 'test-callback', RESEARCH_PUBLIC_URL: base },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  const waitFor = async predicate => { const deadline = Date.now() + 10000; while (!predicate() && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50)); assert.ok(predicate(), output); };
  try {
    await waitFor(() => output.includes('Server Express attivo'));
    const form = new FormData();
    form.set('precontractId', 'precontract-test-123');
    form.set('localName', 'Azienda Test');
    form.set('role', 'Addetto');
    form.set('resourceCount', '2');
    form.set('file', new Blob([Buffer.from('%PDF-1.4\n%%EOF')], { type: 'application/pdf' }), 'scheda.pdf');
    const ingest = token => fetch(`${base}/api/integrations/precontracts`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    assert.equal((await ingest('wrong')).status, 401);
    const created = await ingest('test-ingest');
    assert.equal(created.status, 201);
    const { ricercaId } = await created.json();
    assert.equal((await (await ingest('test-ingest')).json()).ricercaId, ricercaId);
    const detail = await (await fetch(`${base}/api/ricerche/${ricercaId}`)).json();
    assert.equal(detail.data.ricerca.stato_approvazione_tl, 'In attesa di approvazione');
    assert.equal(detail.data.ricerca.precontract_document_name, 'precontratto-precontract-test-123.pdf');
    const approve = password => fetch(`${base}/api/ricerche/${ricercaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stato_approvazione_tl: 'Approvata', stato_ricerca: 'Ricerca Inserita', adminPassword: password }) });
    assert.equal((await approve('wrong')).status, 401);
    assert.equal((await approve('test-admin')).status, 200);
    await waitFor(() => calls.some(item => item.type === 'accepted'));
    const accepted = calls.find(item => item.type === 'accepted');
    assert.equal(accepted.precontractId, 'precontract-test-123');
    assert.ok(accepted.viewerPassword.length >= 16);
    assert.equal((await fetch(accepted.viewerUrl)).status, 200);
    const viewer = password => fetch(accepted.viewerUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ password }) });
    assert.equal((await viewer('wrong')).status, 401);
    assert.match(await (await viewer(accepted.viewerPassword)).text(), /Azienda Test/);
    const report = password => fetch(`${base}/api/ricerche/${ricercaId}/weekly-report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'Due colloqui effettuati', adminPassword: password }) });
    assert.equal((await report('wrong')).status, 401);
    assert.equal((await report('test-admin')).status, 201);
    await waitFor(() => calls.some(item => item.type === 'report'));
    assert.equal((await report('test-admin')).status, 409);
    assert.match(await (await viewer(accepted.viewerPassword)).text(), /Due colloqui effettuati/);
    form.set('precontractId', 'precontract-reject-123');
    const rejectedMandate = await (await ingest('test-ingest')).json();
    const rejectResponse = await fetch(`${base}/api/ricerche/${rejectedMandate.ricercaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stato_approvazione_tl: 'Cestinato', stato_ricerca: 'Cestinato', motivazione: 'Mandato incompleto', adminPassword: 'test-admin' }) });
    assert.equal(rejectResponse.status, 200);
    await waitFor(() => calls.some(item => item.type === 'rejected'));
    assert.equal(calls.find(item => item.type === 'rejected').reason, 'Mandato incompleto');
    console.log('PASS importazione, approvazione/rifiuto, callback, viewer protetto e report settimanale');
  } finally {
    if (child.exitCode === null && child.signalCode === null) { child.kill(); await new Promise(resolve => child.once('exit', resolve)); }
    await new Promise(resolve => callback.close(resolve));
    if (path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(dir).startsWith('ricerca-crm-test-')) fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
