import React from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function CrmRequestInfo({ ricerca, compact = false }) {
  const { ricerche = [] } = useGlobalState() || {};
  if (!ricerca?.crm_precontract_id) return null;
  const siblings = ricerca.crm_parent_id ? ricerche.filter(row => row.crm_parent_id === ricerca.crm_parent_id).sort((a, b) => a.crm_sheet_position - b.crm_sheet_position) : [];
  const multiple = ricerca.crm_sheet_count > 1;
  if (!multiple && !ricerca.crm_commercial_resolution) return null;
  return <section style={{ padding: compact ? 8 : 16, margin: '10px 0', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-secondary)', fontSize: compact ? 12 : 14, lineHeight: 1.6 }}>
    {multiple && <>
      <strong>Scheda {ricerca.crm_sheet_position} di {ricerca.crm_sheet_count} dello stesso precontratto</strong>
      <p>Questa richiesta riguarda {ricerca.ruolo}. Ogni figura ha una ricerca e un’approvazione proprie.</p>
      {!compact && <><small>Riferimento precontratto: {ricerca.crm_parent_id}</small><ul>{siblings.map(row => <li key={row.id}>{row.ruolo} · {row.id} · {row.stato_approvazione_tl}</li>)}</ul></>}
      {siblings.length < ricerca.crm_sheet_count && <p style={{ color: 'var(--warning)' }}>Ricevute {siblings.length} di {ricerca.crm_sheet_count} schede. Le altre potrebbero essere ancora in invio.</p>}
    </>}
    {ricerca.crm_commercial_resolution && <div role="status" style={{ color: 'var(--warning)' }}><strong>{ricerca.crm_commercial_resolution === 'CONTRACT' ? 'Chiamate ha registrato il contratto per questa figura.' : 'Chiamate ha annullato la richiesta per questa figura.'}</strong><p>{ricerca.crm_commercial_notes}</p><small>Controlla questo esito prima di continuare. La fase della ricerca si gestisce da qui.</small></div>}
  </section>;
}
