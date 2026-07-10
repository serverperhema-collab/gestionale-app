import React from 'react';

const StatusMotivationModal = ({
  showInterviewStatusModal, setShowInterviewStatusModal, handleUpdateInterviewStatus,
  showTrialStatusModal, setShowTrialStatusModal, handleUpdateTrialStatus,
  newMandatePopup, setNewMandatePopup,
  newCommercialPopup, setNewCommercialPopup,
  setCurrentPage, setSelectedRicercaId
}) => {
  return (
    <>
      {/* MODAL CAMBIO STATO COLLOQUIO CON MOTIVAZIONE */}
      {showInterviewStatusModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <form onSubmit={handleUpdateInterviewStatus}>
              <div className="modal-header">
                <h2>Registra Esito Colloquio</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInterviewStatusModal(null)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Stai impostando il colloquio di <strong>{showInterviewStatusModal.appuntamento.candidato}</strong> sullo stato <strong>{showInterviewStatusModal.nextStato}</strong>.
                </p>

                <div className="form-group">
                  <label>Nota / Motivazione dell'Esito (Obbligatoria) *</label>
                  <textarea
                    name="motivazione"
                    className="form-control"
                    required
                    rows="3"
                    placeholder="Es: Candidato idoneo e motivato, assente senza preavviso, rifiuto offerta orari, ecc..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInterviewStatusModal(null)}>Annulla</button>
                <button type="submit" className="btn btn-primary">💾 Conferma Stato & Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CAMBIO STATO PROVA CON MOTIVAZIONE */}
      {showTrialStatusModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <form onSubmit={handleUpdateTrialStatus}>
              <div className="modal-header">
                <h2>Registra Esito Periodo di Prova</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTrialStatusModal(null)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Stai impostando il periodo di prova di <strong>{showTrialStatusModal.pipe.nomeCompleto}</strong> sullo stato <strong>{showTrialStatusModal.nextStato}</strong>.
                </p>

                <div className="form-group">
                  <label>Nota Amministrativa / Motivazione dell'Esito (Obbligatoria) *</label>
                  <textarea
                    name="motivazione"
                    className="form-control"
                    required
                    rows="3"
                    placeholder="Es: Periodo concluso positivamente, procedere con assunzione, interrotto per scarso rendimento, ecc..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTrialStatusModal(null)}>Annulla</button>
                <button type="submit" className="btn btn-primary">💾 Conferma Esito & Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. NEW MANDATE NOTIFICATION POPUP */}
      {newMandatePopup && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ width: '420px', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Nuovo Mandato Ricevuto!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Il commerciale <strong>{newMandatePopup.consulente_commerciale}</strong> ha appena inserito un nuovo mandato per <strong>{newMandatePopup.azienda}</strong> (Ruolo: {newMandatePopup.ruolo}).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setCurrentPage('approvazioni');
                  setSelectedRicercaId(null);
                  setNewMandatePopup(null);
                }}
              >
                🔍 Vai ai Mandati da Approvare
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setNewMandatePopup(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. NEW COMMERCIAL REGISTRATION NOTIFICATION POPUP */}
      {newCommercialPopup && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ width: '420px', textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Nuova Richiesta di Abilitazione!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Il commerciale <strong>{newCommercialPopup.nome} {newCommercialPopup.cognome}</strong> (Email: {newCommercialPopup.email}) ha richiesto l'abilitazione ad accedere al portale.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setCurrentPage('commerciali_gestione');
                  setSelectedRicercaId(null);
                  setNewCommercialPopup(null);
                }}
              >
                🔍 Vai a Commerciali & Accessi
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setNewCommercialPopup(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default StatusMotivationModal;
