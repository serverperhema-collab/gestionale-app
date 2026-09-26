import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import PrecontractDocument from '../components/PrecontractDocument';

const PASSWORD_STORAGE_KEY = 'ricerca_document_password';

function readSavedPassword() {
  try {
    return window.localStorage.getItem(PASSWORD_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export default function Approvazioni({ handleApprovalAction }) {
  const { ricerche = [] } = useGlobalState() || {};
  const [savedPassword, setSavedPassword] = useState(readSavedPassword);
  const [passwordInput, setPasswordInput] = useState('');
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [copied, setCopied] = useState(false);

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
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprovalAction(r.id, 'Approvata')}
                    >
                      ✓ Accetta
                    </button>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => handleApprovalAction(r.id, 'Approvata con Riserva')}
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
    </div>
  );
}
