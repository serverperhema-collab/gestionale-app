import React from 'react';

const AdStatusModal = ({ showAdStatusModal, setShowAdStatusModal, newAdStatus, setNewAdStatus, adStatusMotivation, setAdStatusMotivation, handleUpdateAdStatus }) => {
  return (
    <>
      {/* MODAL MODIFICA STATO ANNUNCIO */}
      {showAdStatusModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <form onSubmit={handleUpdateAdStatus}>
              <div className="modal-header">
                <h2>Conferma Cambio Stato Annuncio</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdStatusModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Stai modificando lo stato dell'annuncio in: <strong style={{ color: newAdStatus === 'Attivo' ? 'var(--success)' : 'var(--danger)' }}>{newAdStatus}</strong>.
                </p>
                <div className="form-group">
                  <label>Motivazione del cambio di stato *</label>
                  <textarea
                    className="form-control"
                    required
                    rows="3"
                    value={adStatusMotivation}
                    onChange={(e) => setAdStatusMotivation(e.target.value)}
                    placeholder="Inserisci qui il motivo della disattivazione/riattivazione..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdStatusModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">Conferma</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default AdStatusModal;
