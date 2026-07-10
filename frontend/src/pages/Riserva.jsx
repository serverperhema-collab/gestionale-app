import React from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function Riserva({ handleApprovalAction, setSelectedRicercaId }) {
  const { ricerche } = useGlobalState();

  return (
    <div>
      <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Mandati Approvati con Riserva</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Commerciale</th>
              <th>Locale / Azienda</th>
              <th>Ruolo Richiesto</th>
              <th>Sede Lavoro</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').map(r => (
              <tr key={r.id}>
                <td>{r.data_inserimento}</td>
                <td><strong>{r.consulente_commerciale || 'Operativo'}</strong></td>
                <td>
                  <strong>{r.azienda}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PIVA: {r.piva} <br/> Ref: {r.referente}</div>
                </td>
                <td><strong>{r.ruolo}</strong> (Risorse: {r.nr_risorse})</td>
                <td>{r.sede_lavoro}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleApprovalAction(r.id, 'Approvata')}>
                      ✓ Accetta Definitivo
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedRicercaId(r.id)}>
                      Gestisci
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleApprovalAction(r.id, 'Cestinato')}>
                      🗑️ Cestina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun mandato in riserva al momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
