import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { API_BASE, getProvinceCoords, calculateHaversineDistance, getCapFromAddress, getCoordsFromCap, estimateDistanceByCap, renderCandidateStars, getAdActiveDaysInfo } from '../utils';
export function useAppController() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'dashboard';
  const setCurrentPage = page => navigate(`/${page}`);
  const {
    ricerche,
    setRicerche,
    fetchRicerche,
    fetchRicercheSilent,
    candidati,
    setCandidati,
    fetchCandidati,
    clienti,
    setClienti,
    fetchClienti,
    commerciali,
    setCommerciali,
    fetchCommerciali,
    fetchCommercialiSilent,
    operatori,
    setOperatori,
    fetchOperatori,
    pendingChecklist,
    setPendingChecklist,
    fetchPendingChecklist,
    emailConfig,
    setEmailConfig,
    fetchEmailConfig,
    newMandatePopup,
    setNewMandatePopup,
    newCommercialPopup,
    setNewCommercialPopup,
    lastPendingCount,
    setLastPendingCount,
    lastPendingCommercialCount,
    setLastPendingCommercialCount
  } = useGlobalState();

  // Search detail state
  const [selectedRicercaId, setSelectedRicercaId] = useState(null);
  const [ricercaDetail, setRicercaDetail] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [activeTab, setActiveTab] = useState('dati'); // 'dati', 'colloquio', 'prova', 'assunzione', 'invio', 'storico'

  // Filter states for Candidates moved to Candidati.jsx

  // Modals state
  const [showNewRicercaModal, setShowNewRicercaModal] = useState(false);
  const [showNewClienteModal, setShowNewClienteModal] = useState(false);
  const [showNewCVCandidatoModal, setShowNewCVCandidatoModal] = useState(false);
  const [showEditCandidatoModal, setShowEditCandidatoModal] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(null);
  const [pendingHiringCandidate, setPendingHiringCandidate] = useState(null);
  const [showTerminaProvaModal, setShowTerminaProvaModal] = useState(false);
  const [showNewAnnuncioFormModal, setShowNewAnnuncioFormModal] = useState(false);
  const [showLinkAnnuncioModal, setShowLinkAnnuncioModal] = useState(false);
  const [showNewCandidatoPipelineModal, setShowNewCandidatoPipelineModal] = useState(false);
  const [showNewInterviewFormModal, setShowNewInterviewFormModal] = useState(false);
  const [showNewTrialFormModal, setShowNewTrialFormModal] = useState(false);
  const [showNewAssunzioneModal, setShowNewAssunzioneModal] = useState(false);
  const [showAdStatusModal, setShowAdStatusModal] = useState(false);
  const [showValutazioneModal, setShowValutazioneModal] = useState(false);
  const [evalCandidateId, setEvalCandidateId] = useState('');
  const [evalCandidateName, setEvalCandidateName] = useState('');
  const [evalForm, setEvalForm] = useState({
    pres_personale: '',
    puntualita: '',
    comunicazione: '',
    educazione: '',
    motivazione: '',
    interesse_az: '',
    esperienza_lav: '',
    competenze_tec: '',
    cap_apprendimento: '',
    problem_solving: '',
    cap_organizzativa: '',
    team_work: '',
    autonomia: '',
    affidabilita: '',
    flessibilita: '',
    orario_full_time: 0,
    orario_part_time: 0,
    orario_turni: 0,
    orario_weekend: 0,
    orario_straordinari: 0,
    mob_automunito: 0,
    mob_trasferte: 0,
    mob_spostamenti: 0,
    disp_assunzione: '',
    punti_forza: '',
    aree_miglioramento: '',
    osservazioni: '',
    valutazione_finale: '',
    punteggio_complessivo: null
  });
  const [evalStorico, setEvalStorico] = useState({
    pipeline: [],
    appuntamenti: [],
    logs: []
  });
  const [loadingEvalStorico, setLoadingEvalStorico] = useState(false);
  const [evalActiveTab, setEvalActiveTab] = useState('profilo');
  const [newAdStatus, setNewAdStatus] = useState('');
  const [adStatusMotivation, setAdStatusMotivation] = useState('');
  const [adTimeline, setAdTimeline] = useState([]);
  const [annunci, setAnnunci] = useState([]);
  const [selectedAnnuncio, setSelectedAnnuncio] = useState(null);
  const [selectedPipeCand, setSelectedPipeCand] = useState(null);
  const [isNewCandidate, setIsNewCandidate] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(null); // null or { type: 'Positivo' | 'Negativo', pipe: object }
  const [feedbackNoteText, setFeedbackNoteText] = useState('');

  // Period report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportRange, setReportRange] = useState('month');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [excludeFromResearch, setExcludeFromResearch] = useState(false);
  const [scheduleInterviewOption, setScheduleInterviewOption] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('Online');
  const [cvSentToggle, setCvSentToggle] = useState(true);
  const [pipeCandTimeline, setPipeCandTimeline] = useState([]);
  // Selected entities for edit/action
  const [currentCandidato, setCurrentCandidato] = useState(null);
  const [emailData, setEmailData] = useState({
    idCandidato: '',
    destEmail: '',
    subject: '',
    body: ''
  });
  const [provaData, setProvaData] = useState({
    idCandidato: '',
    dataFine: '',
    esito: 'Prova Superata',
    note: ''
  });

  // State for controlling New Search form fields (allows client auto-fill)
  const [newSearchForm, setNewSearchForm] = useState({
    azienda: '',
    referente: '',
    telefono_mobile: '',
    email: '',
    sede_lavoro: '',
    note: '',
    settore: ''
  });
  const [newSearchRoles, setNewSearchRoles] = useState([{
    ruolo: '',
    nr_risorse: 1,
    ccnl_livello: '',
    retribuzione: '',
    competenze_tecniche: '',
    ore_lavoro: '',
    orario_lavoro: '',
    ore_lavoro_tipo: 'Settimanali'
  }]);

  // Notifications and approvals states moved to GlobalStateContext

  // Subject timeline logs
  const [selectedSubjectLog, setSelectedSubjectLog] = useState(null);
  const [subjectTimeline, setSubjectTimeline] = useState([]);

  // Dashboard pending checklist moved to GlobalStateContext

  // Hiring Sheet states
  const [selectedHiringCandidate, setSelectedHiringCandidate] = useState(null);
  const [hiringFormData, setHiringFormData] = useState({});
  // operatori moved to GlobalStateContext

  // Interview detailed management states
  const [selectedInterviewForManagement, setSelectedInterviewForManagement] = useState(null);
  const [showInterviewStatusModal, setShowInterviewStatusModal] = useState(null);

  // Trial detailed management states
  const [selectedTrialForManagement, setSelectedTrialForManagement] = useState(null);
  const [showTrialStatusModal, setShowTrialStatusModal] = useState(null);

  // Commercials and Email Config states moved to GlobalStateContext

  const {
    showStatus
  } = useToast();
  useEffect(() => {
    if (selectedSubjectLog) {
      fetchSubjectTimeline(selectedSubjectLog.type, selectedSubjectLog.id);
    } else {
      setSubjectTimeline([]);
    }
  }, [selectedSubjectLog]);

  // Load baseline data on page change
  useEffect(() => {
    fetchRicerche();
    fetchCandidati();
    fetchClienti();
    fetchCommerciali();
    fetchPendingChecklist();
    fetchOperatori();
    if (currentPage === 'email_config') {
      fetchEmailConfig();
    }
  }, [currentPage]);

  // Reload research detail if ID is set
  useEffect(() => {
    setSelectedAnnuncio(null);
    setSelectedPipeCand(null);
    setIsNewCandidate(false);
    if (selectedRicercaId) {
      fetchRicercaDetail(selectedRicercaId);
    }
  }, [selectedRicercaId]);
  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      let url = `${API_BASE}/report?range=${reportRange}`;
      if (reportRange === 'custom') {
        url += `&startDate=${reportStartDate}&endDate=${reportEndDate}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setReportData(json.data);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (e) {
      console.error(e);
      showStatus('error', 'Connessione fallita', e.message);
    } finally {
      setLoadingReport(false);
    }
  };
  useEffect(() => {
    if (showReportModal) {
      if (reportRange !== 'custom' || reportStartDate && reportEndDate) {
        handleGenerateReport();
      }
    }
  }, [showReportModal, reportRange, reportStartDate, reportEndDate]);
  const fetchSubjectTimeline = async (type, id) => {
    try {
      const res = await fetch(`${API_BASE}/timeline/soggetto/${type}/${id}`);
      const json = await res.json();
      if (json.success) {
        setSubjectTimeline(json.timeline);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const fetchAdTimeline = async id => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/timeline/${id}`);
      const json = await res.json();
      if (json.success) {
        setAdTimeline(json.timeline);
      }
    } catch (e) {
      console.error("Errore fetchAdTimeline:", e);
    }
  };
  const fetchPipeCandTimeline = async (idCandidato, idRicerca) => {
    if (!idCandidato || !idRicerca) return;
    try {
      const res = await fetch(`${API_BASE}/timeline/candidato/${idCandidato}/ricerca/${idRicerca}`);
      const json = await res.json();
      if (json.success) {
        setPipeCandTimeline(json.timeline);
      }
    } catch (e) {
      console.error("Errore fetchPipeCandTimeline:", e);
    }
  };
  useEffect(() => {
    if (selectedPipeCand) {
      fetchPipeCandTimeline(selectedPipeCand.idCandidato, selectedRicercaId);
    } else {
      setPipeCandTimeline([]);
    }
  }, [selectedPipeCand]);
  const fetchAnnunci = async id => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/ricerche/${id}/annunci`);
      const json = await res.json();
      if (json.success) {
        setAnnunci(json.annunci);
      }
    } catch (e) {
      console.error("Errore fetchAnnunci:", e);
    }
  };
  const fetchRicercaDetail = async id => {
    try {
      const res = await fetch(`${API_BASE}/ricerche/${id}`);
      const json = await res.json();
      if (json.success) {
        setRicercaDetail(json.data);
        fetchAdTimeline(id);
        fetchAnnunci(id);

        // Synchronize selected interview if currently managing it
        setSelectedInterviewForManagement(prev => {
          if (!prev) return null;
          const updated = json.data.appuntamenti.find(a => a.id === prev.id);
          return updated || null;
        });

        // Synchronize selected trial if currently managing it
        setSelectedTrialForManagement(prev => {
          if (!prev) return null;
          const updated = json.data.candidatiCollegati.find(c => c.idCandidato === prev.idCandidato);
          return updated || null;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };
  const handleUpdateAdStatus = async e => {
    e.preventDefault();
    if (!adStatusMotivation.trim() || !selectedAnnuncio) return;
    try {
      showStatus('loading', 'Aggiornamento stato...', 'Salvataggio in corso...');
      const res = await fetch(`${API_BASE}/annunci/${selectedAnnuncio.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stato_annuncio: newAdStatus,
          motivazione_stato: adStatusMotivation
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Stato Aggiornato!', `Stato dell'annuncio modificato in ${newAdStatus}.`);
        setShowAdStatusModal(false);
        setAdStatusMotivation('');
        fetchRicercaDetail(selectedRicercaId);
        setSelectedAnnuncio(null);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleUpdateAnnuncioDetail = async e => {
    e.preventDefault();
    if (!selectedAnnuncio) return;
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      showStatus('loading', 'Salvataggio modifiche...', 'Aggiornamento in corso...');
      const res = await fetch(`${API_BASE}/annunci/${selectedAnnuncio.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Annuncio Aggiornato!', 'Modifiche all\'annuncio salvate con successo.');
        fetchRicercaDetail(selectedRicercaId);
        setSelectedAnnuncio(null);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleDeleteAnnuncio = async id => {
    if (!window.confirm("Sei sicuro di voler eliminare definitivamente questo annuncio?")) return;
    try {
      showStatus('loading', 'Eliminazione annuncio...', 'Cancellazione in corso...');
      const res = await fetch(`${API_BASE}/annunci/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Annuncio Eliminato!', 'L\'annuncio è stato eliminato con successo.');
        fetchRicercaDetail(selectedRicercaId);
        setSelectedAnnuncio(null);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };

  // ----------------- CRUD HANDLERS -----------------

  const handleApprovalAction = async (id, action) => {
    let payload = {};
    let motivazione = '';
    if (action === 'Approvata') {
      payload = {
        stato_approvazione_tl: 'Approvata',
        stato_ricerca: 'Ricerca Inserita'
      };
    } else if (action === 'Cestinato') {
      motivazione = window.prompt("Inserisci la motivazione del cestinamento (obbligatoria):");
      if (motivazione === null) return; // User cancelled
      if (!motivazione.trim()) {
        showStatus("error", "Errore", "La motivazione è obbligatoria per cestinare!");
        return;
      }
      payload = {
        stato_approvazione_tl: 'Cestinato',
        stato_ricerca: 'Cestinato',
        motivazione
      };
    } else if (action === 'Approvata con Riserva') {
      motivazione = window.prompt("Inserisci la motivazione della riserva (obbligatoria):");
      if (motivazione === null) return; // User cancelled
      if (!motivazione.trim()) {
        showStatus("error", "Errore", "La motivazione è obbligatoria per approvare con riserva!");
        return;
      }
      payload = {
        stato_approvazione_tl: 'Approvata con Riserva',
        stato_ricerca: 'Ricerca Inserita',
        motivazione
      };
    } else if (action === 'In Pausa') {
      motivazione = window.prompt("Inserisci la motivazione per mettere in pausa il mandato (obbligatoria):");
      if (motivazione === null) return;
      if (!motivazione.trim()) {
        showStatus("error", "Errore", "La motivazione è obbligatoria per mettere in pausa!");
        return;
      }
      payload = {
        stato_approvazione_tl: 'In Pausa',
        motivazione
      };
    } else if (action === 'Ripristina') {
      payload = {
        stato_approvazione_tl: 'In attesa di approvazione',
        stato_ricerca: ''
      };
    }
    try {
      const res = await fetch(`${API_BASE}/ricerche/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Stato Aggiornato!', `Il mandato è stato impostato come ${action}.`);
        fetchRicerche();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const ensureResearchStarted = async () => {
    if (ricercaDetail && (ricercaDetail.ricerca.stato_ricerca === '' || ricercaDetail.ricerca.stato_ricerca === 'Ricerca Inserita')) {
      try {
        await fetch(`${API_BASE}/ricerche/${selectedRicercaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stato_ricerca: 'Avviata'
          })
        });
        // Silently reload
        fetchRicercaDetail(selectedRicercaId);
        fetchRicerche();
      } catch (e) {
        console.error(e);
      }
    }
  };
  const handleCreateRicerca = async e => {
    e.preventDefault();
    try {
      showStatus('loading', 'Salvataggio...', 'Salvataggio delle ricerche in corso...');

      // Submit each role as a separate research record
      for (const role of newSearchRoles) {
        if (!role.ruolo.trim()) continue;
        const payload = {
          azienda: newSearchForm.azienda,
          piva: newSearchForm.piva || '',
          sede_legale: newSearchForm.sede_legale || '',
          sede_lavoro: newSearchForm.sede_lavoro,
          referente: newSearchForm.referente,
          telefono_mobile: newSearchForm.telefono_mobile,
          telefono_fisso: newSearchForm.telefono_fisso || '',
          email: newSearchForm.email,
          consulente_commerciale: newSearchForm.consulente_commerciale || '',
          outbound: newSearchForm.outbound || '',
          ruolo: role.ruolo,
          nr_risorse: role.nr_risorse,
          ccnl_livello: role.ccnl_livello,
          retribuzione: role.retribuzione,
          competenze_tecniche: role.competenze_tecniche,
          ore_lavoro: role.ore_lavoro,
          ore_lavoro_tipo: role.ore_lavoro_tipo || 'Settimanali',
          orario_lavoro: role.orario_lavoro,
          note: newSearchForm.note || '',
          settore: newSearchForm.settore || ''
        };
        const res = await fetch(`${API_BASE}/ricerche`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || 'Errore nella creazione della ricerca');
        }
      }
      showStatus('success', 'Ricerche inserite!', 'I mandati di selezione sono stati creati con successo.');
      setShowNewRicercaModal(false);
      fetchRicerche();
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const openNewRicercaModal = () => {
    setNewSearchForm({
      azienda: '',
      referente: '',
      telefono_mobile: '',
      telefono_fisso: '',
      email: '',
      sede_lavoro: '',
      sede_legale: '',
      piva: '',
      consulente_commerciale: '',
      outbound: '',
      note: ''
    });
    setNewSearchRoles([{
      ruolo: '',
      nr_risorse: 1,
      ccnl_livello: '',
      retribuzione: '',
      competenze_tecniche: ''
    }]);
    setShowNewRicercaModal(true);
  };
  const handleSelectClientForNewSearch = clientId => {
    if (!clientId) {
      setNewSearchForm(prev => ({
        ...prev,
        azienda: '',
        referente: '',
        telefono_mobile: '',
        telefono_fisso: '',
        email: '',
        sede_lavoro: '',
        sede_legale: '',
        piva: ''
      }));
      return;
    }
    const cl = clienti.find(c => c.id === clientId);
    if (cl) {
      setNewSearchForm(prev => ({
        ...prev,
        azienda: cl.nome_locale || '',
        referente: cl.referente || '',
        telefono_mobile: cl.telefono_mobile || '',
        telefono_fisso: cl.telefono_fisso || '',
        email: cl.email || '',
        sede_lavoro: cl.sede_lavoro || '',
        sede_legale: cl.sede_legale || '',
        piva: cl.piva || ''
      }));
    }
  };
  const handleRoleChange = (index, field, value) => {
    const updated = [...newSearchRoles];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setNewSearchRoles(updated);
  };
  const addRoleField = () => {
    setNewSearchRoles([...newSearchRoles, {
      ruolo: '',
      nr_risorse: 1,
      ccnl_livello: '',
      retribuzione: '',
      competenze_tecniche: '',
      ore_lavoro: '',
      orario_lavoro: '',
      ore_lavoro_tipo: 'Settimanali'
    }]);
  };
  const removeRoleField = index => {
    if (newSearchRoles.length === 1) return;
    const updated = newSearchRoles.filter((_, i) => i !== index);
    setNewSearchRoles(updated);
  };
  const handlePrintScheda = () => {
    if (!currentCandidato) return;
    const printWindow = window.open('', '_blank');
    const areas = [{
      label: 'Presentazione personale',
      score: evalForm.pres_personale
    }, {
      label: 'Puntualità',
      score: evalForm.puntualita
    }, {
      label: 'Comunicazione',
      score: evalForm.comunicazione
    }, {
      label: 'Educazione e atteggiamento',
      score: evalForm.educazione
    }, {
      label: 'Motivazione',
      score: evalForm.motivazione
    }, {
      label: 'Interesse verso l\'azienda',
      score: evalForm.interesse_az
    }, {
      label: 'Esperienza lavorativa',
      score: evalForm.esperienza_lav
    }, {
      label: 'Competenze tecniche',
      score: evalForm.competenze_tec
    }, {
      label: 'Capacità di apprendimento',
      score: evalForm.cap_apprendimento
    }, {
      label: 'Problem solving',
      score: evalForm.problem_solving
    }, {
      label: 'Capacità organizzativa',
      score: evalForm.cap_organizzativa
    }, {
      label: 'Lavoro in team',
      score: evalForm.team_work
    }, {
      label: 'Autonomia',
      score: evalForm.autonomia
    }, {
      label: 'Affidabilità',
      score: evalForm.affidabilita
    }, {
      label: 'Flessibilità',
      score: evalForm.flessibilita
    }];
    const orari = [evalForm.orario_full_time ? 'Full Time' : null, evalForm.orario_part_time ? 'Part Time' : null, evalForm.orario_turni ? 'Turni' : null, evalForm.orario_weekend ? 'Weekend' : null, evalForm.orario_straordinari ? 'Straordinari' : null].filter(Boolean).join(', ') || 'Nessuna preferenza oraria indicata';
    const mobilita = [evalForm.mob_automunito ? 'Automunito' : null, evalForm.mob_trasferte ? 'Disponibile a trasferte' : null, evalForm.mob_spostamenti ? 'Disponibile a spostamenti' : null].filter(Boolean).join(', ') || 'Nessuna indicazione di mobilità';
    const pipelineHtml = evalStorico.pipeline.map(item => `
      <li>Ricerca: <strong>${item.ruolo}</strong> presso <strong>${item.azienda}</strong> | Stato: ${item.stato_avanzamento} ${item.stato_prova ? `(Esito Prova: ${item.stato_prova})` : ''}</li>
    `).join('') || '<li>Nessun mandato collegato</li>';
    const appuntamentiHtml = evalStorico.appuntamenti.map(app => `
      <li>Colloquio <strong>${app.tipo_colloquio}</strong> il ${new Date(app.data_colloquio).toLocaleDateString('it-IT')} alle ${app.ora_colloquio} ${app.luogo ? `presso ${app.luogo}` : ''} | Stato: ${app.stato_appuntamento}</li>
    `).join('') || '<li>Nessun colloquio programmato</li>';
    const logsHtml = evalStorico.logs.map(log => `
      <div style="font-size: 11px; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 2px;">
        <span style="color: #666; font-family: monospace;">[${new Date(log.data_ora).toLocaleDateString('it-IT')}]</span> 
        <strong>${log.attivita}:</strong> ${log.dettagli}
      </div>
    `).join('') || '<div>Nessuna attività registrata</div>';
    const starsText = evalForm.punteggio_complessivo !== null ? '★'.repeat(Math.round(evalForm.punteggio_complessivo / 10)) + '☆'.repeat(10 - Math.round(evalForm.punteggio_complessivo / 10)) : 'Non valutato';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VALUTAZIONE CANDIDATO - ${currentCandidato.cognome.toUpperCase()} ${currentCandidato.nome.toUpperCase()}</title>
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #222; margin: 40px; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 3px solid #333; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #111; letter-spacing: 0.5px; }
          .header .score-badge { font-size: 18px; font-weight: bold; border: 2px solid #333; padding: 6px 12px; border-radius: 6px; text-align: center; }
          
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #888; padding-bottom: 4px; margin-bottom: 12px; color: #111; }
          
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 6px 0; border-bottom: 1px solid #eee; }
          .info-table td.label { font-weight: bold; color: #555; width: 35%; }
          
          .rating-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          .rating-table th { background-color: #f5f5f5; font-size: 11px; padding: 6px 10px; border: 1px solid #ddd; text-align: center; }
          .rating-table th.left { text-align: left; }
          .rating-table td { padding: 6px 10px; border: 1px solid #ddd; font-size: 12px; }
          .rating-table td.center { text-align: center; font-weight: bold; }
          
          .comments-box { border: 1px solid #ccc; padding: 12px; border-radius: 6px; background-color: #fafafa; min-height: 50px; font-size: 12px; white-space: pre-wrap; margin-top: 4px; }
          
          .footer { text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 40px; }
          
          ul { margin: 4px 0; padding-left: 20px; }
          li { margin-bottom: 4px; }
          
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Valutazione Completa Candidato</h1>
            <div style="font-size: 14px; margin-top: 4px; font-weight: 600;">${currentCandidato.cognome} ${currentCandidato.nome} (ID: ${currentCandidato.id})</div>
          </div>
          <div class="score-badge">
            PUNTEGGIO: ${evalForm.punteggio_complessivo !== null ? evalForm.punteggio_complessivo + '/100' : 'N/D'}<br/>
            <span style="font-size:12px; color: #555;">${starsText}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Anagrafica & Informazioni Personali</div>
          <div class="grid-2">
            <table class="info-table">
              <tr>
                <td class="label">Telefono:</td>
                <td>${currentCandidato.telefono || 'N/D'}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td>${currentCandidato.email || 'N/D'}</td>
              </tr>
              <tr>
                <td class="label">Residenza:</td>
                <td>${currentCandidato.residenza || 'N/D'}</td>
              </tr>
            </table>
            <table class="info-table">
              <tr>
                <td class="label">Competenze:</td>
                <td>${currentCandidato.competenze_chiave || 'N/D'}</td>
              </tr>
              <tr>
                <td class="label">Settore:</td>
                <td>${currentCandidato.settore || 'N/D'}</td>
              </tr>
              <tr>
                <td class="label">Codice IBAN:</td>
                <td>${currentCandidato.iban || 'N/D'}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Disponibilità & Preferenze</div>
          <table class="info-table">
            <tr>
              <td class="label" style="width: 25%;">Orari di lavoro:</td>
              <td>${orari}</td>
            </tr>
            <tr>
              <td class="label">Mobilità geografica:</td>
              <td>${mobilita}</td>
            </tr>
            <tr>
              <td class="label">Disponibilità assunzione:</td>
              <td><strong>${evalForm.disp_assunzione || 'N/D'}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section" style="page-break-after: always;">
          <div class="section-title">Griglia Parametri Comportamentali e Tecnici</div>
          <table class="rating-table">
            <thead>
              <tr>
                <th class="left">Area di Valutazione</th>
                <th style="width: 15%;">Punteggio (1-5)</th>
                <th style="width: 30%;">Significato</th>
              </tr>
            </thead>
            <tbody>
              ${areas.map(a => {
      const significato = a.score === 1 ? 'Insufficiente' : a.score === 2 ? 'Sufficiente' : a.score === 3 ? 'Buono' : a.score === 4 ? 'Ottimo' : a.score === 5 ? 'Eccellente' : 'Non valutato';
      return `
                  <tr>
                    <td>${a.label}</td>
                    <td class="center">${a.score || '--'}</td>
                    <td>${significato}</td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Osservazioni del Valutatore</div>
          <div class="grid-2">
            <div>
              <strong style="font-size: 11px; text-transform: uppercase;">Punti di Forza:</strong>
              <div class="comments-box">${evalForm.punti_forza || 'Nessuna nota inserita.'}</div>
            </div>
            <div>
              <strong style="font-size: 11px; text-transform: uppercase;">Aree di Miglioramento:</strong>
              <div class="comments-box">${evalForm.aree_miglioramento || 'Nessuna nota inserita.'}</div>
            </div>
          </div>
          <div class="grid-2" style="margin-top: 15px;">
            <div>
              <strong style="font-size: 11px; text-transform: uppercase;">Osservazioni Generali:</strong>
              <div class="comments-box">${evalForm.osservazioni || 'Nessuna nota inserita.'}</div>
            </div>
            <div>
              <strong style="font-size: 11px; text-transform: uppercase;">Valutazione Conclusiva Finale:</strong>
              <div class="comments-box">${evalForm.valutazione_finale || 'Nessuna nota inserita.'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Storico delle Attività</div>
          <div class="grid-2">
            <div>
              <strong style="font-size: 11px; text-transform: uppercase;">Mandati & Prove:</strong>
              <ul>${pipelineHtml}</ul>
            </div>
            <div>
              <strong style="font-size: 11px; text-transform: uppercase;">Colloqui:</strong>
              <ul>${appuntamentiHtml}</ul>
            </div>
          </div>
          <div style="margin-top: 15px;">
            <strong style="font-size: 11px; text-transform: uppercase;">Log di Registro Storici:</strong>
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 6px; margin-top: 4px; background-color: #fafafa; max-height: 250px; overflow: hidden;">
              ${logsHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          Documento generato dal Sistema Gestionale Risorse Umane il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}.
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  const handlePrintReport = data => {
    if (!data) return;
    const printWindow = window.open('', '_blank');
    const funnelSteps = [{
      step: 'Candidati Associati a Mandato',
      count: data.metrics.candidatiPresentati,
      width: '95%',
      color: '#3B82F6'
    }, {
      step: 'CV Trasmessi a Clienti',
      count: data.metrics.cvInviati,
      width: '80%',
      color: '#F59E0B'
    }, {
      step: 'Colloqui e Test Svolti',
      count: data.metrics.colloquiProgrammati,
      width: '65%',
      color: '#EC4899'
    }, {
      step: 'Prove Lavorative Avviate',
      count: data.metrics.proveAvviate,
      width: '50%',
      color: '#8B5CF6'
    }, {
      step: 'Candidati Assunti / Mandati Assunzione',
      count: data.metrics.assunti,
      width: '35%',
      color: '#10B981'
    }];
    const funnelHtml = funnelSteps.map(f => `
      <div style="width: ${f.width}; margin: 8px auto; border: 1px solid ${f.color}; background-color: #fafafa; border-radius: 4px; padding: 8px; text-align: center; font-size: 12px; font-weight: bold;">
        ${f.step}: ${f.count}
      </div>
    `).join('');
    const logsHtml = data.logs.map(log => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 6px 8px; font-size:11px;">${new Date(log.data_attivita).toLocaleDateString('it-IT')}</td>
        <td style="padding: 6px 8px; font-size:11px; font-weight: bold;">${log.tipo_soggetto}</td>
        <td style="padding: 6px 8px; font-size:11px; font-weight: bold;">${log.tipo_attivita}</td>
        <td style="padding: 6px 8px; font-size:11px; color:#555;">${log.dettagli}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; padding: 12px; color: #888;">Nessun log registrato in questo intervallo.</td></tr>';
    const rangeLabel = reportRange === 'week' ? 'Ultima Settimana' : reportRange === 'month' ? 'Ultimo Mese' : reportRange === '3months' ? 'Ultimi 3 Mesi' : `Intervallo personalizzato (Dal ${new Date(reportStartDate).toLocaleDateString('it-IT')} Al ${new Date(reportEndDate).toLocaleDateString('it-IT')})`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>REPORT DI PERIODO GESTIONALE RISORSE UMANE</title>
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #222; margin: 40px; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 3px solid #333; padding-bottom: 12px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; color: #111; letter-spacing: 0.5px; }
          .header .date-range { font-size: 12px; font-weight: bold; color: #555; }
          
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #888; padding-bottom: 4px; margin-bottom: 12px; color: #111; }
          
          .grid-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 25px; }
          .card-stat { border: 1px solid #ccc; border-radius: 6px; padding: 10px; text-align: center; background-color: #fafafa; }
          .card-stat .label { font-size: 10px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 4px; }
          .card-stat .value { font-size: 20px; font-weight: bold; color: #111; }
          
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          
          .rating-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          .rating-table th { background-color: #f5f5f5; font-size: 11px; padding: 6px 8px; border: 1px solid #ddd; text-align: left; }
          .rating-table td { padding: 6px 8px; border: 1px solid #ddd; font-size: 11px; }
          
          .footer { text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 40px; }
          @media print {
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Report Generale dell'Attività</h1>
            <div class="date-range">Intervallo: ${rangeLabel}</div>
          </div>
          <div style="font-size: 11px; text-align: right; color: #666;">
            Stampato il: ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Indicatori Chiave di Performance (KPI)</div>
          <div class="grid-stats">
            <div class="card-stat">
              <div class="label">Ricerche Aperte</div>
              <div class="value">${data.metrics.ricercheAperte}</div>
            </div>
            <div class="card-stat">
              <div class="label">Nuovi CV</div>
              <div class="value">${data.metrics.nuoviCandidati}</div>
            </div>
            <div class="card-stat">
              <div class="label">CV Presentati</div>
              <div class="value">${data.metrics.candidatiPresentati}</div>
            </div>
            <div class="card-stat">
              <div class="label">CV Inviati</div>
              <div class="value">${data.metrics.cvInviati}</div>
            </div>
            <div class="card-stat">
              <div class="label">Colloqui</div>
              <div class="value">${data.metrics.colloquiProgrammati}</div>
            </div>
            <div class="card-stat">
              <div class="label">Prove Avviate</div>
              <div class="value">${data.metrics.proveAvviate}</div>
            </div>
            <div class="card-stat">
              <div class="label">Candidati Assunti</div>
              <div class="value">${data.metrics.assunti}</div>
            </div>
            <div class="card-stat">
              <div class="label">Mandati Assunzione</div>
              <div class="value">${data.metrics.assunzioniTrasmesse}</div>
            </div>
          </div>
        </div>

        <div class="section" style="page-break-after: always;">
          <div class="section-title">Schemi e Conversione Imbuto (Funnel)</div>
          <div class="grid-2">
            <div>
              <strong style="font-size:11px; text-transform:uppercase; display:block; margin-bottom:8px; text-align:center;">Funnel di Reclutamento:</strong>
              ${funnelHtml}
            </div>
            <div>
              <strong style="font-size:11px; text-transform:uppercase; display:block; margin-bottom:12px;">Analisi Volumi Relativi:</strong>
              ${[{
      label: 'Nuovi CV Inseriti',
      count: data.metrics.nuoviCandidati
    }, {
      label: 'Candidati Associati',
      count: data.metrics.candidatiPresentati
    }, {
      label: 'CV Inviati a Cliente',
      count: data.metrics.cvInviati
    }, {
      label: 'Colloqui e Test',
      count: data.metrics.colloquiProgrammati
    }, {
      label: 'Prove Avviate',
      count: data.metrics.proveAvviate
    }, {
      label: 'Candidati Assunti',
      count: data.metrics.assunti
    }].map(item => {
      const maxVal = Math.max(data.metrics.nuoviCandidati, data.metrics.candidatiPresentati, data.metrics.cvInviati, data.metrics.colloquiProgrammati, data.metrics.proveAvviate, data.metrics.assunti, 1);
      const pct = Math.round(item.count / maxVal * 100);
      return `
                  <div style="margin-bottom: 12px;">
                    <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom: 3px;">
                      <span>${item.label}</span>
                      <strong>${item.count}</strong>
                    </div>
                    <div style="height:8px; background-color:#eee; border-radius:4px; overflow:hidden; border: 1px solid #ccc;">
                      <div style="height:100%; width:${pct}%; background-color:#555; border-radius:4px;"></div>
                    </div>
                  </div>
                `;
    }).join('')}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Registro Attività Dettagliato</div>
          <table class="rating-table">
            <thead>
              <tr>
                <th style="width: 12%;">Data</th>
                <th style="width: 15%;">Categoria</th>
                <th style="width: 25%;">Attività</th>
                <th>Dettagli</th>
              </tr>
            </thead>
            <tbody>
              ${logsHtml}
            </tbody>
          </table>
        </div>

        <div class="footer">
          Documento generato automaticamente dal Sistema Gestionale Risorse Umane Locale.
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  const handleOpenValutazione = async (candidateId, candidateName) => {
    setEvalCandidateId(candidateId);
    setEvalCandidateName(candidateName);
    setLoadingEvalStorico(true);
    setEvalActiveTab('profilo');
    setShowValutazioneModal(true);
    try {
      // 1. Fetch personal details
      const candRes = await fetch(`${API_BASE}/candidati/${candidateId}`);
      const candJson = await candRes.json();
      if (candJson.success) {
        setCurrentCandidato(candJson.data);
      }

      // 2. Fetch evaluation details
      const valRes = await fetch(`${API_BASE}/candidati/${candidateId}/valutazione`);
      const valJson = await valRes.json();
      if (valJson.success) {
        setEvalForm(valJson.data);
      }

      // 3. Fetch history
      const histRes = await fetch(`${API_BASE}/candidati/${candidateId}/storico`);
      const histJson = await histRes.json();
      if (histJson.success) {
        setEvalStorico(histJson.data);
      }
    } catch (e) {
      console.error("Errore nel caricamento della valutazione:", e);
    } finally {
      setLoadingEvalStorico(false);
    }
  };
  const calculateRealtimeScore = form => {
    const params15 = [form.pres_personale, form.puntualita, form.comunicazione, form.educazione, form.motivazione, form.interesse_az, form.esperienza_lav, form.competenze_tec, form.cap_apprendimento, form.problem_solving, form.cap_organizzativa, form.team_work, form.autonomia, form.affidabilita, form.flessibilita];
    let completed = true;
    let sum = 0;
    for (const val of params15) {
      if (val === undefined || val === null || val === '') {
        completed = false;
        break;
      }
      const num = parseInt(val);
      if (isNaN(num) || num < 1 || num > 5) {
        completed = false;
        break;
      }
      sum += num;
    }
    if (completed) {
      return Math.round(sum / 75 * 100);
    }
    return null;
  };
  const handleEvalFormChange = (field, value) => {
    const updatedForm = {
      ...evalForm,
      [field]: value
    };
    const newScore = calculateRealtimeScore(updatedForm);
    updatedForm.punteggio_complessivo = newScore;
    setEvalForm(updatedForm);
  };
  const handleSaveValutazione = async e => {
    e.preventDefault();
    try {
      showStatus('loading', 'Salvataggio valutazione...', 'Salvataggio in corso...');
      const res = await fetch(`${API_BASE}/candidati/${evalCandidateId}/valutazione`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evalForm)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Valutazione salvata!', `La scheda di valutazione è stata salvata con successo. Punteggio: ${json.punteggio_complessivo || 'N/D'}/100`);
        setShowValutazioneModal(false);
        fetchCandidati();
        if (selectedRicercaId) {
          fetchRicercaDetail(selectedRicercaId);
        }
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleCreateCliente = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(`${API_BASE}/clienti`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Cliente creato!', 'Nuovo potenziale cliente inserito in anagrafica.');
        setShowNewClienteModal(false);
        fetchClienti();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleCreateCVCandidato = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (selectedRicercaId) {
      formData.append('id_ricerca', selectedRicercaId);
    }
    try {
      showStatus('loading', 'Salvataggio...', 'Caricamento file CV e anagrafica candidato...');
      const res = await fetch(`${API_BASE}/candidati`, {
        method: 'POST',
        body: formData // multipart/form-data handles file upload
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Candidato inserito!', 'Il file CV è stato salvato e collegato al profilo.');
        setShowNewCVCandidatoModal(false);
        if (selectedRicercaId) {
          await ensureResearchStarted();
          fetchRicercaDetail(selectedRicercaId);
        }
        fetchCandidati();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleInsertCandidate = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      showStatus('loading', 'Inserimento candidato...', 'Elaborazione in corso...');
      let candidateId = '';
      if (isNewCandidate) {
        // Create new candidate
        const resCand = await fetch(`${API_BASE}/candidati`, {
          method: 'POST',
          body: formData
        });
        const jsonCand = await resCand.json();
        if (!jsonCand.success) {
          showStatus('error', 'Errore creazione candidato', jsonCand.error);
          return;
        }
        candidateId = jsonCand.id;
      } else {
        candidateId = formData.get('id_candidato');
      }
      if (!candidateId) {
        showStatus('error', 'Errore', 'Seleziona un candidato esistente o compila i dati per uno nuovo.');
        return;
      }
      const resPipe = await fetch(`${API_BASE}/pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_ricerca: selectedRicercaId,
          id_candidato: candidateId,
          inviato_cliente: cvSentToggle ? 1 : 0,
          feedback_stato: 'In attesa di feedback',
          feedback_note: ''
        })
      });
      const jsonPipe = await resPipe.json();
      if (jsonPipe.success) {
        showStatus('success', 'Candidato Inserito!', 'Il candidato è stato collegato alla ricerca in attesa di feedback.');
        e.target.reset();
        setIsNewCandidate(false);
        fetchCandidati();
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore collegamento', jsonPipe.error);
      }
    } catch (err) {
      showStatus('error', 'Errore di connessione', err.message);
    }
  };
  const handleFeedbackPositivo = async e => {
    e.preventDefault();
    if (!selectedPipeCand) return;
    try {
      showStatus('loading', 'Salvataggio feedback...', 'Salvataggio in corso...');
      const resPipe = await fetch(`${API_BASE}/pipeline/${selectedPipeCand.idAssunzione}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedback_stato: 'Feedback Positivo',
          feedback_note: feedbackNoteText,
          stato_avanzamento: 'Presentato'
        })
      });
      const jsonPipe = await resPipe.json();
      if (!jsonPipe.success) {
        showStatus('error', 'Errore', jsonPipe.error);
        return;
      }
      if (scheduleInterviewOption && interviewDate && interviewTime) {
        const resInt = await fetch(`${API_BASE}/appuntamenti`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_ricerca: selectedRicercaId,
            id_candidato: selectedPipeCand.idCandidato,
            data: interviewDate,
            ora: interviewTime,
            tipo: interviewType,
            note: `Pianificato da feedback positivo. Nota: ${feedbackNoteText}`
          })
        });
        const jsonInt = await resInt.json();
        if (!jsonInt.success) {
          showStatus('error', 'Errore salvataggio colloquio', jsonInt.error);
        }
      }
      showStatus('success', 'Feedback Positivo Registrato!', 'Feedback salvato con successo.');
      setShowFeedbackModal(null);
      setFeedbackNoteText('');
      setScheduleInterviewOption(false);
      setInterviewDate('');
      setInterviewTime('');
      setSelectedPipeCand(null);
      fetchRicercaDetail(selectedRicercaId);
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleFeedbackNegativo = async e => {
    e.preventDefault();
    if (!selectedPipeCand) return;
    if (!feedbackNoteText.trim()) {
      showStatus("error", "Errore", "La motivazione è obbligatoria per il feedback negativo.");
      return;
    }
    try {
      showStatus('loading', 'Salvataggio feedback...', 'Salvataggio in corso...');
      const resPipe = await fetch(`${API_BASE}/pipeline/${selectedPipeCand.idAssunzione}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedback_stato: 'Feedback Negativo',
          feedback_note: feedbackNoteText,
          escludi_ricerca: excludeFromResearch
        })
      });
      const jsonPipe = await resPipe.json();
      if (jsonPipe.success) {
        showStatus('success', 'Feedback Negativo Registrato!', 'Feedback salvato con successo.');
        setShowFeedbackModal(null);
        setFeedbackNoteText('');
        setExcludeFromResearch(false);
        setSelectedPipeCand(null);
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', jsonPipe.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleUnlinkCandidate = async idAssunzione => {
    if (!window.confirm("Sei sicuro di voler separare questo candidato da questa ricerca?")) return;
    try {
      showStatus('loading', 'Scollegamento...', 'Rimozione in corso...');
      const res = await fetch(`${API_BASE}/pipeline/${idAssunzione}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Scollegato!', 'Il candidato è stato separato da questa ricerca.');
        setSelectedPipeCand(null);
        fetchCandidati();
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleToggleInviatoStatus = async newInviato => {
    if (!selectedPipeCand) return;
    try {
      showStatus('loading', 'Aggiornamento invio...', 'Salvataggio in corso...');
      const res = await fetch(`${API_BASE}/pipeline/${selectedPipeCand.idAssunzione}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviato_cliente: newInviato
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Stato Aggiornato!', `Stato dell'invio aggiornato con successo.`);
        setSelectedPipeCand(prev => ({
          ...prev,
          inviatoCliente: newInviato
        }));
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleEditCandidato = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      showStatus('loading', 'Salvataggio...', 'Aggiornamento anagrafica candidato...');
      const res = await fetch(`${API_BASE}/candidati/${currentCandidato.id}`, {
        method: 'PUT',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Candidato aggiornato!', 'Modifiche salvate con successo.');
        setShowEditCandidatoModal(false);
        setShowValutazioneModal(false);
        fetchCandidati();
        if (selectedRicercaId) fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleSaveAnnuncio = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      showStatus('loading', 'Salvataggio annuncio...', 'Inserimento in corso...');
      const res = await fetch(`${API_BASE}/ricerche/${selectedRicercaId}/annunci`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Annuncio Creato!', 'Nuovo annuncio di lavoro inserito con successo.');
        e.target.reset();
        await ensureResearchStarted();
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };

  // Link a candidate (already in DB) to a search
  const handleLinkCandidatoToRicerca = async idCandidato => {
    try {
      const res = await fetch(`${API_BASE}/pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_ricerca: selectedRicercaId,
          id_candidato: idCandidato
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Candidato collegato!', 'Candidato inserito nella pipeline di questa ricerca.');
        await ensureResearchStarted();
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };

  // Change candidate state (colloquio, prova, assunzione)
  const handleUpdatePipelineStatus = async (idAssunzione, stateChange) => {
    try {
      const res = await fetch(`${API_BASE}/pipeline/${idAssunzione}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stateChange)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Pipeline aggiornata!', 'Stato del candidato aggiornato.');
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleUpdateInterviewStatus = async e => {
    e.preventDefault();
    if (!showInterviewStatusModal) return;
    const {
      appuntamento,
      nextStato
    } = showInterviewStatusModal;
    const formData = new FormData(e.target);
    const motivazione = formData.get('motivazione');
    try {
      showStatus('loading', 'Aggiornamento stato...', 'Salvataggio in corso...');
      const res = await fetch(`${API_BASE}/appuntamenti/${appuntamento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stato: nextStato,
          motivazione_stato: motivazione
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Stato Aggiornato!', `Stato del colloquio modificato in ${nextStato}.`);
        setShowInterviewStatusModal(null);
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };

  // Schedule interview
  const handleScheduleInterview = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.id_ricerca = selectedRicercaId;
    try {
      const isLinked = ricercaDetail.candidatiCollegati.some(cc => cc.idCandidato === data.id_candidato);
      if (!isLinked) {
        const linkRes = await fetch(`${API_BASE}/pipeline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_ricerca: selectedRicercaId,
            id_candidato: data.id_candidato
          })
        });
        const linkJson = await linkRes.json();
        if (!linkJson.success) {
          showStatus('error', 'Errore Collegamento', linkJson.error);
          return;
        }
      }
      const res = await fetch(`${API_BASE}/appuntamenti`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Colloquio programmato!', 'Inserito evento nello storico e aggiornata pipeline.');
        await ensureResearchStarted();
        fetchRicercaDetail(selectedRicercaId);
        e.target.reset();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleDeleteInterview = async id => {
    if (!window.confirm("Sei sicuro di voler eliminare definitivamente questo colloquio? Questa operazione cancellerà anche lo storico specifico.")) return;
    try {
      showStatus('loading', 'Eliminazione...', 'Cancellazione colloquio in corso...');
      const res = await fetch(`${API_BASE}/appuntamenti/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Colloquio Eliminato!', 'L\'appuntamento è stato rimosso con successo.');
        setSelectedInterviewForManagement(null);
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore connessione', err.message);
    }
  };
  const handleEditInterviewDetails = async e => {
    e.preventDefault();
    if (!selectedInterviewForManagement) return;
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      showStatus('loading', 'Salvataggio...', 'Aggiornamento dettagli colloquio...');
      const res = await fetch(`${API_BASE}/appuntamenti/${selectedInterviewForManagement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data.data,
          ora: data.ora,
          tipo: data.tipo,
          luogo: data.luogo,
          note: data.note
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Modifiche salvate!', 'I dettagli dell\'appuntamento sono stati aggiornati.');
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore connessione', err.message);
    }
  };
  const handleSaveResearchNote = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nota = formData.get('nota');
    if (!nota || !nota.trim()) return;
    try {
      showStatus('loading', 'Salvataggio nota...', 'Inserimento nota in corso...');
      const res = await fetch(`${API_BASE}/ricerche/${selectedRicercaId}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nota
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Nota aggiunta!', 'La nota è stata registrata nello storico e nei report.');
        fetchRicercaDetail(selectedRicercaId);
        e.target.reset();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };

  // Start trial phase
  const handleStartTrial = async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      let assunzioneId = null;
      const linked = ricercaDetail.candidatiCollegati.find(c => c.idCandidato === data.id_candidato);
      if (!linked) {
        const linkRes = await fetch(`${API_BASE}/pipeline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_ricerca: selectedRicercaId,
            id_candidato: data.id_candidato
          })
        });
        const linkJson = await linkRes.json();
        if (!linkJson.success) {
          showStatus('error', 'Errore Collegamento', linkJson.error);
          return;
        }
        assunzioneId = linkJson.id;
      } else {
        assunzioneId = linked.idAssunzione;
      }
      const res = await fetch(`${API_BASE}/pipeline/${assunzioneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stato_avanzamento: 'In Prova',
          stato_prova: 'In Corso',
          note_amministrazione: data.note || '',
          data_inizio_prova: data.data_inizio_prova,
          data_scadenza_prova: data.data_scadenza_prova,
          prova_contrattualizzata: data.prova_contrattualizzata === 'SI' ? 1 : 0
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Fase di prova avviata!', 'Candidato inserito in prova.');
        await ensureResearchStarted();
        fetchRicercaDetail(selectedRicercaId);
        e.target.reset();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handleEndTrial = async e => {
    e.preventDefault();
    try {
      showStatus('loading', 'Salvataggio esito prova...', 'Salvataggio in corso...');
      const res = await fetch(`${API_BASE}/pipeline/${provaData.idAssunzione || provaData.idCandidato}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stato_avanzamento: provaData.esito === 'Prova Superata' ? 'Approvato/Assunto' : 'CV Scartato',
          stato_prova: provaData.esito,
          note_amministrazione: provaData.note,
          data_scadenza_prova: provaData.dataFine
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Esito Registrato!', `Prova conclusa con esito: ${provaData.esito}`);
        setShowTerminaProvaModal(false);
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore connessione', err.message);
    }
  };
  const handleEditTrialDetails = async e => {
    e.preventDefault();
    if (!selectedTrialForManagement) return;
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      showStatus('loading', 'Salvataggio...', 'Aggiornamento date prova...');
      const res = await fetch(`${API_BASE}/pipeline/${selectedTrialForManagement.idAssunzione}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data_inizio_prova: data.data_inizio_prova,
          data_scadenza_prova: data.data_scadenza_prova,
          prova_contrattualizzata: data.prova_contrattualizzata === 'SI' ? 1 : 0,
          note_amministrazione: data.note
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Modifiche salvate!', 'Date e note del periodo di prova aggiornate con successo.');
        fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore connessione', err.message);
    }
  };
  const handleUpdateTrialStatus = async e => {
    e.preventDefault();
    if (!showTrialStatusModal) return;
    const {
      pipe,
      nextStato
    } = showTrialStatusModal;
    const formData = new FormData(e.target);
    const motivazione = formData.get('motivazione');
    try {
      showStatus('loading', 'Conclusione prova...', 'Salvataggio in corso...');
      const isApproved = nextStato === 'Prova Superata';
      const res = await fetch(`${API_BASE}/pipeline/${pipe.idAssunzione}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stato_avanzamento: isApproved ? 'Approvato/Assunto' : 'CV Scartato',
          stato_prova: nextStato,
          note_amministrazione: `Prova conclusa. Esito: ${nextStato}. Note: ${motivazione}`
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Esito Registrato!', `Prova conclusa con esito: ${nextStato}.`);
        setShowTrialStatusModal(null);
        setSelectedTrialForManagement(null);
        fetchRicercaDetail(selectedRicercaId);

        // If trial is passed, auto-select for assunzione
        if (isApproved) {
          setSelectedHiringCandidate({
            idCandidato: pipe.idCandidato,
            nomeCompleto: pipe.nomeCompleto,
            statoAvanzamento: 'Approvato/Assunto'
          });
          setActiveTab('assunzione');
        }
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handlePrintSingleTrialReport = pipe => {
    if (!pipe || !ricercaDetail) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showStatus("warning", "Attenzione", "Blocco popup rilevato! Consenti i popup per stampare.");
      return;
    }
    const dateStr = new Date().toLocaleDateString('it-IT');
    const timeStr = new Date().toLocaleTimeString('it-IT');

    // Filter timeline for this trial
    const filteredLogs = (timeline || []).filter(log => log.soggetto_correlato === pipe.nomeCompleto && (log.tipo_attivita.toLowerCase().includes('prova') || log.dettagli.toLowerCase().includes('prova')));
    const logRows = filteredLogs.map(log => {
      const logDate = new Date(log.data_attivita).toLocaleDateString('it-IT');
      const logTime = new Date(log.data_attivita).toLocaleTimeString('it-IT');
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px; white-space: nowrap;">${logDate} alle ${logTime}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px; font-weight: bold; color: #2b6cb0;">${log.tipo_attivita}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px; color: #4a5568;">${log.dettagli}</td>
        </tr>
      `;
    }).join('');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Prova - ${pipe.nomeCompleto}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #2d3748; 
            margin: 40px; 
            line-height: 1.6; 
            font-size: 14px; 
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #3182ce;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #2b6cb0; 
            margin: 0 0 6px 0;
            text-transform: uppercase;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #718096;
          }
          .details-card {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .details-item {
            margin-bottom: 10px;
          }
          .details-label {
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
            font-size: 11px;
          }
          .details-value {
            font-size: 14px;
            color: #2d3748;
            margin-top: 2px;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .badge-Superata { background-color: #c6f6d5; color: #22543d; }
          .badge-Non-Superata { background-color: #fed7d7; color: #9b2c2c; }
          .badge-In-Corso { background-color: #feebc8; color: #c05621; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
          }
          th { 
            background-color: #ebf8ff; 
            color: #2b6cb0; 
            border: 1px solid #cbd5e0; 
            padding: 10px; 
            text-align: left; 
            font-size: 12px;
            text-transform: uppercase;
          }
          .no-print {
            margin-top: 30px;
            text-align: center;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 11px;
            color: #a0aec0;
            text-align: center;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">HEMA WORK - REPORT PERIODO DI PROVA</div>
          <div class="meta-info">
            <div><strong>Riferimento:</strong> Selezione Risorse Umane</div>
            <div><strong>Report generato il:</strong> ${dateStr} alle ${timeStr}</div>
          </div>
        </div>

        <div class="details-card">
          <div class="details-grid">
            <div class="details-item">
              <span class="details-label">Candidato in Prova</span>
              <div class="details-value" style="font-weight: bold;">${pipe.nomeCompleto}</div>
            </div>
            <div class="details-item">
              <span class="details-label">Mandato di Ricerca</span>
              <div class="details-value">${ricercaDetail.ricerca.ruolo} presso <strong>${ricercaDetail.ricerca.azienda}</strong></div>
            </div>
            <div class="details-item">
              <span class="details-label">Data Inizio Prova</span>
              <div class="details-value"><strong>${pipe.dataInizioProva || 'N/D'}</strong></div>
            </div>
            <div class="details-item">
              <span class="details-label">Data Scadenza Prevista</span>
              <div class="details-value"><strong>${pipe.dataScadenzaProva || 'N/D'}</strong></div>
            </div>
            <div class="details-item">
              <span class="details-label">Prova Contrattualizzata?</span>
              <div class="details-value"><strong>${pipe.provaContrattualizzata === 1 ? 'SÌ' : 'NO'}</strong></div>
            </div>
            <div class="details-item">
              <span class="details-label">Stato Prova</span>
              <div class="details-value">
                <span class="badge badge-${(pipe.statoProva || 'In Corso').replace(/\s+/g, '-')}">${pipe.statoProva || 'In Corso'}</span>
              </div>
            </div>
            <div class="details-item" style="grid-column: span 2;">
              <span class="details-label">Note e Dettagli Amministrativi</span>
              <div class="details-value" style="font-style: italic;">${pipe.noteAmministrazione || 'Nessuna nota aggiuntiva.'}</div>
            </div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; border-bottom: 1px solid #cbd5e0; padding-bottom: 6px; margin-top: 30px;">
          Registro delle Azioni e Log Storici
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 160px;">Data e Ora Log</th>
              <th style="width: 200px;">Attività</th>
              <th>Dettagli Operazione</th>
            </tr>
          </thead>
          <tbody>
            ${logRows || '<tr><td colspan="3" style="text-align: center; padding: 12px; color: #718096;">Nessuna attività storicizzata per questa prova.</td></tr>'}
          </tbody>
        </table>

        <div class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #3182ce; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 13px;">🖨️ Avvia Stampa / Salva in PDF</button>
        </div>

        <div class="footer">
          HEMA WORK - Documento Confidenziale Interno
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  const handleCreateHiringForCandidate = async (idCandidato, nomeCompleto) => {
    try {
      showStatus('loading', 'Associazione candidato...', 'Preparazione della scheda di assunzione...');
      // 1. Check if candidate is already associated
      const associated = (ricercaDetail.candidatiCollegati || []).find(cc => cc.idCandidato === idCandidato);
      if (associated) {
        if (associated.statoAvanzamento !== 'Approvato/Assunto') {
          // Update status to Approvato/Assunto
          const res = await fetch(`${API_BASE}/pipeline/${associated.idAssunzione}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              stato_avanzamento: 'Approvato/Assunto'
            })
          });
          const json = await res.json();
          if (!json.success) {
            showStatus('error', 'Errore aggiornamento', json.error);
            return;
          }
        }
      } else {
        // Link to research with stato_avanzamento: Approvato/Assunto
        const res = await fetch(`${API_BASE}/pipeline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_ricerca: selectedRicercaId,
            id_candidato: idCandidato,
            stato_avanzamento: 'Approvato/Assunto'
          })
        });
        const json = await res.json();
        if (!json.success) {
          showStatus('error', 'Errore collegamento', json.error);
          return;
        }
      }

      // Refresh detail and open hiring form
      await fetchRicercaDetail(selectedRicercaId);
      setShowNewAssunzioneModal(false);
      handleOpenHiringForm({
        idCandidato,
        nomeCompleto
      });
    } catch (err) {
      showStatus('error', 'Errore connessione', err.message);
    }
  };
  const handleOpenHiringForm = async c => {
    try {
      showStatus('loading', 'Caricamento dati candidato...', 'Recupero delle informazioni in corso...');
      const res = await fetch(`${API_BASE}/candidati/${c.idCandidato}`);
      const json = await res.json();
      if (!json.success) {
        showStatus('error', 'Errore', 'Impossibile recuperare i dati anagrafici del candidato.');
        return;
      }
      const candObj = json.data || {};
      const newHiringData = {
        commerciale: ricercaDetail.ricerca.consulente_commerciale || '',
        outbound: ricercaDetail.ricerca.outbound || '',
        committente: ricercaDetail.ricerca.azienda || '',
        clientePiva: ricercaDetail.ricerca.piva || '',
        clienteSedeLegale: ricercaDetail.ricerca.sede_legale || '',
        clienteSedeLavoro: ricercaDetail.ricerca.sede_lavoro || '',
        clienteReferente: ricercaDetail.ricerca.referente || '',
        clienteEmail: ricercaDetail.ricerca.email || '',
        clienteTelefono: [ricercaDetail.ricerca.telefono_mobile, ricercaDetail.ricerca.telefono_fisso].filter(Boolean).join(' / ') || '',
        cognome: candObj.cognome || '',
        nome: candObj.nome || '',
        sedeLavoro: ricercaDetail.ricerca.sede_lavoro || '',
        ccnl: ricercaDetail.ricerca.ccnl_livello || '',
        livello: c.statoProva || '',
        mansione: ricercaDetail.ricerca.ruolo || '',
        contrattoTipo: c.contrattoTipo || 'Full-time',
        oreContratto: c.oreContratto || '40',
        durata: c.durataContratto || 'Tempo Indeterminato',
        retribuzione: ricercaDetail.ricerca.retribuzione || '',
        costoServizio: c.costoServizioFinale || '',
        note: c.noteAmministrazione || '',
        telefono: candObj.telefono || '',
        mail: candObj.email || '',
        residenza: candObj.residenza || '',
        codiceFiscale: candObj.codice_fiscale || '',
        linkDocumenti: candObj.link_documenti || '',
        idCandidato: c.idCandidato
      };
      setHiringFormData(newHiringData);
      showStatus(null);
      if (candObj.link_documenti) {
        setSelectedHiringCandidate(c);
      } else {
        setPendingHiringCandidate(c);
        setShowDocUploadModal(candObj);
      }
    } catch (err) {
      showStatus('error', 'Errore connessione', err.message);
    }
  };
  const handleUploadDocAndProceed = async e => {
    e.preventDefault();
    const fileInput = document.getElementById('docUploadInput');
    const file = fileInput?.files[0];
    if (file) {
      const fd = new FormData();
      fd.append('docIdFile', file);
      try {
        showStatus('loading', 'Caricamento documento...', 'Salvataggio file in corso...');
        const resUpload = await fetch(`${API_BASE}/candidati/${pendingHiringCandidate.idCandidato}`, {
          method: 'PUT',
          body: fd
        });
        const jsonUpload = await resUpload.json();
        if (jsonUpload.success) {
          showStatus('success', 'Documento Salvato!', 'Il documento d\'identità è stato associato al candidato.');
          setHiringFormData(prev => ({
            ...prev,
            linkDocumenti: jsonUpload.linkDocumenti
          }));
          setSelectedHiringCandidate(pendingHiringCandidate);
          fetchCandidati();
          if (selectedRicercaId) fetchRicercaDetail(selectedRicercaId);
        } else {
          showStatus('error', 'Errore caricamento', jsonUpload.error);
        }
      } catch (errUpload) {
        showStatus('error', 'Connessione fallita', errUpload.message);
      }
    } else {
      setSelectedHiringCandidate(pendingHiringCandidate);
    }
    setShowDocUploadModal(null);
    setPendingHiringCandidate(null);
  };
  const handleUploadHiringDoc = async e => {
    const file = e.target.files[0];
    if (!file || !selectedHiringCandidate) return;
    const candId = selectedHiringCandidate.idCandidato;
    const fd = new FormData();
    fd.append('docIdFile', file);
    try {
      showStatus('loading', 'Caricamento documento...', 'Salvataggio file in corso...');
      const res = await fetch(`${API_BASE}/candidati/${candId}`, {
        method: 'PUT',
        body: fd
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Documento Salvato!', 'Il documento d\'identità è stato associato al candidato nel database.');
        setHiringFormData(prev => ({
          ...prev,
          linkDocumenti: json.linkDocumenti
        }));
        fetchCandidati();
        if (selectedRicercaId) fetchRicercaDetail(selectedRicercaId);
      } else {
        showStatus('error', 'Errore caricamento', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handlePrintHiringSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showStatus("warning", "Attenzione", "Blocco popup rilevato! Consenti i popup per stampare.");
      return;
    }
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scheda Assunzione - HEMA FOOD</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #000; margin: 40px; line-height: 1.8; font-size: 14px; }
          .header { text-align: center; font-size: 22px; font-weight: bold; text-transform: uppercase; margin-bottom: 40px; letter-spacing: 1px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .col { flex: 1; display: flex; }
          .col-half { flex: 0 0 48%; display: flex; }
          .label { font-weight: bold; text-transform: uppercase; white-space: nowrap; margin-right: 8px; }
          .value { border-bottom: 1px solid #000; flex: 1; padding-left: 5px; min-height: 20px; }
          .divider { border-top: 1px solid #000; margin: 30px 0 20px 0; }
          .section-title { font-weight: bold; margin-bottom: 15px; text-decoration: underline; font-size: 15px; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">HEMA FOOD</div>
        
        <div class="row">
          <div class="col-half"><span class="label">Commerciale:</span><span class="value">${hiringFormData.commerciale}</span></div>
          <div class="col-half"><span class="label">Outbound:</span><span class="value">${hiringFormData.outbound}</span></div>
        </div>
        
        <div class="row">
          <div class="col"><span class="label">Committente:</span><span class="value">${hiringFormData.committente}</span></div>
        </div>
        
        <div class="row">
          <div class="col-half"><span class="label">P.IVA CLIENTE:</span><span class="value">${hiringFormData.clientePiva}</span></div>
          <div class="col-half"><span class="label">REFERENTE CLIENTE:</span><span class="value">${hiringFormData.clienteReferente}</span></div>
        </div>
        
        <div class="row">
          <div class="col-half"><span class="label">SEDE LEGALE CLIENTE:</span><span class="value">${hiringFormData.clienteSedeLegale}</span></div>
          <div class="col-half"><span class="label">CONTATTI CLIENTE:</span><span class="value">${hiringFormData.clienteEmail} / ${hiringFormData.clienteTelefono}</span></div>
        </div>
        
        <div class="row">
          <div class="col"><span class="label">SEDE DI LAVORO EFFETTIVA:</span><span class="value">${hiringFormData.clienteSedeLavoro}</span></div>
        </div>
        
        <div style="margin-bottom: 25px;"></div>
        
        <div class="row"><div class="col"><span class="label">COGNOME:</span><span class="value">${hiringFormData.cognome}</span></div></div>
        <div class="row"><div class="col"><span class="label">NOME:</span><span class="value">${hiringFormData.nome}</span></div></div>
        <div class="row"><div class="col"><span class="label">SEDE DI LAVORO:</span><span class="value">${hiringFormData.sedeLavoro}</span></div></div>
        <div class="row"><div class="col"><span class="label">CCNL:</span><span class="value">${hiringFormData.ccnl}</span></div></div>
        <div class="row"><div class="col"><span class="label">LIVELLO DI INQUADRAMENTO:</span><span class="value">${hiringFormData.livello}</span></div></div>
        <div class="row"><div class="col"><span class="label">MANSIONE:</span><span class="value">${hiringFormData.mansione}</span></div></div>
        <div class="row"><div class="col"><span class="label">CONTRATTO PART-TIME/FULL-TIME:</span><span class="value">${hiringFormData.contrattoTipo}</span></div></div>
        <div class="row"><div class="col"><span class="label">ORE CONTRATTO:</span><span class="value">${hiringFormData.oreContratto}</span></div></div>
        <div class="row"><div class="col"><span class="label">DURATA (DATA INIZIO/DATA FINE):</span><span class="value">${hiringFormData.durata}</span></div></div>
        <div class="row"><div class="col"><span class="label">RETRIBUZIONE:</span><span class="value">${hiringFormData.retribuzione}</span></div></div>
        <div class="row"><div class="col"><span class="label">COSTO SERVIZIO:</span><span class="value">${hiringFormData.costoServizio}</span></div></div>
        <div class="row"><div class="col"><span class="label">NOTE (Es.: 13ma, 14ma, bonus Renzi, ANF):</span><span class="value">${hiringFormData.note}</span></div></div>
        
        <div class="divider"></div>
        
        <div class="section-title">Informazioni personali:</div>
        <div class="row"><div class="col"><span class="label">CODICE FISCALE:</span><span class="value">${hiringFormData.codiceFiscale}</span></div></div>
        <div class="row"><div class="col"><span class="label">RESIDENZA:</span><span class="value">${hiringFormData.residenza}</span></div></div>
        <div class="row"><div class="col"><span class="label">TELEFONO:</span><span class="value">${hiringFormData.telefono}</span></div></div>
        <div class="row"><div class="col"><span class="label">MAIL:</span><span class="value">${hiringFormData.mail}</span></div></div>
        <div class="row"><div class="col"><span class="label">IBAN:</span><span class="value">${hiringFormData.iban}</span></div></div>
        <div class="row"><div class="col"><span class="label">DOCUMENTO IDENTITÀ URL:</span><span class="value">${hiringFormData.linkDocumenti ? window.location.origin + hiringFormData.linkDocumenti : 'Nessuno'}</span></div></div>
        
        <div class="no-print" style="margin-top: 50px; text-align: center;">
          <button onclick="window.print()" style="padding: 12px 24px; font-weight: bold; background: #3182ce; color: #fff; border: none; border-radius: 5px; cursor: pointer;">🖨️ Avvia Stampa Scheda</button>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        <\/script>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };
  const handleEmailHiringSheet = async () => {
    const destEmail = window.prompt("Inserisci l'indirizzo email dell'Amministrazione:", "amministrazione@hemafood.it");
    if (!destEmail) return;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; line-height: 1.6;">
        <h2 style="text-align: center; text-transform: uppercase;">HEMA FOOD</h2>
        <p><strong>Commerciale:</strong> ${hiringFormData.commerciale} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Outbound:</strong> ${hiringFormData.outbound}</p>
        <p><strong>Committente:</strong> ${hiringFormData.committente}</p>
        <p><strong>P.IVA Cliente:</strong> ${hiringFormData.clientePiva} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Sede Legale Cliente:</strong> ${hiringFormData.clienteSedeLegale}</p>
        <p><strong>Referente Cliente:</strong> ${hiringFormData.clienteReferente} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Contatti Cliente:</strong> ${hiringFormData.clienteEmail} / ${hiringFormData.clienteTelefono}</p>
        <p><strong>Sede di Lavoro Effettiva:</strong> ${hiringFormData.clienteSedeLavoro}</p>
        <hr/>
        <p><strong>COGNOME:</strong> ${hiringFormData.cognome}</p>
        <p><strong>NOME:</strong> ${hiringFormData.nome}</p>
        <p><strong>SEDE DI LAVORO:</strong> ${hiringFormData.sedeLavoro}</p>
        <p><strong>CCNL:</strong> ${hiringFormData.ccnl}</p>
        <p><strong>LIVELLO DI INQUADRAMENTO:</strong> ${hiringFormData.livello}</p>
        <p><strong>MANSIONE:</strong> ${hiringFormData.mansione}</p>
        <p><strong>CONTRATTO PART-TIME/FULL-TIME:</strong> ${hiringFormData.contrattoTipo}</p>
        <p><strong>ORE CONTRATTO:</strong> ${hiringFormData.oreContratto}</p>
        <p><strong>DURATA (DATA INIZIO/DATA FINE):</strong> ${hiringFormData.durata}</p>
        <p><strong>RETRIBUZIONE:</strong> ${hiringFormData.retribuzione}</p>
        <p><strong>COSTO SERVIZIO:</strong> ${hiringFormData.costoServizio}</p>
        <p><strong>NOTE:</strong> ${hiringFormData.note}</p>
        <hr/>
        <h3>Informazioni personali:</h3>
        <p><strong>CODICE FISCALE:</strong> ${hiringFormData.codiceFiscale}</p>
        <p><strong>RESIDENZA:</strong> ${hiringFormData.residenza}</p>
        <p><strong>TELEFONO:</strong> ${hiringFormData.telefono}</p>
        <p><strong>MAIL:</strong> ${hiringFormData.mail}</p>
        <p><strong>IBAN:</strong> ${hiringFormData.iban}</p>
        <p><strong>DOCUMENTO IDENTITÀ:</strong> ${hiringFormData.linkDocumenti ? `<a href="${API_BASE.replace('/api', '')}${hiringFormData.linkDocumenti}">Apri Documento d'Identità</a>` : 'Nessuno'}</p>
      </div>
    `;
    try {
      showStatus('loading', 'Invio scheda...', 'Invio della scheda assunzione via e-mail in corso...');
      const res = await fetch(`${API_BASE}/email/assunzione`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dest_email: destEmail,
          subject: `Nuova Scheda Assunzione - ${hiringFormData.cognome} ${hiringFormData.nome}`,
          htmlBody,
          id_candidato: selectedHiringCandidate.idCandidato,
          candidato_nome: selectedHiringCandidate.nomeCompleto,
          id_ricerca: selectedRicercaId
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Inviata!', json.message);
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };
  const handlePrintExecutiveReport = () => {
    if (!ricercaDetail || !ricercaDetail.ricerca) return;
    const r = ricercaDetail.ricerca;
    const pipeline = ricercaDetail.candidatiCollegati || [];
    const appuntamenti = ricercaDetail.appuntamenti || [];
    let pauseMotivation = '';
    if (r.note && r.note.includes('MOTIVAZIONE MESSA IN PAUSA')) {
      const parts = r.note.split('\n');
      const pmLine = parts.find(p => p.includes('MOTIVAZIONE MESSA IN PAUSA'));
      if (pmLine) pauseMotivation = pmLine.substring(pmLine.indexOf(']:') + 2).trim();
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showStatus("warning", "Attenzione", "Blocco popup rilevato! Consenti i popup per stampare.");
      return;
    }

    // Calculate days open
    const today = new Date();
    const insertDate = new Date(r.data_inserimento);
    const diffTime = today - insertDate;
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // Stats
    const totalCandidates = pipeline.length;
    const totalInterviews = appuntamenti.length;
    let interviewsAzienda = 0;
    let interviewsAgenzia = 0;
    appuntamenti.forEach(app => {
      const type = (app.tipo || '').toLowerCase();
      if (type.includes('azienda') || type.includes('cliente') || type.includes('presso')) {
        interviewsAzienda++;
      } else {
        interviewsAgenzia++;
      }
    });
    let totalTrials = 0;
    let trialsPassed = 0;
    let trialsFailed = 0;
    let trialsInProgress = 0;
    let totalHires = 0;
    let feedbackPositivo = 0;
    let feedbackNegativo = 0;
    let inAttesaFeedback = 0;
    pipeline.forEach(item => {
      if (item.feedbackStato === 'Feedback Positivo') {
        feedbackPositivo++;
      } else if (item.feedbackStato === 'Feedback Negativo') {
        feedbackNegativo++;
      } else {
        inAttesaFeedback++;
      }
      if (item.statoAvanzamento === 'In Prova') {
        totalTrials++;
        trialsInProgress++;
      } else if (item.statoAvanzamento === 'Approvato/Assunto' || item.statoAvanzamento === 'Assunto') {
        totalHires++;
      }
      if (item.statoProva === 'Superata' || item.statoProva === 'Prova Superata') {
        totalTrials++;
        trialsPassed++;
      } else if (item.statoProva === 'Non Superata' || item.statoProva === 'Prova Non Superata') {
        totalTrials++;
        trialsFailed++;
      }
    });
    const dateStr = new Date().toLocaleDateString('it-IT');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Direzionale - ${r.azienda} (${r.ruolo})</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #2d3748; 
            margin: 50px; 
            line-height: 1.6; 
            font-size: 14px; 
            background: #fff;
          }
          .executive-header {
            border-bottom: 2px solid #3182ce;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2b6cb0; 
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #718096;
          }
          .section-title { 
            font-size: 16px; 
            font-weight: 700; 
            color: #2b6cb0; 
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 30px; 
            margin-bottom: 15px;
            text-transform: uppercase;
          }
          p {
            margin: 0 0 16px 0;
            text-align: justify;
          }
          ul {
            margin: 0 0 20px 0;
            padding-left: 20px;
          }
          li {
            margin-bottom: 8px;
          }
          .cand-list {
            margin-top: 15px;
          }
          .cand-item {
            background-color: #f7fafc;
            border-left: 3px solid #3182ce;
            padding: 12px 16px;
            margin-bottom: 12px;
            border-radius: 0 6px 6px 0;
          }
          .cand-name {
            font-weight: bold;
            color: #2d3748;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            font-size: 11px;
            color: #a0aec0;
            text-align: center;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="executive-header">
          <div class="title">HEMA WORK - RELAZIONE DIREZIONALE DI SELEZIONE</div>
          <div class="meta-info">
            <div><strong>Destinatario:</strong> Direzione Aziendale / Team Leader</div>
            <div><strong>Data Report:</strong> ${dateStr}</div>
          </div>
        </div>

        ${r.stato_approvazione_tl === 'In Pausa' ? `
          <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; margin-bottom: 25px; border-radius: 4px; color: #dd6b20; font-family: sans-serif;">
            <strong style="text-transform: uppercase; font-size: 14px;">⚠️ ATTENZIONE: Mandato in Pausa</strong><br/>
            <span style="font-size: 13px; color: #7b341e;">Questo mandato di ricerca è stato temporaneamente messo in pausa.</span><br/>
            ${pauseMotivation ? `<span style="font-size: 13px; color: #7b341e; margin-top: 6px; display: block;"><strong>Motivazione:</strong> ${pauseMotivation}</span>` : ''}
          </div>
        ` : ''}

        <p>
          Si trasmette di seguito la relazione sullo stato di avanzamento delle attività di reclutamento e selezione per il ruolo di 
          <strong>${r.ruolo}</strong> presso la sede di <strong>${r.sede_lavoro || 'N/D'}</strong> dell'azienda cliente <strong>${r.azienda}</strong>. 
          Il mandato prevede un impegno di <strong>${r.ore_lavoro ? r.ore_lavoro + ' ore ' + (r.ore_lavoro_tipo ? r.ore_lavoro_tipo.toLowerCase() : 'settimanali') : 'N/D'}</strong>${r.orario_lavoro ? ` con orario/turni: <strong>${r.orario_lavoro}</strong>` : ''}.
          Il mandato di ricerca è stato avviato in data <strong>${r.data_inserimento || 'N/D'}</strong> ed è attualmente in corso da <strong>${diffDays} giorni</strong>.
        </p>

        <div class="section-title">Attività e Sintesi dei Risultati</div>
        <ul>
          <li><strong>Sourcing e Screening:</strong> Sono stati individuati e reputati idonei un totale di <strong>${totalCandidates} candidati</strong>, i cui CV sono stati inseriti all'interno del processo di selezione.</li>
          <li><strong>Valutazione dei CV (Feedback):</strong> A seguito della presentazione dei CV al cliente, abbiamo ricevuto <strong>${feedbackPositivo} feedback positivi</strong> e <strong>${feedbackNegativo} feedback negativi</strong>. Attualmente restano <strong>${inAttesaFeedback} CV</strong> in attesa di valutazione da parte del referente.</li>
          <li><strong>Colloqui Effettuati:</strong> Sono stati pianificati e condotti <strong>${totalInterviews} colloqui complessivi</strong>. Nello specifico, sono stati svolti <strong>${interviewsAgenzia} colloqui conoscitivi/attitudinali</strong> (online o in agenzia) e <strong>${interviewsAzienda} colloqui tecnici</strong> direttamente presso la sede dell'azienda cliente.</li>
          <li><strong>Fasi di Prova Operativa:</strong> Le valutazioni hanno condotto all'attivazione di <strong>${totalTrials} periodi di prova</strong> sul campo per saggiare le competenze delle risorse. Di questi periodi: 
            <strong>${trialsPassed}</strong> si sono conclusi con esito favorevole, 
            <strong>${trialsFailed}</strong> hanno dato esito insoddisfacente, e 
            <strong>${trialsInProgress}</strong> sono tuttora in fase di svolgimento.</li>
          <li><strong>Assunzioni Finalizzate:</strong> L'iter si è concluso positivamente con l'assunzione contrattualizzata di <strong>${totalHires} risorse</strong> per ricoprire le posizioni previste.</li>
        </ul>

        <div class="section-title">Resoconto Dettagliato delle Candidature</div>
        <div class="cand-list">
          ${pipeline.length === 0 ? '<p>Nessun candidato attualmente inserito o gestito per questa ricerca.</p>' : pipeline.map(c => `
              <div class="cand-item">
                <div class="cand-name">${c.nomeCompleto}</div>
                <div style="font-size: 12px; color: #4a5568; margin-top: 4px;">
                  <strong>Stato attuale:</strong> ${c.statoAvanzamento || 'CV Ricevuto'} | 
                  <strong>Feedback CV:</strong> ${c.feedbackStato || 'In attesa'} 
                  ${c.feedbackNote ? `(Note: ${c.feedbackNote})` : ''}
                </div>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #4a5568;">
                  Il candidato presenta un CV con competenze/mansione <em>"${c.noteAmministrazione || 'N/D'}"</em>. 
                  ${c.statoProva ? `Ha effettuato un periodo di prova con esito: <strong>${c.statoProva}</strong>.` : ''}
                </p>
              </div>
            `).join('')}
        </div>

        <p style="margin-top: 30px;">
          Le attività proseguono costantemente per allineare le restanti candidature alle esigenze espresse e garantire l'inserimento qualificato di personale idoneo nel minor tempo possibile.
        </p>

        <div class="no-print" style="margin-top: 40px; text-align: center;">
          <button onclick="window.print()" style="padding: 12px 24px; font-weight: bold; background: #3182ce; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">🖨️ Avvia Stampa / Salva in PDF</button>
        </div>

        <div class="footer">
          HEMA WORK - Gestionale Ricerca & Selezione Personale Interno
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  const handlePrintTechnicalReport = () => {
    if (!selectedPipeCand || !ricercaDetail) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showStatus("warning", "Attenzione", "Blocco popup rilevato! Consenti i popup per stampare.");
      return;
    }
    const dateStr = new Date().toLocaleDateString('it-IT');
    const timeStr = new Date().toLocaleTimeString('it-IT');
    const tableRows = pipeCandTimeline.map(log => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; white-space: nowrap;">${log.dataStr}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; color: #2b6cb0;">${log.attivita}</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; color: #4a5568;">${log.dettagli}</td>
      </tr>
    `).join('');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Tecnico Attività - ${selectedPipeCand.nomeCompleto}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #2d3748; 
            margin: 40px; 
            line-height: 1.6; 
            font-size: 14px; 
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #3182ce;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #2b6cb0; 
            margin: 0 0 6px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #718096;
          }
          .section-title { 
            font-size: 14px; 
            font-weight: 700; 
            color: #2b6cb0; 
            margin-top: 20px; 
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .details-card {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .details-item {
            font-size: 13px;
          }
          .details-label {
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
            font-size: 11px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
          }
          th { 
            background-color: #ebf8ff; 
            color: #2b6cb0; 
            border: 1px solid #cbd5e0; 
            padding: 10px; 
            text-align: left; 
            font-size: 12px;
            text-transform: uppercase;
          }
          .no-print {
            margin-top: 30px;
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 11px;
            color: #a0aec0;
            text-align: center;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">HEMA WORK - REPORT TECNICO ATTIVITÀ CANDIDATO</div>
          <div class="meta-info">
            <div><strong>Referenza:</strong> Dossier di Selezione</div>
            <div><strong>Generato il:</strong> ${dateStr} alle ${timeStr}</div>
          </div>
        </div>

        <div class="details-card">
          <div class="details-grid">
            <div class="details-item">
              <span class="details-label">Candidato</span>
              <div style="font-size: 15px; font-weight: bold; color: #2d3748; margin-top: 2px;">
                ${selectedPipeCand.nomeCompleto}
              </div>
              <div style="color: #718096; font-size: 12px; margin-top: 2px;">
                ${selectedPipeCand.email || 'N/D'} | ${selectedPipeCand.telefono || 'N/D'}
              </div>
            </div>
            <div class="details-item">
              <span class="details-label">Mandato di Selezione</span>
              <div style="font-size: 15px; font-weight: bold; color: #2d3748; margin-top: 2px;">
                ${ricercaDetail.ricerca.ruolo}
              </div>
              <div style="color: #718096; font-size: 12px; margin-top: 2px;">
                Azienda: ${ricercaDetail.ricerca.azienda}
              </div>
            </div>
          </div>
        </div>

        <div class="section-title">Cronologia Storica delle Operazioni</div>
        <table>
          <thead>
            <tr>
              <th style="width: 150px;">Data e Ora</th>
              <th style="width: 200px;">Operazione / Evento</th>
              <th>Dettagli / Motivazioni</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="3" style="text-align: center; padding: 15px; color: #718096;">Nessuna operazione registrata.</td></tr>'}
          </tbody>
        </table>

        <div class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #3182ce; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 13px;">🖨️ Stampa Report Tecnico (Salva in PDF)</button>
        </div>

        <div class="footer">
          HEMA WORK - Report di Selezione Riservato
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  const handlePrintSingleInterviewReport = app => {
    if (!app || !ricercaDetail) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showStatus("warning", "Attenzione", "Blocco popup rilevato! Consenti i popup per stampare.");
      return;
    }
    const dateStr = new Date().toLocaleDateString('it-IT');
    const timeStr = new Date().toLocaleTimeString('it-IT');

    // Filter timeline for this interview
    const filteredLogs = (timeline || []).filter(log => log.soggetto_correlato === app.candidato && (log.tipo_attivita.includes('Colloquio') || log.tipo_attivita.includes('Riprogrammazione')));
    const logRows = filteredLogs.map(log => {
      const logDate = new Date(log.data_attivita).toLocaleDateString('it-IT');
      const logTime = new Date(log.data_attivita).toLocaleTimeString('it-IT');
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px; white-space: nowrap;">${logDate} alle ${logTime}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px; font-weight: bold; color: #2b6cb0;">${log.tipo_attivita}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px; color: #4a5568;">${log.dettagli}</td>
        </tr>
      `;
    }).join('');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Colloquio - ${app.candidato}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #2d3748; 
            margin: 40px; 
            line-height: 1.6; 
            font-size: 14px; 
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #3182ce;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #2b6cb0; 
            margin: 0 0 6px 0;
            text-transform: uppercase;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #718096;
          }
          .details-card {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .details-item {
            margin-bottom: 10px;
          }
          .details-label {
            font-weight: bold;
            color: #718096;
            text-transform: uppercase;
            font-size: 11px;
          }
          .details-value {
            font-size: 14px;
            color: #2d3748;
            margin-top: 2px;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .badge-Programmato { background-color: #feebc8; color: #c05621; }
          .badge-Eseguito { background-color: #c6f6d5; color: #22543d; }
          .badge-Annullato { background-color: #fed7d7; color: #9b2c2c; }
          .badge-Non-Presentato { background-color: #e2e8f0; color: #4a5568; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
          }
          th { 
            background-color: #ebf8ff; 
            color: #2b6cb0; 
            border: 1px solid #cbd5e0; 
            padding: 10px; 
            text-align: left; 
            font-size: 12px;
            text-transform: uppercase;
          }
          .no-print {
            margin-top: 30px;
            text-align: center;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 11px;
            color: #a0aec0;
            text-align: center;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">HEMA WORK - SCHEDA DETTAGLIO COLLOQUIO</div>
          <div class="meta-info">
            <div><strong>Riferimento:</strong> Selezione Risorse Umane</div>
            <div><strong>Report generato il:</strong> ${dateStr} alle ${timeStr}</div>
          </div>
        </div>

        <div class="details-card">
          <div class="details-grid">
            <div class="details-item">
              <span class="details-label">Candidato</span>
              <div class="details-value" style="font-weight: bold;">${app.candidato}</div>
            </div>
            <div class="details-item">
              <span class="details-label">Mandato di Ricerca</span>
              <div class="details-value">${ricercaDetail.ricerca.ruolo} presso <strong>${ricercaDetail.ricerca.azienda}</strong></div>
            </div>
            <div class="details-item">
              <span class="details-label">Data e Ora Appuntamento</span>
              <div class="details-value"><strong>${app.data}</strong> alle ore <strong>${app.ora}</strong></div>
            </div>
            <div class="details-item">
              <span class="details-label">Modalità e Luogo</span>
              <div class="details-value">${app.tipo} | <em>${app.luogo || 'N/D'}</em></div>
            </div>
            <div class="details-item">
              <span class="details-label">Stato Attuale Colloquio</span>
              <div class="details-value">
                <span class="badge badge-${app.stato.replace(/\s+/g, '-')}">${app.stato}</span>
              </div>
            </div>
            <div class="details-item">
              <span class="details-label">Note Operatore</span>
              <div class="details-value" style="font-style: italic;">${app.note || 'Nessuna nota aggiuntiva.'}</div>
            </div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 700; color: #2b6cb0; text-transform: uppercase; border-bottom: 1px solid #cbd5e0; padding-bottom: 6px; margin-top: 30px;">
          Registro Storico delle Azioni dell'Appuntamento
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 160px;">Data e Ora Log</th>
              <th style="width: 200px;">Attività</th>
              <th>Dettagli Operazione</th>
            </tr>
          </thead>
          <tbody>
            ${logRows || '<tr><td colspan="3" style="text-align: center; padding: 12px; color: #718096;">Nessuna attività storicizzata per questo appuntamento.</td></tr>'}
          </tbody>
        </table>

        <div class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #3182ce; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 13px;">🖨️ Avvia Stampa / Salva in PDF</button>
        </div>

        <div class="footer">
          HEMA WORK - Documento Confidenziale Interno
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  const handlePrintTechnicalResearchReport = () => {
    if (!ricercaDetail || !ricercaDetail.ricerca) return;
    const r = ricercaDetail.ricerca;
    const pipeline = ricercaDetail.candidatiCollegati || [];
    const appuntamenti = ricercaDetail.appuntamenti || [];
    let pauseMotivation = '';
    if (r.note && r.note.includes('MOTIVAZIONE MESSA IN PAUSA')) {
      const parts = r.note.split('\n');
      const pmLine = parts.find(p => p.includes('MOTIVAZIONE MESSA IN PAUSA'));
      if (pmLine) pauseMotivation = pmLine.substring(pmLine.indexOf(']:') + 2).trim();
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showStatus("warning", "Attenzione", "Blocco popup rilevato! Consenti i popup per stampare.");
      return;
    }

    // Calculate days open
    const today = new Date();
    const insertDate = new Date(r.data_inserimento);
    const diffTime = today - insertDate;
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // Stats
    const totalCandidates = pipeline.length;
    const totalInterviews = appuntamenti.length;
    let interviewsAzienda = 0;
    let interviewsAgenzia = 0;
    appuntamenti.forEach(app => {
      const type = (app.tipo || '').toLowerCase();
      if (type.includes('azienda') || type.includes('cliente') || type.includes('presso')) {
        interviewsAzienda++;
      } else {
        interviewsAgenzia++;
      }
    });
    let totalTrials = 0;
    let trialsPassed = 0;
    let trialsFailed = 0;
    let trialsInProgress = 0;
    let totalHires = 0;
    let feedbackPositivo = 0;
    let feedbackNegativo = 0;
    let inAttesaFeedback = 0;
    pipeline.forEach(item => {
      if (item.feedbackStato === 'Feedback Positivo') {
        feedbackPositivo++;
      } else if (item.feedbackStato === 'Feedback Negativo') {
        feedbackNegativo++;
      } else {
        inAttesaFeedback++;
      }
      if (item.statoAvanzamento === 'In Prova') {
        totalTrials++;
        trialsInProgress++;
      } else if (item.statoAvanzamento === 'Approvato/Assunto' || item.statoAvanzamento === 'Assunto') {
        totalHires++;
      }
      if (item.statoProva === 'Superata' || item.statoProva === 'Prova Superata') {
        totalTrials++;
        trialsPassed++;
      } else if (item.statoProva === 'Non Superata' || item.statoProva === 'Prova Non Superata') {
        totalTrials++;
        trialsFailed++;
      }
    });
    const dateStr = new Date().toLocaleDateString('it-IT');
    const timeStr = new Date().toLocaleTimeString('it-IT');
    const candidateRows = pipeline.map((c, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px; font-weight: bold;">${idx + 1}. ${c.nomeCompleto}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 11px;">${c.email || 'N/D'}<br/>${c.telefono || 'N/D'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 12px;">${c.statoAvanzamento || 'CV Ricevuto'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 11px;">
          <strong>${c.feedbackStato || 'In attesa'}</strong>
          ${c.feedbackNote ? `<br/><span style="color:#718096; font-style:italic;">Note: ${c.feedbackNote}</span>` : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e0; font-size: 11px;">
          ${c.statoProva ? `Esito: <strong>${c.statoProva}</strong><br/><span style="color:#718096; font-size:10px;">Scad: ${c.dataScadenzaProva || 'N/D'}</span>` : 'N/D'}
        </td>
      </tr>
    `).join('');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Tecnico Ricerca - ${r.azienda} (${r.ruolo})</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #2d3748; 
            margin: 40px; 
            line-height: 1.5; 
            font-size: 13px; 
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #4a5568;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #2d3748; 
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .meta-info {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #718096;
          }
          .section-title { 
            font-size: 13px; 
            font-weight: 700; 
            color: #2d3748; 
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 6px 10px;
            margin-top: 25px; 
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-table, .stats-table, .candidates-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .info-table td {
            padding: 6px 8px;
            font-size: 13px;
          }
          .info-label {
            font-weight: bold;
            color: #4a5568;
            width: 180px;
          }
          .stats-table th, .candidates-table th {
            background-color: #edf2f7;
            color: #2d3748;
            border: 1px solid #cbd5e0;
            padding: 8px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
          }
          .stats-table td, .candidates-table td {
            border: 1px solid #cbd5e0;
            padding: 8px;
          }
          .no-print {
            margin-top: 30px;
            text-align: center;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            font-size: 10px;
            color: #a0aec0;
            text-align: center;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">HEMA WORK - REPORT TECNICO RICERCA</div>
          <div class="meta-info">
            <div><strong>Stato Mandato:</strong> ${r.stato_approvazione_tl === 'In Pausa' ? 'IN PAUSA' : r.stato_ricerca || 'N/D'}</div>
            <div><strong>Generato il:</strong> ${dateStr} alle ${timeStr}</div>
          </div>
        </div>

        ${r.stato_approvazione_tl === 'In Pausa' ? `
          <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px; margin-bottom: 20px; border-radius: 4px; color: #dd6b20; font-family: sans-serif;">
            <strong style="text-transform: uppercase; font-size: 13px;">⚠️ Mandato Temporaneamente in Pausa</strong><br/>
            ${pauseMotivation ? `<span style="font-size: 12px; color: #7b341e; display: block; margin-top: 4px;"><strong>Motivazione:</strong> ${pauseMotivation}</span>` : ''}
          </div>
        ` : ''}

        <div class="section-title">Dati Identificativi Ricerca</div>
        <table class="info-table">
          <tr>
            <td class="info-label">ID Mandato:</td>
            <td>${r.id}</td>
            <td class="info-label">Azienda Cliente:</td>
            <td>${r.azienda}</td>
          </tr>
          <tr>
            <td class="info-label">Ruolo Ricercato:</td>
            <td>${r.ruolo}</td>
            <td class="info-label">Settore Riferimento:</td>
            <td>${r.settore || 'N/D'}</td>
          </tr>
          <tr>
            <td class="info-label">Sede di Lavoro:</td>
            <td>${r.sede_lavoro || 'N/D'}</td>
            <td class="info-label">Data Inserimento:</td>
            <td>${r.data_inserimento || 'N/D'} (${diffDays} giorni di attività)</td>
          </tr>
          <tr>
            <td class="info-label">Referente Cliente:</td>
            <td>${r.referente || 'N/D'}</td>
            <td class="info-label">Contatti Referente:</td>
            <td>${r.email || 'N/D'} | ${r.telefono_mobile || 'N/D'}</td>
          </tr>
          <tr>
            <td class="info-label">Ore di Lavoro:</td>
            <td>${r.ore_lavoro ? r.ore_lavoro + ' ore ' + (r.ore_lavoro_tipo ? r.ore_lavoro_tipo.toLowerCase() : 'settimanali') : 'N/D'}</td>
            <td class="info-label">Orario di Lavoro:</td>
            <td>${r.orario_lavoro || 'Opzionale/Flessibile'}</td>
          </tr>
        </table>

        <div class="section-title">Statistiche Generali di Avanzamento</div>
        <table class="stats-table">
          <thead>
            <tr>
              <th>Metrica di Avanzamento</th>
              <th style="width: 120px; text-align: center;">Valore</th>
              <th>Dettaglio / Suddivisione</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Candidati presentati totali</strong></td>
              <td style="text-align: center; font-weight: bold;">${totalCandidates}</td>
              <td>
                CV con Feedback Positivo: <strong>${feedbackPositivo}</strong> | 
                CV con Feedback Negativo: <strong>${feedbackNegativo}</strong> | 
                CV In attesa: <strong>${inAttesaFeedback}</strong>
              </td>
            </tr>
            <tr>
              <td><strong>Colloqui effettuati</strong></td>
              <td style="text-align: center; font-weight: bold;">${totalInterviews}</td>
              <td>
                Presso sede cliente: <strong>${interviewsAzienda}</strong> | 
                Conoscitivi online/agenzia: <strong>${interviewsAgenzia}</strong>
              </td>
            </tr>
            <tr>
              <td><strong>Fasi di prova attivate</strong></td>
              <td style="text-align: center; font-weight: bold;">${totalTrials}</td>
              <td>
                In corso: <strong>${trialsInProgress}</strong> | 
                Superate: <strong>${trialsPassed}</strong> | 
                Non superate: <strong>${trialsFailed}</strong>
              </td>
            </tr>
            <tr>
              <td><strong>Assunzioni contrattualizzate</strong></td>
              <td style="text-align: center; font-weight: bold; color: #2f855a;">${totalHires}</td>
              <td>Risorse inserite con successo in organico.</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">Dettaglio dello Stato dei Candidati</div>
        <table class="candidates-table">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Contatti</th>
              <th>Stato Avanzamento</th>
              <th>Feedback CV Cliente</th>
              <th>Periodo di Prova</th>
            </tr>
          </thead>
          <tbody>
            ${candidateRows || '<tr><td colspan="5" style="text-align: center; color: #718096; padding: 12px;">Nessun candidato collegato.</td></tr>'}
          </tbody>
        </table>

        <div class="no-print">
          <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #2d3748; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 13px;">🖨️ Stampa Report Tecnico (Salva in PDF)</button>
        </div>

        <div class="footer">
          HEMA WORK - Report di Ricerca Tecnico Riservato
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Send CV email customized
  const handleSendCVEmail = async e => {
    e.preventDefault();
    try {
      if (emailData.newCVFile) {
        showStatus('loading', 'Caricamento in corso...', 'Salvataggio del CV nel database del candidato...');
        const fd = new FormData();
        fd.append('cvFile', emailData.newCVFile);
        const uploadRes = await fetch(`${API_BASE}/candidati/${emailData.idCandidato}/cv`, {
          method: 'POST',
          body: fd
        });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
          showStatus('error', 'Errore Caricamento CV', uploadJson.error || 'Impossibile salvare il CV. L\'email non è stata inviata.');
          return;
        }
      }
      showStatus('loading', 'Invio in corso...', 'Spedizione dell\'e-mail e dell\'allegato CV in corso...');
      const res = await fetch(`${API_BASE}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_ricerca: selectedRicercaId,
          id_candidato: emailData.idCandidato,
          dest_email: emailData.destEmail,
          subject: emailData.subject,
          body: emailData.body
        })
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Email inviata!', json.message);
        setShowEmailPreviewModal(false);
        await ensureResearchStarted();
        fetchRicercaDetail(selectedRicercaId);
        if (selectedPipeCand && selectedPipeCand.idCandidato === emailData.idCandidato) {
          setSelectedPipeCand(prev => ({
            ...prev,
            inviatoCliente: 1
          }));
        }
      } else {
        showStatus('error', 'Errore nell\'invio', json.error);
      }
    } catch (err) {
      showStatus('error', 'Connessione fallita', err.message);
    }
  };

  // Trigger WhatsApp logic and write activity log
  const handleSendWA = async c => {
    const tel = String(ricercaDetail.ricerca.telefono_mobile || '');
    const az = String(ricercaDetail.ricerca.azienda || '');
    const ru = String(ricercaDetail.ricerca.ruolo || '');
    if (!tel) {
      showStatus('error', 'Attenzione', 'Numero di telefono del cliente non disponibile.');
      return;
    }
    let cleanNum = tel.replace(/\D/g, '');
    if (!cleanNum.startsWith('39') && cleanNum.startsWith('3')) {
      cleanNum = '39' + cleanNum;
    }
    const origin = window.location.origin.includes('localhost:5173') ? 'http://localhost:3001' : window.location.origin;
    const text = `Gentile Referente di ${az}, in merito alla ricerca in corso per ${ru}, le presentiamo il profilo di ${c.nomeCompleto}. Può visionare il CV al seguente link: ${c.linkCV ? `${origin}${c.linkCV}` : '[Nessun CV inserito]'}`;
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(text)}`;

    // Open WA in new window natively (no popup block!)
    window.open(waUrl, '_blank');

    // Log to DB
    try {
      await fetch(`${API_BASE}/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_ricerca: selectedRicercaId,
          id_candidato: c.idCandidato
        })
      });
      await ensureResearchStarted();
      fetchRicercaDetail(selectedRicercaId);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to open Email customized preview modal
  const openEmailPreview = c => {
    const ref = ricercaDetail.ricerca.referente || 'Referente';
    const az = ricercaDetail.ricerca.azienda || 'Azienda';
    const ru = ricercaDetail.ricerca.ruolo || 'Ruolo';
    const body = `Gentile ${ref} di ${az},\n\nin merito alla ricerca per il ruolo di ${ru}, le presentiamo in allegato il Curriculum Vitae del candidato ${c.nomeCompleto}.\n\nRestiamo a disposizione per fissare un colloquio.\n\nCordiali saluti,\nTeam Selezione`;
    setEmailData({
      idCandidato: c.idCandidato,
      destEmail: ricercaDetail.ricerca.email || '',
      subject: `Presentazione Candidato ${c.nomeCompleto} - ${ru}`,
      body: body,
      hasCV: !!c.link_cv
    });
    setShowEmailPreviewModal(true);
  };

  // Render Stars Rating Component
  const StarRating = ({
    value,
    name,
    onChange
  }) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(<span key={i} className={`star ${i > value ? 'empty' : ''}`} onClick={() => onChange && onChange(i)}>
          ★
        </span>);
    }
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
        <div className="stars-container">{stars}</div>
        <input type="hidden" name={name} value={value} />
      </div>;
  };
  const affinedCandidatiMemo = useMemo(() => {
    if (!ricercaDetail || !ricercaDetail.ricerca || !candidati) return [];
    const provCoords = {
      'MI': {
        lat: 45.4642,
        lon: 9.1900
      },
      'BG': {
        lat: 45.6983,
        lon: 9.6773
      },
      'BS': {
        lat: 45.5416,
        lon: 10.2118
      },
      'MB': {
        lat: 45.5845,
        lon: 9.2735
      },
      'VA': {
        lat: 45.8199,
        lon: 8.8250
      },
      'CO': {
        lat: 45.8081,
        lon: 9.0852
      },
      'PV': {
        lat: 45.1850,
        lon: 9.1500
      },
      'CR': {
        lat: 45.1333,
        lon: 10.0333
      },
      'LC': {
        lat: 45.8566,
        lon: 9.3977
      },
      'LO': {
        lat: 45.3097,
        lon: 9.5000
      }
    };
    function getCoords(address) {
      if (!address) return null;
      const match = address.match(/\((MI|BG|BS|MB|VA|CO|PV|CR|LC|LO)\)/i);
      if (match) return provCoords[match[1].toUpperCase()];
      const addrLower = address.toLowerCase();
      if (addrLower.includes('milano')) return provCoords['MI'];
      if (addrLower.includes('bergamo')) return provCoords['BG'];
      if (addrLower.includes('brescia')) return provCoords['BS'];
      if (addrLower.includes('monza')) return provCoords['MB'];
      if (addrLower.includes('varese')) return provCoords['VA'];
      if (addrLower.includes('como')) return provCoords['CO'];
      if (addrLower.includes('pavia')) return provCoords['PV'];
      if (addrLower.includes('cremona')) return provCoords['CR'];
      if (addrLower.includes('lecco')) return provCoords['LC'];
      if (addrLower.includes('lodi')) return provCoords['LO'];
      return provCoords['MI']; // default fallback
    }
    function calcDistance(c1, c2) {
      if (!c1 || !c2) return 0;
      const R = 6371; // Earth radius in km
      const dLat = (c2.lat - c1.lat) * Math.PI / 180;
      const dLon = (c2.lon - c1.lon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    const research = ricercaDetail.ricerca;
    const rCoords = getCoords(research.sede_lavoro);
    const rSettore = (research.settore || '').toLowerCase().trim();
    return candidati.filter(cand => !(ricercaDetail.candidatiCollegati || []).some(cc => cc.idCandidato === cand.id)).map(cand => {
      const cCoords = getCoords(cand.residenza);
      const distance = calcDistance(rCoords, cCoords);
      const candSettore = (cand.settore || '').toLowerCase().trim();
      let isSectorMatch = true;
      if (rSettore) {
        isSectorMatch = candSettore.includes(rSettore) || rSettore.includes(candSettore);
      }
      return {
        ...cand,
        distance: Math.round(distance),
        isSectorMatch
      };
    }).filter(cand => cand.isSectorMatch && cand.distance <= 50).sort((a, b) => a.distance - b.distance);
  }, [ricercaDetail, candidati]);
  const getAffinedCandidati = () => affinedCandidatiMemo;
  return {
    navigate,
    location,
    currentPage,
    setCurrentPage,
    ricerche,
    setRicerche,
    fetchRicerche,
    fetchRicercheSilent,
    candidati,
    setCandidati,
    fetchCandidati,
    clienti,
    setClienti,
    fetchClienti,
    commerciali,
    setCommerciali,
    fetchCommerciali,
    fetchCommercialiSilent,
    operatori,
    setOperatori,
    fetchOperatori,
    pendingChecklist,
    setPendingChecklist,
    fetchPendingChecklist,
    emailConfig,
    setEmailConfig,
    fetchEmailConfig,
    newMandatePopup,
    setNewMandatePopup,
    newCommercialPopup,
    setNewCommercialPopup,
    lastPendingCount,
    setLastPendingCount,
    lastPendingCommercialCount,
    setLastPendingCommercialCount,
    selectedRicercaId,
    setSelectedRicercaId,
    ricercaDetail,
    setRicercaDetail,
    timeline,
    setTimeline,
    activeTab,
    setActiveTab,
    showNewRicercaModal,
    setShowNewRicercaModal,
    showNewClienteModal,
    setShowNewClienteModal,
    showNewCVCandidatoModal,
    setShowNewCVCandidatoModal,
    showEditCandidatoModal,
    setShowEditCandidatoModal,
    showEmailPreviewModal,
    setShowEmailPreviewModal,
    showDocUploadModal,
    setShowDocUploadModal,
    pendingHiringCandidate,
    setPendingHiringCandidate,
    showTerminaProvaModal,
    setShowTerminaProvaModal,
    showNewAnnuncioFormModal,
    setShowNewAnnuncioFormModal,
    showLinkAnnuncioModal,
    setShowLinkAnnuncioModal,
    showNewCandidatoPipelineModal,
    setShowNewCandidatoPipelineModal,
    showNewInterviewFormModal,
    setShowNewInterviewFormModal,
    showNewTrialFormModal,
    setShowNewTrialFormModal,
    showNewAssunzioneModal,
    setShowNewAssunzioneModal,
    showAdStatusModal,
    setShowAdStatusModal,
    showValutazioneModal,
    setShowValutazioneModal,
    evalCandidateId,
    setEvalCandidateId,
    evalCandidateName,
    setEvalCandidateName,
    evalForm,
    setEvalForm,
    evalStorico,
    setEvalStorico,
    loadingEvalStorico,
    setLoadingEvalStorico,
    evalActiveTab,
    setEvalActiveTab,
    newAdStatus,
    setNewAdStatus,
    adStatusMotivation,
    setAdStatusMotivation,
    adTimeline,
    setAdTimeline,
    annunci,
    setAnnunci,
    selectedAnnuncio,
    setSelectedAnnuncio,
    selectedPipeCand,
    setSelectedPipeCand,
    isNewCandidate,
    setIsNewCandidate,
    showFeedbackModal,
    setShowFeedbackModal,
    feedbackNoteText,
    setFeedbackNoteText,
    showReportModal,
    setShowReportModal,
    reportRange,
    setReportRange,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    reportData,
    setReportData,
    loadingReport,
    setLoadingReport,
    excludeFromResearch,
    setExcludeFromResearch,
    scheduleInterviewOption,
    setScheduleInterviewOption,
    interviewDate,
    setInterviewDate,
    interviewTime,
    setInterviewTime,
    interviewType,
    setInterviewType,
    cvSentToggle,
    setCvSentToggle,
    pipeCandTimeline,
    setPipeCandTimeline,
    currentCandidato,
    setCurrentCandidato,
    emailData,
    setEmailData,
    provaData,
    setProvaData,
    newSearchForm,
    setNewSearchForm,
    newSearchRoles,
    setNewSearchRoles,
    selectedSubjectLog,
    setSelectedSubjectLog,
    subjectTimeline,
    setSubjectTimeline,
    selectedHiringCandidate,
    setSelectedHiringCandidate,
    hiringFormData,
    setHiringFormData,
    selectedInterviewForManagement,
    setSelectedInterviewForManagement,
    showInterviewStatusModal,
    setShowInterviewStatusModal,
    selectedTrialForManagement,
    setSelectedTrialForManagement,
    showTrialStatusModal,
    setShowTrialStatusModal,
    showStatus,
    handleGenerateReport,
    fetchSubjectTimeline,
    fetchAdTimeline,
    fetchPipeCandTimeline,
    fetchAnnunci,
    fetchRicercaDetail,
    handleUpdateAdStatus,
    handleUpdateAnnuncioDetail,
    handleDeleteAnnuncio,
    handleLinkAnnuncio,
    handleUnlinkAnnuncio,
    handleApprovalAction,
    ensureResearchStarted,
    handleCreateRicerca,
    openNewRicercaModal,
    handleSelectClientForNewSearch,
    handleRoleChange,
    addRoleField,
    removeRoleField,
    handlePrintScheda,
    handlePrintReport,
    handleOpenValutazione,
    calculateRealtimeScore,
    handleEvalFormChange,
    handleSaveValutazione,
    handleCreateCliente,
    handleCreateCVCandidato,
    handleInsertCandidate,
    handleFeedbackPositivo,
    handleFeedbackNegativo,
    handleUnlinkCandidate,
    handleToggleInviatoStatus,
    handleEditCandidato,
    handleSaveAnnuncio,
    handleLinkCandidatoToRicerca,
    handleUpdatePipelineStatus,
    handleUpdateInterviewStatus,
    handleScheduleInterview,
    handleDeleteInterview,
    handleEditInterviewDetails,
    handleSaveResearchNote,
    handleStartTrial,
    handleEndTrial,
    handleEditTrialDetails,
    handleUpdateTrialStatus,
    handlePrintSingleTrialReport,
    handleCreateHiringForCandidate,
    handleOpenHiringForm,
    handleUploadDocAndProceed,
    handleUploadHiringDoc,
    handlePrintHiringSheet,
    handleEmailHiringSheet,
    handlePrintExecutiveReport,
    handlePrintTechnicalReport,
    handlePrintSingleInterviewReport,
    handlePrintTechnicalResearchReport,
    handleSendCVEmail,
    handleSendWA,
    openEmailPreview,
    StarRating,
    renderCandidateStars,
    affinedCandidatiMemo,
    getAffinedCandidati
  };
}