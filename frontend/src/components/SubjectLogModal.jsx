import React from 'react';

const SubjectLogModal = ({ selectedSubjectLog, setSelectedSubjectLog, subjectTimeline, handlePrintReport }) => {
  if (!selectedSubjectLog) return null;
  return (
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
  );
};

export default SubjectLogModal;
