const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const isHashed = value => typeof value === 'string' && value.startsWith('scrypt:');
async function hashPassword(password) {
  if (typeof password !== 'string' || !password || password.length > 1024) throw new Error('Password non valida');
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return ['scrypt', salt, key.toString('hex')].join(':');
}
async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 1024 || typeof stored !== 'string') return false;
  if (!isHashed(stored)) {
    return crypto.timingSafeEqual(crypto.createHash('sha256').update(password).digest(), crypto.createHash('sha256').update(stored).digest());
  }
  const [, salt, hex] = stored.split(':');
  if (!/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(hex || '')) return false;
  const key = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(key, Buffer.from(hex, 'hex'));
}
module.exports = { hashPassword, verifyPassword, isHashed };
