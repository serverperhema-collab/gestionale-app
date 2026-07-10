import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function Dashboard({ 
  setShowReportModal, 
  setSelectedRicercaId, 
  setActiveTab 
}) {
  const navigate = useNavigate();
  const { candidati, ricerche, clienti, pendingChecklist } = useGlobalState();

  return (
    <div>
      {/* Header with Report Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>📊 Dashboard Principale</h2>
        <button 
          type="button"
          className="btn btn-primary"
          onClick={() => setShowReportModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, padding: '10px 18px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
        >
          📊 Genera Report Generale
        </button>
      </div>
      {/* Stats cards */}
      <div className="grid-stats">
        <div className="card-stat">
          <h3>Candidati nel Database</h3>
          <div className="value">{candidati.length}</div>
        </div>
        <div className="card-stat success">
          <h3>Ricerche Attive</h3>
          <div className="value">{ricerche.filter(r => (r.stato_approvazione_tl === 'Approvata' || r.stato_approvazione_tl === 'Approvata con Riserva') && r.stato_ricerca !== 'Chiuso/Assunto').length}</div>
        </div>
        <div className="card-stat warning">
          <h3>Dipendenti in Prova</h3>
          <div className="value">
            {ricerche.reduce((acc, r) => acc + (r.stats?.in_prova || 0), 0)}
          </div>
        </div>
        <div className="card-stat danger">
          <h3>Clienti Registrati</h3>
          <div className="value">{clienti.length}</div>
        </div>
      </div>

      {/* Checklist Cose in Sospeso */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 CHECKLIST ATTIVITÀ & SCADENZE IN SOSPESO
        </h2>
        
        {pendingChecklist.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingChecklist.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${
                  item.tipo === 'ANNUNCIO_SCADENZA' ? '#ef4444'
                  : item.tipo === 'ACCOUNT' || item.tipo === 'MANDATO' ? '#f59e0b'
                  : 'var(--primary)'
                }`
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 800, 
                    color: item.tipo === 'ANNUNCIO_SCADENZA' ? '#ef4444'
                           : item.tipo === 'ACCOUNT' || item.tipo === 'MANDATO' ? '#f59e0b'
                           : 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {item.tipo === 'ANNUNCIO_SCADENZA' ? '⏳ SCADENZA ANNUNCIO'
                     : item.tipo === 'ACCOUNT' ? '👤 ABILITAZIONE ACCOUNT'
                     : item.tipo === 'MANDATO' ? '📋 APPROVAZIONE MANDATO'
                     : item.tipo === 'CV' ? '✉️ ESITO INVIO CV'
                     : item.tipo === 'COLLOQUIO' ? '🗓️ ESITO COLLOQUIO'
                     : item.tipo === 'PROVA' ? '🧪 ESITO PERIODO PROVA'
                     : item.tipo}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    {item.testo}
                  </span>
                </div>
                {item.idRicerca && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedRicercaId(item.idRicerca);
                      if (item.tipo === 'CV' || item.tipo === 'COLLOQUIO' || item.tipo === 'PROVA') {
                        setActiveTab('esiti');
                      } else if (item.tipo === 'MANDATO') {
                        navigate('/approvazioni');
                        setSelectedRicercaId(null);
                      } else if (item.tipo === 'ANNUNCIO_SCADENZA') {
                        setActiveTab('dati');
                      }
                    }}
                  >
                    Gestisci ➡️
                  </button>
                )}
                {!item.idRicerca && item.tipo === 'ACCOUNT' && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      navigate('/commerciali_gestione');
                    }}
                  >
                    Gestisci ➡️
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🎉</span>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Nessuna attività in sospeso! Ottimo lavoro, sei in pari con tutto.
            </p>
          </div>
        )}
      </div>

      {/* Mandates overview table */}
      <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Mandati di Selezione in Corso</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Locale / Azienda</th>
              <th>Ruolo Ricercato</th>
              <th>Stato Mandato</th>
              <th>CV Collegati</th>
              <th>In Prova</th>
              <th>Assunti</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {ricerche.filter(r => r.stato_approvazione_tl === 'Approvata' || r.stato_approvazione_tl === 'Approvata con Riserva').map(r => (
              <tr key={r.id}>
                 <td>
                  <strong>{r.azienda}</strong>
                  {r.stato_approvazione_tl === 'Approvata con Riserva' && (
                    <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600, marginTop: '2px' }}>
                      ⚠️ In Riserva ({r.consulente_commerciale})
                    </div>
                  )}
                 </td>
                <td>{r.ruolo}</td>
                <td>
                  <span className={`badge ${
                    r.stato_ricerca === 'Avviata' ? 'badge-primary' 
                    : r.stato_ricerca === 'Ricerca Inserita' ? 'badge-warning'
                    : r.stato_ricerca === 'Chiuso/Assunto' ? 'badge-success'
                    : 'badge-danger'
                  }`}>
                    {r.stato_ricerca}
                  </span>
                </td>
                <td>{r.stats?.cv_ricevuti || 0}</td>
                <td>{r.stats?.in_prova || 0}</td>
                <td>{r.stats?.assunti || 0}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRicercaId(r.id)}>
                    ⚙️ Gestisci
                  </button>
                </td>
              </tr>
            ))}
            {ricerche.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun mandato trovato. Usa il tasto Dati di Test in basso a sinistra per riempire il database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
