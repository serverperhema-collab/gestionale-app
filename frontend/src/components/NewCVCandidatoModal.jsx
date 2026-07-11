import React from 'react';

const NewCVCandidatoModal = ({ showNewCVCandidatoModal, setShowNewCVCandidatoModal, handleCreateCVCandidato }) => {
  return (
    <>
      {/* 3. NEW CV CANDIDATO MODAL */}
      {showNewCVCandidatoModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <form onSubmit={handleCreateCVCandidato}>
              <div className="modal-header">
                <h2>Inserisci Nuovo CV Candidato</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewCVCandidatoModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Cognome *</label>
                    <input type="text" name="cognome" className="form-control" required placeholder="Rossi" />
                  </div>
                  <div className="form-group">
                    <label>Nome *</label>
                    <input type="text" name="nome" className="form-control" required placeholder="Mario" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Recapito (Telefono)</label>
                    <input type="text" name="telefono" className="form-control" placeholder="Cellulare" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="text" name="email" className="form-control" placeholder="mario@mail.it" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>CAP</label>
                    <input type="text" name="cap" className="form-control" placeholder="20121" />
                  </div>
                  <div className="form-group">
                    <label>Città</label>
                    <input type="text" name="citta" className="form-control" placeholder="Milano" />
                  </div>
                  <div className="form-group">
                    <label>Provincia</label>
                    <input type="text" name="provincia" className="form-control" placeholder="MI" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Mansioni / Competenze</label>
                    <input type="text" name="competenze_chiave" className="form-control" placeholder="Es: Cameriere, Barista" />
                  </div>
                  <div className="form-group">
                    <label>Settore</label>
                    <input type="text" name="settore" className="form-control" placeholder="Es: Ristorazione, Hotellerie" />
                  </div>
                  <div className="form-group">
                    <label>Disponibilità</label>
                    <select name="disponibilita" className="form-control">
                      <option value="Immediata">Immediata</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Libero">Libero</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Codice IBAN</label>
                  <input type="text" name="iban" className="form-control" placeholder="IT00X0000000000000000000000" />
                </div>
                <div className="form-group" style={{
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '2px dashed var(--border)',
                  borderRadius: '10px'
                }}>
                  <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span>📁 Seleziona File CV (PDF, Word, Immagine) *</span>
                    <input type="file" name="cvFile" id="cvFile" required style={{ width: '100%', outline: 'none' }} />
                  </label>
                </div>
                <div className="form-group">
                  <label>Note Generali</label>
                  <textarea name="note_generali" className="form-control" placeholder="Esperienze passate, note commerciali..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewCVCandidatoModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-success">💾 Salva Profilo & Carica CV</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default NewCVCandidatoModal;
