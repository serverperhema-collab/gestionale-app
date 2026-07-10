import React from 'react';

const GeneralReportModal = ({
  showReportModal, setShowReportModal,
  reportData, reportRange, setReportRange,
  reportStartDate, setReportStartDate,
  reportEndDate, setReportEndDate,
  loadingReport, handleGenerateReport, handlePrintReport
}) => {
  return (
    <>
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

    </>
  );
};

export default GeneralReportModal;
