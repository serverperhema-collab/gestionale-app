import React from 'react';

const NewRicercaModal = ({
  showNewRicercaModal, setShowNewRicercaModal,
  newSearchForm, setNewSearchForm,
  newSearchRoles,
  handleCreateRicerca, handleRoleChange, addRoleField, removeRoleField,
  handleSelectClientForNewSearch,
  clienti, commerciali, operatori
}) => {
  return (
    <>
{/* 1. NEW RESEARCH MODAL */}
      {showNewRicercaModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <form onSubmit={handleCreateRicerca}>
              <div className="modal-header">
                <h2>Nuova Scheda di Ricerca</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewRicercaModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Incaricati (Commerciale & Outbound) */}
                <div style={{
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  <div className="form-group">
                    <label>Consulente Commerciale *</label>
                    <select 
                      className="form-control"
                      value={newSearchForm.consulente_commerciale}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, consulente_commerciale: e.target.value })}
                    >
                      <option value="">-- Seleziona Commerciale --</option>
                      {commerciali.filter(c => c.stato_approvazione === 'Approvato').map(c => (
                        <option key={c.id} value={`${c.nome} ${c.cognome}`}>{c.nome} {c.cognome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Outbound (Operatore)</label>
                    <select 
                      className="form-control"
                      value={newSearchForm.outbound}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, outbound: e.target.value })}
                    >
                      <option value="">-- Seleziona Operatore --</option>
                      {operatori.map(op => (
                        <option key={op.id} value={`${op.nome} ${op.cognome}`}>{op.nome} {op.cognome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Client selection / Company details */}
                <div style={{
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>ANAGRAFICA CLIENTE / DATI AZIENDA</strong>
                  <div className="form-group">
                    <label>Seleziona Cliente Esistente (Opzionale)</label>
                    <select 
                      className="form-control" 
                      onChange={(e) => handleSelectClientForNewSearch(e.target.value)}
                    >
                      <option value="">-- Nuovo Cliente / Compila Manualmente --</option>
                      {clienti.map(c => (
                        <option key={c.id} value={c.id}>{c.nome_locale} ({c.referente})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Azienda Cliente / Nome Locale *</label>
                      <input 
                        type="text" 
                        name="azienda" 
                        className="form-control" 
                        required 
                        placeholder="Es: Pizzeria Bella Napoli" 
                        value={newSearchForm.azienda}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, azienda: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Partita IVA / Cod.Fisc *</label>
                      <input 
                        type="text" 
                        name="piva" 
                        className="form-control" 
                        required
                        placeholder="11 cifre" 
                        value={newSearchForm.piva}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, piva: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Sede Legale *</label>
                      <input 
                        type="text" 
                        name="sede_legale" 
                        className="form-control" 
                        required
                        placeholder="Indirizzo sede legale" 
                        value={newSearchForm.sede_legale}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, sede_legale: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sede di Lavoro *</label>
                      <input 
                        type="text" 
                        name="sede_lavoro" 
                        className="form-control" 
                        required 
                        placeholder="Es: Via Roma 12, Milano" 
                        value={newSearchForm.sede_lavoro}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, sede_lavoro: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Referente Contatto *</label>
                    <input 
                      type="text" 
                      name="referente" 
                      className="form-control" 
                      required
                      placeholder="Es: Mario Russo" 
                      value={newSearchForm.referente}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, referente: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Telefono Mobile *</label>
                      <input 
                        type="text" 
                        name="telefono_mobile" 
                        className="form-control" 
                        required
                        placeholder="Es: 3331234567" 
                        value={newSearchForm.telefono_mobile}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, telefono_mobile: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefono Fisso *</label>
                      <input 
                        type="text" 
                        name="telefono_fisso" 
                        className="form-control" 
                        required
                        placeholder="Es: 02123456" 
                        value={newSearchForm.telefono_fisso}
                        onChange={(e) => setNewSearchForm({ ...newSearchForm, telefono_fisso: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Cliente *</label>
                    <input 
                      type="email" 
                      name="email" 
                      className="form-control" 
                      required
                      placeholder="esempio@email.com" 
                      value={newSearchForm.email}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Settore di Riferimento *</label>
                    <input 
                      type="text" 
                      name="settore" 
                      className="form-control" 
                      required
                      placeholder="Es: Ristorazione, Logistica, Edilizia..." 
                      value={newSearchForm.settore}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, settore: e.target.value })}
                    />
                  </div>
                </div>

                {/* 2. Roles to search list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>RUOLI RICHIESTI</strong>
                  
                  {newSearchRoles.map((role, idx) => (
                    <div key={idx} style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '16px',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Ruolo #{idx + 1}</span>
                        {newSearchRoles.length > 1 && (
                          <button 
                            type="button" 
                            className="btn btn-danger btn-sm" 
                            style={{ padding: '2px 8px', fontSize: '11px' }}
                            onClick={() => removeRoleField(idx)}
                          >
                            Elimina Ruolo
                          </button>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Ruolo Ricercato *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required 
                          placeholder="Es: Cuoco, Barista, Cameriere..." 
                          value={role.ruolo}
                          onChange={(e) => handleRoleChange(idx, 'ruolo', e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label>Nr Risorse</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            min="1" 
                            value={role.nr_risorse}
                            onChange={(e) => handleRoleChange(idx, 'nr_risorse', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="form-group">
                          <label>CCNL e Livello *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            placeholder="Es: Ristorazione 5° liv" 
                            value={role.ccnl_livello}
                            onChange={(e) => handleRoleChange(idx, 'ccnl_livello', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label>Retribuzione *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            placeholder="Es: 1400€ netti" 
                            value={role.retribuzione}
                            onChange={(e) => handleRoleChange(idx, 'retribuzione', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Competenze Richieste *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            placeholder="Requisiti fondamentali" 
                            value={role.competenze_tecniche}
                            onChange={(e) => handleRoleChange(idx, 'competenze_tecniche', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label>Ore di Lavoro</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              min="1"
                              placeholder="Es: 40" 
                              value={role.ore_lavoro}
                              onChange={(e) => handleRoleChange(idx, 'ore_lavoro', e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <select 
                              className="form-control"
                              required
                              value={role.ore_lavoro_tipo || 'Settimanali'}
                              onChange={(e) => handleRoleChange(idx, 'ore_lavoro_tipo', e.target.value)}
                              style={{ width: '130px' }}
                            >
                              <option value="Giornaliere">Giornaliere</option>
                              <option value="Settimanali">Settimanali</option>
                              <option value="Mensili">Mensili</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Orario di Lavoro (Opzionale)</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Es: Spezzato, Turni..." 
                            value={role.orario_lavoro}
                            onChange={(e) => handleRoleChange(idx, 'orario_lavoro', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    style={{ alignSelf: 'flex-start' }}
                    onClick={addRoleField}
                  >
                    ➕ Aggiungi altro ruolo per questo cliente
                  </button>
                </div>

                {/* 3. General internal notes */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label>Note Interne Generali Mandato (Opzionali)</label>
                    <textarea 
                      name="note" 
                      className="form-control" 
                      placeholder="Note aggiuntive generali del mandato..." 
                      value={newSearchForm.note}
                      onChange={(e) => setNewSearchForm({ ...newSearchForm, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewRicercaModal(false)}>Annulla</button>
                <button type="submit" className="btn btn-primary">➕ Salva Ricerca</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default NewRicercaModal;
