import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { API_BASE } from '../utils';
import { useDialogs } from '../contexts/DialogContext';

export default function Riserva({ handleApprovalAction }) {
  const { askText } = useDialogs();
  const { ricerche = [] } = useGlobalState() || {};
  const [updatesMandate, setUpdatesMandate] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [updatesError, setUpdatesError] = useState('');
  const openUpdates = async mandate => {
    setUpdatesMandate(mandate); setUpdates([]); setUpdatesError('');
    try {
      const response = await fetch(`${API_BASE}/ricerche/${encodeURIComponent(mandate.id)}/reserve-updates`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Caricamento non riuscito');
      setUpdates(data.data || []);
    } catch (error) { setUpdatesError(error.message); }
  };
  const download = async update => {
    const password = window.localStorage.getItem('ricerca_document_password') || await askText('Password per aprire l’allegato:');
    if (!password) return;
    try {
      const response = await fetch(`${API_BASE}/ricerche/${encodeURIComponent(updatesMandate.id)}/reserve-updates/${encodeURIComponent(update.id)}/file/open`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Download non riuscito');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = update.original_name; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) { setUpdatesError(error.message); }
  };

  return (
    <div>
      <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Mandati Approvati con Riserva</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Commerciale</th>
              <th>Locale / Azienda</th>
              <th>Ruolo Richiesto</th>
              <th>Sede Lavoro</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').map(r => (
              <tr key={r.id}>
                <td>{r.data_inserimento}</td>
                <td><strong>{r.consulente_commerciale || 'Operativo'}</strong></td>
                <td>
                  <strong>{r.azienda}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PIVA: {r.piva} <br/> Ref: {r.referente}</div>
                </td>
                <td><strong>{r.ruolo}</strong> (Risorse: {r.nr_risorse})</td>
                <td>{r.sede_lavoro}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleApprovalAction(r.id, 'Approvata')}>
                      ✓ Accetta Definitivo
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => void openUpdates(r)}>Aggiornamenti{r.crm_reserve_update_count > 0 ? ` (${r.crm_reserve_update_count})` : ''}</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleApprovalAction(r.id, 'Cestinato')}>
                      🗑️ Cestina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun mandato in riserva al momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {updatesMandate && <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setUpdatesMandate(null)}>
        <section role="dialog" aria-modal="true" aria-label="Aggiornamenti dal CRM chiamate" onClick={event => event.stopPropagation()} style={{ width: 'min(100%, 680px)', maxHeight: '90vh', overflow: 'auto', background: 'var(--card-bg, #1f2937)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Aggiornamenti · {updatesMandate.azienda}</h3><button type="button" className="btn btn-secondary btn-sm" onClick={() => setUpdatesMandate(null)}>Chiudi</button></div>
          {updatesError && <p role="alert" style={{ color: 'var(--danger)' }}>{updatesError}</p>}
          {updates.length === 0 && !updatesError && <p>Nessun aggiornamento ricevuto.</p>}
          {updates.map(update => <article key={update.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginTop: 12 }}><small>{new Date(update.created_at).toLocaleString('it-IT')}</small><p style={{ whiteSpace: 'pre-wrap' }}>{update.note}</p>{update.original_name && <button type="button" className="btn btn-secondary btn-sm" onClick={() => void download(update)}>Scarica allegato: {update.original_name}</button>}</article>)}
        </section>
      </div>}
    </div>
  );
}
