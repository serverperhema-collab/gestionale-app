import React from 'react';

const ValutazioneModal = ({
  showValutazioneModal, setShowValutazioneModal,
  currentCandidato, setCurrentCandidato,
  evalForm, evalActiveTab, setEvalActiveTab,
  evalCandidateId, evalCandidateName,
  loadingEvalStorico, evalStorico,
  timeline,
  handleSaveValutazione, handleEvalFormChange, calculateRealtimeScore,
  renderCandidateStars,
  API_BASE,
  handlePrintScheda,
  handleEditCandidato
}) => {
  return (
    <>
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
      
    </>
  );
};

export default ValutazioneModal;
