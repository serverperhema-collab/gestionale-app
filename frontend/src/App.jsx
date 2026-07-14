import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAppController } from './hooks/useAppController';
import GlobalModals from './components/GlobalModals';

import Dashboard from './pages/Dashboard';
import GestioneRicerche from './pages/GestioneRicerche';
import Approvazioni from './pages/Approvazioni';
import Riserva from './pages/Riserva';
import Cestinati from './pages/Cestinati';
import Pausa from './pages/Pausa';
import GestioneCommerciali from './pages/GestioneCommerciali';
import ConfigurazioneEmail from './pages/EmailConfig';
import Candidati from './pages/GestioneCandidati';
import Clienti from './pages/GestioneClienti';
import RicercaDetail from './pages/RicercaDetail';
import PostaElettronica from './pages/PostaElettronica';
import GestioneAnnunci from './pages/GestioneAnnunci';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fee', zIndex: 9999, position: 'relative' }}>
          <h2>Qualcosa e andato storto nel renderizzare la vista principale.</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.error && this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default function App() {
  const ctrl = useAppController();

  React.useEffect(() => {
    let title = "HR Management";
    if (ctrl.selectedRicercaId && ctrl.ricercaDetail?.ricerca) {
      const r = ctrl.ricercaDetail.ricerca;
      title = `Mandato: ${r.ruolo} @ ${r.azienda}`;
    } else {
      switch (ctrl.currentPage) {
        case 'dashboard': title = "Dashboard - HR Management"; break;
        case 'ricerche': title = "Mandati & Ricerche - HR Management"; break;
        case 'approvazioni': title = "Mandati da Approvare - HR Management"; break;
        case 'riserva': title = "Mandati in Riserva - HR Management"; break;
        case 'pausa': title = "Mandati in Pausa - HR Management"; break;
        case 'cestinati': title = "Mandati Cestinati - HR Management"; break;
        case 'candidati': title = "Anagrafica Candidati - HR Management"; break;
        case 'clienti': title = "Clienti - HR Management"; break;
        case 'annunci': title = "Gestione Annunci - HR Management"; break;
        case 'commerciali_gestione': title = "Gestione Commerciali - HR Management"; break;
        case 'posta': title = "Posta Elettronica - HR Management"; break;
        case 'email_config': title = "Configurazione SMTP - HR Management"; break;
      }
    }
    document.title = title;
  }, [ctrl.currentPage, ctrl.selectedRicercaId, ctrl.ricercaDetail]);

  React.useEffect(() => {
    ctrl.setSelectedRicercaId(null);
  }, [ctrl.currentPage]);

  // Next/Prev navigation logic for details page
  const getNavigableRicerche = () => {
    const all = ctrl.ricerche || [];
    switch (ctrl.currentPage) {
      case 'approvazioni':
        return all.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione');
      case 'riserva':
        return all.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva');
      case 'pausa':
        return all.filter(r => r.stato_approvazione_tl === 'In Pausa');
      case 'cestinati':
        return all.filter(r => r.stato_approvazione_tl === 'Cestinato');
      default:
        return all.filter(r => r.stato_approvazione_tl === 'Approvata' || r.stato_approvazione_tl === 'Approvata con Riserva');
    }
  };

  const navList = getNavigableRicerche();
  const currentIndex = navList.findIndex(r => r.id === ctrl.selectedRicercaId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < navList.length - 1;

  const handlePrev = () => {
    if (hasPrev) ctrl.setSelectedRicercaId(navList[currentIndex - 1].id);
  };
  const handleNext = () => {
    if (hasNext) ctrl.setSelectedRicercaId(navList[currentIndex + 1].id);
  };

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💼 HR MANAGEMENT</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('dashboard'); ctrl.setSelectedRicercaId(null); }}>📊 Dashboard</button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'ricerche' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('ricerche'); ctrl.setSelectedRicercaId(null); }}>📋 Mandati & Ricerche</button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'approvazioni' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('approvazioni'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              ⏳ Mandati da Approvare
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'riserva' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('riserva'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              ⚠️ Mandati in Riserva
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'pausa' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('pausa'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              ⏸️ Mandati in Pausa
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In Pausa').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In Pausa').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'cestinati' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('cestinati'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              🗑️ Mandati Cestinati
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Cestinato').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Cestinato').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'candidati' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('candidati'); ctrl.setSelectedRicercaId(null); }}>👥 Database Candidati</button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'annunci' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('annunci'); ctrl.setSelectedRicercaId(null); }}>📢 Bacheca Annunci</button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'clienti' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('clienti'); ctrl.setSelectedRicercaId(null); }}>🏢 Anagrafica Clienti</button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'commerciali_gestione' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('commerciali_gestione'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              🤝 Commerciali & Accessi
              {ctrl.commerciali.filter(c => c.stato_approvazione === 'Da Approvare').length > 0 && (
                <span className="badge-notification">{ctrl.commerciali.filter(c => c.stato_approvazione === 'Da Approvare').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'posta' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('posta'); ctrl.setSelectedRicercaId(null); }}>📧 Posta Elettronica</button>
          </li>
          <li>
            <button className="menu-item" onClick={() => window.open('https://web.whatsapp.com/', 'whatsappWeb', 'width=1200,height=800,left=100,top=100')}>💬 WhatsApp</button>
          </li>
          <li>
            <button className={`menu-item ${ctrl.currentPage === 'email_config' ? 'active' : ''}`} onClick={() => { ctrl.setCurrentPage('email_config'); ctrl.setSelectedRicercaId(null); }}>⚙️ Configurazione E-mail</button>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* HEADER */}
        <header className="content-header">
          <h1>
            {ctrl.selectedRicercaId 
              ? `Gestione Mandato: ${ctrl.ricercaDetail ? `${ctrl.ricercaDetail.ricerca.ruolo} @ ${ctrl.ricercaDetail.ricerca.azienda}` : 'Caricamento...'}` 
              : ctrl.currentPage === 'dashboard' ? 'Dashboard Principale'
              : ctrl.currentPage === 'approvazioni' ? 'Mandati Commerciali da Approvare'
              : ctrl.currentPage === 'riserva' ? 'Mandati in Riserva'
              : ctrl.currentPage === 'pausa' ? 'Mandati in Pausa'
              : ctrl.currentPage === 'cestinati' ? 'Mandati Cestinati'
              : ctrl.currentPage === 'ricerche' ? 'Mandati e Ricerche Attive'
              : ctrl.currentPage === 'candidati' ? 'Database Curricula'
              : ctrl.currentPage === 'annunci' ? 'Bacheca Annunci Globali'
              : ctrl.currentPage === 'commerciali_gestione' ? 'Gestione Profili Commerciali'
              : ctrl.currentPage === 'email_config' ? 'Configurazione Server E-mail'
              : ctrl.currentPage === 'posta' ? 'Client Posta Elettronica'
              : ctrl.currentPage === 'whatsapp' ? 'Integrazione WhatsApp Web'
              : 'Anagrafica Potenziali Clienti'
            }
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="btn btn-sm" 
              style={{ backgroundColor: '#dc3545', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }} 
              onClick={async () => {
                if (window.confirm("Sei sicuro di voler eliminare DEFINITIVAMENTE tutti i log e i dati di test di Rossi Marco?")) {
                  try {
                    const res = await fetch(`${ctrl.API_BASE}/clean-test-rossi`, { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                      alert("Pulizia completata con successo!");
                    } else {
                      alert("Errore durante la pulizia: " + data.error);
                    }
                  } catch (err) {
                    alert("Errore di rete: " + err.message);
                  }
                }
              }}
            >
              ⚠️ ELIMINA TEST ROSSI MARCO
            </button>
            {ctrl.currentPage === 'ricerche' && !ctrl.selectedRicercaId && (
              <button className="btn btn-primary btn-sm" onClick={ctrl.openNewRicercaModal}>➕ Nuova Ricerca</button>
            )}
            {ctrl.currentPage === 'clienti' && (
              <button className="btn btn-primary btn-sm" onClick={() => ctrl.setShowNewClienteModal(true)}>➕ Nuovo Cliente</button>
            )}
            {ctrl.currentPage === 'candidati' && (
              <button className="btn btn-primary btn-sm" onClick={() => { ctrl.setCurrentCandidato(null); ctrl.setShowNewCVCandidatoModal(true); }}>➕ Inserisci CV</button>
            )}
            {ctrl.selectedRicercaId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm" 
                  onClick={handlePrev} 
                  disabled={!hasPrev}
                  style={{ opacity: hasPrev ? 1 : 0.4, cursor: hasPrev ? 'pointer' : 'not-allowed' }}
                  title="Mandato Precedente"
                >
                  ⬅️ Prec
                </button>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'center' }}>
                  {currentIndex + 1} / {navList.length}
                </span>
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm" 
                  onClick={handleNext} 
                  disabled={!hasNext}
                  style={{ opacity: hasNext ? 1 : 0.4, cursor: hasNext ? 'pointer' : 'not-allowed' }}
                  title="Mandato Successivo"
                >
                  Succ ➡️
                </button>
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginLeft: '8px' }} onClick={() => ctrl.setSelectedRicercaId(null)}>↩️ Torna alla Lista</button>
              </div>
            )}
          </div>
        </header>

        {/* BODY */}
        <div className="content-body">
          {/* ROUTED PAGES */}
          {!ctrl.selectedRicercaId && (
            <Routes>
              <Route path="/" element={<Dashboard setShowReportModal={ctrl.setShowReportModal} setSelectedRicercaId={ctrl.setSelectedRicercaId} setActiveTab={ctrl.setActiveTab} />} />
              <Route path="/dashboard" element={<Dashboard setShowReportModal={ctrl.setShowReportModal} setSelectedRicercaId={ctrl.setSelectedRicercaId} setActiveTab={ctrl.setActiveTab} />} />
              <Route path="/ricerche" element={<GestioneRicerche setSelectedRicercaId={ctrl.setSelectedRicercaId} />} />
              <Route path="/approvazioni" element={<Approvazioni handleApprovalAction={ctrl.handleApprovalAction} />} />
              <Route path="/riserva" element={<Riserva handleApprovalAction={ctrl.handleApprovalAction} setSelectedRicercaId={ctrl.setSelectedRicercaId} />} />
              <Route path="/cestinati" element={<Cestinati handleApprovalAction={ctrl.handleApprovalAction} />} />
              <Route path="/pausa" element={<Pausa handleApprovalAction={ctrl.handleApprovalAction} setSelectedRicercaId={ctrl.setSelectedRicercaId} />} />
              <Route path="/commerciali_gestione" element={<GestioneCommerciali />} />
              <Route path="/posta" element={<PostaElettronica candidati={ctrl.candidati} clienti={ctrl.clienti} ricerche={ctrl.ricerche} showStatus={ctrl.showStatus} API_BASE={ctrl.API_BASE} />} />
              <Route path="/email_config" element={<ConfigurazioneEmail />} />
              <Route path="/candidati" element={<Candidati handleOpenValutazione={ctrl.handleOpenValutazione} setSelectedSubjectLog={ctrl.setSelectedSubjectLog} handleLinkCandidatoToRicerca={ctrl.handleLinkCandidatoToRicerca} setCurrentCandidato={ctrl.setCurrentCandidato} setShowNewCVCandidatoModal={ctrl.setShowNewCVCandidatoModal} />} />
              <Route path="/annunci" element={<GestioneAnnunci ctrl={ctrl} />} />
              <Route path="/clienti" element={<Clienti setSelectedSubjectLog={ctrl.setSelectedSubjectLog} />} />
            </Routes>
          )}

          {/* SINGLE SEARCH DETAIL & WORKSPACE */}
          {ctrl.selectedRicercaId && (
            !ctrl.ricercaDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ marginBottom: '16px', fontSize: '24px' }}>🔄</div>
                <span style={{ fontWeight: 600 }}>Caricamento dettagli mandato...</span>
              </div>
            ) : (
              <ErrorBoundary>
                <RicercaDetail {...ctrl} />
              </ErrorBoundary>
            )
          )}
        </div>
      </main>

      <GlobalModals {...ctrl} API_BASE={ctrl.API_BASE} renderCandidateStars={ctrl.renderCandidateStars} />
    </div>
  );
}
