import React, { useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function GestioneRicerche({ setSelectedRicercaId }) {
  const { ricerche = [] } = useGlobalState() || {};
  const [sortDirection, setSortDirection] = useState(null); // null | 'asc' | 'desc'

  const activeRicerche = ricerche.filter(r => r.stato_approvazione_tl === 'Approvata' || r.stato_approvazione_tl === 'Approvata con Riserva');

  const sortedRicerche = [...activeRicerche].sort((a, b) => {
    if (!sortDirection) return 0;
    
    const statusA = a.stato_ricerca || 'Ricerca Inserita';
    const statusB = b.stato_ricerca || 'Ricerca Inserita';
    
    if (sortDirection === 'asc') {
      return statusA.localeCompare(statusB);
    } else {
      return statusB.localeCompare(statusA);
    }
  });

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Codice</th>
            <th>Azienda Cliente</th>
            <th>Ruolo</th>
            <th>Sede di Lavoro</th>
            <th>Referente</th>
            <th>Email/Mobile</th>
            <th 
              onClick={() => {
                if (sortDirection === null) setSortDirection('asc');
                else if (sortDirection === 'asc') setSortDirection('desc');
                else setSortDirection(null);
              }}
              style={{ cursor: 'pointer', userSelect: 'none', transition: 'color 0.2s', color: sortDirection ? 'var(--primary)' : 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = sortDirection ? 'var(--primary)' : 'var(--text-secondary)'}
            >
              Stato Ricerca {sortDirection === 'asc' ? ' ⬇️' : sortDirection === 'desc' ? ' ⬆️' : ' ↕️'}
            </th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {sortedRicerche.map(r => (
            <tr key={r.id}>
              <td><code>{r.id}</code></td>
              <td>
                <strong>{r.azienda}</strong>
                {r.stato_approvazione_tl === 'Approvata con Riserva' && (
                  <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600, marginTop: '2px' }}>
                    ⚠️ In Riserva ({r.consulente_commerciale})
                  </div>
                )}
              </td>
              <td>{r.ruolo}</td>
              <td>{r.sede_lavoro}</td>
              <td>{r.referente}</td>
              <td style={{ fontSize: '12px' }}>{r.email} <br/> {r.telefono_mobile}</td>
              <td>
                <span className={`badge ${
                  r.stato_ricerca === 'Avviata' ? 'badge-primary' 
                  : r.stato_ricerca === 'Chiuso/Assunto' ? 'badge-success'
                  : 'badge-warning'
                }`}>
                  {r.stato_ricerca || 'Ricerca Inserita'}
                </span>
              </td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => setSelectedRicercaId(r.id)}>
                  Gestisci
                </button>
              </td>
            </tr>
          ))}
          {sortedRicerche.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                Nessun mandato di ricerca attivo.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
