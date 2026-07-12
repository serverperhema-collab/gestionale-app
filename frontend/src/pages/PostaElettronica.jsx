import React, { useState, useEffect, useMemo } from 'react';

export default function PostaElettronica({ candidati = [], clienti = [], ricerche = [], showStatus, API_BASE }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [destinatario, setDestinatario] = useState('');
  const [oggetto, setOggetto] = useState('');
  const [corpo, setCorpo] = useState('');
  const [selectedCandidatoId, setSelectedCandidatoId] = useState('');
  const [selectedRicercaId, setSelectedRicercaId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');

  // Load emails
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/emails`);
      const json = await res.json();
      if (json.success) {
        setEmails(json.data || []);
        if (json.data && json.data.length > 0 && !selectedEmail && !isComposing) {
          setSelectedEmail(json.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Templates definition
  const templates = {
    custom: { label: 'Scrittura Libera', subject: '', body: '' },
    colloquio: {
      label: 'Richiesta di Colloquio',
      subject: 'Convocazione Colloquio Conoscitivo - HEMA Selezione',
      body: 'Gentile Candidato,\n\nin merito alla sua candidatura inserita nel nostro database, vorremmo concordare un colloquio conoscitivo in presenza o video-call.\n\nLe chiediamo cortesemente di comunicarci la sua disponibilità per i prossimi giorni.\n\nUn cordiale saluto,\nTeam Risorse Umane'
    },
    presentazione_cv: {
      label: 'Presentazione CV al Cliente',
      subject: 'Presentazione Profilo Candidato per Ricerca in Corso',
      body: 'Spettabile Cliente,\n\nin merito al mandato di ricerca da voi affidatoci, vi inoltriamo in allegato il profilo del candidato selezionato che riteniamo in linea con le vostre richieste.\n\nRestiamo a disposizione per programmare un colloquio di approfondimento.\n\nCordiali saluti,\nArea Selezione Personale'
    },
    assunzione: {
      label: 'Comunicazione Assunzione',
      subject: 'Conferma Assunzione e Invio Scheda Amministrativa',
      body: 'Gentile Collaboratore,\n\nsiamo lieti di confermarle il superamento del periodo di prova e la formalizzazione dell\'assunzione.\n\nLe trasmettiamo in allegato la scheda riepilogativa da firmare e rispedire per avviare le pratiche amministrative.\n\nBenvenuto a bordo,\nAmministrazione HR'
    }
  };

  // Handle template selection
  const handleTemplateChange = (type) => {
    setSelectedTemplate(type);
    if (type !== 'custom') {
      setOggetto(templates[type].subject);
      setCorpo(templates[type].body);
    } else {
      setOggetto('');
      setCorpo('');
    }
  };

  // Autocomplete/fill details on candidate select
  const handleCandidatoSelect = (id) => {
    setSelectedCandidatoId(id);
    if (id) {
      const cand = candidati.find(c => String(c.id) === id);
      if (cand) {
        setDestinatario(cand.email || '');
        // Customize template if selected
        if (selectedTemplate !== 'custom') {
          let updatedBody = templates[selectedTemplate].body
            .replace('Gentile Candidato', `Gentile ${cand.nome} ${cand.cognome}`)
            .replace('Gentile Collaboratore', `Gentile ${cand.nome} ${cand.cognome}`);
          setCorpo(updatedBody);
        }
      }
    }
  };

  // Filter emails list
  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return emails;
    const q = searchQuery.toLowerCase();
    return emails.filter(e => 
      (e.destinatario || '').toLowerCase().includes(q) ||
      (e.oggetto || '').toLowerCase().includes(q) ||
      (e.corpo || '').toLowerCase().includes(q) ||
      (e.mittente || '').toLowerCase().includes(q)
    );
  }, [emails, searchQuery]);

  // Handle send email
  const handleSend = async (e) => {
    e.preventDefault();
    if (!destinatario || !oggetto || !corpo) {
      showStatus("warning", "Attenzione", "Compila tutti i campi obbligatori!");
      return;
    }

    try {
      showStatus('loading', 'Invio e-mail...', 'Trasmissione del messaggio in corso...');
      const res = await fetch(`${API_BASE}/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatario,
          oggetto,
          corpo,
          id_candidato: selectedCandidatoId || null,
          id_ricerca: selectedRicercaId || null,
          tipo: selectedTemplate === 'custom' ? 'custom' : selectedTemplate
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'E-mail inviata!', json.stato === 'Simulata' 
          ? 'Simulazione completata con successo (credenziali SMTP non configurate).' 
          : 'E-mail inviata con successo tramite il server SMTP.');
        
        // Reset composer
        setDestinatario('');
        setOggetto('');
        setCorpo('');
        setSelectedCandidatoId('');
        setSelectedRicercaId('');
        setSelectedTemplate('custom');
        setIsComposing(false);
        
        // Refresh email list
        await fetchEmails();
      } else {
        showStatus('error', 'Errore invio', json.error || 'Impossibile completare l\'operazione.');
      }
    } catch (err) {
      showStatus('error', 'Errore di connessione', err.message);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: 'calc(100vh - 120px)', minHeight: '550px' }}>
      
      {/* LEFT PANE: EMAIL LIST */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        {/* Header Left */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => {
              setIsComposing(true);
              setSelectedEmail(null);
            }}
          >
            ➕ Nuova Email
          </button>
          
          <input 
            type="text" 
            className="form-control" 
            placeholder="Cerca e-mail..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Message list scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {loading && emails.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Caricamento...</div>
          ) : filteredEmails.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>Nessun messaggio trovato</div>
          ) : (
            filteredEmails.map(e => {
              const dateStr = e.data_invio ? new Date(e.data_invio).toLocaleString('it-IT', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/D';
              
              const isSelected = selectedEmail && selectedEmail.id === e.id;
              
              return (
                <div 
                  key={e.id}
                  onClick={() => {
                    setSelectedEmail(e);
                    setIsComposing(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    transition: 'all 0.2s ease',
                    background: isSelected ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                  }}
                  className="email-item-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{dateStr}</span>
                    <span className="badge" style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      fontWeight: 800,
                      backgroundColor: e.stato === 'Inviata' ? 'rgba(16, 185, 129, 0.15)' : e.stato === 'Simulata' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: e.stato === 'Inviata' ? '#10B981' : e.stato === 'Simulata' ? '#F59E0B' : '#EF4444'
                    }}>
                      {e.stato}
                    </span>
                  </div>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.destinatario}
                  </strong>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                    {e.oggetto}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: DETAIL OR COMPOSER */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {isComposing ? (
          /* COMPOSER FORM */
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              📨 Componi Nuovo Messaggio
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '13px' }}>Modello Email (Template)</label>
                <select 
                  className="form-control" 
                  value={selectedTemplate} 
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  style={{ marginTop: '6px' }}
                >
                  {Object.entries(templates).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '13px' }}>Seleziona Candidato (Opzionale)</label>
                <select 
                  className="form-control" 
                  value={selectedCandidatoId} 
                  onChange={(e) => handleCandidatoSelect(e.target.value)}
                  style={{ marginTop: '6px' }}
                >
                  <option value="">-- Seleziona per autocompilare --</option>
                  {candidati.map(c => (
                    <option key={c.id} value={c.id}>{c.cognome} {c.nome} ({c.email || 'N/D'})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '13px' }}>Destinatario E-mail *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  required
                  placeholder="destinatario@azienda.it" 
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  style={{ marginTop: '6px' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, fontSize: '13px' }}>Collega a Ricerca (Opzionale)</label>
                <select 
                  className="form-control" 
                  value={selectedRicercaId} 
                  onChange={(e) => setSelectedRicercaId(e.target.value)}
                  style={{ marginTop: '6px' }}
                >
                  <option value="">-- Nessuna ricerca collegata --</option>
                  {ricerche.map(r => (
                    <option key={r.id} value={r.id}>{r.azienda} - {r.ruolo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, fontSize: '13px' }}>Oggetto *</label>
              <input 
                type="text" 
                className="form-control" 
                required
                placeholder="Oggetto dell'email..." 
                value={oggetto}
                onChange={(e) => setOggetto(e.target.value)}
                style={{ marginTop: '6px' }}
              />
            </div>

            <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontWeight: 600, fontSize: '13px' }}>Corpo del Messaggio *</label>
              <textarea 
                className="form-control" 
                required
                placeholder="Scrivi qui il corpo del messaggio..." 
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                style={{ marginTop: '6px', flex: 1, minHeight: '200px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsComposing(false);
                  if (emails.length > 0) setSelectedEmail(emails[0]);
                }}
              >
                Annulla
              </button>
              <button type="submit" className="btn btn-primary">
                🚀 Invia Email
              </button>
            </div>
          </form>
        ) : selectedEmail ? (
          /* DETAILED EMAIL VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* Header Info */}
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge" style={{
                  fontWeight: 800,
                  backgroundColor: selectedEmail.stato === 'Inviata' ? 'rgba(16, 185, 129, 0.15)' : selectedEmail.stato === 'Simulata' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: selectedEmail.stato === 'Inviata' ? '#10B981' : selectedEmail.stato === 'Simulata' ? '#F59E0B' : '#EF4444'
                }}>
                  {selectedEmail.stato === 'Simulata' ? '⚠️ INVIO SIMULATO' : selectedEmail.stato === 'Inviata' ? '✓ INVIATA CON SUCCESSO' : '✕ INVIO FALLITO'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedEmail.data_invio ? new Date(selectedEmail.data_invio).toLocaleString('it-IT') : 'N/D'}
                </span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '8px 0', color: 'var(--text-primary)' }}>
                {selectedEmail.oggetto}
              </h2>
            </div>

            {/* From/To Metadata Box */}
            <div style={{ 
              background: 'var(--bg-primary)', 
              borderRadius: '8px', 
              padding: '16px', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '13px'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Da:</span>{' '}
                <code style={{ color: 'var(--primary)', fontWeight: 600 }}>{selectedEmail.mittente}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>A:</span>{' '}
                <code style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedEmail.destinatario}</code>
              </div>
              {selectedEmail.tipo && (
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Tipologia:</span>{' '}
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{selectedEmail.tipo.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            {/* Email Body content */}
            <div style={{ 
              flex: 1, 
              background: 'var(--bg-primary)', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              padding: '24px', 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'inherit', 
              fontSize: '14px', 
              color: 'var(--text-primary)', 
              lineHeight: 1.6,
              overflowY: 'auto'
            }}>
              {selectedEmail.corpo}
            </div>
            
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>📨</span>
            <p>Seleziona un messaggio per visualizzarne i dettagli o componi una nuova e-mail.</p>
          </div>
        )}
      </div>

    </div>
  );
}
