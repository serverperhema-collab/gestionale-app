const crypto = require('node:crypto');
const { db } = require('./database');
const { verifyPassword } = require('./passwords');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
async function createSession(req, res, role, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const seconds = role === 'admin' ? 12 * 60 * 60 : 30 * 24 * 60 * 60;
  await db.run('INSERT INTO app_sessions (token_hash, role, user_id, expires_at) VALUES (?, ?, ?, ?)', [digest(token), role, userId, Date.now() + seconds * 1000]);
  if (role === 'admin') res.cookie('hema_hr_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: seconds * 1000, path: '/' });
  await db.run('DELETE FROM app_sessions WHERE expires_at < ?', [Date.now()]);
  return token;
}
async function sessionFor(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers.cookie?.match(/(?:^|;\s*)hema_hr_session=([^;]+)/)?.[1];
  if (!token || !/^[\w-]{43}$/.test(token)) return null;
  const session = await db.get('SELECT * FROM app_sessions WHERE token_hash = ? AND expires_at > ?', [digest(token), Date.now()]);
  if (!session) return null;
  if (session.role === 'admin') return session;
  const table = session.role === 'commerciale' ? 'commerciali' : 'clienti_portale';
  const user = await db.get('SELECT * FROM ' + table + ' WHERE id = ?', [session.user_id]);
  if (!user || user.stato_approvazione !== 'Approvato') return null;
  return { ...session, user };
}
function installAuth(app) {
  const loginAttempts = new Map();
  app.use(['/api/auth/login', '/api/commerciali/login', '/api/clienti/login'], (req, res, next) => {
    const now = Date.now();
    for (const [ip, record] of loginAttempts) if (record.until < now) loginAttempts.delete(ip);
    const record = loginAttempts.get(req.ip) || { count: 0, until: now + 10 * 60 * 1000 };
    record.count++;
    loginAttempts.set(req.ip, record);
    if (record.count > 30) return res.status(429).json({ success: false, error: 'Troppi tentativi. Riprova tra qualche minuto.' });
    next();
  });
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const password = process.env.HR_LOGIN_PASSWORD;
      if (!password) return res.status(503).json({ success: false, error: 'Accesso interno non configurato sul server' });
      if (!await verifyPassword(req.body.password, password)) return res.status(401).json({ success: false, error: 'Password errata' });
      const token = await createSession(req, res, 'admin', 'hr');
      res.setHeader('Cache-Control', 'no-store');
      res.json({ success: true, token });
    } catch (error) { next(error); }
  });
  app.get('/api/auth/session', async (req, res, next) => {
    try { const session = await sessionFor(req); res.status(session ? 200 : 401).json({ success: !!session, role: session?.role }); }
    catch (error) { next(error); }
  });
  app.post('/api/auth/logout', async (req, res, next) => {
    try {
      const session = await sessionFor(req);
      if (session) await db.run('DELETE FROM app_sessions WHERE token_hash = ?', [session.token_hash]);
      res.clearCookie('hema_hr_session', { path: '/' });
      res.json({ success: true });
    } catch (error) { next(error); }
  });
  const publicRoutes = new Set(['/commerciali/login', '/commerciali/registra', '/clienti/login', '/clienti/registra']);
  app.use('/api', async (req, res, next) => {
    try {
      if (publicRoutes.has(req.path) && req.method === 'POST') return next();
      if (req.path.startsWith('/integrations/')) return next();
      if (req.method === 'POST' && /^\/ricerche\/[^/]+\/(precontract-document|signed-precontract-document|reserve-updates\/[^/]+\/file)\/open$/.test(req.path)) return next();
      if (req.path === '/operatori' && req.method === 'GET') return next();
      const session = await sessionFor(req);
      if (!session) return res.status(401).json({ success: false, code: 'SESSION_REQUIRED', error: 'Accedi per continuare' });
      req.auth = session;
      res.setHeader('Cache-Control', 'no-store');
      if (session.role === 'admin') return next();
      const user = session.user;
      if (session.role === 'commerciale') {
        const fullName = user.nome + ' ' + user.cognome;
        if (req.method === 'GET' && req.path === '/commerciali/ricerche') { req.query.nome = fullName; return next(); }
        if (req.method === 'POST' && req.path === '/ricerche') {
          req.body.consulente_commerciale = fullName;
          req.body.da_approvare = true;
          return next();
        }
        const timeline = req.path.match(/^\/timeline\/([^/]+)$/);
        if (req.method === 'GET' && timeline) {
          const research = await db.get('SELECT consulente_commerciale FROM ricerche WHERE id = ?', [timeline[1]]);
          if (research?.consulente_commerciale === fullName) return next();
        }
      }
      if (session.role === 'cliente') {
        if (req.method === 'GET' && ['/clienti/portale/ricerche', '/clienti/portale/sedi'].includes(req.path)) {
          req.query.piva = user.piva || '';
          req.query.azienda = user.nome_locale;
          return next();
        }
        if (req.method === 'POST' && req.path === '/clienti/portale/ricerche') {
          req.body.azienda = user.nome_locale;
          req.body.piva = user.piva || '';
          return next();
        }
      }
      res.status(403).json({ success: false, error: 'Non autorizzato per questa operazione' });
    } catch (error) { next(error); }
  });
}
module.exports = { installAuth, createSession, sessionFor };
