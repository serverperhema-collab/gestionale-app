import React from 'react';

const StarRating = ({ value, name, onChange }) => {
  const stars = [];
  for (let i = 1; i <= 10; i++) {
    stars.push(
      <span 
        key={i} 
        onClick={() => onChange(i)}
        style={{
          cursor: 'pointer',
          color: i <= value ? '#FBBF24' : 'rgba(255,255,255,0.1)',
          fontSize: '24px',
          marginRight: '2px',
          transition: 'color 0.2s ease',
          display: 'inline-block'
        }}
        title={`Voto: ${i}`}
      >
        ★
      </span>
    );
  }
  return <div style={{ display: 'flex' }}>{stars}</div>;
};

const EditCandidatoModal = ({ showEditCandidatoModal, setShowEditCandidatoModal, currentCandidato, setCurrentCandidato, handleEditCandidato, API_BASE }) => {
  return (
    <>
      {/* 4. EDIT CANDIDATO & STAR RATINGS MODAL */}
      {showEditCandidatoModal && currentCandidato && (
        <div className="modal-overlay">
          <div className="modal-container">
            <form onSubmit={handleEditCandidato}>
              <div className="modal-header">
                <h2>Modifica Candidato: {currentCandidato.cognome} {currentCandidato.nome}</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditCandidatoModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Ratings */}
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '10px'
                }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Valutazione Profilo (1-10 stelle)</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px' }}>Serietà:</span>
                    <StarRating 
                      value={currentCandidato.valutazione_serieta || 0} 
                      name="valutazione_serieta" 
                      onChange={(val) => setCurrentCandidato({ ...currentCandidato, valutazione_serieta: val })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px' }}>Disponibilità:</span>
                    <StarRating 
                      value={currentCandidato.valutazione_disponibilita || 0} 
                      name="valutazione_disponibilita" 
                      onChange={(val) => setCurrentCandidato({ ...currentCandidato, valutazione_disponibilita: val })}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px' }}>Professionalità:</span>
                    <StarRating 
                      value={currentCandidato.valutazione_professionalita || 0} 
                      name="valutazione_professionalita" 
                      onChange={(val) => setCurrentCandidato({ ...currentCandidato, valutazione_professionalita: val })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Cognome *</label>
                    <input type="text" name="cognome" className="form-control" required defaultValue={currentCandidato.cognome} />
                  </div>
                  <div className="form-group">
                    <label>Nome *</label>
                    <input type="text" name="nome" className="form-control" required defaultValue={currentCandidato.nome} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Recapito (Telefono)</label>
                    <input type="text" name="telefono" className="form-control" defaultValue={currentCandidato.telefono} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" defaultValue={currentCandidato.email} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Residenza Completa</label>
                  <input type="text" name="residenza" className="form-control" defaultValue={currentCandidato.residenza} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Competenze Chiave</label>
                    <input type="text" name="competenze_chiave" className="form-control" defaultValue={currentCandidato.competenze_chiave} />
                  </div>
                  <div className="form-group">
                    <label>Settore</label>
                    <input type="text" name="settore" className="form-control" defaultValue={currentCandidato.settore || ''} />
                  </div>
                  <div className="form-group">
                    <label>Disponibilità</label>
                    <select name="disponibilita" className="form-control" defaultValue={currentCandidato.disponibilita || 'Immediata'}>
                      <option value="Immediata">Immediata</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Libero">Libero</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Codice IBAN</label>
                  <input type="text" name="iban" className="form-control" defaultValue={currentCandidato.iban || ''} />
                </div>
                <div className="form-group">
                  <label>Aggiorna File CV (opzionale, sovrascriverà il precedente)</label>
                  <input type="file" name="cvFile" style={{ width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group">
                  <label>Note Generali</label>
                  <textarea name="note_generali" className="form-control" defaultValue={currentCandidato.note_generali} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditCandidatoModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">💾 Salva Modifiche</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default EditCandidatoModal;
