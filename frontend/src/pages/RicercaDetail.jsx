import React, { useEffect } from 'react';
import { API_BASE, renderCandidateStars, getCapFromAddress, estimateDistanceByCap, getAdActiveDaysInfo } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function RicercaDetail({
  ricercaDetail,
  setRicercaDetail,
  timeline,
  setTimeline,
  activeTab,
  setActiveTab,
  showNewCandidatoPipelineModal,
  setShowNewCandidatoPipelineModal,
  isNewCandidate,
  setIsNewCandidate,
  candidati,
  clienti,
  operatori,
  commerciali,
  showStatus,
  handleOpenValutazione,
  getAffinedCandidati,
  handleLinkCandidatoToRicerca,
  handleInsertCandidate,
  handleFeedbackPositivo,
  handleFeedbackNegativo,
  handleUnlinkCandidate,
  handleToggleInviatoStatus,
  handleEditCandidato,
  handleSaveAnnuncio,
  handleUpdatePipelineStatus,
  handleScheduleInterview,
  handleDeleteInterview,
  handleEditInterviewDetails,
  handleSaveResearchNote,
  handleStartTrial,
  handleToggleStar,
  handleApprovalAction,
  setSelectedRicercaId,
  setSelectedSubjectLog,
  showNewInterviewFormModal,
  setShowNewInterviewFormModal,
  showNewTrialFormModal,
  setShowNewTrialFormModal,
  showNewAssunzioneModal,
  setShowNewAssunzioneModal,
  showAdStatusModal,
  setShowAdStatusModal,
  handleUpdateAdStatus,
  newAdStatus,
  setNewAdStatus,
  adStatusMotivation,
  setAdStatusMotivation,
  adTimeline,
  fetchAdTimeline,
  setSelectedPipeCand,
  selectedPipeCand,
  selectedInterviewForManagement,
  setSelectedInterviewForManagement,
  showInterviewStatusModal,
  setShowInterviewStatusModal,
  selectedTrialForManagement,
  setSelectedTrialForManagement,
  showTrialStatusModal,
  setShowTrialStatusModal,
  pendingHiringCandidate,
  setPendingHiringCandidate,
  handlePrintSingleInterviewReport,
  handlePrintSingleTrialReport,
  StarRating,
  handlePrintHiringSheet,
  handleEmailHiringSheet,
  handlePrintExecutiveReport,
  handlePrintTechnicalReport,
  handlePrintTechnicalResearchReport,
  handleUploadHiringDoc,
  handleCreateHiringForCandidate,
  handleOpenHiringForm,
  setCurrentPage, 
  ricerche, 
  fetchRicerche, 
  selectedRicercaId, 
  showNewAnnuncioFormModal, 
  setShowNewAnnuncioFormModal, 
  annunci, 
  setSelectedAnnuncio, 
  setShowFeedbackModal, 
  cvSentToggle, 
  setCvSentToggle, 
  pipeCandTimeline, 
  selectedHiringCandidate, 
  setSelectedHiringCandidate, 
  hiringFormData, 
  setHiringFormData, 
  fetchRicercaDetail, 
  handleSendWA, openEmailPreview, handlePrintTimelineReport,
  showLinkAnnuncioModal,
  setShowLinkAnnuncioModal,
  handleLinkAnnuncio,
  handleUnlinkAnnuncio
}) {
  const { annunci: annunciGlobali } = useGlobalState();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
               {ricercaDetail.ricerca.stato_approvazione_tl === 'In attesa di approvazione' && (
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid var(--warning)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '4px' }}>⚠️ MANDATO IN ATTESA DI APPROVAZIONE</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Questo mandato è stato inserito dal commerciale <strong>{ricercaDetail.ricerca.consulente_commerciale || 'Sconosciuto'}</strong> ed è in attesa di approvazione.
                    </span>
                  </div>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/ricerche/${selectedRicercaId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ stato_approvazione_tl: 'Approvata' })
                        });
                        const json = await res.json();
                        if (json.success) {
                          showStatus('success', 'Mandato approvato!', 'La ricerca è stata approvata e attivata.');
                          fetchRicercaDetail(selectedRicercaId);
                        }
                      } catch (err) {
                        showStatus('error', 'Errore', err.message);
                      }
                    }}
                  >
                    ✓ Approva Mandato
                  </button>
                </div>
              )}

              {ricercaDetail.ricerca.stato_approvazione_tl === 'Approvata con Riserva' && (
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid var(--warning)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '4px' }}>⚠️ MANDATO APPROVATO CON RISERVA</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Questo mandato è in stato di riserva. Puoi accettarlo definitivamente in qualsiasi momento per renderlo un mandato ordinario.
                    </span>
                  </div>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE}/ricerche/${selectedRicercaId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ stato_approvazione_tl: 'Approvata' })
                        });
                        const json = await res.json();
                        if (json.success) {
                          showStatus('success', 'Riserva Rimossa!', 'Il mandato è ora approvato in via definitiva.');
                          fetchRicercaDetail(selectedRicercaId);
                          fetchRicerche();
                        }
                      } catch (err) {
                        showStatus('error', 'Errore', err.message);
                      }
                    }}
                  >
                    ✓ Accetta Definitivo
                  </button>
                </div>
              )}
              {/* Header metrics */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 24px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>NOME ATTIVITÀ</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
                      {ricercaDetail.ricerca.azienda ? ricercaDetail.ricerca.azienda.toUpperCase() : 'N/D'}
                    </div>
                  </div>
                  <div style={{ borderLeft: '2px solid var(--border)', height: '32px', alignSelf: 'center' }}></div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>RUOLO RICERCATO</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                      {ricercaDetail.ricerca.ruolo}
                    </div>
                  </div>
                  <div style={{ borderLeft: '2px solid var(--border)', height: '32px', alignSelf: 'center' }}></div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CLIENTE REFERENTE</span>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>
                      {ricercaDetail.ricerca.referente} ({ricercaDetail.ricerca.email} | {ricercaDetail.ricerca.telefono_mobile})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SEDE DI L.</span>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{ricercaDetail.ricerca.sede_lavoro}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SETTORE</span>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{ricercaDetail.ricerca.settore || 'N/D'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>RISORSE</span>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{ricercaDetail.ricerca.nr_risorse}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ORE DI LAVORO</span>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{ricercaDetail.ricerca.ore_lavoro ? `${ricercaDetail.ricerca.ore_lavoro}h ${ricercaDetail.ricerca.ore_lavoro_tipo ? ricercaDetail.ricerca.ore_lavoro_tipo.toLowerCase() : 'sett.'}` : 'N/D'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ORARIO DI L.</span>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{ricercaDetail.ricerca.orario_lavoro || 'Opzionale/Flessibile'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Facilità Ricerca:</span>
                    <StarRating 
                      maxStars={5}
                      value={ricercaDetail.ricerca.valutazione_facilita || 0}
                      onChange={async (newVal) => {
                        await fetch(`${API_BASE}/ricerche/${selectedRicercaId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ facilita: newVal })
                        });
                        fetchRicercaDetail(selectedRicercaId);
                      }}
                    />
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handlePrintTechnicalResearchReport}
                    style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}
                  >
                    📄 Report Tecnico (PDF)
                  </button>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handlePrintExecutiveReport}
                    style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}
                  >
                    👥 Relazione Direzionale (PDF)
                  </button>
                  {ricercaDetail.ricerca.stato_approvazione_tl === 'In Pausa' ? (
                    <button 
                      className="btn btn-success btn-sm" 
                      style={{ fontWeight: 'bold', marginRight: '8px' }}
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/ricerche/${selectedRicercaId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              stato_approvazione_tl: 'Approvata',
                              stato_ricerca: 'Ricerca Inserita'
                            })
                          });
                          const json = await res.json();
                          if (json.success) {
                            showStatus('success', 'Mandato Riattivato!', 'Il mandato è stato riattivato con successo.');
                            fetchRicercaDetail(selectedRicercaId);
                            fetchRicerche();
                          }
                        } catch (err) {
                          showStatus('error', 'Errore', err.message);
                        }
                      }}
                    >
                      ▶️ Riattiva Mandato
                    </button>
                  ) : (
                    ricercaDetail.ricerca.stato_approvazione_tl !== 'Cestinato' && (
                      <button 
                        className="btn btn-warning btn-sm" 
                        style={{ backgroundColor: '#D97706', color: '#fff', fontWeight: 'bold', marginRight: '8px' }}
                        onClick={async () => {
                          const reason = window.prompt("Inserisci la motivazione obbligatoria per mettere in pausa questo mandato:");
                          if (reason === null) return;
                          if (!reason.trim()) {
                            showStatus("error", "Errore", "La motivazione è obbligatoria per mettere in pausa il mandato.");
                            return;
                          }
                          try {
                            const res = await fetch(`${API_BASE}/ricerche/${selectedRicercaId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ 
                                stato_approvazione_tl: 'In Pausa',
                                motivazione: reason
                              })
                            });
                            const json = await res.json();
                            if (json.success) {
                              showStatus('success', 'Mandato in Pausa!', 'Il mandato è stato temporaneamente messo in pausa.');
                              fetchRicercaDetail(selectedRicercaId);
                              fetchRicerche();
                            }
                          } catch (err) {
                            showStatus('error', 'Errore', err.message);
                          }
                        }}
                      >
                        ⏸️ Metti in Pausa
                      </button>
                    )
                  )}
                  {ricercaDetail.ricerca.stato_approvazione_tl !== 'Cestinato' && (
                    <button 
                      className="btn btn-danger btn-sm" 
                      style={{ backgroundColor: '#EF4444', fontWeight: 'bold' }}
                      onClick={async () => {
                        const reason = window.prompt("Inserisci la motivazione obbligatoria per il cestinamento di questa ricerca:");
                        if (reason === null) return;
                        if (!reason.trim()) {
                          showStatus("error", "Errore", "La motivazione è obbligatoria per cestinare la ricerca.");
                          return;
                        }
                        try {
                          const res = await fetch(`${API_BASE}/ricerche/${selectedRicercaId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              stato_approvazione_tl: 'Cestinato',
                              motivazione: reason
                            })
                          });
                          const json = await res.json();
                          if (json.success) {
                            showStatus('success', 'Ricerca Cestinata!', 'La ricerca è stata spostata nei mandati Cestinati.');
                            setSelectedRicercaId(null);
                            setCurrentPage('cestinati');
                          }
                        } catch (err) {
                          showStatus('error', 'Errore', err.message);
                        }
                      }}
                    >
                      🗑️ Cestina Mandato
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="tab-nav">
                <button className={`tab-nav-btn ${activeTab === 'dati' ? 'active' : ''}`} onClick={() => setActiveTab('dati')}>📢 Annuncio</button>
                <button className={`tab-nav-btn ${activeTab === 'invio' ? 'active' : ''}`} onClick={() => setActiveTab('invio')}>👥 Candidati</button>
                <button className={`tab-nav-btn ${activeTab === 'colloquio' ? 'active' : ''}`} onClick={() => setActiveTab('colloquio')}>🗓️ Inserisci Colloquio</button>
                <button className={`tab-nav-btn ${activeTab === 'prova' ? 'active' : ''}`} onClick={() => setActiveTab('prova')}>🧪 Prove</button>
                <button className={`tab-nav-btn ${activeTab === 'assunzione' ? 'active' : ''}`} onClick={() => setActiveTab('assunzione')}>📄 Genera Assunzione</button>
                <button className={`tab-nav-btn ${activeTab === 'storico' ? 'active' : ''}`} onClick={() => setActiveTab('storico')}>📜 Storico Mandato</button>
                <button className={`tab-nav-btn ${activeTab === 'note_ricerca' ? 'active' : ''}`} onClick={() => setActiveTab('note_ricerca')}>📝 Note Ricerca</button>
              </div>

              {/* Tab Panels */}
              <div style={{ flexGrow: 1, overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px' }}>
                
                {/* TAB 1: DATI ANNUNCIO */}
                {activeTab === 'dati' && (
                  <>
                    {/* LISTA ANNUNCI E FORM NUOVO INSERIMENTO */}
                    <div>
                      {/* Modal Form Nuovo Annuncio */}
                      {showNewAnnuncioFormModal && (
                        <div className="modal-overlay" style={{ zIndex: 1100 }}>
                          <div className="modal-container" style={{ maxWidth: '600px', width: '95%' }}>
                            <div className="modal-header flex-between-center">
                              <h2 style={{ margin: 0 }}>➕ Pubblica Nuovo Annuncio</h2>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewAnnuncioFormModal(false)}>✕</button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px' }}>
                              <form onSubmit={(e) => { e.preventDefault(); handleSaveAnnuncio(e); setShowNewAnnuncioFormModal(false); }} className="flex-col-gap-16">
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label>Testo dell'Annuncio di Lavoro *</label>
                                  <textarea 
                                    name="testo_annuncio" 
                                    className="form-control" 
                                    required
                                    placeholder="Inserisci il testo completo dell'annuncio..."
                                    style={{ minHeight: '100px' }}
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label>Mansione dell'Annuncio *</label>
                                    <input 
                                      type="text" 
                                      name="mansione" 
                                      className="form-control" 
                                      required
                                      placeholder="Es: Sviluppatore React, Addetto Vendite..."
                                    />
                                  </div>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label>Zona di Lavoro *</label>
                                    <input 
                                      type="text" 
                                      name="zona" 
                                      className="form-control" 
                                      required
                                      placeholder="Es: Milano (MI), Bergamo..."
                                    />
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label>Portali Pubblicazione (separati da virgola)</label>
                                    <input 
                                      type="text" 
                                      name="portali_annuncio" 
                                      className="form-control" 
                                      placeholder="Es: Indeed, Subito.it, LinkedIn"
                                    />
                                  </div>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label>Link Annuncio Web *</label>
                                    <input 
                                      type="text" 
                                      name="link_annuncio" 
                                      className="form-control" 
                                      required
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                  <div className="form-group" style={{ margin: 0 }}>
                                    <label>Data Pubblicazione Annuncio *</label>
                                    <input 
                                      type="date" 
                                      name="data_inserimento_annuncio" 
                                      className="form-control" 
                                      required
                                    />
                                  </div>

                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label>Note dell'Annuncio (Opzionali)</label>
                                  <textarea 
                                    name="note" 
                                    className="form-control" 
                                    placeholder="Note interne, feedback o accordi per l'annuncio..."
                                    style={{ minHeight: '60px' }}
                                  />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                                  <button type="button" className="btn btn-secondary" onClick={() => setShowNewAnnuncioFormModal(false)}>Annulla</button>
                                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>💾 Salva Annuncio</button>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      )}

                      {showLinkAnnuncioModal && (
                        <div className="modal-overlay" style={{ zIndex: 1100 }}>
                          <div className="modal-container" style={{ maxWidth: '700px', width: '95%', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div className="modal-header flex-between-center">
                              <h2 style={{ margin: 0 }}>🔗 Collega Annuncio Esistente</h2>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowLinkAnnuncioModal(false)}>✕</button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px' }}>
                              <p>Seleziona un annuncio dalla bacheca globale da collegare a questo mandato:</p>
                              {annunciGlobali && annunciGlobali.length > 0 ? (
                                <table className="data-table" style={{ width: '100%', marginTop: '10px' }}>
                                  <thead>
                                    <tr>
                                      <th>Mansione / Zona</th>
                                      <th>Stato</th>
                                      <th>Azioni</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {annunciGlobali.map(a => {
                                      // Controlla se è già collegato
                                      const isLinked = annunci.some(linkedAnn => linkedAnn.id === a.id);
                                      return (
                                        <tr key={a.id}>
                                          <td>
                                            <strong>{a.mansione || 'N/D'} ({a.zona || 'N/D'})</strong>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Portali: {a.portali_annuncio || 'N/D'}</div>
                                            <small>{a.testo_annuncio ? a.testo_annuncio.substring(0,30)+'...' : ''}</small>
                                          </td>
                                          <td><span className={`badge ${a.stato_annuncio === 'Attivo' ? 'badge-success' : 'badge-secondary'}`}>{a.stato_annuncio}</span></td>
                                          <td style={{ textAlign: 'right' }}>
                                            {isLinked ? (
                                              <span style={{ color: 'var(--success)' }}>✓ Già collegato</span>
                                            ) : (
                                              <button className="btn btn-primary btn-sm" onClick={() => {
                                                handleLinkAnnuncio(a.id);
                                                setShowLinkAnnuncioModal(false);
                                              }}>Collega</button>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <p>Nessun annuncio disponibile nella bacheca globale.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tabella degli Annunci Salvati */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>📋 Annunci Collegati</h3>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowLinkAnnuncioModal(true)}>
                              🔗 Collega Annuncio Esistente
                            </button>
                          </div>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Mansione / Zona</th>
                                  <th>Link Annuncio</th>
                                  <th>Pubblicazione</th>
                                  <th>Giorni Online</th>
                                  <th>Stato</th>
                                  <th style={{ textAlign: 'center' }}>Azioni</th>
                                </tr>
                              </thead>
                              <tbody>
                                {annunci.map(ann => {
                                  const expInfo = getAdActiveDaysInfo(ann.data_inserimento_annuncio, ann.stato_annuncio);
                                  return (
                                    <tr key={ann.id}>
                                      <td>
                                        <strong>{ann.mansione || 'N/D'} ({ann.zona || 'N/D'})</strong>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Portali: {ann.portali_annuncio || 'N/D'}</div>
                                      </td>
                                      <td><a href={ann.link_annuncio} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{ann.link_annuncio}</a></td>
                                      <td>{ann.data_inserimento_annuncio ? new Date(ann.data_inserimento_annuncio).toLocaleDateString('it-IT') : 'N/D'}</td>
                                      <td style={{ color: expInfo.color, fontWeight: 700 }}>{expInfo.text}</td>
                                      <td>
                                        <span className={`badge ${ann.stato_annuncio === 'Disattivato' ? 'badge-danger' : 'badge-success'}`}>
                                          {ann.stato_annuncio || 'Attivo'}
                                        </span>
                                      </td>
                                      <td>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                          <button 
                                            className="btn btn-secondary btn-sm" 
                                            onClick={() => {
                                              handleUnlinkAnnuncio(ann.id);
                                            }}
                                          >
                                            🔌 Scollega
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {annunci.length === 0 && (
                                  <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun annuncio pubblicato per questa ricerca.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Log Attività Annunci</h3>
                          <TimelineComponent idRicerca={selectedRicercaId} reloadTrigger={ricercaDetail} timeline={timeline} setTimeline={setTimeline} API_BASE={API_BASE} handlePrintTimelineReport={handlePrintTimelineReport} />
                        </div>
                      </div>
                  </>
                )}

                {/* TAB 2: CANDIDATI */}
                {activeTab === 'invio' && (
                  <div>
                    <div>
                        {/* Modal Inserimento Candidato */}
                        {showNewCandidatoPipelineModal && (
                          <div className="modal-overlay" style={{ zIndex: 1100 }}>
                            <div className="modal-container" style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                              <div className="modal-header flex-between-center">
                                <h2 style={{ margin: 0 }}>➕ Inserisci Candidato nel Mandato</h2>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewCandidatoPipelineModal(false)}>✕</button>
                              </div>
                              <div className="modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                
                                {/* DIPENDENTI AFFINI (<50km) SECTION */}
                                {getAffinedCandidati().length > 0 && (
                                  <div style={{
                                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    marginBottom: '10px'
                                  }}>
                                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', marginTop: 0 }}>
                                      👥 Dipendenti/Candidati Affini Consigliati per Settore &amp; Zona (&lt; 50 KM)
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {getAffinedCandidati().slice(0, 5).map(cand => (
                                        <div key={cand.id} style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          backgroundColor: 'var(--bg-secondary)',
                                          padding: '8px 12px',
                                          borderRadius: '6px',
                                          border: '1px solid var(--border)'
                                        }}>
                                          <div style={{ fontSize: '13px' }}>
                                            <strong>{cand.cognome} {cand.nome}</strong> 
                                            <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '11px' }}>
                                              ({cand.residenza.split(',')[1] || cand.residenza})
                                            </span>
                                            <div style={{ marginTop: '2px' }}>
                                              {renderCandidateStars(cand.punteggio_complessivo, () => handleOpenValutazione(cand.id, `${cand.cognome} ${cand.nome}`))}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                              🎯 Mansione: {cand.competenze_chiave} | 🏢 Settore: {cand.settore || 'N/D'} | 🚗 Distanza stimata: <strong>{cand.distance} km</strong>
                                            </div>
                                          </div>
                                          <button 
                                            className="btn btn-primary btn-sm" 
                                            style={{ padding: '4px 10px', fontSize: '12px' }}
                                            onClick={() => { handleLinkCandidatoToRicerca(cand.id); setShowNewCandidatoPipelineModal(false); }}
                                          >
                                            🔗 Collega Subito
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Sezione Modulo di Inserimento */}
                                <div className="card-box" style={{ padding: '20px', border: '1px solid var(--border)' }}>
                                  {/* Pulsanti Tipo Inserimento */}
                                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <button
                                      type="button"
                                      className={`btn ${!isNewCandidate ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                      onClick={() => setIsNewCandidate(false)}
                                    >
                                      📂 Associa Candidato Esistente
                                    </button>
                                    <button
                                      type="button"
                                      className={`btn ${isNewCandidate ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                      onClick={() => setIsNewCandidate(true)}
                                    >
                                      ➕ Crea Nuovo e Collega
                                    </button>
                                  </div>

                                  <form onSubmit={(e) => { e.preventDefault(); handleInsertCandidate(e); setShowNewCandidatoPipelineModal(false); }} className="flex-col-gap-16">
                                    {!isNewCandidate ? (
                                      <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '13px' }}>Seleziona Candidato dal Database</label>
                                        <select className="form-control" name="id_candidato" required style={{ maxWidth: '400px' }}>
                                          <option value="">-- Seleziona un candidato --</option>
                                          {candidati
                                            .filter(cand => !ricercaDetail.candidatiCollegati.some(cc => cc.idCandidato === cand.id))
                                            .map(cand => (
                                              <option key={cand.id} value={cand.id}>
                                                {cand.cognome} {cand.nome} ({cand.competenze_chiave || 'N/D'} - {cand.settore || 'N/D'})
                                              </option>
                                            ))
                                          }
                                        </select>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>Cognome *</label>
                                          <input type="text" className="form-control" name="cognome" required placeholder="Cognome" />
                                        </div>
                                        <div className="form-group">
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>Nome *</label>
                                          <input type="text" className="form-control" name="nome" required placeholder="Nome" />
                                        </div>
                                        <div className="form-group">
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>Telefono *</label>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="text" className="form-control" name="telefono" id="new_cand_telefono" required placeholder="Telefono" />
                                            <button 
                                              type="button" 
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => {
                                                const el = document.getElementById('new_cand_telefono');
                                                if (el) el.value = 'Non presente';
                                              }}
                                              style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
                                            >
                                              Non presente
                                            </button>
                                          </div>
                                        </div>
                                        <div className="form-group">
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>Email *</label>
                                          <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="text" className="form-control" name="email" id="new_cand_email" required placeholder="Email" />
                                            <button 
                                              type="button" 
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => {
                                                const el = document.getElementById('new_cand_email');
                                                if (el) el.value = 'Non presente';
                                              }}
                                              style={{ whiteSpace: 'nowrap', fontSize: '12px' }}
                                            >
                                              Non presente
                                            </button>
                                          </div>
                                        </div>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>Residenza (Indirizzo Completo per il CAP) *</label>
                                          <input type="text" className="form-control" name="residenza" required placeholder="Es: Via Roma 1, 20121 Milano" />
                                        </div>
                                        <div className="form-group">
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>Mansione *</label>
                                          <input type="text" className="form-control" name="competenze_chiave" required placeholder="Es: Lavapiatti, Autista, ecc." />
                                        </div>
                                        <div className="form-group">
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>Settore *</label>
                                          <input type="text" className="form-control" name="settore" required placeholder="Es: Ristorazione, Logistica, ecc." />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                          <label style={{ fontWeight: 600, fontSize: '13px' }}>File del CV</label>
                                          <input type="file" className="form-control" name="cvFile" accept=".pdf,.doc,.docx" />
                                        </div>
                                      </div>
                                    )}

                                    {/* Scelta se inviato o meno al cliente */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                      <label style={{ fontSize: '13px', fontWeight: 600 }}>Stato invio CV al cliente *</label>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                          type="button"
                                          className={`btn ${cvSentToggle ? 'btn-success' : 'btn-secondary'} btn-sm`}
                                          onClick={() => setCvSentToggle(true)}
                                          style={{ padding: '6px 16px', fontWeight: 700 }}
                                        >
                                          Sì (Inviato)
                                        </button>
                                        <button
                                          type="button"
                                          className={`btn ${!cvSentToggle ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                                          onClick={() => setCvSentToggle(false)}
                                          style={{ padding: '6px 16px', fontWeight: 700 }}
                                        >
                                          No (Non Inviato)
                                        </button>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                                      <button type="button" className="btn btn-secondary" onClick={() => setShowNewCandidatoPipelineModal(false)}>Chiudi</button>
                                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>💾 Salva Candidato</button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Elenco dei Candidati Inseriti */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>📋 Candidati Presentati</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowNewCandidatoPipelineModal(true)}>
                              ➕ Inserisci Nuovo Candidato
                            </button>
                          </div>
                          <div className="table-container">
                            <table className="data-table">
                              <thead>
                                <tr>
                                  <th>Candidato</th>
                                  <th>Contatti</th>
                                  <th>Inviato Cliente</th>
                                  <th>Stato Feedback</th>
                                  <th style={{ textAlign: 'center' }}>Azioni</th>
                                </tr>
                              </thead>
                              <tbody>
                                {ricercaDetail.candidatiCollegati.map(c => {
                                  const feedColor = c.feedbackStato === 'Feedback Positivo' ? '#10b981'
                                                    : c.feedbackStato === 'Feedback Negativo' ? '#ef4444'
                                                    : '#f59e0b';
                                  return (
                                    <tr key={c.idCandidato} onClick={() => setSelectedPipeCand(c)} style={{ cursor: 'pointer' }}>
                                      <td>
                                        <strong 
                                          onClick={(e) => { e.stopPropagation(); handleOpenValutazione(c.idCandidato, c.nomeCompleto); }} 
                                          style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                                        >
                                          {c.nomeCompleto}
                                        </strong>
                                        <div style={{ marginTop: '4px' }}>
                                          {renderCandidateStars(c.punteggioComplessivo, () => handleOpenValutazione(c.idCandidato, c.nomeCompleto))}
                                        </div>
                                      </td>
                                      <td>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                          {c.telefono || 'N/D'} | {c.email || 'N/D'}
                                        </span>
                                      </td>
                                      <td>
                                        <span className={`badge ${c.inviatoCliente === 1 ? 'badge-success' : 'badge-danger'}`}>
                                          {c.inviatoCliente === 1 ? 'Sì' : 'No'}
                                        </span>
                                      </td>
                                      <td>
                                        <span style={{ 
                                          display: 'inline-block',
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          fontSize: '11px',
                                          fontWeight: 800,
                                          backgroundColor: `${feedColor}20`,
                                          color: feedColor
                                        }}>
                                          {c.feedbackStato || 'In attesa'}
                                        </span>
                                      </td>
                                      <td>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                          <button 
                                            className="btn btn-secondary btn-sm" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedPipeCand(c);
                                            }}
                                          >
                                            ⚙️ Gestisci
                                          </button>
                                          <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); openEmailPreview(c); }} title="Invia Email">
                                            📧 Email
                                          </button>
                                          <button className="btn btn-success btn-sm" style={{ padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); handleSendWA(c); }} title="Invia WhatsApp">
                                            💬 WA
                                          </button>
                                          <button 
                                            className="btn btn-danger btn-sm" 
                                            style={{ padding: '4px 8px' }}
                                            onClick={(e) => { e.stopPropagation(); handleUnlinkCandidate(c.idAssunzione); }}
                                            title="Separa da questa ricerca"
                                          >
                                            Separa
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {ricercaDetail.candidatiCollegati.length === 0 && (
                                  <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun candidato inserito in questa ricerca.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Log Attività Candidati</h3>
                          <TimelineComponent idRicerca={selectedRicercaId} reloadTrigger={ricercaDetail} timeline={timeline} setTimeline={setTimeline} API_BASE={API_BASE} handlePrintTimelineReport={handlePrintTimelineReport} />
                        </div>
                      </div>

                      {selectedPipeCand && (
                        <div className="modal-overlay" style={{ zIndex: 1200, padding: '20px' }}>
                          <div className="modal-container" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header flex-between-center">
                              <h2 style={{ margin: 0 }}>Gestione Candidato: {selectedPipeCand.nomeCompleto}</h2>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedPipeCand(null)}>✕</button>
                            </div>
                            <div className="modal-body" style={{ padding: '24px' }}>
                              {/* GESTIONE DETTAGLIO SINGOLO CANDIDATO NELLA PIPELINE */}

                        <div className="card-box" style={{ padding: '24px', marginBottom: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                              👤 Gestione Candidato: <span style={{ color: 'var(--primary)' }}>{selectedPipeCand.nomeCompleto}</span>
                              <div style={{ marginTop: '6px' }}>
                                {renderCandidateStars(selectedPipeCand.punteggioComplessivo, () => handleOpenValutazione(selectedPipeCand.idCandidato, selectedPipeCand.nomeCompleto))}
                              </div>
                            </h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleOpenValutazione(selectedPipeCand.idCandidato, selectedPipeCand.nomeCompleto)}
                              >
                                📋 Compila Valutazione
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleUnlinkCandidate(selectedPipeCand.idAssunzione)}
                              >
                                🗑️ Separa da Ricerca
                              </button>
                            </div>
                          </div>

                          {/* Dettagli info anagrafiche */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Telefono</span>
                              <div style={{ fontWeight: 600 }}>{selectedPipeCand.telefono || 'N/D'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email</span>
                              <div style={{ fontWeight: 600 }}>{selectedPipeCand.email || 'N/D'}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Curriculum Vitae</span>
                              <div>
                                {selectedPipeCand.linkCV ? (
                                  <a href={`${API_BASE.replace('/api', '')}${selectedPipeCand.linkCV}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
                                    📄 Apri CV
                                  </a>
                                ) : 'Nessun CV caricato'}
                              </div>
                            </div>
                          </div>

                          {/* Sezione Stato Feedback ed Esiti */}
                          <div style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            border: '1px solid var(--border)', 
                            padding: '16px', 
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '24px'
                          }}>
                            <div className="flex-between-center">
                              <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Stato Feedback Corrente:</span>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                                  {selectedPipeCand.feedbackStato || 'In attesa di feedback'}
                                </div>
                              </div>
                              <span className={`badge ${selectedPipeCand.inviatoCliente === 1 ? 'badge-success' : 'badge-danger'}`}>
                                {selectedPipeCand.inviatoCliente === 1 ? 'CV Inviato al Cliente' : 'CV Non Inviato'}
                              </span>
                            </div>

                            {/* Modifica Stato Invio */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>Modifica Stato Invio:</span>
                              <button
                                type="button"
                                className={`btn ${selectedPipeCand.inviatoCliente === 1 ? 'btn-success' : 'btn-secondary'} btn-xs`}
                                onClick={() => handleToggleInviatoStatus(1)}
                              >
                                Sì (Inviato)
                              </button>
                              <button
                                type="button"
                                className={`btn ${selectedPipeCand.inviatoCliente !== 1 ? 'btn-danger' : 'btn-secondary'} btn-xs`}
                                onClick={() => handleToggleInviatoStatus(0)}
                              >
                                No (Non Inviato)
                              </button>
                            </div>

                            {selectedPipeCand.feedbackNote && (
                              <div style={{ fontSize: '13px', borderLeft: '3px solid var(--primary)', paddingLeft: '10px', marginTop: '4px' }}>
                                <strong>Note/Motivazione:</strong> {selectedPipeCand.feedbackNote}
                              </div>
                            )}

                            {/* Pulsanti per il cambio di stato */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                              <button 
                                className="btn btn-success" 
                                onClick={() => setShowFeedbackModal({ type: 'Positivo', pipe: selectedPipeCand })}
                              >
                                ✔️ Feedback Positivo
                              </button>
                              <button 
                                className="btn btn-danger" 
                                onClick={() => setShowFeedbackModal({ type: 'Negativo', pipe: selectedPipeCand })}
                              >
                                ❌ Feedback Negativo
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Report Storico delle Azioni Stampabile */}
                        <div className="card-box" style={{ padding: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>📋 Storico Azioni Candidato in questa Ricerca</h3>
                            <button className="btn btn-secondary btn-sm" onClick={handlePrintTechnicalReport}>
                              🖨️ Stampa Report PDF
                            </button>
                          </div>

                          <div id="pipe-cand-timeline-report">
                            <h2>Report Storico Attività Candidato</h2>
                            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Candidato:</strong> {selectedPipeCand.nomeCompleto}</p>
                            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Azienda Mandataria:</strong> {ricercaDetail.ricerca.azienda} ({ricercaDetail.ricerca.ruolo})</p>
                            
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Data e Ora</th>
                                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Azione</th>
                                  <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Dettagli / Motivazioni</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pipeCandTimeline.map(log => (
                                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '8px', fontSize: '12px' }}>{log.dataStr}</td>
                                    <td style={{ padding: '8px', fontSize: '12px' }}><strong>{log.attivita}</strong></td>
                                    <td style={{ padding: '8px', fontSize: '12px' }}>{log.dettagli}</td>
                                  </tr>
                                ))}
                                {pipeCandTimeline.length === 0 && (
                                  <tr>
                                    <td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>Nessuna azione storicizzata per questo candidato.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                
                {activeTab === 'colloquio' && (
                  <div>
                    {/* STATE 1: LISTA E NUOVO INSERIMENTO */}
                      <div>
                        {/* Modal Programmazione Colloquio */}
                        {showNewInterviewFormModal && (
                          <div className="modal-overlay" style={{ zIndex: 1100 }}>
                            <div className="modal-container" style={{ maxWidth: '700px', width: '95%' }}>
                              <div className="modal-header flex-between-center">
                                <h2 style={{ margin: 0 }}>📅 Programma Nuovo Colloquio</h2>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewInterviewFormModal(false)}>✕</button>
                              </div>
                              <div className="modal-body" style={{ padding: '20px' }}>
                                <form onSubmit={(e) => { e.preventDefault(); handleScheduleInterview(e); setShowNewInterviewFormModal(false); }} className="flex-col-gap-16">
                                  <div className="grid-2-cols">
                                    <div className="form-group">
                                      <label>Seleziona Candidato *</label>
                                      <select name="id_candidato" className="form-control" required>
                                        <option value="">-- Seleziona candidato --</option>
                                        <optgroup label="Candidati già collegati a questa ricerca">
                                          {ricercaDetail.candidatiCollegati.map(c => (
                                            <option key={c.idCandidato} value={c.idCandidato}>{c.nomeCompleto} {c.punteggioComplessivo !== null && c.punteggioComplessivo !== undefined ? `(${c.punteggioComplessivo}/100)` : '(Non valutato)'} (Già Collegato)</option>
                                          ))}
                                        </optgroup>
                                        <optgroup label="Altri candidati esterni nel database">
                                          {candidati
                                            .filter(c => !ricercaDetail.candidatiCollegati.some(cc => cc.idCandidato === c.id))
                                            .map(c => (
                                              <option key={c.id} value={c.id}>{c.cognome} {c.nome} {c.punteggio_complessivo !== null && c.punteggio_complessivo !== undefined ? `(${c.punteggio_complessivo}/100)` : '(Non valutato)'} (Esterno - Verrà collegato)</option>
                                            ))
                                          }
                                        </optgroup>
                                      </select>
                                    </div>
                                    <div className="form-group">
                                      <label>Tipo di Colloquio</label>
                                      <select name="tipo" className="form-control" defaultValue="In presenza" required>
                                        <option value="In presenza">In presenza</option>
                                        <option value="Video chiamata">Video chiamata</option>
                                        <option value="Telefonico">Telefonico</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                      <label>Data *</label>
                                      <input type="date" name="data" className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                      <label>Ora *</label>
                                      <input type="time" name="ora" className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                      <label>Luogo</label>
                                      <select name="luogo" className="form-control" required>
                                        <option value="Presso nostra sede">Presso nostra sede</option>
                                        <option value="Presso cliente">Presso cliente</option>
                                        <option value="Online / Video Call">Online / Video Call</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="form-group">
                                    <label>Note / Dettagli Colloquio</label>
                                    <textarea name="note" className="form-control" placeholder="Inserisci note aggiuntive o dettagli sul colloquio..." />
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowNewInterviewFormModal(false)}>Annulla</button>
                                    <button type="submit" className="btn btn-primary">📅 Salva Appuntamento</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lista Colloqui Programmati */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>📋 Colloqui Programmati</h3>
                          <button className="btn btn-primary btn-sm" onClick={() => setShowNewInterviewFormModal(true)}>
                            ➕ Programma Nuovo Colloquio
                          </button>
                        </div>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Candidato</th>
                                <th>Data/Ora</th>
                                <th>Tempistica</th>
                                <th>Tipo & Luogo</th>
                                <th>Stato</th>
                                <th style={{ textAlign: 'center' }}>Azione</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ricercaDetail.appuntamenti.map(a => {
                                // Calculate countdown days dynamically
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const appDate = new Date(a.data);
                                appDate.setHours(0,0,0,0);

                                let tempisticaStr = '';
                                let tempisticaColor = 'var(--text-secondary)';

                                if (appDate.getTime() === today.getTime()) {
                                  tempisticaStr = 'Oggi';
                                  tempisticaColor = '#f59e0b';
                                } else if (appDate > today) {
                                  const diffDays = Math.ceil((appDate - today) / (1000 * 60 * 60 * 24));
                                  tempisticaStr = `Tra ${diffDays} giorn${diffDays === 1 ? 'o' : 'i'}`;
                                } else {
                                  const diffDays = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
                                  tempisticaStr = `⚠️ Scaduto da ${diffDays} giorn${diffDays === 1 ? 'o' : 'i'} - da aggiornare`;
                                  tempisticaColor = '#ef4444';
                                }

                                return (
                                  <tr key={a.id} onClick={() => setSelectedInterviewForManagement(a)} style={{ cursor: 'pointer' }}>
                                    <td>
                                      <strong 
                                        onClick={(e) => { e.stopPropagation(); handleOpenValutazione(a.idCandidato, a.candidato); }} 
                                        style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                                      >
                                        {a.candidato}
                                      </strong>
                                      <div style={{ marginTop: '4px' }}>
                                        {renderCandidateStars(a.punteggioComplessivo, () => handleOpenValutazione(a.idCandidato, a.candidato))}
                                      </div>
                                    </td>
                                    <td>{a.data} alle {a.ora}</td>
                                    <td>
                                      <span style={{ fontWeight: 600, color: tempisticaColor }}>
                                        {tempisticaStr}
                                      </span>
                                    </td>
                                    <td>
                                      <span style={{ fontSize: '12px' }}>
                                        {a.tipo} | <em>{a.luogo || 'N/D'}</em>
                                      </span>
                                    </td>
                                    <td>
                                      <span className="badge" style={{
                                        fontWeight: 800,
                                        backgroundColor: a.stato === 'Eseguito' ? 'rgba(16,185,129,0.15)'
                                                        : a.stato === 'Annullato' ? 'rgba(239,68,68,0.15)'
                                                        : a.stato === 'Non Presentato' ? 'rgba(74,85,104,0.15)'
                                                        : 'rgba(245,158,11,0.15)',
                                        color: a.stato === 'Eseguito' ? '#10b981'
                                               : a.stato === 'Annullato' ? '#ef4444'
                                               : a.stato === 'Non Presentato' ? '#4a5568'
                                               : '#f59e0b'
                                      }}>
                                        {a.stato}
                                      </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => { e.stopPropagation(); setSelectedInterviewForManagement(a); }}
                                        style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      >
                                        ⚙️ Gestisci
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                              {ricercaDetail.appuntamenti.length === 0 && (
                                <tr>
                                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                                    Nessun colloquio programmato per questa ricerca.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div style={{ marginTop: '32px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Log Attività Colloqui</h3>
                        <TimelineComponent idRicerca={selectedRicercaId} reloadTrigger={ricercaDetail} timeline={timeline} setTimeline={setTimeline} API_BASE={API_BASE} handlePrintTimelineReport={handlePrintTimelineReport} />
                      </div>
                    </div>
                  )}

                
                {activeTab === 'prova' && (
                  <div>
                    {/* STATE 1: LISTA E NUOVO INSERIMENTO */}
                      <div>
                        {/* Modal Programmazione Prova */}
                        {showNewTrialFormModal && (
                          <div className="modal-overlay" style={{ zIndex: 1100 }}>
                            <div className="modal-container" style={{ maxWidth: '700px', width: '95%' }}>
                              <div className="modal-header flex-between-center">
                                <h2 style={{ margin: 0 }}>➕ Avvia prova presso cliente</h2>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewTrialFormModal(false)}>✕</button>
                              </div>
                              <div className="modal-body" style={{ padding: '20px' }}>
                                <form onSubmit={(e) => { e.preventDefault(); handleStartTrial(e); setShowNewTrialFormModal(false); }} className="flex-col-gap-16">
                                  <div className="grid-2-cols">
                                    <div className="form-group">
                                      <label>Seleziona Candidato *</label>
                                      <select name="id_candidato" className="form-control" required>
                                        <option value="">-- Seleziona candidato --</option>
                                        <optgroup label="Candidati già collegati a questa ricerca">
                                          {ricercaDetail.candidatiCollegati.map(c => (
                                            <option key={c.idCandidato} value={c.idCandidato}>{c.nomeCompleto} {c.punteggioComplessivo !== null && c.punteggioComplessivo !== undefined ? `(${c.punteggioComplessivo}/100)` : '(Non valutato)'} (Già Collegato)</option>
                                          ))}
                                        </optgroup>
                                        <optgroup label="Altri candidati esterni nel database">
                                          {candidati
                                            .filter(c => !ricercaDetail.candidatiCollegati.some(cc => cc.idCandidato === c.id))
                                            .map(c => (
                                              <option key={c.id} value={c.id}>{c.cognome} {c.nome} {c.punteggio_complessivo !== null && c.punteggio_complessivo !== undefined ? `(${c.punteggio_complessivo}/100)` : '(Non valutato)'} (Esterno - Verrà collegato)</option>
                                            ))
                                          }
                                        </optgroup>
                                      </select>
                                    </div>
                                    <div className="form-group">
                                      <label>Prova contrattualizzata? *</label>
                                      <select name="prova_contrattualizzata" className="form-control" defaultValue="NO" required>
                                        <option value="SI">SÌ</option>
                                        <option value="NO">NO</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="grid-2-cols">
                                    <div className="form-group">
                                      <label>Data Inizio Prova *</label>
                                      <input type="date" name="data_inizio_prova" className="form-control" required />
                                    </div>
                                    <div className="form-group">
                                      <label>Data Scadenza Prova *</label>
                                      <input type="date" name="data_scadenza_prova" className="form-control" required />
                                    </div>
                                  </div>

                                  <div className="form-group">
                                    <label>Note Amministrazione / Note Accordo</label>
                                    <textarea name="note" className="form-control" placeholder="Es: Prova retribuita 8€/ora, rimborso spese, note orari..." />
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowNewTrialFormModal(false)}>Annulla</button>
                                    <button type="submit" className="btn btn-warning" style={{ fontWeight: 700 }}>🧪 Avvia Periodo Prova</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lista Prove Programmate o Effettuate */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>📋 Prove in corso o effettuate</h3>
                          <button className="btn btn-primary btn-sm" onClick={() => setShowNewTrialFormModal(true)}>
                            ➕ Avvia Nuova Prova
                          </button>
                        </div>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Candidato</th>
                                <th>Data Inizio</th>
                                <th>Data Scadenza</th>
                                <th>Contrattualizzata</th>
                                <th>Stato Prova</th>
                                <th style={{ textAlign: 'center' }}>Azione</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ricercaDetail.candidatiCollegati
                                .filter(c => c.statoAvanzamento === 'In Prova' || c.statoProva || c.dataInizioProva)
                                .map(c => {
                                  // Compute trial state dynamically
                                  const today = new Date();
                                  today.setHours(0,0,0,0);
                                  const start = c.dataInizioProva ? new Date(c.dataInizioProva) : null;
                                  if (start) start.setHours(0,0,0,0);
                                  const end = c.dataScadenzaProva ? new Date(c.dataScadenzaProva) : null;
                                  if (end) end.setHours(0,0,0,0);

                                  let computedStatus = 'In Corso';
                                  let statusColor = '#f59e0b';
                                  let bgColor = 'rgba(245,158,11,0.15)';

                                  if (c.statoProva === 'Prova Superata') {
                                    computedStatus = 'Superata';
                                    statusColor = '#10b981';
                                    bgColor = 'rgba(16,185,129,0.15)';
                                  } else if (c.statoProva === 'Prova Non Superata') {
                                    computedStatus = 'Non Superata';
                                    statusColor = '#ef4444';
                                    bgColor = 'rgba(239,68,68,0.15)';
                                  } else if (c.statoProva === 'Interrotta') {
                                    computedStatus = 'Interrotta';
                                    statusColor = '#ef4444';
                                    bgColor = 'rgba(239,68,68,0.15)';
                                  } else {
                                    // Not decided yet
                                    if (start && today < start) {
                                      computedStatus = 'Da effettuare';
                                      statusColor = '#718096';
                                      bgColor = 'rgba(113,128,150,0.15)';
                                    } else if (end && today > end) {
                                      computedStatus = 'Terminata da reportare';
                                      statusColor = '#e53e3e';
                                      bgColor = 'rgba(229,62,62,0.15)';
                                    }
                                  }

                                  return (
                                    <tr key={c.idCandidato} onClick={() => handleOpenHiringForm(c)} style={{ cursor: 'pointer' }}>
                                      <td>
                                        <strong 
                                       onClick={(e) => { e.stopPropagation(); handleOpenValutazione(c.idCandidato, c.nomeCompleto); }} 
                                       style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                                     >
                                       {c.nomeCompleto}
                                     </strong>
                                        <div style={{ marginTop: '4px' }}>
                                          {renderCandidateStars(c.punteggioComplessivo, () => handleOpenValutazione(c.idCandidato, c.nomeCompleto))}
                                        </div>
                                      </td>
                                      <td>{c.dataInizioProva || 'N/D'}</td>
                                      <td>{c.dataScadenzaProva || 'N/D'}</td>
                                      <td>
                                        <span className="badge" style={{
                                          fontWeight: 800,
                                          backgroundColor: c.provaContrattualizzata === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(74,85,104,0.15)',
                                          color: c.provaContrattualizzata === 1 ? '#10b981' : '#4a5568'
                                        }}>
                                          {c.provaContrattualizzata === 1 ? 'SÌ' : 'NO'}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="badge" style={{
                                          fontWeight: 800,
                                          backgroundColor: bgColor,
                                          color: statusColor
                                        }}>
                                          {computedStatus}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <button
                                          type="button"
                                          className="btn btn-secondary btn-sm"
                                          onClick={(e) => { e.stopPropagation(); setSelectedTrialForManagement(c); }}
                                          style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        >
                                          ⚙️ Gestisci
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              {ricercaDetail.candidatiCollegati.filter(c => c.statoAvanzamento === 'In Prova' || c.statoProva || c.dataInizioProva).length === 0 && (
                                <tr>
                                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                                    Nessun periodo di prova registrato per questa ricerca.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div style={{ marginTop: '32px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Log Attività Prove</h3>
                        <TimelineComponent idRicerca={selectedRicercaId} reloadTrigger={ricercaDetail} timeline={timeline} setTimeline={setTimeline} API_BASE={API_BASE} handlePrintTimelineReport={handlePrintTimelineReport} />
                      </div>
                    </div>
                  )}




                {/* TAB 5: GENERA ASSUNZIONE */}
                {activeTab === 'assunzione' && (
                  <div>
                      <div>
                        {/* Modal Seleziona Candidato per Assunzione */}
                        {showNewAssunzioneModal && (
                          <div className="modal-overlay" style={{ zIndex: 1100 }}>
                            <div className="modal-container" style={{ maxWidth: '600px', width: '95%' }}>
                              <div className="modal-header flex-between-center">
                                <h2 style={{ margin: 0 }}>➕ Nuova Assunzione per il Mandato</h2>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewAssunzioneModal(false)}>✕</button>
                              </div>
                              <div className="modal-body" style={{ padding: '20px' }}>
                                <div className="form-group">
                                  <label style={{ fontWeight: 600, fontSize: '13px' }}>Seleziona Candidato dal Database *</label>
                                  <select id="select_new_hiring_candidate" className="form-control" required style={{ width: '100%', marginTop: '8px' }}>
                                    <option value="">-- Seleziona candidato --</option>
                                    <optgroup label="Candidati collegati a questa ricerca">
                                      {(ricercaDetail.candidatiCollegati || [])
                                        .filter(cc => cc.statoAvanzamento !== 'Approvato/Assunto')
                                        .map(cc => (
                                          <option key={cc.idCandidato} value={`${cc.idCandidato}|${cc.nomeCompleto}`}>
                                            {cc.nomeCompleto} ({cc.statoAvanzamento})
                                          </option>
                                        ))
                                      }
                                    </optgroup>
                                    <optgroup label="Candidati esterni nel database">
                                      {candidati
                                        .filter(cand => !(ricercaDetail.candidatiCollegati || []).some(cc => cc.idCandidato === cand.id))
                                        .map(cand => (
                                          <option key={cand.id} value={`${cand.id}|${cand.cognome} ${cand.nome}`}>
                                            {cand.cognome} {cand.nome} ({cand.competenze_chiave || 'N/D'})
                                          </option>
                                        ))
                                      }
                                    </optgroup>
                                  </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                  <button type="button" className="btn btn-secondary" onClick={() => setShowNewAssunzioneModal(false)}>Annulla</button>
                                  <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => {
                                      const val = document.getElementById('select_new_hiring_candidate').value;
                                      if (val) {
                                        const [idCandidato, nomeCompleto] = val.split('|');
                                        handleCreateHiringForCandidate(idCandidato, nomeCompleto);
                                      } else {
                                        showStatus("warning", "Attenzione", "Seleziona un candidato per procedere!");
                                      }
                                    }}
                                  >
                                    Procedi con l'Assunzione
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Dipendenti Assunti o Idonei all'Assunzione</h3>
                          <button className="btn btn-primary btn-sm" onClick={() => setShowNewAssunzioneModal(true)}>
                            ➕ Nuova Assunzione
                          </button>
                        </div>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Nome Dipendente</th>
                                <th>Stato Avanzamento</th>
                                <th>Azione</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(ricercaDetail.candidatiCollegati || []).filter(c => c.statoAvanzamento === 'Approvato/Assunto').map(c => (
                                <tr key={c.idCandidato} onClick={() => handleOpenHiringForm(c)} style={{ cursor: 'pointer' }}>
                                       <td>
                                         <strong 
                                           onClick={(e) => { e.stopPropagation(); handleOpenValutazione(c.idCandidato, c.nomeCompleto); }} 
                                           style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                                         >
                                           {c.nomeCompleto}
                                         </strong>
                                    <div style={{ marginTop: '4px' }}>
                                      {renderCandidateStars(c.punteggioComplessivo, () => handleOpenValutazione(c.idCandidato, c.nomeCompleto))}
                                    </div>
                                  </td>
                                  <td><span className="badge badge-success">{c.statoAvanzamento}</span></td>
                                  <td>
                                    <button className="btn btn-success btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenHiringForm(c); }}>
                                      📄 Compila Scheda Assunzione
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {(ricercaDetail.candidatiCollegati || []).filter(c => c.statoAvanzamento === 'Approvato/Assunto').length === 0 && (
                                <tr>
                                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Nessun dipendente approvato pronto per l'assunzione. Clicca su "Nuova Assunzione" per avviare una procedura.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Log Attività Assunzioni</h3>
                          <TimelineComponent idRicerca={selectedRicercaId} reloadTrigger={ricercaDetail} timeline={timeline} setTimeline={setTimeline} API_BASE={API_BASE} handlePrintTimelineReport={handlePrintTimelineReport} />
                        </div>
                      </div>

                      {selectedHiringCandidate && (
                        <div className="modal-overlay" style={{ zIndex: 1200, padding: '20px' }}>
                          <div className="modal-container" style={{ width: '1000px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header flex-between-center">
                              <h2 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', margin: 0 }}>
                                Scheda Assunzione HEMA FOOD: {selectedHiringCandidate.nomeCompleto}
                              </h2>
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedHiringCandidate(null)}>✕ Chiudi</button>
                            </div>
                            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                        <form className="card-container">
                          <div style={{ textTransform: 'uppercase', fontWeight: 800, textAlign: 'center', fontSize: '18px', marginBottom: '16px', letterSpacing: '1px', color: 'var(--text-primary)' }}>
                            HEMA FOOD
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Commerciale</label>
                              <input type="text" className="form-control" value={hiringFormData.commerciale || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, commerciale: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Outbound</label>
                              <input type="text" className="form-control" value={hiringFormData.outbound || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, outbound: e.target.value })} />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Committente (Cliente)</label>
                            <input type="text" className="form-control" value={hiringFormData.committente || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, committente: e.target.value })} />
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>P.IVA Cliente</label>
                              <input type="text" className="form-control" value={hiringFormData.clientePiva || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, clientePiva: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Referente Cliente</label>
                              <input type="text" className="form-control" value={hiringFormData.clienteReferente || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, clienteReferente: e.target.value })} />
                            </div>
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Sede Legale Cliente</label>
                              <input type="text" className="form-control" value={hiringFormData.clienteSedeLegale || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, clienteSedeLegale: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Email Referente Cliente</label>
                              <input type="text" className="form-control" value={hiringFormData.clienteEmail || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, clienteEmail: e.target.value })} />
                            </div>
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Sede di Lavoro Effettiva</label>
                              <input type="text" className="form-control" value={hiringFormData.clienteSedeLavoro || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, clienteSedeLavoro: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Telefono Referente Cliente</label>
                              <input type="text" className="form-control" value={hiringFormData.clienteTelefono || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, clienteTelefono: e.target.value })} />
                            </div>
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Cognome *</label>
                              <input type="text" className="form-control" value={hiringFormData.cognome || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, cognome: e.target.value })} required />
                            </div>
                            <div className="form-group">
                              <label>Nome *</label>
                              <input type="text" className="form-control" value={hiringFormData.nome || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, nome: e.target.value })} required />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Sede di Lavoro</label>
                            <input type="text" className="form-control" value={hiringFormData.sedeLavoro || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, sedeLavoro: e.target.value })} />
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>CCNL</label>
                              <input type="text" className="form-control" value={hiringFormData.ccnl || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, ccnl: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Livello di Inquadramento</label>
                              <input type="text" className="form-control" value={hiringFormData.livello || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, livello: e.target.value })} />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Mansione</label>
                            <input type="text" className="form-control" value={hiringFormData.mansione || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, mansione: e.target.value })} />
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Contratto Part-time / Full-time</label>
                              <input type="text" className="form-control" value={hiringFormData.contrattoTipo || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, contrattoTipo: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Ore Contratto</label>
                              <input type="text" className="form-control" value={hiringFormData.oreContratto || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, oreContratto: e.target.value })} />
                            </div>
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Durata (Data Inizio / Data Fine)</label>
                              <input type="text" className="form-control" value={hiringFormData.durata || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, durata: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Retribuzione</label>
                              <input type="text" className="form-control" value={hiringFormData.retribuzione || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, retribuzione: e.target.value })} />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Costo Servizio</label>
                            <input type="text" className="form-control" value={hiringFormData.costoServizio || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, costoServizio: e.target.value })} />
                          </div>

                          <div className="form-group">
                            <label>Note (Es.: 13ma, 14ma, bonus Renzi, ANF)</label>
                            <input type="text" className="form-control" value={hiringFormData.note || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, note: e.target.value })} placeholder="Es: 13ma e 14ma incluse, ANF a parte" />
                          </div>

                          <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
                          
                          <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Informazioni personali:</strong>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Telefono Dipendente</label>
                              <input type="text" className="form-control" value={hiringFormData.telefono || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, telefono: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Mail Dipendente</label>
                              <input type="text" className="form-control" value={hiringFormData.mail || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, mail: e.target.value })} />
                            </div>
                          </div>

                          <div className="grid-2-cols">
                            <div className="form-group">
                              <label>Codice Fiscale Dipendente</label>
                              <input type="text" className="form-control" value={hiringFormData.codiceFiscale || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, codiceFiscale: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label>Residenza Completa</label>
                              <input type="text" className="form-control" value={hiringFormData.residenza || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, residenza: e.target.value })} />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>IBAN Dipendente</label>
                            <input type="text" className="form-control" value={hiringFormData.iban || ''} onChange={(e) => setHiringFormData({ ...hiringFormData, iban: e.target.value })} />
                          </div>

                          <div className="form-group" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                            <label style={{ fontWeight: 600, fontSize: '13px' }}>Documento d'Identità (Fisico)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                              <input type="file" onChange={handleUploadHiringDoc} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ outline: 'none' }} />
                              {hiringFormData.linkDocumenti ? (
                                <a href={`${API_BASE.replace('/api', '')}${hiringFormData.linkDocumenti}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--success)', textDecoration: 'underline', fontWeight: 600, fontSize: '13px' }}>
                                  📄 Apri Documento Caricato
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Nessun documento caricato</span>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                            <button type="button" className="btn btn-secondary" onClick={handlePrintHiringSheet}>
                              🖨️ Manda in Stampa
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleEmailHiringSheet}>
                              📧 Invia Mail a Amministrazione
                            </button>
                          </div>
                        </form>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* TAB 6: STORICO */}
                {activeTab === 'storico' && (
                  <div>
                    <h3 className="section-title">Attività Cronologiche Mandato</h3>
                    <TimelineComponent idRicerca={selectedRicercaId} reloadTrigger={ricercaDetail} timeline={timeline} setTimeline={setTimeline} API_BASE={API_BASE} handlePrintTimelineReport={handlePrintTimelineReport} />
                  </div>
                )}

                {/* TAB 7: NOTE RICERCA */}
                {activeTab === 'note_ricerca' && (() => {
                  const notesText = ricercaDetail.ricerca.note || '';
                  const parsedNotes = notesText.split('\n')
                    .map((line, idx) => {
                      const match = line.match(/^\[(.*?) - NOTA DI RICERCA\]:\s*(.*)$/);
                      if (match) {
                        return { id: idx, date: match[1], content: match[2] };
                      }
                      return null;
                    })
                    .filter(Boolean)
                    .reverse();

                  return (
                    <div>
                      <h3 className="section-title">
                        📝 Note Ricerca / Mandato
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '28px' }}>
                        {/* Aggiungi Nota */}
                        <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>➕ Aggiungi Nuova Nota</h4>
                          <form onSubmit={handleSaveResearchNote} className="flex-col-gap-16">
                            <div className="form-group">
                              <label>Testo della Nota *</label>
                              <textarea 
                                name="nota" 
                                className="form-control" 
                                required 
                                rows="6" 
                                placeholder="Scrivi una nota di aggiornamento, dettagli emersi dal cliente o avanzamenti della ricerca..."
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>💾 Salva Nota</button>
                            </div>
                          </form>
                        </div>

                        {/* Registro Note Inserite */}
                        <div className="flex-col-gap-16">
                          <h4 style={{ fontSize: '14px', fontWeight: 700 }}>📋 Registro Note Ricerca</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '6px' }}>
                            {parsedNotes.map(note => (
                              <div key={note.id} style={{
                                background: 'var(--bg-primary)',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px dashed var(--border)', paddingBottom: '6px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>Aggiornamento</span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{note.date}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                                  {note.content}
                                </p>
                              </div>
                            ))}
                            {parsedNotes.length === 0 && (
                              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                Nessuna nota di ricerca inserita finora.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>
  );
}


export function TimelineComponent({ idRicerca, reloadTrigger, timeline, setTimeline, API_BASE, handlePrintTimelineReport }) {
  

  useEffect(() => {
    fetchTimeline();
  }, [idRicerca, reloadTrigger]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`${API_BASE}/timeline/${idRicerca}`);
      const json = await res.json();
      if (json.success) {
        setTimeline(json.timeline);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => handlePrintTimelineReport('Storico Ricerca Mandato', `Timeline delle attività e degli avanzamenti per la ricerca ID: ${idRicerca}`, timeline)}
        >
          🖨️ Stampa Report Mandato
        </button>
      </div>
      {timeline.map(item => (
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
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.tipo}</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>Azione: {item.attivita}</span>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.dettagli}</p>
        </div>
      ))}
      {timeline.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
          Nessuna attività registrata per questa ricerca.
        </div>
      )}
        {/* END Modal Assunzione */}
    </div>
  );
}
