import React from 'react';

const TrialModal = ({
  selectedTrialForManagement, setSelectedTrialForManagement,
  timeline,
  handleEditTrialDetails, handlePrintSingleTrialReport,
  showTrialStatusModal, setShowTrialStatusModal
}) => {
  if (!selectedTrialForManagement) return null;
  return (
        <div className="modal-overlay" style={{ zIndex: 1080 }}>
          <div className="modal-container" style={{ maxWidth: '1000px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>⚙️ GESTIONE PERIODO DI PROVA: {selectedTrialForManagement.nomeCompleto}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedTrialForManagement(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              {/* STATE 2: GESTIONE SINGOLA PROVA */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => setSelectedTrialForManagement(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            ↩️ Torna all'elenco generale delle prove
                          </button>
                          <div>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => handlePrintSingleTrialReport(selectedTrialForManagement)}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontWeight: 600 }}
                            >
                              🖨️ Stampa Report Prova
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                          {/* Modulo Modifica Dettagli */}
                          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>
                              ✏️ Modifica Dettagli Periodo di Prova
                            </h3>
                            <form onSubmit={handleEditTrialDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div className="form-group">
                                <label>Candidato in Prova</label>
                                <input type="text" className="form-control" value={selectedTrialForManagement.nomeCompleto} disabled style={{ background: '#f7fafc', cursor: 'not-allowed' }} />
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                  <label>Data Inizio Prova</label>
                                  <input type="date" name="data_inizio_prova" defaultValue={selectedTrialForManagement.dataInizioProva || ''} className="form-control" required />
                                </div>
                                <div className="form-group">
                                  <label>Data Scadenza Prova</label>
                                  <input type="date" name="data_scadenza_prova" defaultValue={selectedTrialForManagement.dataScadenzaProva || ''} className="form-control" required />
                                </div>
                              </div>

                              <div className="form-group">
                                <label>Prova Contrattualizzata? *</label>
                                <select name="prova_contrattualizzata" defaultValue={selectedTrialForManagement.provaContrattualizzata === 1 ? 'SI' : 'NO'} className="form-control" required>
                                  <option value="SI">SÌ</option>
                                  <option value="NO">NO</option>
                                </select>
                              </div>

                              <div className="form-group">
                                <label>Note Amministrazione / Note Accordo</label>
                                <textarea name="note" defaultValue={selectedTrialForManagement.noteAmministrazione || ''} className="form-control" rows="3" placeholder="Es: Prova retribuita 8€/ora" />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>💾 Salva Modifiche</button>
                              </div>
                            </form>
                          </div>

                          {/* Concludi Periodo di Prova & Timeline */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                              <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
                                🏁 Concludi Periodo di Prova
                              </h3>
                              
                              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                Definisci l'esito finale della prova per questo candidato. L'esito richiede l'inserimento obbligatorio di una nota di motivazione.
                              </p>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={() => setShowTrialStatusModal({ pipe: selectedTrialForManagement, nextStato: 'Prova Superata' })}
                                  style={{ padding: '10px', fontWeight: 700 }}
                                >
                                  ✅ Superata (Avvia Assunzione)
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => setShowTrialStatusModal({ pipe: selectedTrialForManagement, nextStato: 'Prova Non Superata' })}
                                  style={{ padding: '10px', fontWeight: 700 }}
                                >
                                  ❌ Non Superata
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => setShowTrialStatusModal({ pipe: selectedTrialForManagement, nextStato: 'Interrotta' })}
                                  style={{ padding: '10px', fontWeight: 700, backgroundColor: '#4a5568', color: '#fff' }}
                                >
                                  ⚠️ Interrotta / Ritiro
                                </button>
                              </div>
                            </div>

                            {/* Timeline Log Storici della Prova */}
                            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', flexGrow: 1 }}>
                              <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
                                📜 Report Azioni della Prova
                              </h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '250px', overflowY: 'auto', paddingRight: '6px' }}>
                                {(timeline || [])
                                  .filter(log => 
                                    log.soggetto_correlato === selectedTrialForManagement.nomeCompleto && 
                                    (log.tipo_attivita.toLowerCase().includes('prova') || log.dettagli.toLowerCase().includes('prova'))
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
                                  log.soggetto_correlato === selectedTrialForManagement.nomeCompleto && 
                                  (log.tipo_attivita.toLowerCase().includes('prova') || log.dettagli.toLowerCase().includes('prova'))
                                ).length === 0 && (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                    Nessun log specifico registrato per questa prova.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedTrialForManagement(null)}>Chiudi</button>
            </div>
          </div>
        </div>
  );
};

export default TrialModal;
