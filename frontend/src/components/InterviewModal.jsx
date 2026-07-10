import React from 'react';

const InterviewModal = ({
  selectedInterviewForManagement, setSelectedInterviewForManagement,
  timeline,
  handleEditInterviewDetails, handleDeleteInterview, handlePrintSingleInterviewReport,
  showInterviewStatusModal, setShowInterviewStatusModal
}) => {
  if (!selectedInterviewForManagement) return null;
  return (
        <div className="modal-overlay" style={{ zIndex: 1080 }}>
          <div className="modal-container" style={{ maxWidth: '1000px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>⚙️ GESTIONE COLLOQUIO: {selectedInterviewForManagement.candidato}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedInterviewForManagement(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              {/* STATE 2: GESTIONE SINGOLO COLLOQUIO */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => setSelectedInterviewForManagement(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            ↩️ Torna all'elenco dei colloqui
                          </button>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => handlePrintSingleInterviewReport(selectedInterviewForManagement)}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontWeight: 600 }}
                            >
                              🖨️ Stampa Report Colloquio
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => handleDeleteInterview(selectedInterviewForManagement.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontWeight: 600 }}
                            >
                              🗑️ Elimina Colloquio
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                          {/* Modulo Modifica Dettagli */}
                          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>
                              ✏️ Modifica Dettagli Colloquio
                            </h3>
                            <form onSubmit={handleEditInterviewDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div className="form-group">
                                <label>Candidato</label>
                                <input type="text" className="form-control" value={selectedInterviewForManagement.candidato} disabled style={{ background: '#f7fafc', cursor: 'not-allowed' }} />
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                  <label>Data</label>
                                  <input type="date" name="data" defaultValue={selectedInterviewForManagement.data} className="form-control" required />
                                </div>
                                <div className="form-group">
                                  <label>Ora</label>
                                  <input type="time" name="ora" defaultValue={selectedInterviewForManagement.ora} className="form-control" required />
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                  <label>Tipo di Colloquio</label>
                                  <select name="tipo" defaultValue={selectedInterviewForManagement.tipo || 'In presenza'} className="form-control" required>
                                    <option value="In presenza">In presenza</option>
                                    <option value="Video chiamata">Video chiamata</option>
                                    <option value="Telefonico">Telefonico</option>
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Luogo</label>
                                  <select name="luogo" defaultValue={selectedInterviewForManagement.luogo || 'Presso nostra sede'} className="form-control" required>
                                    <option value="Presso nostra sede">Presso nostra sede</option>
                                    <option value="Presso cliente">Presso cliente</option>
                                    <option value="Online / Video Call">Online / Video Call</option>
                                  </select>
                                </div>
                              </div>

                              <div className="form-group">
                                <label>Note / Dettagli Colloquio</label>
                                <textarea name="note" defaultValue={selectedInterviewForManagement.note || ''} className="form-control" rows="3" placeholder="Inserisci note o dettagli..." />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>💾 Salva Modifiche</button>
                              </div>
                            </form>
                          </div>

                          {/* Stato del Colloquio & Timeline */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
                                ⚙️ Stato del Colloquio
                              </h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Stato Attuale:</span>
                                <span style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  backgroundColor: selectedInterviewForManagement.stato === 'Eseguito' ? 'rgba(16,185,129,0.15)'
                                                  : selectedInterviewForManagement.stato === 'Annullato' ? 'rgba(239,68,68,0.15)'
                                                  : selectedInterviewForManagement.stato === 'Non Presentato' ? 'rgba(74,85,104,0.15)'
                                                  : 'rgba(245,158,11,0.15)',
                                  color: selectedInterviewForManagement.stato === 'Eseguito' ? '#10b981'
                                         : selectedInterviewForManagement.stato === 'Annullato' ? '#ef4444'
                                         : selectedInterviewForManagement.stato === 'Non Presentato' ? '#4a5568'
                                         : '#f59e0b'
                                }}>
                                  {selectedInterviewForManagement.stato}
                                </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cambia Stato (Richiede Motivazione):</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={() => setShowInterviewStatusModal({ appuntamento: selectedInterviewForManagement, nextStato: 'Eseguito' })}
                                  >
                                    ✅ Eseguito
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => setShowInterviewStatusModal({ appuntamento: selectedInterviewForManagement, nextStato: 'Annullato' })}
                                  >
                                    ❌ Annullato
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowInterviewStatusModal({ appuntamento: selectedInterviewForManagement, nextStato: 'Non Presentato' })}
                                    style={{ backgroundColor: '#4a5568', color: '#fff' }}
                                  >
                                    ⚠️ Non Presentato
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-warning btn-sm"
                                    onClick={() => setShowInterviewStatusModal({ appuntamento: selectedInterviewForManagement, nextStato: 'Programmato' })}
                                  >
                                    📅 Riprogrammato
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                      const customStatus = window.prompt("Inserisci lo stato personalizzato:");
                                      if (customStatus && customStatus.trim()) {
                                        setShowInterviewStatusModal({ appuntamento: selectedInterviewForManagement, nextStato: customStatus.trim() });
                                      }
                                    }}
                                  >
                                    ➕ Altro
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Timeline Dettagliata Appuntamento */}
                            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', flexGrow: 1 }}>
                              <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
                                📜 Report Azioni del Colloquio
                              </h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '250px', overflowY: 'auto', paddingRight: '6px' }}>
                                {(timeline || [])
                                  .filter(log => 
                                    log.soggetto_correlato === selectedInterviewForManagement.candidato && 
                                    (log.tipo_attivita.includes('Colloquio') || log.tipo_attivita.includes('Riprogrammazione'))
                                  )
                                  .map(log => {
                                    const logDate = new Date(log.data_attivita).toLocaleDateString('it-IT');
                                    const logTime = new Date(log.data_attivita).toLocaleTimeString('it-IT');
                                    return (
                                      <div key={log.id} style={{ display: 'flex', flexDirection: 'column', paddingBottom: '10px', borderBottom: '1px dashed var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{logDate} - {logTime}</span>
                                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>{log.tipo_attivita}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.dettagli}</span>
                                      </div>
                                    );
                                  })}
                                {(timeline || []).filter(log => 
                                  log.soggetto_correlato === selectedInterviewForManagement.candidato && 
                                  (log.tipo_attivita.includes('Colloquio') || log.tipo_attivita.includes('Riprogrammazione'))
                                ).length === 0 && (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                    Nessuna azione registrata per questo colloquio.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedInterviewForManagement(null)}>Chiudi</button>
            </div>
          </div>
        </div>
  );
};

export default InterviewModal;
