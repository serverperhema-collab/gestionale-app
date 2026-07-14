import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { API_BASE } from '../utils';
import { useToast } from '../contexts/ToastContext';

export default function Clienti({ setSelectedSubjectLog }) {
  const { clienti = [], fetchClienti } = useGlobalState() || {};
  const { showStatus } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentClient, setCurrentClient] = useState({});
  const [editWorkplaces, setEditWorkplaces] = useState(['']);

  const handleOpenEdit = (cl) => {
    setCurrentClient({ ...cl });
    const sedi = cl.sede_lavoro ? cl.sede_lavoro.split(' | ') : [''];
    setEditWorkplaces(sedi);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const filteredSedi = editWorkplaces.filter(w => w.trim() !== '');
    const sede_lavoro = filteredSedi.join(' | ');
    const updatedClient = { ...currentClient, sede_lavoro };
    try {
      showStatus('loading', 'Salvataggio modifiche...');
      const res = await fetch(`${API_BASE}/clienti/${updatedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Cliente modificato', 'Dati cliente aggiornati con successo.');
        setShowEditModal(false);
        fetchClienti();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore di rete', err.message);
    }
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE il cliente "${nome}"? Questa azione non puo essere annullata.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/clienti/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Cliente eliminato', 'Cliente eliminato con successo');
        fetchClienti();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (e) {
      showStatus('error', 'Errore di rete', e.message);
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nome Locale</th>
            <th>P.IVA</th>
            <th>Sede Legale/Lavoro</th>
            <th>Referente</th>
            <th>Telefono / Email</th>
            <th>Data Registrazione</th>
            <th style={{ textAlign: 'center' }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {clienti.map(cl => (
            <tr key={cl.id}>
              <td><strong>{cl.nome_locale}</strong></td>
              <td><code>{cl.piva}</code></td>
              <td style={{ fontSize: '13px' }}>
                <strong>Legale:</strong> {cl.sede_legale || 'N/D'} <br/> 
                <strong>Lavoro:</strong>
                {cl.sede_lavoro ? (
                  <div style={{ paddingLeft: '8px', marginTop: '2px', color: 'var(--text-secondary)' }}>
                    {cl.sede_lavoro.split(' | ').map((s, idx) => (
                      <div key={idx} style={{ marginBottom: '2px' }}>• {s}</div>
                    ))}
                  </div>
                ) : ' N/D'}
              </td>
              <td>{cl.referente}</td>
              <td>{cl.telefono_mobile} <br/> {cl.email}</td>
              <td>{cl.data_inserimento}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSubjectLog({ type: 'CLIENTE', id: cl.id, name: cl.nome_locale })}>
                    📜 Log Attività
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(cl)}>
                    ✏️ Modifica
                  </button>
                  <button className="btn btn-sm" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={() => handleDelete(cl.id, cl.nome_locale)}>
                    🗑️ Elimina
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {clienti.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun cliente in anagrafica.</td>
            </tr>
          )}
        </tbody>
      </table>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>✏️ Modifica Cliente</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label>Nome Locale / Ragione Sociale *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={currentClient.nome_locale || ''} 
                    onChange={e => setCurrentClient({...currentClient, nome_locale: e.target.value})} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Partita IVA</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={currentClient.piva || ''} 
                      onChange={e => setCurrentClient({...currentClient, piva: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Referente</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={currentClient.referente || ''} 
                      onChange={e => setCurrentClient({...currentClient, referente: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Sede Legale</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={currentClient.sede_legale || ''} 
                      onChange={e => setCurrentClient({...currentClient, sede_legale: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Sedi Operative / Lavoro</label>
                  {editWorkplaces.map((w, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={w} 
                        placeholder={`Sede ${index + 1}`}
                        onChange={e => {
                          const newSedi = [...editWorkplaces];
                          newSedi[index] = e.target.value;
                          setEditWorkplaces(newSedi);
                        }} 
                      />
                      {editWorkplaces.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => {
                            const newSedi = editWorkplaces.filter((_, i) => i !== index);
                            setEditWorkplaces(newSedi);
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => setEditWorkplaces([...editWorkplaces, ''])}
                    style={{ marginTop: '4px' }}
                  >
                    ➕ Aggiungi Sede
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={currentClient.email || ''} 
                      onChange={e => setCurrentClient({...currentClient, email: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Cellulare</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={currentClient.telefono_mobile || ''} 
                      onChange={e => setCurrentClient({...currentClient, telefono_mobile: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Telefono Fisso</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={currentClient.telefono_fisso || ''} 
                      onChange={e => setCurrentClient({...currentClient, telefono_fisso: e.target.value})} 
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Salva Modifiche</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
