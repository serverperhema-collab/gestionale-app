import React from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function Approvazioni({ handleApprovalAction }) {
  const { ricerche } = useGlobalState();

  return (
    <div>
      <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 700 }}>Mandati in attesa di Approvazione</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Commerciale</th>
              <th>Locale / Azienda</th>
              <th>Ruolo Richiesto</th>
              <th>Sede Lavoro</th>
              <th>Accordi / Dettagli</th>
              <th style={{ textAlign: 'center' }}>Azioni Decisioni</th>
            </tr>
          </thead>
          <tbody>
            {ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').map(r => (
              <tr key={r.id}>
                <td>{r.data_inserimento}</td>
                <td><strong>{r.consulente_commerciale || 'Operativo'}</strong></td>
                <td>
                  <strong>{r.azienda}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PIVA: {r.piva} <br/> Ref: {r.referente} ({r.telefono_mobile})</div>
                </td>
                <td>
                  <strong>{r.ruolo}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Risorse: {r.nr_risorse} <br/> CCNL: {r.ccnl_livello || 'N/D'} <br/> Retr: {r.retribuzione || 'N/D'}</div>
                </td>
                <td>{r.sede_lavoro}</td>
                <td style={{ fontSize: '12px', maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  <strong>Comp:</strong> {r.competenze_tecniche || 'N/D'} <br/>
                  <strong>Note:</strong> {r.note || 'Nessuna nota'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprovalAction(r.id, 'Approvata')}
                    >
                      ✓ Accetta
                    </button>
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={() => handleApprovalAction(r.id, 'Approvata con Riserva')}
                      style={{ backgroundColor: 'var(--warning)', color: '#000' }}
                    >
                      Approva con Riserva
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleApprovalAction(r.id, 'Cestinato')}
                    >
                      🗑️ Cestina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun mandato in attesa di approvazione.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
