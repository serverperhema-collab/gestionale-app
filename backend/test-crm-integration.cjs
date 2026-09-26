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
    const signedPdf = Buffer.from('%PDF-1.4\n% Documento firmato\n%%EOF');
    const ingest = token => fetch(`${base}/api/integrations/precontracts`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    assert.equal((await ingest('wrong')).status, 401);
    form.set('signedFile', new Blob([Buffer.from('not-a-pdf')], { type: 'application/pdf' }), 'firmato.pdf');
    assert.equal((await ingest('test-ingest')).status, 400);
    form.set('signedFile', new Blob([signedPdf], { type: 'application/pdf' }), 'firmato.pdf');
    const created = await ingest('test-ingest');
    assert.equal(created.status, 201);
    const { ricercaId } = await created.json();
    assert.equal((await (await ingest('test-ingest')).json()).ricercaId, ricercaId);
    const detail = await (await fetch(`${base}/api/ricerche/${ricercaId}`)).json();
    assert.equal(detail.data.ricerca.stato_approvazione_tl, 'In attesa di approvazione');
    assert.equal(detail.data.ricerca.precontract_document_name, 'precontratto-precontract-test-123.pdf');
    assert.equal(detail.data.ricerca.signed_precontract_document_name, 'firmato.pdf');
    const signedDownload = password => fetch(`${base}/api/ricerche/${ricercaId}/signed-precontract-document/open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    assert.equal((await signedDownload('wrong')).status, 401);
    assert.deepEqual(Buffer.from(await (await signedDownload('test-admin')).arrayBuffer()), signedPdf);
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
    form.set('precontractId', 'precontract-reserve-123');
    form.delete('signedFile');
    const reservedMandate = await (await ingest('test-ingest')).json();
    const reserveResponse = await fetch(`${base}/api/ricerche/${reservedMandate.ricercaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stato_approvazione_tl: 'Approvata con Riserva', stato_ricerca: 'Ricerca Inserita', motivazione: 'Aggiornare la sede di lavoro', adminPassword: 'test-admin' }) });
    assert.equal(reserveResponse.status, 200);
    await waitFor(() => calls.some(item => item.type === 'reserved'));
    const reserved = calls.find(item => item.type === 'reserved');
    assert.equal(reserved.note, 'Aggiornare la sede di lavoro');
    assert.ok(reserved.viewerUrl && reserved.viewerPassword);
    assert.ok(!calls.some(item => item.precontractId === 'precontract-reserve-123' && item.type === 'accepted'));
    const replyForm = new FormData();
    replyForm.set('precontractId', 'precontract-reserve-123'); replyForm.set('messageId', 'reserve-reply-123'); replyForm.set('note', 'Sede aggiornata come richiesto');
    replyForm.set('file', new Blob([signedPdf], { type: 'application/pdf' }), 'aggiornamento.pdf');
    const reply = token => fetch(`${base}/api/integrations/ricerche/${reservedMandate.ricercaId}/reserve-updates`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: replyForm });
    assert.equal((await reply('wrong')).status, 401);
    assert.equal((await reply('test-ingest')).status, 201);
    assert.equal((await reply('test-ingest')).status, 200);
    replyForm.set('note', 'Messaggio modificato con lo stesso ID');
    assert.equal((await reply('test-ingest')).status, 409);
    replyForm.set('messageId', 'reserve-reply-plain-123'); replyForm.set('note', 'Confermo anche per iscritto'); replyForm.delete('file');
    assert.equal((await reply('test-ingest')).status, 201);
    const updates = await (await fetch(`${base}/api/ricerche/${reservedMandate.ricercaId}/reserve-updates`)).json();
    assert.equal(updates.data.length, 2);
    assert.equal(updates.data.find(item => item.id === 'reserve-reply-123').note, 'Sede aggiornata come richiesto');
    assert.equal(updates.data.find(item => item.id === 'reserve-reply-plain-123').original_name, null);
    const fileUrl = `${base}/api/ricerche/${reservedMandate.ricercaId}/reserve-updates/reserve-reply-123/file/open`;
    assert.equal((await fetch(fileUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'wrong' }) })).status, 401);
    assert.deepEqual(Buffer.from(await (await fetch(fileUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'test-admin' }) })).arrayBuffer()), signedPdf);
    const listed = await (await fetch(`${base}/api/ricerche`)).json();
    assert.equal(listed.data.find(item => item.id === reservedMandate.ricercaId).crm_reserve_update_count, 2);
    const finalApproval = await fetch(`${base}/api/ricerche/${reservedMandate.ricercaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stato_approvazione_tl: 'Approvata', stato_ricerca: 'Ricerca Inserita', adminPassword: 'test-admin' }) });
    assert.equal(finalApproval.status, 200);
    await waitFor(() => calls.some(item => item.precontractId === 'precontract-reserve-123' && item.type === 'accepted'));
    form.set('precontractId', 'precontract-reject-123');
    form.delete('signedFile');
    const rejectedMandate = await (await ingest('test-ingest')).json();
    const unsignedDetail = await (await fetch(`${base}/api/ricerche/${rejectedMandate.ricercaId}`)).json();
    assert.equal(unsignedDetail.data.ricerca.signed_precontract_document_name, null);
    const rejectResponse = await fetch(`${base}/api/ricerche/${rejectedMandate.ricercaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stato_approvazione_tl: 'Cestinato', stato_ricerca: 'Cestinato', motivazione: 'Mandato incompleto', adminPassword: 'test-admin' }) });
    assert.equal(rejectResponse.status, 200);
    await waitFor(() => calls.some(item => item.type === 'rejected'));
    assert.equal(calls.find(item => item.type === 'rejected').reason, 'Mandato incompleto');
    console.log('PASS importazione, approvazione/riserva/rifiuto, aggiornamenti con allegato, callback, viewer protetto e report settimanale');
  } finally {
    if (child.exitCode === null && child.signalCode === null) { child.kill(); await new Promise(resolve => child.once('exit', resolve)); }
    await new Promise(resolve => callback.close(resolve));
    if (path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(dir).startsWith('ricerca-crm-test-')) fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
