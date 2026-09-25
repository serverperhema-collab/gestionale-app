import React, { useState } from 'react';
import { API_BASE } from '../utils';

export default function WeeklyCrmReport({ ricerca, onSaved }) {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!ricerca.crm_precontract_id || !ricerca.crm_accepted_at) return null;
  const now = new Date();
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (now.getUTCDay() + 6) % 7)).toISOString().slice(0, 10);
  const alreadySent = ricerca.crm_last_report_week === monday;
  const submit = async event => {
    event.preventDefault();
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`${API_BASE}/ricerche/${encodeURIComponent(ricerca.id)}/weekly-report`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, adminPassword: password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Invio non riuscito');
      setText(''); setPassword(''); setMessage('Report salvato e messo in invio al gestionale chiamate.');
      onSaved?.(ricerca.id);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  };
  return <section style={{ margin: '16px 0', padding: 16, border: '1px solid var(--border)', borderRadius: 8 }}>
    <h3>Report settimanale al gestionale chiamate</h3>
    <p>{alreadySent ? 'Report di questa settimana già inviato.' : `Report della settimana del ${monday} da compilare.`}</p>
    {!alreadySent && <form onSubmit={submit}>
      <textarea className="form-control" value={text} onChange={event => setText(event.target.value)} maxLength={10000} required placeholder="Stato ricerca, colloqui, candidati e prossimi passi" />
      <input className="form-control" type="password" value={password} onChange={event => setPassword(event.target.value)} required placeholder="Password autorizzativa" autoComplete="current-password" />
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Invio…' : 'Salva e invia report'}</button>
    </form>}
    {message && <p role="status">{message}</p>}
  </section>;
}
