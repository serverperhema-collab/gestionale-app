const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const projectRoot = path.resolve(__dirname, '..');
const testRoot = path.join(projectRoot, '.checkup');
fs.mkdirSync(testRoot, { recursive: true });
const dataDir = fs.mkdtempSync(path.join(testRoot, 'unified-hosting-'));
const results = [];
(async () => {
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const base = 'http://127.0.0.1:' + port;
  const child = spawn(process.execPath, ['backend/server.js'], {
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), DATA_DIR: dataDir,
      REQUIRE_FRONTEND_BUILD: 'true', HR_LOGIN_PASSWORD: 'unified-test-only',
      FRONTEND_ORIGINS: '', HR_DOCUMENT_PASSWORD: 'unified-doc-test-only',
      CALLS_CRM_CALLBACK_URL: '', CALLS_CRM_CALLBACK_TOKEN: '', PRECONTRACT_INGEST_TOKEN: 'unified-crm-test-only' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  const check = async (name, action) => { await action(); results.push({ name, result: 'PASS' }); console.log('PASS ' + name); };
  try {
    const deadline = Date.now() + 15000;
    while (!output.includes('Server Express attivo') && child.exitCode === null && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 30));
    assert.match(output, /Server Express attivo/, output);
    let html;
    await check('Un solo server restituisce login e percorsi React diretti', async () => {
      for (const route of ['/', '/dashboard', '/ricerche', '/ricerche/', '/clienti', '/commerciali_gestione', '/email_config', '/aggiornamenti', '/aggiornamenti/']) {
        const response = await fetch(base + route);
        assert.equal(response.status, 200, route);
        assert.match(response.headers.get('content-type'), /text\/html/);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        html = await response.text(); assert.match(html, /id="root"/);
      }
    });
    await check('Asset compilati, immagini e icone raggiungibili senza Vercel', async () => {
      const assetPaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)].map(match => match[1]);
      assert.ok(assetPaths.some(asset => asset.endsWith('.js')));
      for (const asset of [...assetPaths, '/favicon.svg', '/icons.svg', '/sfondo_login.jpg']) {
        const response = await fetch(base + asset); assert.equal(response.status, 200, asset);
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        if (asset.endsWith('.js')) {
          const bundle = await response.text();
          assert.ok(!bundle.includes('gestionale-app-opal.vercel.app'));
          assert.ok(!bundle.includes('http://localhost:3002/api'));
        }
      }
    });
    await check('Portali cliente e commerciale originali e autenticazione server', async () => {
      for (const role of ['cliente', 'commerciale']) {
        const response = await fetch(base + '/' + role); assert.equal(response.status, 200);
        const portal = await response.text(); assert.match(portal, /portal-auth\.js/);
        assert.ok(!portal.includes('id="root"'));
      }
      assert.equal((await fetch(base + '/portal-auth.js')).status, 200);
      assert.equal((await fetch(base + '/api/ricerche')).status, 401);
    });
    let token;
    await check('Login e API funzionano sulla stessa origine in produzione', async () => {
      const response = await fetch(base + '/api/auth/login', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'unified-test-only' }) });
      assert.equal(response.status, 200); token = (await response.json()).token;
      assert.match(response.headers.get('set-cookie'), /HttpOnly/);
      assert.match(response.headers.get('set-cookie'), /Secure/);
      assert.equal((await fetch(base + '/api/ricerche', { headers: { Authorization: 'Bearer ' + token } })).status, 200);
      assert.equal((await fetch(base + '/healthz')).status, 200);
      assert.equal((await fetch(base + '/api/auth/login', { method: 'POST', headers: { Origin: 'https://foreign.invalid', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
    });
    await check('API e allegati mancanti non restituiscono la pagina React', async () => {
      const api = await fetch(base + '/api/non-esiste', { headers: { Authorization: 'Bearer ' + token } });
      assert.equal(api.status, 404); assert.match(api.headers.get('content-type'), /application\/json/);
      for (const route of ['/assets/non-esiste.js', '/server.js', '/database.db', '/private/non-esiste', '/uploads/cv/non-esiste.pdf']) {
        const response = await fetch(base + route, { headers: { Authorization: 'Bearer ' + token } });
        assert.equal(response.status, 404, route);
        assert.ok(!(await response.text()).includes('id="root"'));
      }
    });
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const stopped = new Promise(resolve => child.once('exit', resolve)); child.kill(); await stopped;
    }
    fs.writeFileSync(path.join(testRoot, 'unified-hosting-results.json'), JSON.stringify(results, null, 2));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
