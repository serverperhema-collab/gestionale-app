import React from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function GestioneRicerche({ setSelectedRicercaId }) {
  const { ricerche } = useGlobalState();

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
            <th>Stato Ricerca</th>
            <th>Azione</th>
          </tr>
        </thead>
        <tbody>
          {ricerche.filter(r => r.stato_approvazione_tl === 'Approvata' || r.stato_approvazione_tl === 'Approvata con Riserva').map(r => (
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
                  {r.stato_ricerca}
                </span>
              </td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => setSelectedRicercaId(r.id)}>
                  Gestisci
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
