const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
let sessionToken;
const fetch = (url, options = {}) => {
  const headers = new Headers(options.headers);
  if (sessionToken && String(url).includes('/api/') && !headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + sessionToken);
  return global.fetch(url, { ...options, headers });
};

async function freePort() {
  const server = net.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

(async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ricerca-precontract-test-'));
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: String(port), DATA_DIR: dataDir, PRECONTRACT_INGEST_TOKEN: 'test-integration-token', HR_DOCUMENT_PASSWORD: 'test-document-password', HR_LOGIN_PASSWORD: 'test-login', CALLS_CRM_CALLBACK_URL: '', CALLS_CRM_CALLBACK_TOKEN: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  try {
    const deadline = Date.now() + 10_000;
    while (!output.includes('Server Express attivo') && Date.now() < deadline) {
      if (child.exitCode !== null) throw new Error(output || `Server exited: ${child.exitCode}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.match(output, /Server Express attivo/, output);
    sessionToken = (await (await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'test-login' }) })).json()).token;
    const mandateResponse = await fetch(`${base}/api/ricerche`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ azienda: 'Test PDF', ruolo: 'Ricercatore', da_approvare: true }),
    });
    assert.equal(mandateResponse.status, 200);
    const mandate = await mandateResponse.json();
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF');
    const upload = async (token, precontractId = 'precontract-test-1', file = pdf) => {
      const body = new FormData();
      body.set('precontractId', precontractId);
      body.set('file', new Blob([file], { type: 'application/pdf' }), 'Scheda precontratto.pdf');
      return fetch(`${base}/api/integrations/ricerche/${mandate.id}/precontract-document`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body,
      });
    };
    assert.equal((await upload('wrong-token')).status, 401);
    assert.equal((await upload('test-integration-token')).status, 201);
    const repeated = await upload('test-integration-token');
    assert.equal(repeated.status, 200);
    assert.equal((await repeated.json()).idempotent, true);
    assert.equal((await upload('test-integration-token', 'precontract-test-2')).status, 409);
    const list = await (await fetch(`${base}/api/ricerche`)).json();
    assert.equal(list.data.find(item => item.id === mandate.id).precontract_document_name, 'Scheda precontratto.pdf');
    const download = password => fetch(`${base}/api/ricerche/${mandate.id}/precontract-document/open`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
    });
    assert.equal((await download('wrong-password')).status, 401);
    const downloaded = await download('test-document-password');
    assert.equal(downloaded.status, 200);
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), pdf);
    assert.equal((await fetch(`${base}/private/precontracts/test.pdf`)).status, 404);
    console.log('PASS PDF privato, autorizzazioni, idempotenza e metadati mandato');
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
      await new Promise(resolve => child.once('exit', resolve));
    }
    const resolved = path.resolve(dataDir);
    if (resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('ricerca-precontract-test-')) {
      fs.rmSync(resolved, { recursive: true, force: true });
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
