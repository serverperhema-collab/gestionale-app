import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import PrecontractDocument from '../components/PrecontractDocument';
import { API_BASE } from '../utils';

const PASSWORD_STORAGE_KEY = 'ricerca_document_password';

function readSavedPassword() {
  try {
    return window.localStorage.getItem(PASSWORD_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export default function Approvazioni({ handleApprovalAction }) {
  const { ricerche = [], fetchRicerche } = useGlobalState() || {};
  const [savedPassword, setSavedPassword] = useState(readSavedPassword);
  const [passwordInput, setPasswordInput] = useState('');
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [copied, setCopied] = useState(false);
  const [reserveMandateId, setReserveMandateId] = useState(null);
  const [reserveNote, setReserveNote] = useState('');
  const [reserveBusy, setReserveBusy] = useState(false);
  const [linkSource, setLinkSource] = useState(null);
  const [linkTargetId, setLinkTargetId] = useState('');
  const [linkSearch, setLinkSearch] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkConfirmed, setLinkConfirmed] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState('');

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const linkCandidates = ricerche.filter(r => r.id !== linkSource?.id &&
    ['Approvata', 'Approvata con Riserva'].includes(r.stato_approvazione_tl) &&
    !['Chiuso/Assunto', 'Cestinato'].includes(r.stato_ricerca) && !r.crm_precontract_id &&
    !r.precontract_document_name && !r.signed_precontract_document_name
  ).filter(r => `${r.id} ${r.azienda} ${r.ruolo} ${r.sede_lavoro || ''}`.toLowerCase().includes(linkSearch.toLowerCase()))
    .sort((a, b) => {
      const score = r => Number(normalize(r.azienda) === normalize(linkSource?.azienda)) * 2 + Number(normalize(r.ruolo) === normalize(linkSource?.ruolo));
      return score(b) - score(a) || a.azienda.localeCompare(b.azienda);
    });
  const selectedTarget = ricerche.find(r => r.id === linkTargetId);

  const connectExisting = async event => {
    event.preventDefault();
    if (!linkSource || !selectedTarget || !linkConfirmed || linkBusy) return;
    setLinkBusy(true);
    setLinkError('');
    try {
      const response = await fetch(`${API_BASE}/ricerche/${encodeURIComponent(linkSource.id)}/collega-precontratto`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: selectedTarget.id, adminPassword: linkPassword, confirm: true })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Collegamento non riuscito');
      await fetchRicerche();
      setLinkSource(null);
      setLinkPassword('');
      setLinkConfirmed(false);
    } catch (error) { setLinkError(error.message || 'Collegamento non riuscito'); }
    finally { setLinkBusy(false); }
  };

  const savePassword = event => {
    event.preventDefault();
    const value = passwordInput.trim();
    if (!value) return;
    try {
      window.localStorage.setItem(PASSWORD_STORAGE_KEY, value);
      setSavedPassword(value);
      setPasswordInput('');
      setEditingPassword(false);
      setPasswordError('');
    } catch {
      setPasswordError('Il browser non permette di salvare la password.');
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(savedPassword);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setPasswordError('Impossibile copiare la password.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Mandati in attesa di Approvazione</h2>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
          {savedPassword && !editingPassword ? <>
            <code style={{ overflowWrap: 'anywhere' }}>{savedPassword}</code>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copyPassword} aria-label="Copia password" title="Copia password">{copied ? '✓' : '⧉'}</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setPasswordInput(savedPassword); setEditingPassword(true); setPasswordError(''); }}>Modifica</button>
          </> : <form onSubmit={savePassword} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <input type="password" value={passwordInput} onChange={event => setPasswordInput(event.target.value)} placeholder="Password PDF" aria-label="Password da ricordare in questo browser" autoComplete="off" required />
            <button type="submit" className="btn btn-secondary btn-sm">Salva</button>
            {editingPassword && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingPassword(false); setPasswordInput(''); setPasswordError(''); }}>Annulla</button>}
          </form>}
          {passwordError && <span role="alert" style={{ color: 'var(--danger)', fontSize: 12 }}>{passwordError}</span>}
        </div>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Commerciale</th>
              <th>Locale / Azienda</th>
              <th>Ruolo Richiesto</th>
              <th>Sede Lavoro</th>
              <th>Accordi / Dettagli</th>
              <th style={{ textAlign: 'center' }}>Azioni Decisioni</th>
            </tr>
          </thead>
          <tbody>
            {ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').map(r => (
              <tr key={r.id}>
                <td>{r.data_inserimento}</td>
                <td><strong>{r.consulente_commerciale || 'Operativo'}</strong></td>
                <td>
                  <strong>{r.azienda}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PIVA: {r.piva} <br/> Ref: {r.referente} ({r.telefono_mobile})</div>
                </td>
                <td>
                  <strong>{r.ruolo}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Risorse: {r.nr_risorse} <br/> CCNL: {r.ccnl_livello || 'N/D'} <br/> Retr: {r.retribuzione || 'N/D'}</div>
                </td>
                <td>{r.sede_lavoro}</td>
                <td style={{ fontSize: '12px', maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  <strong>Comp:</strong> {r.competenze_tecniche || 'N/D'} <br/>
                  <strong>Note:</strong> {r.note || 'Nessuna nota'}
                  <PrecontractDocument ricercaId={r.id} filename={r.precontract_document_name} />
                  <PrecontractDocument ricercaId={r.id} filename={r.signed_precontract_document_name} kind="signed" />
                </td>
                <td>
                  {r.crm_precontract_id && ricerche.some(candidate => candidate.id !== r.id && !candidate.crm_precontract_id && ['Approvata', 'Approvata con Riserva'].includes(candidate.stato_approvazione_tl) && normalize(candidate.azienda) === normalize(r.azienda) && normalize(candidate.ruolo) === normalize(r.ruolo)) &&
                    <div style={{ color: 'var(--warning)', fontWeight: 700, marginBottom: 8 }}>⚠️ Esiste già una ricerca simile: controlla se puoi collegarla.</div>}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprovalAction(r.id, 'Approvata')}
                    >
                      ✓ Accetta
                    </button>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => { setReserveMandateId(r.id); setReserveNote(''); }}
                      style={{ backgroundColor: 'var(--warning)', color: '#000' }}
                    >
                      Approva con Riserva
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleApprovalAction(r.id, 'Cestinato')}
                    >
                      🗑️ Cestina
                    </button>
                    {r.crm_precontract_id && <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                      setLinkSource(r); setLinkTargetId(''); setLinkSearch(''); setLinkPassword(''); setLinkConfirmed(false); setLinkError('');
                    }}>Collega a ricerca esistente</button>}
                  </div>
                </td>
              </tr>
            ))}
            {ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun mandato in attesa di approvazione.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {linkSource && <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => !linkBusy && setLinkSource(null)}>
        <form role="dialog" aria-modal="true" aria-label="Collega a ricerca esistente" onClick={event => event.stopPropagation()} onSubmit={connectExisting} style={{ width: 'min(100%, 700px)', maxHeight: '90vh', overflow: 'auto', background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3>Collega a ricerca esistente</h3>
          <p>La richiesta di Chiamate riguarda <strong>{linkSource.azienda}</strong> — {linkSource.ruolo} ({linkSource.id}). Scegli la ricerca già avviata. La sua fase, i candidati e l’approvazione non cambieranno.</p>
          <label htmlFor="link-search">Cerca per azienda, ruolo o codice</label>
          <input id="link-search" className="form-control" value={linkSearch} onChange={event => { setLinkSearch(event.target.value); setLinkTargetId(''); setLinkConfirmed(false); }} placeholder="Cerca una ricerca attiva" autoFocus />
          <div style={{ maxHeight: 230, overflow: 'auto', margin: '12px 0' }}>
            {linkCandidates.map(r => <label key={r.id} style={{ display: 'block', padding: 10, border: '1px solid var(--border)', borderRadius: 8, marginBottom: 6, cursor: 'pointer' }}>
              <input type="radio" name="link-target" value={r.id} checked={linkTargetId === r.id} onChange={() => { setLinkTargetId(r.id); setLinkConfirmed(false); }} style={{ marginRight: 10 }} />
              <strong>{r.azienda}</strong> — {r.ruolo} · {r.id} · {r.stato_ricerca || 'Ricerca Inserita'}
            </label>)}
            {linkCandidates.length === 0 && <p>Nessuna ricerca collegabile. Quelle con un altro precontratto o documento già presente richiedono una verifica separata.</p>}
          </div>
          {selectedTarget && <div style={{ margin: '12px 0', padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
            <strong>Controlla prima di confermare</strong>
            <p>Da Chiamate: {linkSource.azienda} — {linkSource.ruolo}; sede: {linkSource.sede_lavoro || 'non indicata'}; risorse: {linkSource.nr_risorse || 'non indicate'}.</p>
            <p>Ricerca scelta: {selectedTarget.azienda} — {selectedTarget.ruolo}; sede: {selectedTarget.sede_lavoro || 'non indicata'}; risorse: {selectedTarget.nr_risorse || 'non indicate'}.</p>
            <p>Il PDF ricevuto da Chiamate sarà collegato alla ricerca scelta. La richiesta provvisoria sarà registrata e rimossa dall’elenco.</p>
          </div>}
          <label style={{ display: 'block', marginBottom: 12 }}><input type="checkbox" checked={linkConfirmed} onChange={event => setLinkConfirmed(event.target.checked)} disabled={!selectedTarget} /> Ho verificato che è la stessa ricerca.</label>
          <label htmlFor="link-password">Password autorizzativa</label>
          <input id="link-password" type="password" className="form-control" value={linkPassword} onChange={event => setLinkPassword(event.target.value)} autoComplete="off" required />
          {linkError && <p role="alert" style={{ color: 'var(--danger)' }}>{linkError}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" disabled={linkBusy} onClick={() => setLinkSource(null)}>Annulla</button>
            <button type="submit" className="btn btn-primary" disabled={!selectedTarget || !linkConfirmed || !linkPassword || linkBusy}>{linkBusy ? 'Collegamento...' : 'Conferma collegamento'}</button>
          </div>
        </form>
      </div>}
      {reserveMandateId && <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.75)', display: 'grid', placeItems: 'center', padding: 16 }} onClick={() => setReserveMandateId(null)}>
        <form role="dialog" aria-modal="true" aria-label="Approvazione con riserva" onClick={event => event.stopPropagation()} onSubmit={async event => { event.preventDefault(); if (!reserveNote.trim() || reserveBusy) return; setReserveBusy(true); try { if (await handleApprovalAction(reserveMandateId, 'Approvata con Riserva', reserveNote.trim())) setReserveMandateId(null); } finally { setReserveBusy(false); } }} style={{ width: 'min(100%, 560px)', background: 'var(--card-bg, #1f2937)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3>Approva con riserva</h3><p>Scrivi la nota che sarà inviata al gestionale chiamate.</p>
          <textarea autoFocus required maxLength={10000} rows={6} value={reserveNote} onChange={event => setReserveNote(event.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><button type="button" className="btn btn-secondary" onClick={() => setReserveMandateId(null)} disabled={reserveBusy}>Annulla</button><button type="submit" className="btn btn-warning" disabled={!reserveNote.trim() || reserveBusy}>{reserveBusy ? 'Salvataggio…' : 'Conferma riserva'}</button></div>
        </form>
      </div>}
    </div>
  );
}
