import React from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { API_BASE } from '../utils';
import { useToast } from '../contexts/ToastContext';

export default function Clienti({ setSelectedSubjectLog }) {
  const { clienti, fetchClienti } = useGlobalState();
  const { showStatus } = useToast();

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE il cliente "${nome}"? Questa azione non puo essere annullata.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/clienti/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Cliente eliminato', 'Cliente eliminato con successo');
        fetchClienti();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (e) {
      showStatus('error', 'Errore di rete', e.message);
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nome Locale</th>
            <th>P.IVA</th>
            <th>Sede Legale/Lavoro</th>
            <th>Referente</th>
            <th>Telefono / Email</th>
            <th>Data Registrazione</th>
            <th style={{ textAlign: 'center' }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {clienti.map(cl => (
            <tr key={cl.id}>
              <td><strong>{cl.nome_locale}</strong></td>
              <td><code>{cl.piva}</code></td>
              <td style={{ fontSize: '13px' }}>Legale: {cl.sede_legale} <br/> Lavoro: {cl.sede_lavoro}</td>
              <td>{cl.referente}</td>
              <td>{cl.telefono_mobile} <br/> {cl.email}</td>
              <td>{cl.data_inserimento}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSubjectLog({ type: 'CLIENTE', id: cl.id, name: cl.nome_locale })}>
                    📜 Log Attività
                  </button>
                  <button className="btn btn-sm" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={() => handleDelete(cl.id, cl.nome_locale)}>
                    🗑️ Elimina
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {clienti.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun cliente in anagrafica.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
