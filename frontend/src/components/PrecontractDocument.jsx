import React, { useState } from 'react';
import { API_BASE } from '../utils';

export default function PrecontractDocument({ ricercaId, filename }) {
  const [expanded, setExpanded] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!filename) return null;

  const download = async (event) => {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/ricerche/${encodeURIComponent(ricercaId)}/precontract-document/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Impossibile aprire il PDF');
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setPassword('');
      setExpanded(false);
    } catch (cause) {
      setError(cause.message || 'Impossibile aprire il PDF');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: 10, padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
      <strong>📄 Scheda precontratto</strong>
      <div style={{ fontSize: 12, overflowWrap: 'anywhere' }}>{filename}</div>
      {!expanded ? (
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={() => setExpanded(true)}>Scarica PDF</button>
      ) : (
        <form onSubmit={download} style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <input type="password" autoComplete="current-password" aria-label="Password per scaricare la scheda precontratto" placeholder="Password di accesso" value={password} onChange={event => setPassword(event.target.value)} required />
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Apertura…' : 'Scarica'}</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setExpanded(false); setPassword(''); setError(''); }}>Annulla</button>
        </form>
      )}
      {error && <p role="alert" style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
    </div>
  );
}
