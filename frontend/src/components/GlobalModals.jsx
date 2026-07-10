import React from 'react';
import ValutazioneModal from './ValutazioneModal';
import InterviewModal from './InterviewModal';
import TrialModal from './TrialModal';
import GeneralReportModal from './GeneralReportModal';
import NewRicercaModal from './NewRicercaModal';
import NewClientModal from './NewClientModal';
import NewCVCandidatoModal from './NewCVCandidatoModal';
import EditCandidatoModal from './EditCandidatoModal';
import EmailPreviewModal from './EmailPreviewModal';
import SubjectLogModal from './SubjectLogModal';
import AnnuncioModal from './AnnuncioModal';
import StatusMotivationModal from './StatusMotivationModal';
import FeedbackModal from './FeedbackModal';
import AdStatusModal from './AdStatusModal';
import TerminaProvaModal from './TerminaProvaModal';

export default function GlobalModals(props) {
  const {
    showValutazioneModal, setShowValutazioneModal, currentCandidato, setCurrentCandidato, evalForm, setEvalForm, evalActiveTab, setEvalActiveTab,
    evalCandidateId, evalCandidateName, loadingEvalStorico, evalStorico, timeline, handleSaveValutazione, handleEvalFormChange,
    calculateRealtimeScore, renderCandidateStars, API_BASE, handlePrintScheda, handleEditCandidato,
    selectedInterviewForManagement, setSelectedInterviewForManagement, handleEditInterviewDetails, handleDeleteInterview,
    handlePrintSingleInterviewReport, showInterviewStatusModal, setShowInterviewStatusModal,
    selectedTrialForManagement, setSelectedTrialForManagement, handleEditTrialDetails, handlePrintSingleTrialReport,
    showTrialStatusModal, setShowTrialStatusModal, showReportModal, setShowReportModal, reportData, reportRange, setReportRange,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate, loadingReport, handleGenerateReport, handlePrintReport,
    showNewRicercaModal, setShowNewRicercaModal, newSearchForm, setNewSearchForm, newSearchRoles, handleCreateRicerca, handleRoleChange,
    addRoleField, removeRoleField, handleSelectClientForNewSearch, clienti, commerciali, operatori, showNewClienteModal, setShowNewClienteModal,
    handleCreateCliente, showNewCVCandidatoModal, setShowNewCVCandidatoModal, handleCreateCVCandidato, showEditCandidatoModal,
    setShowEditCandidatoModal, showEmailPreviewModal, setShowEmailPreviewModal, emailData, setEmailData, handleSendEmail, showDocUploadModal,
    setShowDocUploadModal, handleUploadDocument, pendingHiringCandidate, setPendingHiringCandidate, hiringFormData, setHiringFormData,
    handleCompleteHiring, showTerminaProvaModal, setShowTerminaProvaModal, provaData, setProvaData, handleTerminaProva, showNewAnnuncioFormModal,
    setShowNewAnnuncioFormModal, newSearchForm: annuncioForm, setNewSearchForm: setAnnuncioForm, handleCreateAnnuncio, newSearchRoles: annuncioRoles,
    addRoleField: annuncioAddRole, removeRoleField: annuncioRemoveRole, handleRoleChange: annuncioRoleChange,
    selectedSubjectLog, setSelectedSubjectLog, subjectTimeline, setSubjectTimeline, candidati,
    selectedAnnuncio, setSelectedAnnuncio, handleUpdateAnnuncioDetail,
    handleSaveStatusMotivation, newAdStatus, adStatusMotivation, setAdStatusMotivation, showFeedbackModal, setShowFeedbackModal,
    feedbackNoteText, setFeedbackNoteText, handleSaveFeedback, showAdStatusModal, setShowAdStatusModal, handleUpdateAdStatus,
    newMandatePopup, setNewMandatePopup, newCommercialPopup, setNewCommercialPopup, setCurrentPage
  } = props;

  return (
    <>
      {/* ----------------- MODALS ----------------- */}

            {/* CANDIDATE EVALUATION MODAL */}
      {showValutazioneModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '900px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>📋 SCHEDA COMPLETA DIPENDENTE: {evalCandidateName}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrintScheda} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                  🖨️ Stampa Scheda
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowValutazioneModal(false)}>✕</button>
              </div>
            </div>
            
            {/* TABS NAVIGATION */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', padding: '0 24px 12px 24px', flexShrink: 0, marginTop: '8px' }}>
              <button 
                type="button" 
                className={`tab-nav-btn ${evalActiveTab === 'profilo' ? 'active' : ''}`}
                onClick={() => setEvalActiveTab('profilo')}
                style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 'bold' }}
              >
                👤 Anagrafica & Profilo
              </button>
              <button 
                type="button" 
                className={`tab-nav-btn ${evalActiveTab === 'valutazione' ? 'active' : ''}`}
                onClick={() => setEvalActiveTab('valutazione')}
                style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 'bold' }}
              >
                📊 Valutazione & Attività
              </button>
            </div>

            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              
              {/* TAB 1: DATI PERSONALI & PROFILO ANAGRAFICA */}
              {evalActiveTab === 'profilo' && currentCandidato && (
                <form onSubmit={handleEditCandidato} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Cognome *</label>
                      <input type="text" name="cognome" className="form-control" required defaultValue={currentCandidato.cognome} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Nome *</label>
                      <input type="text" name="nome" className="form-control" required defaultValue={currentCandidato.nome} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Recapito (Telefono)</label>
                      <input type="text" name="telefono" className="form-control" defaultValue={currentCandidato.telefono} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Email</label>
                      <input type="email" name="email" className="form-control" defaultValue={currentCandidato.email} />
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Residenza Completa</label>
                    <input type="text" name="residenza" className="form-control" defaultValue={currentCandidato.residenza} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Competenze Chiave</label>
                      <input type="text" name="competenze_chiave" className="form-control" defaultValue={currentCandidato.competenze_chiave} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Settore</label>
                      <input type="text" name="settore" className="form-control" defaultValue={currentCandidato.settore || ''} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Disponibilità</label>
                      <select name="disponibilita" className="form-control" defaultValue={currentCandidato.disponibilita || 'Immediata'}>
                        <option value="Immediata">Immediata</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Libero">Libero</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Codice IBAN</label>
                    <input type="text" name="iban" className="form-control" defaultValue={currentCandidato.iban || ''} />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Codice Fiscale</label>
                    <input type="text" name="codice_fiscale" className="form-control" defaultValue={currentCandidato.codice_fiscale || ''} />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Carica/Aggiorna Documento Identità (Fisico)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="file" name="docIdFile" style={{ outline: 'none' }} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                      {currentCandidato.link_documenti && (
                        <a href={`${API_BASE.replace('/api', '')}${currentCandidato.link_documenti}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
                          📄 Apri Documento Corrente
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Carica/Aggiorna File CV (opzionale, sovrascriverà il precedente)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="file" name="cvFile" style={{ outline: 'none' }} />
                      {currentCandidato.link_cv && (
                        <a href={currentCandidato.link_cv} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>
                          📄 Apri CV Corrente
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Note Generali</label>
                    <textarea name="note_generali" className="form-control" rows="3" defaultValue={currentCandidato.note_generali} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowValutazioneModal(false)}>Chiudi</button>
                    <button type="submit" className="btn btn-primary">💾 Salva Dati Anagrafici</button>
                  </div>
                </form>
              )}

              {/* TAB 2: SCHEDA DI VALUTAZIONE E STORICO ATTIVITA */}
              {evalActiveTab === 'valutazione' && (
                <form onSubmit={handleSaveValutazione} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* 1. SCALA DI VALUTAZIONE GRID */}
                  <div>
                    <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--primary)' }}>⚙️ GRIGLIA DI VALUTAZIONE COMPORTAMENTALE E TECNICA</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Seleziona un punteggio da 1 (Insufficiente) a 5 (Eccellente) per ciascuna delle 15 aree per calcolare la valutazione complessiva automatica.
                    </p>
                    
                    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', color: 'var(--text-secondary)' }}>Area di valutazione</th>
                            <th style={{ textAlign: 'center', padding: '10px 8px', width: '70px', fontSize: '11px', color: 'var(--text-secondary)' }}>1<br/><span style={{ fontSize: '9px' }}>Insuff.</span></th>
                            <th style={{ textAlign: 'center', padding: '10px 8px', width: '70px', fontSize: '11px', color: 'var(--text-secondary)' }}>2<br/><span style={{ fontSize: '9px' }}>Suff.</span></th>
                            <th style={{ textAlign: 'center', padding: '10px 8px', width: '70px', fontSize: '11px', color: 'var(--text-secondary)' }}>3<br/><span style={{ fontSize: '9px' }}>Buono</span></th>
                            <th style={{ textAlign: 'center', padding: '10px 8px', width: '70px', fontSize: '11px', color: 'var(--text-secondary)' }}>4<br/><span style={{ fontSize: '9px' }}>Ottimo</span></th>
                            <th style={{ textAlign: 'center', padding: '10px 8px', width: '70px', fontSize: '11px', color: 'var(--text-secondary)' }}>5<br/><span style={{ fontSize: '9px' }}>Eccell.</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'pres_personale', label: 'Presentazione personale' },
                            { key: 'puntualita', label: 'Puntualità' },
                            { key: 'comunicazione', label: 'Comunicazione' },
                            { key: 'educazione', label: 'Educazione e atteggiamento' },
                            { key: 'motivazione', label: 'Motivazione' },
                            { key: 'interesse_az', label: 'Interesse verso l\'azienda' },
                            { key: 'esperienza_lav', label: 'Esperienza lavorativa' },
                            { key: 'competenze_tec', label: 'Competenze tecniche' },
                            { key: 'cap_apprendimento', label: 'Capacità di apprendimento' },
                            { key: 'problem_solving', label: 'Problem solving' },
                            { key: 'cap_organizzativa', label: 'Capacità organizzativa' },
                            { key: 'team_work', label: 'Lavoro in team' },
                            { key: 'autonomia', label: 'Autonomia' },
                            { key: 'affidabilita', label: 'Affidabilità' },
                            { key: 'flessibilita', label: 'Flessibilità' }
                          ].map((area, index) => (
                            <tr key={area.key} style={{ borderBottom: '1px solid var(--border)', backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                              <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600 }}>{area.label}</td>
                              {[1, 2, 3, 4, 5].map(n => (
                                <td key={n} style={{ textAlign: 'center', padding: '8px' }}>
                                  <input 
                                    type="radio" 
                                    name={`rating-${area.key}`}
                                    checked={evalForm[area.key] === n}
                                    onChange={() => handleEvalFormChange(area.key, n)}
                                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* 2. DISPONIBILITÀ SECTION */}
                  <div>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary)' }}>📅 DISPONIBILITÀ OPERATIVA</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <strong style={{ display: 'block', fontSize: '12px', marginBottom: '10px', color: 'var(--text-secondary)' }}>ORARI DI LAVORO</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { key: 'orario_full_time', label: 'Full Time' },
                            { key: 'orario_part_time', label: 'Part Time' },
                            { key: 'orario_turni', label: 'Turni' },
                            { key: 'orario_weekend', label: 'Weekend' },
                            { key: 'orario_straordinari', label: 'Straordinari' }
                          ].map(item => (
                            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={evalForm[item.key] === 1}
                                onChange={(e) => setEvalForm({ ...evalForm, [item.key]: e.target.checked ? 1 : 0 })}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <strong style={{ display: 'block', fontSize: '12px', marginBottom: '10px', color: 'var(--text-secondary)' }}>MOBILITÀ GEOGRAFICA</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {[
                            { key: 'mob_automunito', label: 'Automunito' },
                            { key: 'mob_trasferte', label: 'Disponibile a trasferte' },
                            { key: 'mob_spostamenti', label: 'Disponibile a spostamenti' }
                          ].map(item => (
                            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={evalForm[item.key] === 1}
                                onChange={(e) => setEvalForm({ ...evalForm, [item.key]: e.target.checked ? 1 : 0 })}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                              />
                              {item.label}
                            </label>
                          ))}
                        </div>
                        
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>DISPONIBILITÀ ASSUNZIONE *</label>
                          <select 
                            className="form-control" 
                            value={evalForm.disp_assunzione || ''}
                            onChange={(e) => setEvalForm({ ...evalForm, disp_assunzione: e.target.value })}
                            required
                          >
                            <option value="">-- Seleziona --</option>
                            <option value="Immediata">Immediata</option>
                            <option value="Entro 15 giorni">Entro 15 giorni</option>
                            <option value="Entro 30 giorni">Entro 30 giorni</option>
                            <option value="Oltre 30 giorni">Oltre 30 giorni</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 3. OSSERVAZIONI TEXTAREAS */}
                  <div>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--primary)' }}>✍️ OSSERVAZIONI E NOTE DI VALUTAZIONE</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Punti di Forza</label>
                        <textarea 
                          className="form-control" 
                          rows="3" 
                          placeholder="Indicare i principali punti di forza riscontrati..."
                          value={evalForm.punti_forza || ''}
                          onChange={(e) => setEvalForm({ ...evalForm, punti_forza: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Aree di Miglioramento</label>
                        <textarea 
                          className="form-control" 
                          rows="3" 
                          placeholder="Indicare gli aspetti da migliorare o le lacune rilevate..."
                          value={evalForm.aree_miglioramento || ''}
                          onChange={(e) => setEvalForm({ ...evalForm, aree_miglioramento: e.target.value })}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Osservazioni Generali</label>
                        <textarea 
                          className="form-control" 
                          rows="3" 
                          placeholder="Altre osservazioni utili del valutatore..."
                          value={evalForm.osservazioni || ''}
                          onChange={(e) => setEvalForm({ ...evalForm, osservazioni: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Valutazione Conclusiva Finale</label>
                        <textarea 
                          className="form-control" 
                          rows="3" 
                          placeholder="Giudizio sintetico e indicazione di idoneità..."
                          value={evalForm.valutazione_finale || ''}
                          onChange={(e) => setEvalForm({ ...evalForm, valutazione_finale: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. REAL-TIME CALCULATED SCORE PREVIEW */}
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>PUNTEGGIO COMPLESSIVO</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Calcolato in base ai 15 parametri inseriti (rescalato su 100)</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {calculateRealtimeScore(evalForm) !== null ? (
                        <div>
                          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                            {calculateRealtimeScore(evalForm)} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/ 100</span>
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            {renderCandidateStars(calculateRealtimeScore(evalForm))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 'bold' }}>
                          ⚠️ Compila tutte le 15 aree per calcolare il punteggio
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5. HISTORY SUMMARY TIMELINE */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--primary)' }}>📜 RIEPILOGO ATTIVITÀ CANDIDATO (STORICO)</h3>
                    
                    {loadingEvalStorico ? (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Caricamento storico attività in corso...</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Column Left: Mandati e Prove */}
                        <div>
                          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>💼 Mandati Associati &amp; Prove</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {evalStorico.pipeline.map(item => (
                              <div key={item.id_ricerca} style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700 }}>{item.ruolo}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Azienda: <strong>{item.azienda}</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                  <span className="badge badge-secondary" style={{ fontSize: '10px' }}>{item.stato_avanzamento}</span>
                                  {item.stato_prova && (
                                    <span className="badge" style={{ 
                                      fontSize: '10px', 
                                      backgroundColor: item.stato_prova === 'Prova Superata' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                      color: item.stato_prova === 'Prova Superata' ? '#10b981' : '#ef4444'
                                    }}>
                                      {item.stato_prova}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {evalStorico.pipeline.length === 0 && (
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nessuna ricerca collegata.</span>
                            )}
                          </div>
                        </div>

                        {/* Column Right: Colloqui & Logs */}
                        <div>
                          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>📅 Colloqui &amp; Test Prenotati</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            {evalStorico.appuntamenti.map(app => (
                              <div key={app.id} style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                  <strong>{app.tipo_colloquio}</strong>
                                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{app.data_colloquio} {app.ora_colloquio}</span>
                                </div>
                                {app.luogo && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Luogo: <em>{app.luogo}</em></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                  <span className="badge badge-primary" style={{ fontSize: '9px' }}>{app.stato_appuntamento}</span>
                                  {app.note_dettagli && <span style={{ fontSize: '10px', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.note_dettagli}>{app.note_dettagli}</span>}
                                </div>
                              </div>
                            ))}
                            {evalStorico.appuntamenti.length === 0 && (
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Nessun colloquio programmato.</span>
                            )}
                          </div>

                          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>📜 Log Registro Attività</h4>
                          <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            {evalStorico.logs.map(log => (
                              <div key={log.id} style={{ fontSize: '11px', borderBottom: '1px solid var(--border)', padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>[{new Date(log.data_ora).toLocaleDateString('it-IT')}]</span>
                                <strong style={{ color: 'var(--primary)' }}>{log.attivita}:</strong> {log.dettagli}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {evalStorico.pipeline.length === 0 && evalStorico.appuntamenti.length === 0 && evalStorico.logs.length === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nessuna attività registrata nel database per questo candidato.</span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowValutazioneModal(false)}>Chiudi</button>
                    <button type="submit" className="btn btn-primary">💾 Salva Scheda di Valutazione</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 9. DIALOGO GESTIONE COLLOQUIO IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}
      {selectedInterviewForManagement && (
        <div className="modal-overlay" style={{ zIndex: 1080 }}>
          <div className="modal-container" style={{ maxWidth: '1000px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>⚙️ GESTIONE COLLOQUIO: {selectedInterviewForManagement.candidato}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedInterviewForManagement(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              /* STATE 2: GESTIONE SINGOLO COLLOQUIO */
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
      )}


      {/* 10. DIALOGO GESTIONE PROVA IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}
      {selectedTrialForManagement && (
        <div className="modal-overlay" style={{ zIndex: 1080 }}>
          <div className="modal-container" style={{ maxWidth: '1000px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>⚙️ GESTIONE PERIODO DI PROVA: {selectedTrialForManagement.nomeCompleto}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedTrialForManagement(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              /* STATE 2: GESTIONE SINGOLA PROVA */
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
      )}

      {/* 8. REPORT GENERALE DI PERIODO MODAL */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '950px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>📊 REPORT GENERALE DI PERIODO</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => handlePrintReport(reportData)}
                  disabled={!reportData || loadingReport}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                >
                  🖨️ Stampa Report
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReportModal(false)}>✕</button>
              </div>
            </div>
            
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Period selection bar */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Seleziona Periodo:</span>
                  {[
                    { key: 'week', label: 'Ultima Settimana' },
                    { key: 'month', label: 'Ultimo Mese' },
                    { key: '3months', label: 'Ultimi 3 Mesi' },
                    { key: 'custom', label: 'Seleziona Intervallo' }
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      className={`btn ${reportRange === p.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setReportRange(p.key)}
                      style={{ fontWeight: 600 }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                
                {reportRange === 'custom' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dal:</span>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={reportStartDate} 
                        onChange={(e) => setReportStartDate(e.target.value)} 
                        style={{ padding: '4px 8px', fontSize: '12px', width: '130px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Al:</span>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={reportEndDate} 
                        onChange={(e) => setReportEndDate(e.target.value)} 
                        style={{ padding: '4px 8px', fontSize: '12px', width: '130px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {loadingReport ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
                  <span>Elaborazione dei dati storici in corso...</span>
                </div>
              ) : reportData ? (
                <>
                  {/* Summary Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                    {[
                      { label: 'Mandati Aperti', val: reportData.metrics.ricercheAperte, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)' },
                      { label: 'CV Inseriti', val: reportData.metrics.nuoviCandidati, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                      { label: 'Presentati a Ricerche', val: reportData.metrics.candidatiPresentati, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
                      { label: 'Inviati a Clienti', val: reportData.metrics.cvInviati, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                      { label: 'Colloqui Programmati', val: reportData.metrics.colloquiProgrammati, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
                      { label: 'Prove Avviate', val: reportData.metrics.proveAvviate, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
                      { label: 'Candidati Assunti', val: reportData.metrics.assunti, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                      { label: 'Mandati Assunzione', val: reportData.metrics.assunzioniTrasmesse, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
                    ].map((card, i) => (
                      <div key={i} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>{card.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: card.color }}>{card.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Visual CSS Charts / Schemi */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* Chart 1: Activity Volume Breakdown */}
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                      <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '16px', fontWeight: 800 }}>
                        📊 Distribuzione Volumi Operativi
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Nuovi CV Inseriti', count: reportData.metrics.nuoviCandidati, color: '#10B981' },
                          { label: 'Candidati Associati a Mandato', count: reportData.metrics.candidatiPresentati, color: '#3B82F6' },
                          { label: 'CV Inviati a Cliente (Email/WA)', count: reportData.metrics.cvInviati, color: '#F59E0B' },
                          { label: 'Colloqui e Test Pianificati', count: reportData.metrics.colloquiProgrammati, color: '#EC4899' },
                          { label: 'Prove Lavorative Avviate', count: reportData.metrics.proveAvviate, color: '#8B5CF6' },
                          { label: 'Candidati Assunti', count: reportData.metrics.assunti, color: '#10B981' }
                        ].map((item, idx) => {
                          const maxCount = Math.max(
                            reportData.metrics.nuoviCandidati,
                            reportData.metrics.candidatiPresentati,
                            reportData.metrics.cvInviati,
                            reportData.metrics.colloquiProgrammati,
                            reportData.metrics.proveAvviate,
                            reportData.metrics.assunti,
                            1
                          );
                          const pct = Math.round((item.count / maxCount) * 100);
                          return (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>{item.label}</span>
                                <strong style={{ color: item.color }}>{item.count}</strong>
                              </div>
                              <div style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: item.color, borderRadius: '5px', transition: 'width 0.4s ease' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chart 2: Funnel di Conversione Risorse */}
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                      <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '16px', fontWeight: 800 }}>
                        ⏳ Funnel di Avanzamento Ricerca
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        {[
                          { step: 'CV Presentati', count: reportData.metrics.candidatiPresentati, width: '95%', color: '#3B82F6' },
                          { step: 'Inviati a Clienti', count: reportData.metrics.cvInviati, width: '80%', color: '#F59E0B' },
                          { step: 'Colloqui Eseguiti', count: reportData.metrics.colloquiProgrammati, width: '65%', color: '#EC4899' },
                          { step: 'Prove Attivate', count: reportData.metrics.proveAvviate, width: '50%', color: '#8B5CF6' },
                          { step: 'Candidati Assunti / Mandati Assunzione', count: reportData.metrics.assunti, width: '35%', color: '#10B981' }
                        ].map((funnel, idx) => (
                          <div 
                            key={idx} 
                            style={{
                              width: funnel.width,
                              backgroundColor: `${funnel.color}20`,
                              border: `1px solid ${funnel.color}`,
                              borderRadius: '6px',
                              padding: '8px',
                              textAlign: 'center',
                              fontSize: '11px',
                              position: 'relative'
                            }}
                          >
                            <strong>{funnel.step}: {funnel.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Activity log details */}
                  <div>
                    <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 800 }}>
                      📋 Dettaglio delle Attività Registrate ({reportData.logs.length})
                    </h3>
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(0,0,0,0.1)'
                    }}>
                      <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-secondary)', zIndex: 1 }}>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Data</th>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Categoria</th>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Attività</th>
                            <th style={{ textAlign: 'left', padding: '10px 12px' }}>Dettagli</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{new Date(log.data_attivita).toLocaleDateString('it-IT')}</td>
                              <td style={{ padding: '8px 12px' }}><span className="badge badge-secondary">{log.tipo_soggetto}</span></td>
                              <td style={{ padding: '8px 12px' }}><strong>{log.tipo_attivita}</strong></td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{log.dettagli}</td>
                            </tr>
                          ))}
                          {reportData.logs.length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Nessuna attività registrata nell'intervallo selezionato.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Seleziona i parametri e genera il report.
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ flexShrink: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

{/* 1. NEW RESEARCH MODAL */}
      {showNewRicercaModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <form onSubmit={handleCreateRicerca}>
              <div className="modal-header">
                <h2>Nuova Scheda di Ricerca</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewRicercaModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Incaricati (Commerciale & Outbound) */}
                <div style={{
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div className="form-group">
                    <label>Consulente Commerciale *</label>
                    <select 
                      className="form-control"
                      required
                      value={newSearchForm.consulente_commerciale}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, consulente_commerciale: e.target.value })}
                    >
                      <option value="">-- Seleziona Commerciale --</option>
                      {commerciali.filter(c => c.stato_approvazione === 'Approvato').map(c => (
                        <option key={c.id} value={`${c.nome} ${c.cognome}`}>{c.nome} {c.cognome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Outbound (Operatore) *</label>
                    <select 
                      className="form-control"
                      required
                      value={newSearchForm.outbound}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, outbound: e.target.value })}
                    >
                      <option value="">-- Seleziona Operatore --</option>
                      {operatori.map(op => (
                        <option key={op.id} value={`${op.nome} ${op.cognome}`}>{op.nome} {op.cognome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Client selection / Company details */}
                <div style={{
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>ANAGRAFICA CLIENTE / DATI AZIENDA</strong>
                  <div className="form-group">
                    <label>Seleziona Cliente Esistente (Opzionale)</label>
                    <select 
                      className="form-control" 
                      onChange={(e) => handleSelectClientForNewSearch(e.target.value)}
                    >
                      <option value="">-- Nuovo Cliente / Compila Manualmente --</option>
                      {clienti.map(c => (
                        <option key={c.id} value={c.id}>{c.nome_locale} ({c.referente})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Azienda Cliente / Nome Locale *</label>
                      <input 
                        type="text" 
                        name="azienda" 
                        className="form-control" 
                        required 
                        placeholder="Es: Pizzeria Bella Napoli" 
                        value={newSearchForm.azienda}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, azienda: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Partita IVA / Cod.Fisc *</label>
                      <input 
                        type="text" 
                        name="piva" 
                        className="form-control" 
                        required
                        placeholder="11 cifre" 
                        value={newSearchForm.piva}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, piva: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Sede Legale *</label>
                      <input 
                        type="text" 
                        name="sede_legale" 
                        className="form-control" 
                        required
                        placeholder="Indirizzo sede legale" 
                        value={newSearchForm.sede_legale}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, sede_legale: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sede di Lavoro *</label>
                      <input 
                        type="text" 
                        name="sede_lavoro" 
                        className="form-control" 
                        required 
                        placeholder="Es: Via Roma 12, Milano" 
                        value={newSearchForm.sede_lavoro}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, sede_lavoro: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Referente Contatto *</label>
                    <input 
                      type="text" 
                      name="referente" 
                      className="form-control" 
                      required
                      placeholder="Es: Mario Russo" 
                      value={newSearchForm.referente}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, referente: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Telefono Mobile *</label>
                      <input 
                        type="text" 
                        name="telefono_mobile" 
                        className="form-control" 
                        required
                        placeholder="Es: 3331234567" 
                        value={newSearchForm.telefono_mobile}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, telefono_mobile: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefono Fisso *</label>
                      <input 
                        type="text" 
                        name="telefono_fisso" 
                        className="form-control" 
                        required
                        placeholder="Es: 02123456" 
                        value={newSearchForm.telefono_fisso}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, telefono_fisso: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Cliente *</label>
                    <input 
                      type="email" 
                      name="email" 
                      className="form-control" 
                      required
                      placeholder="esempio@email.com" 
                      value={newSearchForm.email}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Settore di Riferimento *</label>
                    <input 
                      type="text" 
                      name="settore" 
                      className="form-control" 
                      required
                      placeholder="Es: Ristorazione, Logistica, Edilizia..." 
                      value={newSearchForm.settore}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, settore: e.target.value })}
                    />
                  </div>
                </div>

                {/* 2. Roles to search list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>RUOLI RICHIESTI</strong>
                  
                  {newSearchRoles.map((role, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '16px',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Ruolo #{idx + 1}</span>
                        {newSearchRoles.length > 1 && (
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm" 
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => removeRoleField(idx)}
                          >
                            Elimina Ruolo
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Ruolo Ricercato *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required 
                          placeholder="Es: Cuoco, Barista, Cameriere..." 
                          value={role.ruolo}
                          onChange={(e) => handleRoleChange(idx, 'ruolo', e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label>Nr Risorse</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            min="1" 
                            value={role.nr_risorse}
                            onChange={(e) => handleRoleChange(idx, 'nr_risorse', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="form-group">
                          <label>CCNL e Livello *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            placeholder="Es: Ristorazione 5° liv" 
                            value={role.ccnl_livello}
                            onChange={(e) => handleRoleChange(idx, 'ccnl_livello', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label>Retribuzione *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            placeholder="Es: 1400€ netti" 
                            value={role.retribuzione}
                            onChange={(e) => handleRoleChange(idx, 'retribuzione', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Competenze Richieste *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            placeholder="Requisiti fondamentali" 
                            value={role.competenze_tecniche}
                            onChange={(e) => handleRoleChange(idx, 'competenze_tecniche', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label>Numero Ore di Lavoro *</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            required
                            min="1"
                            placeholder="Es: 40" 
                            value={role.ore_lavoro}
                            onChange={(e) => handleRoleChange(idx, 'ore_lavoro', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Orario di Lavoro (Opzionale)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Es: Spezzato, Turni..." 
                            value={role.orario_lavoro}
                            onChange={(e) => handleRoleChange(idx, 'orario_lavoro', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ alignSelf: 'flex-start' }}
                    onClick={addRoleField}
                  >
                    ➕ Aggiungi altro ruolo per questo cliente
                  </button>
                </div>

                {/* 3. General internal notes */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label>Note Interne Generali Mandato *</label>
                    <textarea 
                      name="note" 
                      className="form-control" 
                      required
                      placeholder="Note aggiuntive generali del mandato..." 
                      value={newSearchForm.note}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewRicercaModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">➕ Salva Ricerca</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. NEW CLIENT MODAL */}
      {showNewClienteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <form onSubmit={handleCreateCliente}>
              <div className="modal-header">
                <h2>Nuova Anagrafica Cliente</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewClienteModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Nome Locale / Azienda *</label>
                  <input type="text" name="nome_locale" className="form-control" required placeholder="Es: Ristorante Da Gianni" />
                </div>
                <div className="form-group">
                  <label>Partita IVA</label>
                  <input type="text" name="piva" className="form-control" placeholder="11 cifre" />
                </div>
                <div className="form-group">
                  <label>Sede Legale</label>
                  <input type="text" name="sede_legale" className="form-control" placeholder="Indirizzo legale" />
                </div>
                <div className="form-group">
                  <label>Sede Operativa / Lavoro</label>
                  <input type="text" name="sede_lavoro" className="form-control" placeholder="Indirizzo di lavoro" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Referente Contatto</label>
                    <input type="text" name="referente" className="form-control" placeholder="Referente locale" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" placeholder="info@locale.it" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Telefono Mobile</label>
                    <input type="text" name="telefono_mobile" className="form-control" placeholder="Numero cellulare" />
                  </div>
                  <div className="form-group">
                    <label>Telefono Fisso</label>
                    <input type="text" name="telefono_fisso" className="form-control" placeholder="Telefono fisso" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewClienteModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">➕ Salva Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <input type="email" name="email" className="form-control" placeholder="mario@mail.it" />
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

      {/* 5. EMAIL PREVIEW MODAL */}
      {showEmailPreviewModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-container" style={{ width: '650px' }}>
            <form onSubmit={handleSendCVEmail}>
              <div className="modal-header">
                <h2>Anteprima ed Invio E-mail</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEmailPreviewModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label>Destinatario Referente</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={emailData.destEmail}
                    onChange={(e) => setEmailData({ ...emailData, destEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Oggetto E-mail</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Testo del Messaggio</label>
                  <textarea 
                    className="form-control" 
                    required 
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    style={{ minHeight: '180px' }}
                  />
                </div>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(16,185,129,0.2)',
                  fontSize: '12px',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📎 <strong>Allegato rilevato:</strong> Il file del curriculum vitae originale verrà inviato in allegato fisico a questa e-mail.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEmailPreviewModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">📧 Invia E-mail Ora</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            {/* 14. DIALOGO GESTIONE ANNUNCIO IN MODALE ELEGANTE (QUASI TUTTO SCHERMO) */}
      {selectedAnnuncio && (
        <div className="modal-overlay" style={{ zIndex: 1080 }}>
          <div className="modal-container" style={{ maxWidth: '1000px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>⚙️ GESTIONE ANNUNCIO DI LAVORO ({selectedAnnuncio.id})</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedAnnuncio(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              /* SEZIONE DI GESTIONE DEL SINGOLO ANNUNCIO SELEZIONATO */
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedAnnuncio(null)}
                          >
                            ⬅ Torna alla lista annunci
                          </button>
                        </div>

                        <form onSubmit={handleUpdateAnnuncioDetail} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div className="form-group">
                            <label>Testo dell'Annuncio di Lavoro *</label>
                            <textarea 
                              name="testo_annuncio" 
                              className="form-control" 
                              required
                              defaultValue={selectedAnnuncio.testo_annuncio || ''}
                              placeholder="Inserisci il testo completo dell'annuncio..."
                              style={{ minHeight: '150px' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                              <label>Portali Pubblicazione (separati da virgola)</label>
                              <input 
                                type="text" 
                                name="portali_annuncio" 
                                className="form-control" 
                                defaultValue={selectedAnnuncio.portali_annuncio || ''}
                                placeholder="Es: Indeed, Subito.it, LinkedIn"
                              />
                            </div>
                            <div className="form-group">
                              <label>Link Annuncio Web *</label>
                              <input 
                                type="text" 
                                name="link_annuncio" 
                                className="form-control" 
                                required
                                defaultValue={selectedAnnuncio.link_annuncio || ''}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                              <label>Data Pubblicazione Annuncio *</label>
                              <input 
                                type="date" 
                                name="data_inserimento_annuncio" 
                                className="form-control" 
                                required
                                defaultValue={selectedAnnuncio.data_inserimento_annuncio || ''}
                              />
                            </div>
                            <div className="form-group">
                              <label>Data Scadenza Annuncio *</label>
                              <input 
                                type="date" 
                                name="data_scadenza_annuncio" 
                                className="form-control" 
                                required
                                defaultValue={selectedAnnuncio.data_scadenza_annuncio || ''}
                              />
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '12px 16px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            marginTop: '16px'
                          }}>
                            <div>
                              <strong>Stato dell'Annuncio:</strong>{' '}
                              <span className={`badge ${selectedAnnuncio.stato_annuncio === 'Disattivato' ? 'badge-danger' : 'badge-success'}`}>
                                {selectedAnnuncio.stato_annuncio || 'Attivo'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                const targetStatus = (selectedAnnuncio.stato_annuncio || 'Attivo') === 'Attivo' ? 'Disattivato' : 'Attivo';
                                setNewAdStatus(targetStatus);
                                setAdStatusMotivation('');
                                setShowAdStatusModal(true);
                              }}
                            >
                              🔄 Modifica Stato Annuncio
                            </button>
                          </div>

                          <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Note dell'Annuncio (Opzionali)</label>
                            <textarea 
                              name="note" 
                              className="form-control" 
                              placeholder="Note interne, feedback o accordi per l'annuncio..."
                              defaultValue={selectedAnnuncio.note || ''}
                              style={{ minHeight: '60px' }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button type="submit" className="btn btn-primary">💾 Salva Modifiche Annuncio</button>
                          </div>
                        </form>

                        {/* Report di Attività per questo specifico Annuncio */}
                        <div id="print-ad-report" style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary)' }}>📜 Report Azioni Annuncio di Lavoro ({selectedAnnuncio.id})</h4>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                const printContents = document.getElementById('print-ad-report').innerHTML;
                                const printWindow = window.open('', '_blank');
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Report Azioni Annuncio - ${ricercaDetail.ricerca.azienda}</title>
                                      <style>
                                        body { font-family: system-ui, sans-serif; padding: 40px; color: #333; }
                                        h2 { border-bottom: 2px solid #4F46E5; padding-bottom: 8px; color: #4F46E5; }
                                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                        th { background-color: #f5f5f5; }
                                        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: #e5e7eb; }
                                      </style>
                                    </head>
                                    <body>
                                      <h2>Report Azioni Annuncio - ${ricercaDetail.ricerca.azienda} (Ruolo: ${ricercaDetail.ricerca.ruolo})</h2>
                                      <p><strong>ID Annuncio:</strong> ${selectedAnnuncio.id}</p>
                                      <p><strong>Link Annuncio:</strong> ${selectedAnnuncio.link_annuncio || 'N/D'}</p>
                                      <p><strong>Stato Attuale:</strong> ${selectedAnnuncio.stato_annuncio || 'Attivo'}</p>
                                      ${printContents}
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                printWindow.print();
                              }}
                            >
                              🖨️ Stampa Report Annuncio
                            </button>
                          </div>
                          <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <table className="data-table" style={{ fontSize: '12px' }}>
                              <thead>
                                <tr>
                                  <th style={{ width: '130px' }}>Data / Ora</th>
                                  <th style={{ width: '150px' }}>Attività</th>
                                  <th>Dettagli Operazione</th>
                                </tr>
                              </thead>
                              <tbody>
                                {adTimeline
                                  .filter(item => 
                                    item.id === selectedAnnuncio.id || 
                                    (item.dettagli && item.dettagli.includes(selectedAnnuncio.id))
                                  )
                                  .map(item => (
                                    <tr key={item.id}>
                                      <td><code>{item.dataStr}</code></td>
                                      <td>
                                        <span className="badge" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
                                          {item.attivita}
                                        </span>
                                      </td>
                                      <td>{item.dettagli}</td>
                                    </tr>
                                  ))
                                }
                                {adTimeline.filter(item => 
                                    item.id === selectedAnnuncio.id || 
                                    (item.dettagli && item.dettagli.includes(selectedAnnuncio.id))
                                  ).length === 0 && (
                                  <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessuna azione registrata per questo annuncio.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedAnnuncio(null)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* 9. SUBJECT TIMELINE LOG MODAL */}
      {selectedSubjectLog && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-container" style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h2>📜 Log Operazioni: {selectedSubjectLog.name}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedSubjectLog(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {subjectTimeline.map(item => (
                  <div key={item.id} style={{
                    borderLeft: '3px solid var(--primary)',
                    paddingLeft: '16px',
                    position: 'relative',
                    marginBottom: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.dataStr}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.attivita}</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>{item.dettagli}</p>
                  </div>
                ))}
                {subjectTimeline.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                    Nessuna operazione registrata per questo soggetto.
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-primary btn-sm" onClick={() => handlePrintReport(selectedSubjectLog.name, `Storico completo delle operazioni relative al soggetto ID: ${selectedSubjectLog.id} (${selectedSubjectLog.type})`, subjectTimeline)}>
                🖨️ Stampa Report
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSubjectLog(null)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

const handlePrintReport = (title, subtitle, timelineData) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Blocco popup rilevato! Consenti i popup per stampare il report.");
    return;
  }
  
  const rowsHtml = timelineData.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 12px; white-space: nowrap;">${item.dataStr}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 12px; font-weight: bold;">${item.attivita || item.tipo || ''}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 12px;">${item.dettagli}</td>
    </tr>
  `).join('');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Operazioni - ${title}</title>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0 0 0; font-size: 14px; color: #666; }
        .info-box { background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 6px; margin-bottom: 30px; }
        .info-box h2 { margin: 0 0 5px 0; font-size: 16px; }
        .info-box p { margin: 0; font-size: 13px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { padding: 10px; border-bottom: 2px solid #333; text-align: left; font-size: 13px; text-transform: uppercase; }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💼 HEMA WORK / MDI</h1>
        <p>REPORT OPERAZIONI COMPILATE - EXPORT UFFICIALE</p>
      </div>
      
      <div class="info-box">
        <h2>Soggetto/Oggetto del Report: ${title}</h2>
        <p>${subtitle}</p>
        <p style="margin-top: 5px; font-size: 11px; color: #888;">Generato il: ${new Date().toLocaleString('it-IT')}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 150px;">Data e Ora</th>
            <th style="width: 180px;">Azione / Operazione</th>
            <th>Dettagli Attività</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">Nessuna attività registrata.</td></tr>'}
        </tbody>
      </table>
      
      <div class="no-print" style="margin-top: 40px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; font-weight: bold; background-color: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
          🖨️ Stampa questo Report
        </button>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      <\/script>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

