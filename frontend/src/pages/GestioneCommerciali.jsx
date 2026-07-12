import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { useToast } from '../contexts/ToastContext';
import { API_BASE } from '../utils';

const formatDateSafe = (dateString) => {
  if (!dateString) return 'N/D';
  if (dateString.length === 10 && dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  const parsed = Date.parse(dateString);
  if (isNaN(parsed)) return dateString;
  return new Date(parsed).toLocaleDateString('it-IT');
};

export default function GestioneCommerciali() {
  const { commerciali, fetchCommerciali, operatori, fetchOperatori } = useGlobalState();
  const { showStatus } = useToast();
  const [showCommercialeLinkModal, setShowCommercialeLinkModal] = useState(false);

  const handleCommercialStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/commerciali/${id}/stato`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato_approvazione: status })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Stato Aggiornato!', `Il commerciale è stato impostato come ${status}.`);
        fetchCommerciali();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore di connessione', err.message);
    }
  };

  const handleDeleteCommercial = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo profilo commerciale?")) return;
    try {
      const res = await fetch(`${API_BASE}/commerciali/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Eliminato!', 'Profilo commerciale rimosso.');
        fetchCommerciali();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore di connessione', err.message);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Richieste e Profili Commerciali</h2>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '14px', marginBottom: '4px', fontWeight: 700 }}>Link Accesso Commerciali</h3>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {window.location.port && window.location.port !== '3001' ? `http://${window.location.hostname}:3001/commerciale` : window.location.origin + '/commerciale'}
          </div>
        </div>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => {
            const link = window.location.port && window.location.port !== '3001' ? `http://${window.location.hostname}:3001/commerciale` : window.location.origin + '/commerciale';
            navigator.clipboard.writeText(link);
            showStatus('success', 'Copiato', 'Link copiato negli appunti');
          }}
        >
          Copia Link
        </button>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowCommercialeLinkModal(true)}
          style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
        >
          Invia Link su WhatsApp
        </button>
      </div>

      {/* Form per aggiungere un commerciale */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 700 }}>➕ Crea Nuovo Profilo Commerciale</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          try {
            const res = await fetch(`${API_BASE}/commerciali`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...data, stato_approvazione: 'Approvato' })
            });
            const json = await res.json();
            if (json.success) {
              showStatus('success', 'Commerciale Creato!', 'Il profilo del commerciale è stato creato e approvato.');
              fetchCommerciali();
              e.target.reset();
            } else {
              showStatus('error', 'Errore', json.error);
            }
          } catch (err) {
            showStatus('error', 'Errore di connessione', err.message);
          }
        }} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          backgroundColor: 'var(--bg-secondary)',
          padding: '16px 20px',
          border: '1px solid var(--border)',
          borderRadius: '10px'
        }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Nome *</label>
            <input type="text" name="nome" className="form-control" required placeholder="Es: Mario" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Cognome *</label>
            <input type="text" name="cognome" className="form-control" required placeholder="Es: Rossi" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Email *</label>
            <input type="email" name="email" className="form-control" required placeholder="Es: commerciale@gmail.com" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Telefono</label>
            <input type="text" name="telefono" className="form-control" placeholder="Es: 3331234567" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Data di Nascita</label>
            <input type="date" name="data_nascita" className="form-control" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Password di Accesso *</label>
            <input type="text" name="password" className="form-control" required placeholder="Scegli password" />
          </div>
          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>
              💾 Salva e Approva Commerciale
            </button>
          </div>
        </form>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nominativo</th>
              <th>Email / Telefono</th>
              <th>Data Nascita</th>
              <th>Password</th>
              <th>Data Registrazione</th>
              <th>Stato</th>
              <th style={{ textAlign: 'center' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {commerciali.map(c => (
              <tr key={c.id}>
                <td><strong>{c.cognome} {c.nome}</strong></td>
                <td>{c.email} <br/> {c.telefono || 'N/D'}</td>
                <td>{formatDateSafe(c.data_nascita)}</td>
                <td><code>{c.password}</code></td>
                <td>{formatDateSafe(c.data_registrazione)}</td>
                <td>
                  <span className={`badge ${
                    c.stato_approvazione === 'Approvato' ? 'badge-success'
                    : c.stato_approvazione === 'Da Approvare' ? 'badge-warning'
                    : 'badge-danger'
                  }`}>
                    {c.stato_approvazione}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {c.stato_approvazione === 'Da Approvare' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleCommercialStatus(c.id, 'Approvato')}>
                          ✓ Approva
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCommercialStatus(c.id, 'Rifiutato')}>
                          ✕ Rifiuta
                        </button>
                      </>
                    )}
                    {c.stato_approvazione !== 'Da Approvare' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleCommercialStatus(c.id, 'Da Approvare')}>
                        Rimetti in Attesa
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" style={{ backgroundColor: '#EF4444' }} onClick={() => handleDeleteCommercial(c.id)}>
                      Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {commerciali.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun commerciale registrato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gestione Operatori (Outbound) */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Gestione Operatori (Outbound)</h2>
        
        {/* Form per aggiungere un operatore */}
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          try {
            const res = await fetch(`${API_BASE}/operatori`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const json = await res.json();
            if (json.success) {
              showStatus('success', 'Operatore Aggiunto!', 'Nuovo operatore inserito con successo.');
              fetchOperatori();
              e.target.reset();
            } else {
              showStatus('error', 'Errore', json.error);
            }
          } catch (err) {
            showStatus('error', 'Errore di connessione', err.message);
          }
        }} style={{
          display: 'flex',
          gap: '16px',
          backgroundColor: 'var(--bg-card)',
          padding: '16px',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          marginBottom: '20px',
          alignItems: 'flex-end'
        }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label>Nome *</label>
            <input type="text" name="nome" className="form-control" required placeholder="Es: Giulia" />
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label>Cognome *</label>
            <input type="text" name="cognome" className="form-control" required placeholder="Es: Bianchi" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 20px' }}>
            ➕ Aggiungi Operatore
          </button>
        </form>

        {/* Tabella degli operatori */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome Operatore</th>
                <th>Stato</th>
                <th style={{ textAlign: 'center', width: '150px' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {operatori.map(op => (
                <tr key={op.id}>
                  <td><strong>{op.cognome} {op.nome}</strong></td>
                  <td>
                    <span className="badge badge-success">Attivo</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button className="btn btn-danger btn-sm" style={{ backgroundColor: '#EF4444' }} onClick={async () => {
                        if (window.confirm(`Sei sicuro di voler eliminare l'operatore ${op.nome} ${op.cognome}?`)) {
                          try {
                            const res = await fetch(`${API_BASE}/operatori/${op.id}`, { method: 'DELETE' });
                            const json = await res.json();
                            if (json.success) {
                              showStatus('success', 'Operatore Eliminato', 'L\'operatore è stato rimosso.');
                              fetchOperatori();
                            } else {
                              showStatus('error', 'Errore', json.error);
                            }
                          } catch (err) {
                            showStatus('error', 'Connessione fallita', err.message);
                          }
                        }
                      }}>
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {operatori.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun operatore inserito.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCommercialeLinkModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Invia Link a Commerciale</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCommercialeLinkModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Seleziona un commerciale a cui inviare il link di accesso su WhatsApp. Verranno mostrati solo i commerciali con un numero di telefono salvato.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {commerciali.filter(c => c.telefono).length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    Nessun commerciale con numero di telefono salvato.
                  </div>
                ) : (
                  commerciali.filter(c => c.telefono).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.nome} {c.cognome}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.telefono}</div>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#25D366', color: 'white', border: 'none' }}
                        onClick={() => {
                          const phone = c.telefono.replace(/\D/g, '');
                          const url = window.location.port && window.location.port !== '3001' ? `http://${window.location.hostname}:3001/commerciale` : window.location.origin + '/commerciale';
                          const msg = encodeURIComponent(`Ciao ${c.nome}, ecco il link per accedere all'Area Commerciali del gestionale:\n${url}`);
                          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                          setShowCommercialeLinkModal(false);
                        }}
                      >
                        Invia su WhatsApp
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCommercialeLinkModal(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
