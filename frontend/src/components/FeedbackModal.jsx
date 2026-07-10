import React from 'react';

const FeedbackModal = ({
  showFeedbackModal, setShowFeedbackModal,
  feedbackNoteText, setFeedbackNoteText,
  scheduleInterviewOption, setScheduleInterviewOption,
  interviewDate, setInterviewDate,
  interviewTime, setInterviewTime,
  interviewType, setInterviewType,
  excludeFromResearch, setExcludeFromResearch,
  cvSentToggle, setCvSentToggle,
  handleFeedbackPositivo, handleFeedbackNegativo
}) => {
  return (
    <>
      {/* MODAL FEEDBACK POSITIVO */}
      {showFeedbackModal && showFeedbackModal.type === 'Positivo' && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <form onSubmit={handleFeedbackPositivo}>
              <div className="modal-header">
                <h2>Feedback Positivo Candidato</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowFeedbackModal(null)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Registra un riscontro positivo per <strong>{showFeedbackModal.pipe.nomeCompleto}</strong>.
                </p>

                {/* Opzione Inserisci Colloquio */}
                <div style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)', 
                  padding: '12px 16px', 
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={scheduleInterviewOption} 
                      onChange={(e) => setScheduleInterviewOption(e.target.checked)} 
                    />
                    Pianificare subito un colloquio con il cliente?
                  </label>

                  {scheduleInterviewOption && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label style={{ fontSize: '11px' }}>Data Colloquio *</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            required={scheduleInterviewOption}
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label style={{ fontSize: '11px' }}>Ora Colloquio *</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            required={scheduleInterviewOption}
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '11px' }}>Tipo Colloquio</label>
                        <select 
                          className="form-control"
                          value={interviewType}
                          onChange={(e) => setInterviewType(e.target.value)}
                        >
                          <option value="Online">Online (Google Meet/Teams)</option>
                          <option value="Presenziale">Presenziale (In sede)</option>
                          <option value="Telefonico">Telefonico</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Note / Valutazioni (Opzionali)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={feedbackNoteText}
                    onChange={(e) => setFeedbackNoteText(e.target.value)}
                    placeholder="Dettagli sulle risposte del cliente o annotazioni..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowFeedbackModal(null);
                  setFeedbackNoteText('');
                  setScheduleInterviewOption(false);
                }}>Annulla</button>
                <button type="submit" className="btn btn-success">💾 Registra Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FEEDBACK NEGATIVO */}
      {showFeedbackModal && showFeedbackModal.type === 'Negativo' && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '450px' }}>
            <form onSubmit={handleFeedbackNegativo}>
              <div className="modal-header">
                <h2>Feedback Negativo Candidato</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowFeedbackModal(null)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Registra un riscontro negativo per <strong>{showFeedbackModal.pipe.nomeCompleto}</strong>.
                </p>

                <div className="form-group">
                  <label>Motivazione Feedback Negativo (Obbligatoria) *</label>
                  <textarea
                    className="form-control"
                    required
                    rows="3"
                    value={feedbackNoteText}
                    onChange={(e) => setFeedbackNoteText(e.target.value)}
                    placeholder="Es: Mancanza di esperienza specifica, rifiuto orari proposti, ecc..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={excludeFromResearch} 
                      onChange={(e) => setExcludeFromResearch(e.target.checked)} 
                    />
                    Escludere il candidato da questa ricerca?
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowFeedbackModal(null);
                  setFeedbackNoteText('');
                  setExcludeFromResearch(false);
                }}>Annulla</button>
                <button type="submit" className="btn btn-danger">💾 Registra Esito Negativo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackModal;
