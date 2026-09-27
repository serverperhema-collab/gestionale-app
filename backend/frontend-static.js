const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const frontendDir = path.resolve(__dirname, '..', 'frontend', 'dist');
const frontendIndex = path.join(frontendDir, 'index.html');
const frontendRoutes = new Set(['/', '/index.html', '/dashboard', '/ricerche', '/approvazioni', '/riserva', '/cestinati', '/pausa', '/commerciali_gestione', '/posta', '/email_config', '/candidati', '/annunci', '/clienti', '/aggiornamenti']);

function verifyFrontendBuild() {
  if (process.env.REQUIRE_FRONTEND_BUILD === 'true' && !fs.existsSync(frontendIndex)) {
    throw new Error('Build frontend mancante: eseguire node scripts/build-render.cjs dalla radice del progetto.');
  }
}

function installFrontend(app) {
  // Register after APIs and portals: their errors must never become the React login page.
  app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'Endpoint non trovato' }));
  app.get(['/favicon.svg', '/icons.svg', '/sfondo_login.jpg'], (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(path.join(frontendDir, req.path.slice(1)));
  });
  app.use('/assets', express.static(path.join(frontendDir, 'assets'), {
    index: false, immutable: true, maxAge: '1y', dotfiles: 'deny',
    setHeaders(res) { res.setHeader('X-Content-Type-Options', 'nosniff'); }
  }));
  app.use('/assets', (req, res) => res.status(404).send('Risorsa non trovata'));
  app.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method) || !frontendRoutes.has(req.path.replace(/\/$/, '') || '/')) return next();
    if (!fs.existsSync(frontendIndex)) return res.status(503).send('Interfaccia non compilata. Eseguire la build del frontend.');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.sendFile(frontendIndex);
  });
}

module.exports = { installFrontend, verifyFrontendBuild };
