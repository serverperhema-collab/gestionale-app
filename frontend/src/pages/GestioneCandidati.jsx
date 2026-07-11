import React, { useState, useMemo } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { API_BASE, getCapFromAddress, estimateDistanceByCap, renderCandidateStars } from '../utils';
import { useToast } from '../contexts/ToastContext';

export default function Candidati({
  handleOpenValutazione,
  setSelectedSubjectLog,
  handleLinkCandidatoToRicerca,
  setCurrentCandidato,
  setShowNewCVCandidatoModal,
  setShowEditCandidatoModal
}) {
  const { candidati, fetchCandidati } = useGlobalState();
  const { showStatus } = useToast();

  const handleDeleteCandidato = async (id, nomeCompleto) => {
    if (!window.confirm(`Sei sicuro di voler eliminare DEFINITIVAMENTE il candidato "${nomeCompleto}"? Questa azione non puo essere annullata.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/candidati/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Candidato eliminato', 'Candidato eliminato con successo');
        fetchCandidati();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (e) {
      showStatus('error', 'Errore di rete', e.message);
    }
  };

  // Local filter states
  const [filterNominativo, setFilterNominativo] = useState('');
  const [filterCap, setFilterCap] = useState('');
  const [filterRaggio, setFilterRaggio] = useState('all');
  const [filterMansione, setFilterMansione] = useState('');
  const [filterSettore, setFilterSettore] = useState('');

  const uniqueMansioni = useMemo(() => {
    return Array.from(new Set(
      candidati.map(c => c.competenze_chiave).filter(Boolean)
    )).sort();
  }, [candidati]);

  const uniqueSettori = useMemo(() => {
    return Array.from(new Set(
      candidati.map(c => c.settore).filter(Boolean)
    )).sort();
  }, [candidati]);

  const filteredCandidati = useMemo(() => {
    return candidati.filter(c => {
      // 1. Nominativo Filter
      if (filterNominativo.trim()) {
        const q = filterNominativo.toLowerCase();
        const nomeCompleto = `${c.nome || ''} ${c.cognome || ''}`.toLowerCase();
        const cognomeNome = `${c.cognome || ''} ${c.nome || ''}`.toLowerCase();
        if (!nomeCompleto.includes(q) && !cognomeNome.includes(q)) return false;
      }
      
      // 2. CAP + Raggio Filter
      if (filterCap.length === 5 && filterRaggio !== 'all') {
        const candCap = getCapFromAddress(c.residenza);
        if (candCap) {
          const dist = estimateDistanceByCap(filterCap, candCap);
          if (dist > parseInt(filterRaggio)) return false;
        } else {
          return false;
        }
      }
      
      // 3. Mansione Filter
      if (filterMansione) {
        const mansioneLower = filterMansione.toLowerCase();
        const cMansione = (c.competenze_chiave || '').toLowerCase();
        if (!cMansione.includes(mansioneLower)) return false;
      }
      
      // 4. Settore Filter
      if (filterSettore) {
        const settoreLower = filterSettore.toLowerCase();
        const cSettore = (c.settore || '').toLowerCase();
        if (cSettore !== settoreLower) return false;
      }
      
      return true;
    });
  }, [candidati, filterNominativo, filterCap, filterRaggio, filterMansione, filterSettore]);

  const getProximityTextNew = (c) => {
    if (filterCap.length !== 5) return null;
    const candCap = getCapFromAddress(c.residenza);
    if (candCap) {
      const dist = estimateDistanceByCap(filterCap, candCap);
      return (
        <div style={{ marginTop: '4px' }}>
          <span className="proximity-badge" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818CF8', borderColor: '#4F46E5', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
            🚗 ~{dist} km da {filterCap}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Database Curricula ({filteredCandidati.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setCurrentCandidato(null); setShowNewCVCandidatoModal(true); }}>
          ➕ Inserisci CV
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr 1.2fr auto',
        gap: '16px',
        alignItems: 'end'
      }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Nominativo</label>
          <input 
            type="text" 
            className="form-control" 
            value={filterNominativo} 
            onChange={(e) => setFilterNominativo(e.target.value)} 
            placeholder="Cerca nome o cognome..." 
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>CAP Centro Ricerca</label>
          <input 
            type="text" 
            maxLength={5}
            className="form-control" 
            value={filterCap} 
            onChange={(e) => setFilterCap(e.target.value.replace(/\D/g, ''))} 
            placeholder="Es: 24044" 
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Raggio</label>
          <select 
            className="form-control" 
            value={filterRaggio} 
            onChange={(e) => setFilterRaggio(e.target.value)}
            disabled={filterCap.length !== 5}
          >
            <option value="all">Qualsiasi raggio</option>
            <option value="10">Entro 10 km</option>
            <option value="20">Entro 20 km</option>
            <option value="50">Entro 50 km</option>
            <option value="100">Entro 100 km</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Mansione</label>
          <select 
            className="form-control" 
            value={filterMansione} 
            onChange={(e) => setFilterMansione(e.target.value)}
          >
            <option value="">Tutte le mansioni</option>
            {uniqueMansioni.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Settore</label>
          <select 
            className="form-control" 
            value={filterSettore} 
            onChange={(e) => setFilterSettore(e.target.value)}
          >
            <option value="">Tutti i settori</option>
            {uniqueSettori.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button 
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFilterNominativo('');
            setFilterCap('');
            setFilterRaggio('all');
            setFilterMansione('');
            setFilterSettore('');
          }}
          style={{ height: '38px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Candidates Grid/Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nominativo</th>
              <th>Telefono / Email</th>
              <th>Residenza</th>
              <th>Competenze Chiave</th>
              <th>Settore</th>
              <th>CV File</th>
              <th>Valutazioni</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidati.map(c => (
              <tr key={c.id} onClick={() => handleOpenValutazione(c.id, `${c.cognome} ${c.nome}`)} style={{ cursor: 'pointer' }}>
                <td>
                  <strong>{c.cognome} {c.nome}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {c.id}</div>
                </td>
                <td style={{ fontSize: '13px' }}>{c.telefono} <br/> {c.email}</td>
                <td>
                  {c.residenza}
                  {getProximityTextNew(c)}
                </td>
                <td><span className="badge badge-primary">{c.competenze_chiave}</span></td>
                <td>
                  <span className="badge badge-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                    {c.settore || 'N/D'}
                  </span>
                </td>
                <td>
                  {c.link_cv ? (
                    <a href={`${API_BASE.replace('/api', '')}${c.link_cv}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                      📄 Apri CV File
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Nessun CV</span>
                  )}
                  {c.link_documenti && (
                    <div style={{ marginTop: '4px' }}>
                      <a href={`${API_BASE.replace('/api', '')}${c.link_documenti}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--success)', textDecoration: 'none', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🪪 Apri Doc Identità
                      </a>
                    </div>
                  )}
                </td>
                <td>
                  {renderCandidateStars(c.punteggio_complessivo, () => handleOpenValutazione(c.id, `${c.cognome} ${c.nome}`))}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenValutazione(c.id, `${c.cognome} ${c.nome}`); }}>
                      🔍 Scheda
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setCurrentCandidato(c); setShowEditCandidatoModal(true); }} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
                      ✏️ Modifica
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedSubjectLog({ type: 'CANDIDATO', id: c.id, name: `${c.cognome} ${c.nome}` }); }}>
                      📜 Log Attività
                    </button>
                    <button className="btn btn-sm" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleDeleteCandidato(c.id, `${c.cognome} ${c.nome}`); }}>
                      🗑️ Elimina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCandidati.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessun candidato trovato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
