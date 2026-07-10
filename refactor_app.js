const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'frontend/src/App_backup.jsx');
const appCode = fs.readFileSync(appPath, 'utf8');

// 1. Find where `function App() {` starts and where `return (` starts
const functionAppRegex = /function App\(\)\s*\{/;
const appMatch = appCode.match(functionAppRegex);
const appStartIndex = appMatch.index + appMatch[0].length;

const returnRegex = /\s*return \(\s*<div className="app-container">/;
const returnMatch = appCode.match(returnRegex);
if (!returnMatch) {
  console.log("Could not find return statement");
  process.exit(1);
}
const returnMatchIndex = returnMatch.index;

// Extract the entire body of App() before the return
const bodyContent = appCode.slice(appStartIndex, returnMatchIndex);

// We also need to extract all the variables/functions defined at the top level of this body to return them.
// A simple way is to match `const [var, setVar]` and `const handleSomething = `
// Actually, let's just use regex to find all top-level `const ` and `let ` declarations.
const declarations = new Set();

const constRegex = /^\s*const\s+(?:\[(.*?)\]|\{(.*?)\}|([a-zA-Z0-9_]+))\s*=/gm;
let match;
while ((match = constRegex.exec(bodyContent)) !== null) {
  if (match[1]) {
    // Array destructuring: const [a, b] = ...
    match[1].split(',').forEach(v => {
      const name = v.trim();
      if (name && !name.startsWith('...')) declarations.add(name);
    });
  } else if (match[2]) {
    // Object destructuring: const {a, b} = ...
    match[2].split(',').forEach(v => {
      let name = v.split(':')[0].trim();
      if (name && !name.startsWith('...')) declarations.add(name);
    });
  } else if (match[3]) {
    // Standard assignment: const a = ...
    declarations.add(match[3].trim());
  }
}

const letRegex = /^\s*let\s+([a-zA-Z0-9_]+)/gm;
while ((match = letRegex.exec(bodyContent)) !== null) {
  declarations.add(match[1].trim());
}

// Convert Set to Array and format return statement
const exportList = Array.from(declarations).sort().join(',\n    ');

// Create useAppController.js
const hookCode = `import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { 
  API_BASE, 
  getProvinceCoords, 
  calculateHaversineDistance, 
  getCapFromAddress, 
  getCoordsFromCap, 
  estimateDistanceByCap, 
  renderCandidateStars, 
  getAdActiveDaysInfo 
} from '../utils';

export function useAppController() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showStatus } = useToast();
  const { ricerche, candidati, clienti, operatori, commerciali, fetchRicerche, fetchCandidati, fetchClienti, fetchCommerciali } = useGlobalState();

${bodyContent.replace(/const navigate = useNavigate\(\);\n/, '').replace(/const location = useLocation\(\);\n/, '').replace(/const { showStatus } = useToast\(\);\n/, '').replace(/const { ricerche, candidati, clienti, operatori, commerciali, fetchRicerche, fetchCandidati, fetchClienti, fetchCommerciali } = useGlobalState\(\);\n/, '')}

  return {
    navigate, location, showStatus, ricerche, candidati, clienti, operatori, commerciali, fetchRicerche, fetchCandidati, fetchClienti, fetchCommerciali,
    ${exportList}
  };
}
`;

fs.writeFileSync(path.join(__dirname, 'frontend/src/hooks/useAppController.js'), hookCode);

// Create GlobalModals.jsx
// We need to extract the modals from the JSX
const modalsStart = appCode.indexOf('{/* ----------------- MODALS ----------------- */}');
const modalsEnd = appCode.lastIndexOf('</main>'); // Modals are after main?
// Wait, looking at App.jsx, the modals are after </main>
const appEnd = appCode.lastIndexOf('</div>'); // end of app-container

let modalsContent = '';
if (modalsStart !== -1) {
  modalsContent = appCode.slice(modalsStart, appEnd).trim();
}

// Create GlobalModals.jsx
const globalModalsCode = `import React from 'react';
import ValutazioneModal from './ValutazioneModal';
import InterviewModal from './InterviewModal';
import TrialModal from './TrialModal';
import GeneralReportModal from './GeneralReportModal';
import NewRicercaModal from './NewRicercaModal';
import NewClientModal from './NewClientModal';
import NewCVCandidatoModal from './NewCVCandidatoModal';
import EditCandidatoModal from './EditCandidatoModal';
import EmailPreviewModal from './EmailPreviewModal';
import SubjectLogModal from './SubjectLogModal';
import AnnuncioModal from './AnnuncioModal';
import StatusMotivationModal from './StatusMotivationModal';
import FeedbackModal from './FeedbackModal';
import AdStatusModal from './AdStatusModal';
import TerminaProvaModal from './TerminaProvaModal';

export default function GlobalModals(props) {
  const {
    showValutazioneModal, setShowValutazioneModal, currentCandidato, setCurrentCandidato, evalForm, evalActiveTab, setEvalActiveTab,
    evalCandidateId, evalCandidateName, loadingEvalStorico, evalStorico, timeline, handleSaveValutazione, handleEvalFormChange,
    calculateRealtimeScore, renderCandidateStars, API_BASE, handlePrintScheda, handleEditCandidato,
    selectedInterviewForManagement, setSelectedInterviewForManagement, handleEditInterviewDetails, handleDeleteInterview,
    handlePrintSingleInterviewReport, showInterviewStatusModal, setShowInterviewStatusModal,
    selectedTrialForManagement, setSelectedTrialForManagement, handleEditTrialDetails, handlePrintSingleTrialReport,
    showTrialStatusModal, setShowTrialStatusModal, showReportModal, setShowReportModal, reportData, reportRange, setReportRange,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate, loadingReport, handleGenerateReport, handlePrintReport,
    showNewRicercaModal, setShowNewRicercaModal, newSearchForm, setNewSearchForm, newSearchRoles, handleCreateRicerca, handleRoleChange,
    addRoleField, removeRoleField, handleSelectClientForNewSearch, clienti, commerciali, operatori, showNewClienteModal, setShowNewClienteModal,
    handleCreateCliente, showNewCVCandidatoModal, setShowNewCVCandidatoModal, handleCreateCVCandidato, showEditCandidatoModal,
    setShowEditCandidatoModal, showEmailPreviewModal, setShowEmailPreviewModal, emailData, setEmailData, handleSendEmail, showDocUploadModal,
    setShowDocUploadModal, handleUploadDocument, pendingHiringCandidate, setPendingHiringCandidate, hiringFormData, setHiringFormData,
    handleCompleteHiring, showTerminaProvaModal, setShowTerminaProvaModal, provaData, setProvaData, handleTerminaProva, showNewAnnuncioFormModal,
    setShowNewAnnuncioFormModal, newSearchForm: annuncioForm, setNewSearchForm: setAnnuncioForm, handleCreateAnnuncio, newSearchRoles: annuncioRoles,
    addRoleField: annuncioAddRole, removeRoleField: annuncioRemoveRole, handleRoleChange: annuncioRoleChange,
    selectedSubjectLog, setSelectedSubjectLog, subjectTimeline, setSubjectTimeline, candidati,
    selectedAnnuncio, setSelectedAnnuncio, handleUpdateAnnuncioDetail,
    handleSaveStatusMotivation, newAdStatus, adStatusMotivation, setAdStatusMotivation, showFeedbackModal, setShowFeedbackModal,
    feedbackNoteText, setFeedbackNoteText, handleSaveFeedback, showAdStatusModal, setShowAdStatusModal, handleUpdateAdStatus
  } = props;

  return (
    <>
      ${modalsContent}
    </>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'frontend/src/components/GlobalModals.jsx'), globalModalsCode);

// Now recreate App.jsx
const appJsxCode = `import React from 'react';
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
import ConfigurazioneEmail from './pages/ConfigurazioneEmail';
import Candidati from './pages/Candidati';
import Clienti from './pages/Clienti';
import RicercaDetail from './pages/RicercaDetail';
import PostaElettronica from './components/PostaElettronica';

export default function App() {
  const ctrl = useAppController();

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>💼 HR MANAGEMENT</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'dashboard' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('dashboard'); ctrl.setSelectedRicercaId(null); }}>📊 Dashboard</button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'ricerche' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('ricerche'); ctrl.setSelectedRicercaId(null); }}>📋 Mandati & Ricerche</button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'approvazioni' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('approvazioni'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              ⏳ Mandati da Approvare
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'riserva' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('riserva'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              ⚠️ Mandati in Riserva
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Approvata con Riserva').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'pausa' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('pausa'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              ⏸️ Mandati in Pausa
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In Pausa').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'In Pausa').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'cestinati' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('cestinati'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              🗑️ Mandati Cestinati
              {ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Cestinato').length > 0 && (
                <span className="badge-notification">{ctrl.ricerche.filter(r => r.stato_approvazione_tl === 'Cestinato').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'candidati' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('candidati'); ctrl.setSelectedRicercaId(null); }}>👥 Database Candidati</button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'clienti' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('clienti'); ctrl.setSelectedRicercaId(null); }}>🏢 Anagrafica Clienti</button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'commerciali_gestione' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('commerciali_gestione'); ctrl.setSelectedRicercaId(null); }} style={{ position: 'relative' }}>
              🤝 Commerciali & Accessi
              {ctrl.commerciali.filter(c => c.stato_approvazione === 'Da Approvare').length > 0 && (
                <span className="badge-notification">{ctrl.commerciali.filter(c => c.stato_approvazione === 'Da Approvare').length}</span>
              )}
            </button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'posta' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('posta'); ctrl.setSelectedRicercaId(null); }}>📧 Posta Elettronica</button>
          </li>
          <li>
            <button className="menu-item" onClick={() => window.open('https://web.whatsapp.com/', 'whatsappWeb', 'width=1200,height=800,left=100,top=100')}>💬 WhatsApp</button>
          </li>
          <li>
            <button className={\`menu-item \${ctrl.currentPage === 'email_config' ? 'active' : ''}\`} onClick={() => { ctrl.setCurrentPage('email_config'); ctrl.setSelectedRicercaId(null); }}>⚙️ Configurazione E-mail</button>
          </li>
        </ul>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* HEADER */}
        <header className="content-header">
          <h1>
            {ctrl.selectedRicercaId 
              ? \`Gestione Mandato: \${ctrl.ricercaDetail?.ricerca.ruolo} @ \${ctrl.ricercaDetail?.ricerca.azienda}\` 
              : ctrl.currentPage === 'dashboard' ? 'Dashboard Principale'
              : ctrl.currentPage === 'approvazioni' ? 'Mandati Commerciali da Approvare'
              : ctrl.currentPage === 'riserva' ? 'Mandati in Riserva'
              : ctrl.currentPage === 'pausa' ? 'Mandati in Pausa'
              : ctrl.currentPage === 'cestinati' ? 'Mandati Cestinati'
              : ctrl.currentPage === 'ricerche' ? 'Mandati e Ricerche Attive'
              : ctrl.currentPage === 'candidati' ? 'Database Curricula'
              : ctrl.currentPage === 'commerciali_gestione' ? 'Gestione Profili Commerciali'
              : ctrl.currentPage === 'email_config' ? 'Configurazione Server E-mail'
              : ctrl.currentPage === 'posta' ? 'Client Posta Elettronica'
              : ctrl.currentPage === 'whatsapp' ? 'Integrazione WhatsApp Web'
              : 'Anagrafica Potenziali Clienti'
            }
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
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
              <button className="btn btn-secondary btn-sm" onClick={() => ctrl.setSelectedRicercaId(null)}>↩️ Torna alla Lista</button>
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
              <Route path="/clienti" element={<Clienti setSelectedSubjectLog={ctrl.setSelectedSubjectLog} />} />
            </Routes>
          )}

          {/* SINGLE SEARCH DETAIL & WORKSPACE */}
          {ctrl.selectedRicercaId && ctrl.ricercaDetail && (
            <RicercaDetail {...ctrl} />
          )}
        </div>
      </main>

      <GlobalModals {...ctrl} API_BASE={ctrl.API_BASE} renderCandidateStars={ctrl.renderCandidateStars} />
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'frontend/src/App.jsx'), appJsxCode);

console.log('App.jsx has been rewritten!');
