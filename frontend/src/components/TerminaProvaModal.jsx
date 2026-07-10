import React from 'react';

const TerminaProvaModal = ({ showTerminaProvaModal, setShowTerminaProvaModal, provaData, setProvaData, handleEndTrial }) => {
  return (
    <>
      {/* 6. TERMINA PROVA MODAL */}
      {showTerminaProvaModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ width: '450px' }}>
            <form onSubmit={handleEndTrial}>
              <div className="modal-header">
                <h2>Concludi Periodo Prova</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTerminaProvaModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Esito Prova</label>
                  <select 
                    className="form-control" 
                    value={provaData.esito}
                    onChange={(e) => setProvaData({ ...provaData, esito: e.target.value })}
                  >
                    <option value="Prova Superata">Prova Superata (Idoneo all'Assunzione)</option>
                    <option value="Prova Non Superata">Prova Non Superata (Scartato)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Data Conclusione Prova</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={provaData.dataFine}
                    onChange={(e) => setProvaData({ ...provaData, dataFine: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Note Conclusive / Amministrative</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Accordi per liquidazione o motivazioni esito..."
                    value={provaData.note}
                    onChange={(e) => setProvaData({ ...provaData, note: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTerminaProvaModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-danger">💾 Salva Esito Prova</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default TerminaProvaModal;
