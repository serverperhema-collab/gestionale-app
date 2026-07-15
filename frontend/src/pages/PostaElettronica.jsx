import React, { useState, useEffect, useMemo } from 'react';

// Safe date formatter helper
const formatDateSafe = (dateString) => {
  if (!dateString) return 'N/D';
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    return String(dateString);
  }
  const now = new Date();
  
  // If today: show HH:MM
  if (parsed.toDateString() === now.toDateString()) {
    return parsed.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
  
  // If this year: show Day Month (e.g. 13 lug)
  if (parsed.getFullYear() === now.getFullYear()) {
    return parsed.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }
  
  // Older: show DD/MM/YYYY
  return parsed.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Pastel colors for sender avatars
const getAvatarColor = (name = '') => {
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#34d399', '#2dd4bf', 
    '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#f472b6'
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export default function PostaElettronica({ candidati = [], clienti = [], ricerche = [], showStatus, API_BASE, fetchCandidati }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Attachment linking states
  const [linkingAttachment, setLinkingAttachment] = useState(null);
  const [linkingCandidateId, setLinkingCandidateId] = useState('');
  const [linkingDocType, setLinkingDocType] = useState('cv');
  const [submittingLink, setSubmittingLink] = useState(false);

  // Custom confirmation modal state
  const [confirmModalData, setConfirmModalData] = useState(null);

  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setConfirmModalData({
        message,
        onConfirm: () => {
          setConfirmModalData(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmModalData(null);
          resolve(false);
        }
      });
    });
  };

  const handleConfirmLink = async (att, forceOverwrite = false) => {
    if (!linkingCandidateId) return;

    // Optional frontend client-side warning check (safety measure)
    const cand = candidati.find(c => String(c.id) === String(linkingCandidateId));
    if (cand && !forceOverwrite) {
      if (linkingDocType === 'cv' && cand.link_cv && cand.link_cv.trim() !== '') {
        const confirmOverwrite = await showConfirm(`Il candidato ${cand.nome} ${cand.cognome} ha già un Curriculum Vitae collegato. Vuoi sostituirlo con questo allegato?`);
        if (!confirmOverwrite) return;
      } else if (linkingDocType === 'doc' && cand.link_documenti && cand.link_documenti.trim() !== '') {
        const confirmOverwrite = await showConfirm(`Il candidato ${cand.nome} ${cand.cognome} ha già un Documento d'identità collegato. Vuoi sostituirlo con questo allegato?`);
        if (!confirmOverwrite) return;
      }
    }

    try {
      setSubmittingLink(true);
      showStatus('loading', 'Collegamento allegato...', 'Collegamento del file alla scheda candidato in corso...');
      const res = await fetch(`${API_BASE}/candidati/${linkingCandidateId}/collega-allegato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localName: att.localName,
          filename: att.filename,
          tipo_documento: linkingDocType,
          overwrite: forceOverwrite
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Allegato collegato!', `L'allegato "${att.filename}" è stato collegato con successo.`);
        setLinkingAttachment(null);
        setLinkingCandidateId('');
        if (typeof fetchCandidati === 'function') {
          await fetchCandidati();
        }
      } else if (json.error === 'already_exists') {
        const confirmOverwrite = await showConfirm(json.message);
        if (confirmOverwrite) {
          await handleConfirmLink(att, true);
        }
      } else {
        showStatus('error', 'Errore di collegamento', json.error || 'Impossibile collegare l\'allegato.');
      }
    } catch (err) {
      showStatus('error', 'Errore di rete', err.message);
    } finally {
      setSubmittingLink(false);
    }
  };
  
  // Navigation & Folders
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Floating Compose Drawer
  const [isComposing, setIsComposing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Form states
  const [destinatario, setDestinatario] = useState('');
  const [oggetto, setOggetto] = useState('');
  const [corpo, setCorpo] = useState('');
  const [selectedCandidatoId, setSelectedCandidatoId] = useState('');
  const [selectedRicercaId, setSelectedRicercaId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');

  // IMAP Sync States
  const [syncing, setSyncing] = useState(false);
  const [offset, setOffset] = useState(0);

  // Load emails
  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/emails`);
      const json = await res.json();
      if (json.success) {
        setEmails(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEmails = async (isLoadMore = false) => {
    try {
      setSyncing(true);
      const nextOffset = isLoadMore ? offset + 50 : 0;
      
      showStatus('loading', 'Sincronizzazione...', isLoadMore ? 'Recupero messaggi meno recenti...' : 'Sincronizzazione con il server Aruba in corso...');
      
      const res = await fetch(`${API_BASE}/emails/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50, offset: nextOffset })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Sincronizzazione completata!', isLoadMore 
          ? `Caricati altri messaggi (nuovi messaggi salvati: ${json.addedCount || 0}).`
          : `La casella postale è aggiornata (nuovi messaggi scaricati: ${json.addedCount || 0}).`);
        
        if (isLoadMore) {
          setOffset(nextOffset);
        } else {
          setOffset(0); // Reset offset on fresh sync
        }
        await fetchEmails();
      } else {
        showStatus('error', 'Errore sincronizzazione', json.error || 'Impossibile connettersi ad Aruba.');
      }
    } catch (err) {
      showStatus('error', 'Errore di connessione', err.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchEmails();
    if (typeof fetchCandidati === 'function') {
      fetchCandidati();
    }
  }, []);

  // Templates definition
  const templates = {
    custom: { label: 'Scrittura Libera', subject: '', body: '' },
    colloquio: {
      label: 'Richiesta di Colloquio',
      subject: 'Convocazione Colloquio Conoscitivo - HEMA Selezione',
      body: 'Gentile Candidato,\n\nin merito alla sua candidatura inserita nel nostro database, vorremmo concordare un colloquio conoscitivo in presenza o video-call.\n\nLe chiediamo cortesemente di comunicarci la sua disponibilità per i primi giorni della prossima settimana.\n\nUn cordiale saluto,\nTeam Risorse Umane'
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
        if (selectedTemplate !== 'custom') {
          let updatedBody = templates[selectedTemplate].body
            .replace('Gentile Candidato', `Gentile ${cand.nome} ${cand.cognome}`)
            .replace('Gentile Collaboratore', `Gentile ${cand.nome} ${cand.cognome}`);
          setCorpo(updatedBody);
        }
      }
    }
  };

  // Toggle favorite / star status
  const toggleStar = async (id, currentVal, e) => {
    if (e) e.stopPropagation();
    const newVal = currentVal === 1 ? 0 : 1;
    // Optimistic UI update
    setEmails(prev => prev.map(item => item.id === id ? { ...item, preferito: newVal } : item));
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(prev => ({ ...prev, preferito: newVal }));
    }
    
    try {
      await fetch(`${API_BASE}/emails/${id}/preferito`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferito: newVal })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle read/unread status
  const toggleReadStatus = async (id, currentVal, e) => {
    if (e) e.stopPropagation();
    const newVal = currentVal === 1 ? 0 : 1;
    setEmails(prev => prev.map(item => item.id === id ? { ...item, letto: newVal } : item));
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(prev => ({ ...prev, letto: newVal }));
    }

    try {
      await fetch(`${API_BASE}/emails/${id}/letto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letto: newVal })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Move single or batch to folder (trash, spam, etc.)
  const moveToFolder = async (ids, folder, e) => {
    if (e) e.stopPropagation();
    const idList = Array.isArray(ids) ? ids : [ids];
    
    // Optimistic update
    setEmails(prev => prev.map(item => idList.includes(item.id) ? { ...item, cartella: folder } : item));
    if (selectedEmail && idList.includes(selectedEmail.id)) {
      setSelectedEmail(null);
    }
    setSelectedIds(prev => {
      const next = new Set(prev);
      idList.forEach(id => next.delete(id));
      return next;
    });

    try {
      await Promise.all(idList.map(id => 
        fetch(`${API_BASE}/emails/${id}/cartella`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartella: folder })
        })
      ));
      showStatus('success', 'Operazione completata', `E-mail spostate in ${folder === 'trash' ? 'Cestino' : folder}.`);
    } catch (err) {
      console.error(err);
      showStatus('error', 'Errore', 'Impossibile completare lo spostamento.');
    }
  };

  // Permanently delete from trash
  const deletePermanently = async (ids, e) => {
    if (e) e.stopPropagation();
    const idList = Array.isArray(ids) ? ids : [ids];
    
    if (!window.confirm("Sei sicuro di voler eliminare DEFINITIVAMENTE questi messaggi? Non potrai più recuperarli.")) {
      return;
    }

    setEmails(prev => prev.filter(item => !idList.includes(item.id)));
    if (selectedEmail && idList.includes(selectedEmail.id)) {
      setSelectedEmail(null);
    }
    setSelectedIds(prev => {
      const next = new Set(prev);
      idList.forEach(id => next.delete(id));
      return next;
    });

    try {
      await Promise.all(idList.map(id => 
        fetch(`${API_BASE}/emails/${id}`, { method: 'DELETE' })
      ));
      showStatus('success', 'Eliminazione completata', 'Messaggi eliminati definitivamente.');
    } catch (err) {
      console.error(err);
    }
  };

  // Batch actions
  const handleBatchStar = async (starred) => {
    const list = Array.from(selectedIds);
    setEmails(prev => prev.map(item => list.includes(item.id) ? { ...item, preferito: starred ? 1 : 0 } : item));
    setSelectedIds(new Set());
    try {
      await Promise.all(list.map(id => 
        fetch(`${API_BASE}/emails/${id}/preferito`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferito: starred ? 1 : 0 })
        })
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchRead = async (read) => {
    const list = Array.from(selectedIds);
    setEmails(prev => prev.map(item => list.includes(item.id) ? { ...item, letto: read ? 1 : 0 } : item));
    setSelectedIds(new Set());
    try {
      await Promise.all(list.map(id => 
        fetch(`${API_BASE}/emails/${id}/letto`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ letto: read ? 1 : 0 })
        })
      ));
    } catch (e) {
      console.error(e);
    }
  };

  // Selection toggle
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const ids = currentFolderEmails.map(item => item.id);
      setSelectedIds(new Set(ids));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

  // Reply email
  const handleReply = (email) => {
    setDestinatario(email.mittente);
    setOggetto(`Risp: ${email.oggetto}`);
    setCorpo(`\n\n--- Il giorno ${new Date(email.data_invio).toLocaleString('it-IT')} <${email.mittente}> ha scritto:\n> ${email.corpo.split('\n').join('\n> ')}`);
    setIsComposing(true);
    setIsMinimized(false);
  };

  // Filter and display current folder emails
  const currentFolderEmails = useMemo(() => {
    let list = emails;
    if (currentFolder === 'speciali') {
      list = emails.filter(e => e.preferito === 1 && e.cartella !== 'trash');
    } else if (currentFolder === 'posticipati') {
      list = emails.filter(e => e.data_posticipato != null && e.cartella !== 'trash');
    } else {
      list = emails.filter(e => e.cartella === currentFolder);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(e => 
      (e.destinatario || '').toLowerCase().includes(q) ||
      (e.oggetto || '').toLowerCase().includes(q) ||
      (e.corpo || '').toLowerCase().includes(q) ||
      (e.mittente || '').toLowerCase().includes(q)
    );
  }, [emails, currentFolder, searchQuery]);

  // Unread folder counts
  const counts = useMemo(() => {
    return {
      inbox: emails.filter(e => e.cartella === 'inbox' && e.letto === 0).length,
      spam: emails.filter(e => e.cartella === 'spam' && e.letto === 0).length,
      trash: emails.filter(e => e.cartella === 'trash' && e.letto === 0).length,
    };
  }, [emails]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', height: 'calc(100vh - 120px)', minHeight: '600px', position: 'relative' }}>
      
      {/* Styles Injection */}
      <style>{`
        .gmail-sidebar-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-radius: 0 20px 20px 0;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 2px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.15s ease;
          border-left: 3px solid transparent;
        }
        .gmail-sidebar-item:hover {
          background-color: var(--border);
          color: var(--text-primary);
        }
        .gmail-sidebar-item.active {
          background-color: rgba(79, 70, 229, 0.12);
          color: var(--primary);
          font-weight: 700;
          border-left: 3px solid var(--primary);
        }
        .email-row {
          display: grid;
          grid-template-columns: 40px 30px 200px 1fr 100px;
          align-items: center;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.15s ease;
          background: var(--bg-secondary);
        }
        .email-row:hover {
          box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
          z-index: 2;
          background: var(--bg-primary);
        }
        .email-row.unread {
          background: var(--bg-primary);
          font-weight: bold;
          color: var(--text-primary);
        }
        .email-row.selected {
          background: rgba(79, 70, 229, 0.08);
        }
        .hover-actions-trigger {
          position: relative;
        }
        .hover-actions {
          display: none;
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg-primary);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          gap: 6px;
        }
        .email-row:hover .hover-actions {
          display: flex;
        }
      `}</style>

      {/* LEFT SIDEBAR (Gmail design) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
        
        {/* Pill Scrivi Button */}
        <button
          className="btn btn-primary"
          style={{
            borderRadius: '24px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
            width: '180px',
            marginBottom: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
          onClick={() => {
            setIsComposing(true);
            setIsMinimized(false);
          }}
        >
          <span style={{ fontSize: '20px' }}>✏️</span>
          Scrivi
        </button>

        {/* Folders List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div 
            className={`gmail-sidebar-item ${currentFolder === 'inbox' ? 'active' : ''}`}
            onClick={() => { setCurrentFolder('inbox'); setSelectedEmail(null); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📥</span>
              <span>Posta in arrivo</span>
            </div>
            {counts.inbox > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                {counts.inbox}
              </span>
            )}
          </div>

          <div 
            className={`gmail-sidebar-item ${currentFolder === 'speciali' ? 'active' : ''}`}
            onClick={() => { setCurrentFolder('speciali'); setSelectedEmail(null); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⭐</span>
              <span>Speciali</span>
            </div>
          </div>

          <div 
            className={`gmail-sidebar-item ${currentFolder === 'posticipati' ? 'active' : ''}`}
            onClick={() => { setCurrentFolder('posticipati'); setSelectedEmail(null); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⏰</span>
              <span>Posticipati</span>
            </div>
          </div>

          <div 
            className={`gmail-sidebar-item ${currentFolder === 'sent' ? 'active' : ''}`}
            onClick={() => { setCurrentFolder('sent'); setSelectedEmail(null); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📤</span>
              <span>Inviate</span>
            </div>
          </div>

          <div 
            className={`gmail-sidebar-item ${currentFolder === 'spam' ? 'active' : ''}`}
            onClick={() => { setCurrentFolder('spam'); setSelectedEmail(null); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🚫</span>
              <span>Spam</span>
            </div>
            {counts.spam > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                {counts.spam}
              </span>
            )}
          </div>

          <div 
            className={`gmail-sidebar-item ${currentFolder === 'trash' ? 'active' : ''}`}
            onClick={() => { setCurrentFolder('trash'); setSelectedEmail(null); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🗑️</span>
              <span>Cestino</span>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT PANE: LIST OR VIEW */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border)', 
        borderRadius: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>

        {/* 1. Gmail-Style Top Search Bar */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)', 
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--bg-secondary)', 
            borderRadius: '24px', 
            padding: '8px 16px',
            flex: 1,
            maxWidth: '720px',
            border: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: '16px', marginRight: '10px', color: 'var(--text-secondary)' }}>🔍</span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Cerca nella posta..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', padding: 0, outline: 'none', boxShadow: 'none', width: '100%', color: 'var(--text-primary)' }}
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchEmails}>🔄 Ricarica</button>
          <button className="btn btn-primary btn-sm" onClick={() => handleSyncEmails(false)} disabled={syncing}>
            {syncing ? '⏳ Sincronizzazione...' : '🔄 Sincronizza con Aruba'}
          </button>
        </div>

        {/* 2. List or Detail View */}
        {!selectedEmail ? (
          /* EMAIL LISTING */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Action Bar (Top Controls) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '10px 20px', 
              background: 'var(--bg-primary)', 
              borderBottom: '1px solid var(--border)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input 
                  type="checkbox" 
                  checked={currentFolderEmails.length > 0 && selectedIds.size === currentFolderEmails.length}
                  onChange={handleSelectAll} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                
                {/* Batch Actions buttons */}
                {selectedIds.size > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-secondary btn-xs" onClick={() => handleBatchRead(true)}>📩 Segna Letto</button>
                    <button className="btn btn-secondary btn-xs" onClick={() => handleBatchRead(false)}>✉️ Segna Non Letto</button>
                    <button className="btn btn-secondary btn-xs" onClick={() => handleBatchStar(true)}>⭐ Speciale</button>
                    
                    {currentFolder !== 'trash' ? (
                      <button className="btn btn-danger btn-xs" onClick={() => moveToFolder(Array.from(selectedIds), 'trash')}>🗑️ Cestino</button>
                    ) : (
                      <button className="btn btn-danger btn-xs" onClick={() => deletePermanently(Array.from(selectedIds))}>🗑️ Elimina Definitivamente</button>
                    )}
                    {currentFolder !== 'spam' && currentFolder !== 'trash' && (
                      <button className="btn btn-secondary btn-xs" onClick={() => moveToFolder(Array.from(selectedIds), 'spam')}>🚫 Spam</button>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {currentFolderEmails.length > 0 ? `1-${currentFolderEmails.length} di ${currentFolderEmails.length}` : '0-0 di 0'}
              </div>

            </div>

            {/* Emails Scrollable Area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading && emails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '24px' }}>⏳</span> Caricamento in corso...
                </div>
              ) : currentFolderEmails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>✉️</span>
                  Nessun messaggio trovato in questa cartella.
                </div>
              ) : (
                currentFolderEmails.map(e => {
                  const isStarred = e.preferito === 1;
                  const isRead = e.letto === 1;
                  const isChecked = selectedIds.has(e.id);
                  const senderName = e.cartella === 'sent' ? `A: ${e.destinatario}` : e.mittente.split('@')[0];

                  return (
                    <div 
                      key={e.id}
                      className={`email-row ${!isRead ? 'unread' : ''} ${isChecked ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedEmail(e);
                        // Automatically mark as read when opened
                        if (!isRead) {
                          toggleReadStatus(e.id, 0);
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(event) => handleSelectRow(e.id, event)}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                      />

                      {/* Star */}
                      <span 
                        onClick={(event) => toggleStar(e.id, e.preferito, event)}
                        style={{ fontSize: '16px', color: isStarred ? '#f59e0b' : '#9ca3af', cursor: 'pointer' }}
                      >
                        {isStarred ? '★' : '☆'}
                      </span>

                      {/* Sender */}
                      <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                        {senderName}
                      </span>

                      {/* Subject and snippet */}
                      <div style={{ display: 'flex', gap: '8px', overflow: 'hidden', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{e.oggetto}</span>
                        <span style={{ color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          — {e.corpo}
                        </span>
                      </div>

                      {/* Date / Hover actions */}
                      <div className="hover-actions-trigger" style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>{formatDateSafe(e.data_invio)}</span>
                        
                        {/* Hover Actions */}
                        <div className="hover-actions">
                          <span 
                            title={isRead ? "Segna come da leggere" : "Segna come letto"}
                            onClick={(event) => toggleReadStatus(e.id, e.letto, event)}
                            style={{ cursor: 'pointer', fontSize: '14px' }}
                          >
                            {isRead ? '📧' : '📩'}
                          </span>
                          {e.cartella !== 'trash' ? (
                            <span 
                              title="Sposta nel Cestino"
                              onClick={(event) => moveToFolder(e.id, 'trash', event)}
                              style={{ cursor: 'pointer', fontSize: '14px' }}
                            >
                              🗑️
                            </span>
                          ) : (
                            <span 
                              title="Elimina definitivamente"
                              onClick={(event) => deletePermanently(e.id, event)}
                              style={{ cursor: 'pointer', fontSize: '14px' }}
                            >
                              ❌
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {currentFolder === 'inbox' && currentFolderEmails.length > 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => handleSyncEmails(true)}
                    disabled={syncing}
                    style={{ padding: '8px 24px', borderRadius: '20px', fontWeight: 600 }}
                  >
                    {syncing ? '⏳ Caricamento...' : '⬇️ Carica altre e-mail (meno recenti)'}
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* DETAILED EMAIL VIEW */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
            
            {/* Detail Actions Top Bar */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px', 
              padding: '12px 20px', 
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-secondary)'
            }}>
              
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setSelectedEmail(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ⬅️ Torna alla lista
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                <span 
                  title="Aggiungi/Rimuovi da Speciali"
                  onClick={() => toggleStar(selectedEmail.id, selectedEmail.preferito)}
                  style={{ fontSize: '20px', cursor: 'pointer', color: selectedEmail.preferito === 1 ? '#f59e0b' : '#9ca3af' }}
                >
                  {selectedEmail.preferito === 1 ? '★' : '☆'}
                </span>

                <span 
                  title={selectedEmail.letto === 1 ? "Segna come da leggere" : "Segna come letto"}
                  onClick={() => { toggleReadStatus(selectedEmail.id, selectedEmail.letto); setSelectedEmail(null); }}
                  style={{ fontSize: '18px', cursor: 'pointer' }}
                >
                  {selectedEmail.letto === 1 ? '📧' : '📩'}
                </span>

                {selectedEmail.cartella !== 'trash' ? (
                  <button 
                    className="btn btn-danger btn-xs" 
                    title="Sposta nel Cestino"
                    onClick={() => moveToFolder(selectedEmail.id, 'trash')}
                  >
                    🗑️ Sposta nel Cestino
                  </button>
                ) : (
                  <button 
                    className="btn btn-danger btn-xs" 
                    title="Elimina Definitivamente"
                    onClick={() => deletePermanently(selectedEmail.id)}
                  >
                    🗑️ Elimina Definitivamente
                  </button>
                )}

                {selectedEmail.cartella !== 'spam' && selectedEmail.cartella !== 'trash' && (
                  <button 
                    className="btn btn-secondary btn-xs"
                    onClick={() => moveToFolder(selectedEmail.id, 'spam')}
                  >
                    🚫 Segna come Spam
                  </button>
                )}
                
                {selectedEmail.cartella === 'trash' || selectedEmail.cartella === 'spam' ? (
                  <button 
                    className="btn btn-secondary btn-xs"
                    onClick={() => moveToFolder(selectedEmail.id, 'inbox')}
                  >
                    📥 Sposta in Posta in Arrivo
                  </button>
                ) : null}
              </div>

            </div>

            {/* Email Header Metadata */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
              
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                {selectedEmail.oggetto}
              </h2>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {/* Sender Avatar */}
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: getAvatarColor(selectedEmail.mittente), 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {(selectedEmail.mittente || 'H')[0].toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{selectedEmail.mittente}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(selectedEmail.data_invio).toLocaleString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    a {selectedEmail.destinatario}
                  </div>
                </div>
              </div>

            </div>

            {/* Email Content scrollable area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px', background: 'var(--bg-primary)' }}>
              
              {/* Linked Subject Metadata Box */}
              {(selectedEmail.id_candidato || selectedEmail.id_ricerca) && (
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '10px', 
                  padding: '12px 16px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  fontSize: '13px'
                }}>
                  {selectedEmail.id_candidato && (
                    <div>
                      🔗 <strong>Candidato:</strong>{' '}
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {candidati.find(c => String(c.id) === String(selectedEmail.id_candidato))?.cognome || 'Vedi Profilo'} 
                        {' '}{candidati.find(c => String(c.id) === String(selectedEmail.id_candidato))?.nome || ''}
                      </span>
                    </div>
                  )}
                  {selectedEmail.id_ricerca && (
                    <div>
                      💼 <strong>Mandato:</strong>{' '}
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {ricerche.find(r => String(r.id) === String(selectedEmail.id_ricerca))?.azienda || 'Vedi Ricerca'} 
                        {' '}- {ricerche.find(r => String(r.id) === String(selectedEmail.id_ricerca))?.ruolo || ''}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.6, 
                fontSize: '14px', 
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}>
                {selectedEmail.corpo}
              </div>

              {/* Email Attachments Render */}
              {(() => {
                let parsedAllegati = [];
                if (selectedEmail.allegati) {
                  try {
                    parsedAllegati = typeof selectedEmail.allegati === 'string'
                      ? JSON.parse(selectedEmail.allegati)
                      : selectedEmail.allegati;
                  } catch (e) {
                    console.error("Errore parsing allegati:", e);
                  }
                }
                
                if (!parsedAllegati || parsedAllegati.length === 0) return null;
                
                const formatSize = (bytes) => {
                  if (!bytes) return '';
                  if (bytes < 1024) return `${bytes} B`;
                  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
                  return `${(bytes / 1048576).toFixed(1)} MB`;
                };

                return (
                  <div style={{ 
                    marginTop: '30px', 
                    padding: '16px', 
                    background: 'var(--bg-secondary)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '10px' 
                  }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: 'var(--text-primary)', 
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📎 Allegati ({parsedAllegati.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {parsedAllegati.map((att, i) => {
                        const fileUrl = `${API_BASE.replace('/api', '')}/uploads/doc/${att.localName}`;
                        const isCurrentlyLinking = linkingAttachment && linkingAttachment.localName === att.localName;
                        return (
                          <div key={i} style={{ 
                            background: 'var(--bg-primary)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '8px',
                            padding: '10px 14px', 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            fontSize: '13px'
                          }}>
                            {/* Main row */}
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              width: '100%'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '18px' }}>📄</span>
                                <span style={{ 
                                  fontWeight: 500, 
                                  color: 'var(--text-primary)', 
                                  textOverflow: 'ellipsis', 
                                  overflow: 'hidden', 
                                  whiteSpace: 'nowrap' 
                                }}>
                                  {att.filename}
                                </span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                                  ({formatSize(att.size)})
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isCurrentlyLinking) {
                                      setLinkingAttachment(null);
                                      setLinkingCandidateId('');
                                    } else {
                                      setLinkingAttachment(att);
                                      setLinkingCandidateId('');
                                    }
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: isCurrentlyLinking ? 'var(--border)' : 'rgba(79, 70, 229, 0.1)',
                                    color: isCurrentlyLinking ? 'var(--text-secondary)' : 'var(--primary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                  }}
                                >
                                  🔗 Collega
                                </button>
                                <a 
                                  href={fileUrl} 
                                  download={att.filename}
                                  target="_blank" 
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.2s'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                  ⬇️ Scarica
                                </a>
                              </div>
                            </div>

                            {/* Inline linking container */}
                            {isCurrentlyLinking && (
                              <div style={{ 
                                padding: '12px', 
                                background: 'var(--bg-secondary)', 
                                border: '1px dashed var(--primary)', 
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                marginTop: '4px'
                              }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                  Collega questo allegato ad un candidato:
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <select 
                                    value={linkingCandidateId} 
                                    onChange={(e) => setLinkingCandidateId(e.target.value)}
                                    className="form-control"
                                    style={{ flex: 1, minWidth: '180px', height: '32px', fontSize: '13px', padding: '4px 8px' }}
                                  >
                                    <option value="">-- Seleziona Candidato --</option>
                                    {[...candidati].sort((a,b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`)).map(c => (
                                      <option key={c.id} value={c.id}>{c.cognome} {c.nome} ({c.email || 'N/D'})</option>
                                    ))}
                                  </select>

                                  <select 
                                    value={linkingDocType} 
                                    onChange={(e) => setLinkingDocType(e.target.value)}
                                    className="form-control"
                                    style={{ width: '180px', height: '32px', fontSize: '13px', padding: '4px 8px' }}
                                  >
                                    <option value="cv">Curriculum Vitae (CV)</option>
                                    <option value="doc">Documento Identità</option>
                                  </select>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button 
                                    type="button" 
                                    className="btn btn-secondary btn-xs"
                                    onClick={() => {
                                      setLinkingAttachment(null);
                                      setLinkingCandidateId('');
                                    }}
                                  >
                                    Annulla
                                  </button>
                                  <button 
                                    type="button" 
                                    className="btn btn-primary btn-xs"
                                    disabled={!linkingCandidateId || submittingLink}
                                    onClick={() => handleConfirmLink(att)}
                                  >
                                    {submittingLink ? 'Collegamento...' : 'Conferma Collegamento'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Action reply at bottom */}
              <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleReply(selectedEmail)}>
                  ↩️ Rispondi
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setOggetto(`Inoltra: ${selectedEmail.oggetto}`);
                    setCorpo(`\n\n---------- Messaggio inoltrato ----------\nDa: <${selectedEmail.mittente}>\nData: ${new Date(selectedEmail.data_invio).toLocaleString('it-IT')}\nOggetto: ${selectedEmail.oggetto}\nA: <${selectedEmail.destinatario}>\n\n${selectedEmail.corpo}`);
                    setDestinatario('');
                    setIsComposing(true);
                    setIsMinimized(false);
                  }}
                >
                  ➡️ Inoltra
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* 3. FLOATING COMPOSE WIDGET (Gmail-Style Drawer at bottom-right) */}
      {isComposing && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          right: '80px',
          width: '600px',
          height: isMinimized ? '44px' : '520px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          transition: 'height 0.25s ease'
        }}>
          
          {/* Header Compose Widget */}
          <div style={{
            background: '#202124',
            color: 'white',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }} onClick={() => setIsMinimized(!isMinimized)}>
            <strong style={{ fontSize: '14px' }}>Nuovo Messaggio</strong>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }} title="Riduci/Ingrandisci">
                {isMinimized ? '🗖' : '🗕'}
              </span>
              <span 
                style={{ fontSize: '18px', fontWeight: 'bold' }} 
                title="Chiudi bozza" 
                onClick={(e) => { e.stopPropagation(); setIsComposing(false); }}
              >
                ✕
              </span>
            </div>
          </div>

          {/* Form Content (visible only when not minimized) */}
          {!isMinimized && (
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              
              <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                
                {/* Autocompletes Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Modello Email</label>
                    <select 
                      className="form-control" 
                      value={selectedTemplate} 
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      style={{ height: '32px', padding: '4px 8px', fontSize: '13px' }}
                    >
                      {Object.entries(templates).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Collega Candidato</label>
                    <select 
                      className="form-control" 
                      value={selectedCandidatoId} 
                      onChange={(e) => handleCandidatoSelect(e.target.value)}
                      style={{ height: '32px', padding: '4px 8px', fontSize: '13px' }}
                    >
                      <option value="">-- Seleziona --</option>
                      {candidati.map(c => (
                        <option key={c.id} value={c.id}>{c.cognome} {c.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destinatario & Ricerca */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>A *</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      required
                      placeholder="destinatario@mail.it" 
                      value={destinatario}
                      onChange={(e) => setDestinatario(e.target.value)}
                      style={{ height: '32px', padding: '4px 8px', fontSize: '13px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Collega Ricerca</label>
                    <select 
                      className="form-control" 
                      value={selectedRicercaId} 
                      onChange={(e) => setSelectedRicercaId(e.target.value)}
                      style={{ height: '32px', padding: '4px 8px', fontSize: '13px' }}
                    >
                      <option value="">-- Nessuna --</option>
                      {ricerche.map(r => (
                        <option key={r.id} value={r.id}>{r.azienda} - {r.ruolo}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Oggetto */}
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Oggetto *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    placeholder="Oggetto dell'e-mail..." 
                    value={oggetto}
                    onChange={(e) => setOggetto(e.target.value)}
                    style={{ height: '32px', padding: '4px 8px', fontSize: '13px' }}
                  />
                </div>

                {/* Message Body */}
                <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Corpo del Messaggio *</label>
                  <textarea 
                    className="form-control" 
                    required
                    placeholder="Scrivi il messaggio qui..." 
                    value={corpo}
                    onChange={(e) => setCorpo(e.target.value)}
                    style={{ flex: 1, resize: 'none', padding: '10px', fontSize: '13px', minHeight: '160px', fontFamily: 'inherit', marginTop: '4px' }}
                  />
                </div>

              </div>

              {/* Compose Footer Actions */}
              <div style={{ 
                padding: '12px 16px', 
                borderTop: '1px solid var(--border)', 
                background: 'var(--bg-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px', borderRadius: '18px', fontWeight: 600 }}>
                  🚀 Invia
                </button>
                
                <span 
                  title="Elimina Bozza"
                  onClick={() => setIsComposing(false)}
                  style={{ fontSize: '20px', cursor: 'pointer', padding: '4px' }}
                >
                  🗑️
                </span>
              </div>

            </form>
          )}

        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            width: '420px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>Conferma Operazione</h4>
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.5 
            }}>
              {confirmModalData.message}
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end', 
              marginTop: '8px' 
            }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ 
                  borderRadius: '8px', 
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
                onClick={confirmModalData.onCancel}
              >
                Annulla
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ 
                  borderRadius: '8px', 
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
                onClick={confirmModalData.onConfirm}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
