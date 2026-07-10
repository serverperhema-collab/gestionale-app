import React from 'react';

const AnnuncioModal = ({ selectedAnnuncio, setSelectedAnnuncio, adTimeline, ricercaDetail, handleUpdateAnnuncioDetail, handleDeleteAnnuncio, setNewAdStatus, setAdStatusMotivation, setShowAdStatusModal }) => {
  if (!selectedAnnuncio) return null;
  return (
        <div className="modal-overlay" style={{ zIndex: 1080 }}>
          <div className="modal-container" style={{ maxWidth: '1000px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>⚙️ GESTIONE ANNUNCIO DI LAVORO ({selectedAnnuncio.id})</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedAnnuncio(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              {/* SEZIONE DI GESTIONE DEL SINGOLO ANNUNCIO SELEZIONATO */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedAnnuncio(null)}
                          >
                            ⬅ Torna alla lista annunci
                          </button>
                        </div>

                        <form onSubmit={handleUpdateAnnuncioDetail} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div className="form-group">
                            <label>Testo dell'Annuncio di Lavoro *</label>
                            <textarea 
                              name="testo_annuncio" 
                              className="form-control" 
                              required
                              defaultValue={selectedAnnuncio.testo_annuncio || ''}
                              placeholder="Inserisci il testo completo dell'annuncio..."
                              style={{ minHeight: '150px' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                              <label>Portali Pubblicazione (separati da virgola)</label>
                              <input 
                                type="text" 
                                name="portali_annuncio" 
                                className="form-control" 
                                defaultValue={selectedAnnuncio.portali_annuncio || ''}
                                placeholder="Es: Indeed, Subito.it, LinkedIn"
                              />
                            </div>
                            <div className="form-group">
                              <label>Link Annuncio Web *</label>
                              <input 
                                type="text" 
                                name="link_annuncio" 
                                className="form-control" 
                                required
                                defaultValue={selectedAnnuncio.link_annuncio || ''}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                              <label>Data Pubblicazione Annuncio *</label>
                              <input 
                                type="date" 
                                name="data_inserimento_annuncio" 
                                className="form-control" 
                                required
                                defaultValue={selectedAnnuncio.data_inserimento_annuncio || ''}
                              />
                            </div>
                            <div className="form-group">
                              <label>Data Scadenza Annuncio *</label>
                              <input 
                                type="date" 
                                name="data_scadenza_annuncio" 
                                className="form-control" 
                                required
                                defaultValue={selectedAnnuncio.data_scadenza_annuncio || ''}
                              />
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            padding: '12px 16px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            marginTop: '16px'
                          }}>
                            <div>
                              <strong>Stato dell'Annuncio:</strong>{' '}
                              <span className={`badge ${selectedAnnuncio.stato_annuncio === 'Disattivato' ? 'badge-danger' : 'badge-success'}`}>
                                {selectedAnnuncio.stato_annuncio || 'Attivo'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                const targetStatus = (selectedAnnuncio.stato_annuncio || 'Attivo') === 'Attivo' ? 'Disattivato' : 'Attivo';
                                setNewAdStatus(targetStatus);
                                setAdStatusMotivation('');
                                setShowAdStatusModal(true);
                              }}
                            >
                              🔄 Modifica Stato Annuncio
                            </button>
                          </div>

                          <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Note dell'Annuncio (Opzionali)</label>
                            <textarea 
                              name="note" 
                              className="form-control" 
                              placeholder="Note interne, feedback o accordi per l'annuncio..."
                              defaultValue={selectedAnnuncio.note || ''}
                              style={{ minHeight: '60px' }}
                            />
                          </div>

                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                            <button 
                              type="button" 
                              className="btn btn-danger" 
                              onClick={() => handleDeleteAnnuncio(selectedAnnuncio.id)}
                            >
                              🗑️ Elimina Annuncio
                            </button>
                            <button type="submit" className="btn btn-primary">💾 Salva Modifiche Annuncio</button>
                          </div>
                        </form>

                        {/* Report di Attività per questo specifico Annuncio */}
                        <div id="print-ad-report" style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: 'var(--primary)' }}>📜 Report Azioni Annuncio di Lavoro ({selectedAnnuncio.id})</h4>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                const printContents = document.getElementById('print-ad-report').innerHTML;
                                const printWindow = window.open('', '_blank');
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Report Azioni Annuncio - ${ricercaDetail.ricerca.azienda}</title>
                                      <style>
                                        body { font-family: system-ui, sans-serif; padding: 40px; color: #333; }
                                        h2 { border-bottom: 2px solid #4F46E5; padding-bottom: 8px; color: #4F46E5; }
                                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                                        th { background-color: #f5f5f5; }
                                        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: #e5e7eb; }
                                      </style>
                                    </head>
                                    <body>
                                      <h2>Report Azioni Annuncio - ${ricercaDetail.ricerca.azienda} (Ruolo: ${ricercaDetail.ricerca.ruolo})</h2>
                                      <p><strong>ID Annuncio:</strong> ${selectedAnnuncio.id}</p>
                                      <p><strong>Link Annuncio:</strong> ${selectedAnnuncio.link_annuncio || 'N/D'}</p>
                                      <p><strong>Stato Attuale:</strong> ${selectedAnnuncio.stato_annuncio || 'Attivo'}</p>
                                      ${printContents}
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                printWindow.print();
                              }}
                            >
                              🖨️ Stampa Report Annuncio
                            </button>
                          </div>
                          <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <table className="data-table" style={{ fontSize: '12px' }}>
                              <thead>
                                <tr>
                                  <th style={{ width: '130px' }}>Data / Ora</th>
                                  <th style={{ width: '150px' }}>Attività</th>
                                  <th>Dettagli Operazione</th>
                                </tr>
                              </thead>
                              <tbody>
                                {adTimeline
                                  .filter(item => 
                                    item.id === selectedAnnuncio.id || 
                                    (item.dettagli && item.dettagli.includes(selectedAnnuncio.id))
                                  )
                                  .map(item => (
                                    <tr key={item.id}>
                                      <td><code>{item.dataStr}</code></td>
                                      <td>
                                        <span className="badge" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
                                          {item.attivita}
                                        </span>
                                      </td>
                                      <td>{item.dettagli}</td>
                                    </tr>
                                  ))
                                }
                                {adTimeline.filter(item => 
                                    item.id === selectedAnnuncio.id || 
                                    (item.dettagli && item.dettagli.includes(selectedAnnuncio.id))
                                  ).length === 0 && (
                                  <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nessuna azione registrata per questo annuncio.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedAnnuncio(null)}>Chiudi</button>
            </div>
          </div>
        </div>
  );
};

export default AnnuncioModal;
