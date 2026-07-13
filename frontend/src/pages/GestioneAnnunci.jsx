import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { API_BASE } from '../utils';

export default function GestioneAnnunci({ ctrl }) {
  const { annunci, fetchAnnunci } = useGlobalState();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const handleOpenNew = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleOpenEdit = (annuncio) => {
    setFormData({ ...annuncio });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      ctrl.showStatus('loading', 'Salvataggio in corso...');
      const url = formData.id ? `${API_BASE}/annunci/${formData.id}` : `${API_BASE}/annunci`;
      const method = formData.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (json.success) {
        ctrl.showStatus('success', 'Salvato', 'Annuncio salvato con successo!');
        setShowModal(false);
        fetchAnnunci();
      } else {
        ctrl.showStatus('error', 'Errore', json.error || 'Errore durante il salvataggio');
      }
    } catch (err) {
      ctrl.showStatus('error', 'Errore', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare definitivamente questo annuncio? Verrà scollegato da tutte le ricerche.")) return;
    
    try {
      ctrl.showStatus('loading', 'Eliminazione in corso...');
      const res = await fetch(`${API_BASE}/annunci/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        ctrl.showStatus('success', 'Eliminato', 'Annuncio eliminato.');
        fetchAnnunci();
      } else {
        ctrl.showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      ctrl.showStatus('error', 'Errore', err.message);
    }
  };

  return (
    <div className="page-content" style={{ padding: '20px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>📢 Bacheca Annunci</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>Gestisci gli annunci globali da agganciare alle ricerche</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenNew}>➕ Crea Nuovo Annuncio</button>
      </div>

      <div className="table-responsive">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Mansione / Zona</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Inserimento / Scadenza</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Stato</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Ricerche Collegate</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {annunci.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  <strong>{a.mansione || 'N/D'} ({a.zona || 'N/D'})</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Portali: {a.portali_annuncio || 'N/D'}</div>
                  {a.link_annuncio && (
                    <div style={{ marginTop: '4px' }}>
                      <a href={a.link_annuncio} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--primary)' }}>Apri Link ↗</a>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px', fontSize: '13px' }}>
                  Inizio: {a.data_inserimento_annuncio || 'N/D'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span className={`badge ${a.stato_annuncio === 'Chiuso' ? 'badge-secondary' : 'badge-primary'}`}>{a.stato_annuncio}</span>
                </td>
                <td style={{ padding: '12px' }}>
                  {a.ricerche_collegate ? a.ricerche_collegate.split(',').length : 0} ricerche
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(a)} style={{ marginRight: '8px' }}>Modifica</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Elimina</button>
                </td>
              </tr>
            ))}
            {annunci.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun annuncio trovato</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{formData.id ? 'Modifica Annuncio' : 'Nuovo Annuncio'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Testo Annuncio *</label>
                  <textarea className="form-control" rows="5" required value={formData.testo_annuncio || ''} onChange={e => setFormData({...formData, testo_annuncio: e.target.value})}></textarea>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Mansione *</label>
                    <input type="text" className="form-control" required value={formData.mansione || ''} onChange={e => setFormData({...formData, mansione: e.target.value})} placeholder="Es: Sviluppatore React..." />
                  </div>
                  <div className="form-group">
                    <label>Zona *</label>
                    <input type="text" className="form-control" required value={formData.zona || ''} onChange={e => setFormData({...formData, zona: e.target.value})} placeholder="Es: Milano (MI)..." />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Portali</label>
                    <input type="text" className="form-control" value={formData.portali_annuncio || ''} onChange={e => setFormData({...formData, portali_annuncio: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Link Diretto</label>
                    <input type="text" className="form-control" value={formData.link_annuncio || ''} onChange={e => setFormData({...formData, link_annuncio: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Data Pubblicazione *</label>
                    <input type="date" className="form-control" required value={formData.data_inserimento_annuncio || ''} onChange={e => setFormData({...formData, data_inserimento_annuncio: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Stato Annuncio</label>
                  <select className="form-control" value={formData.stato_annuncio || 'Attivo'} onChange={e => setFormData({...formData, stato_annuncio: e.target.value})}>
                    <option value="Attivo">Attivo</option>
                    <option value="In Pausa">In Pausa</option>
                    <option value="Scaduto">Scaduto</option>
                    <option value="Chiuso">Chiuso</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Note Interne</label>
                  <textarea className="form-control" rows="2" value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
