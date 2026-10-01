import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import PrecontractDocument from '../components/PrecontractDocument';
import { API_BASE } from '../utils';
import './Approvazioni.css';
import CrmRequestInfo from '../components/CrmRequestInfo';

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
  const unavailableReason = r => {
    if (!['Approvata', 'Approvata con Riserva'].includes(r.stato_approvazione_tl)) return 'Non ancora approvata';
    if (['Chiuso/Assunto', 'Cestinato'].includes(r.stato_ricerca)) return 'Ricerca chiusa';
    if (r.crm_precontract_id) return 'Già collegata a Chiamate';
    if (r.precontract_document_name || r.signed_precontract_document_name) return 'Ha già documenti di precontratto';
    return '';
  };
  const otherRicerche = ricerche.filter(r => r.id !== linkSource?.id);
  const query = linkSearch.trim().toLocaleLowerCase('it-IT');
  const linkCandidates = otherRicerche.filter(r =>
    !query || `${r.id} ${r.azienda} ${r.ruolo} ${r.sede_lavoro || ''}`.toLocaleLowerCase('it-IT').includes(query)
  )
    .sort((a, b) => {
      const score = r => Number(normalize(r.azienda) === normalize(linkSource?.azienda)) * 2 + Number(normalize(r.ruolo) === normalize(linkSource?.ruolo));
      return Number(Boolean(unavailableReason(a))) - Number(Boolean(unavailableReason(b))) || score(b) - score(a) || a.azienda.localeCompare(b.azienda);
    });
  const selectedTarget = ricerche.find(r => r.id === linkTargetId && !unavailableReason(r));

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
                  <CrmRequestInfo ricerca={r} compact />
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
                      disabled={r.crm_commercial_resolution === 'CANCELLED'}
                      onClick={() => handleApprovalAction(r.id, 'Approvata')}
                    >
                      ✓ Accetta
                    </button>
                    <button 
                      className="btn btn-warning btn-sm"
                      disabled={r.crm_commercial_resolution === 'CANCELLED'}
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
                    {r.crm_precontract_id && <button type="button" disabled={r.crm_commercial_resolution === 'CANCELLED'} className="btn btn-secondary btn-sm" onClick={() => {
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
      {linkSource && <div role="presentation" className="crm-link-overlay" onClick={() => !linkBusy && setLinkSource(null)}>
        <div role="dialog" aria-modal="true" aria-labelledby="crm-link-title" className="crm-link-dialog" onClick={event => event.stopPropagation()}>
          <header className="crm-link-header">
            <div>
              <span className="crm-link-eyebrow">PRECONTRATTO DA CHIAMATE</span>
              <h3 id="crm-link-title">Collega a ricerca esistente</h3>
            </div>
            <button type="button" className="crm-link-close" aria-label="Chiudi finestra" disabled={linkBusy} onClick={() => setLinkSource(null)}>×</button>
          </header>
          <div className="crm-link-content">
            <div className="crm-link-source">
              <span>Richiesta ricevuta</span>
              <strong>{linkSource.azienda} · {linkSource.ruolo}</strong>
              <small>Codice {linkSource.id}</small>
            </div>
            <p className="crm-link-explain">Scegli la ricerca già aperta. La sua fase, i candidati e l’approvazione non cambieranno.</p>
            <div className="crm-link-search-block">
              <label htmlFor="link-search">Cerca per azienda, ruolo, sede o codice</label>
              <input id="link-search" type="search" name="crmLinkLookup" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} className="form-control" value={linkSearch} onChange={event => { setLinkSearch(event.target.value); setLinkTargetId(''); setLinkConfirmed(false); }} placeholder="Lascia vuoto per vedere tutte le ricerche" />
              <small>{query ? `${linkCandidates.length} ${linkCandidates.length === 1 ? 'ricerca trovata' : 'ricerche trovate'}` : `Tutte le ricerche: ${otherRicerche.length}`}</small>
            </div>
            <div className="crm-link-list" role="radiogroup" aria-label="Ricerca da collegare">
              {linkCandidates.map(r => {
                const reason = unavailableReason(r);
                return <label key={r.id} className={`crm-link-option${reason ? ' is-unavailable' : ''}${linkTargetId === r.id ? ' is-selected' : ''}`}>
                  <input type="radio" name="link-target" value={r.id} checked={linkTargetId === r.id} disabled={Boolean(reason)} onChange={() => { setLinkTargetId(r.id); setLinkConfirmed(false); }} />
                  <span className="crm-link-option-details">
                    <strong>{r.azienda} · {r.ruolo}</strong>
                    <small>{r.id} · {r.stato_ricerca || 'Ricerca Inserita'}{r.sede_lavoro ? ` · ${r.sede_lavoro}` : ''}</small>
                  </span>
                  {reason && <span className="crm-link-unavailable">{reason}</span>}
                </label>;
              })}
              {linkCandidates.length === 0 && <div className="crm-link-empty">{query ? 'Nessuna ricerca corrisponde a questa ricerca.' : 'Non ci sono altre ricerche da mostrare.'}</div>}
            </div>
            {selectedTarget && <div className="crm-link-comparison">
              <strong>Prima di collegare, confronta i dati</strong>
              <div><span>Da Chiamate</span><p>{linkSource.azienda} · {linkSource.ruolo}<br />Sede: {linkSource.sede_lavoro || 'non indicata'} · Risorse: {linkSource.nr_risorse || 'non indicate'}</p></div>
              <div><span>Ricerca scelta</span><p>{selectedTarget.azienda} · {selectedTarget.ruolo}<br />Sede: {selectedTarget.sede_lavoro || 'non indicata'} · Risorse: {selectedTarget.nr_risorse || 'non indicate'}</p></div>
              <small>Il PDF verrà collegato alla ricerca scelta. La richiesta provvisoria sarà registrata e tolta dall’elenco.</small>
            </div>}
            <form id="crm-link-confirm-form" onSubmit={connectExisting} autoComplete="off" className="crm-link-confirm-form">
              <label className="crm-link-check"><input type="checkbox" checked={linkConfirmed} onChange={event => setLinkConfirmed(event.target.checked)} disabled={!selectedTarget} /> Ho verificato che è la stessa ricerca.</label>
              <label htmlFor="link-password">Password autorizzativa</label>
              <input id="link-password" type="password" name="crmLinkAuthorization" className="form-control" value={linkPassword} onChange={event => setLinkPassword(event.target.value)} autoComplete="off" required />
              {linkError && <p role="alert" className="crm-link-error">{linkError}</p>}
            </form>
          </div>
          <footer className="crm-link-footer">
            <button type="button" className="btn btn-secondary" disabled={linkBusy} onClick={() => setLinkSource(null)}>Annulla</button>
            <button type="submit" form="crm-link-confirm-form" className="btn btn-primary" disabled={!selectedTarget || !linkConfirmed || !linkPassword || linkBusy}>{linkBusy ? 'Collegamento...' : 'Conferma collegamento'}</button>
          </footer>
        </div>
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
