import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  apiFetchRicerche, 
  apiFetchCandidati, 
  apiFetchClienti, 
  apiFetchCommerciali, 
  apiFetchOperatori, 
  apiFetchPendingChecklist,
  apiFetchAnnunci
} from '../api';
import { API_BASE } from '../utils';
import { useAuth } from './AuthContext';

const GlobalStateContext = createContext(null);

export const GlobalStateProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { authenticated } = useAuth();
  useEffect(() => { if (!authenticated) queryClient.clear(); }, [authenticated, queryClient]);

  const [lastPendingCount, setLastPendingCount] = useState(0);
  const [lastPendingCommercialCount, setLastPendingCommercialCount] = useState(0);
  const [lastPendingClientCount, setLastPendingClientCount] = useState(0);
  const [newMandatePopup, setNewMandatePopup] = useState(null);
  const [newCommercialPopup, setNewCommercialPopup] = useState(null);
  const [newClientPopup, setNewClientPopup] = useState(null);

  // --- React Query Hooks ---

  // Ricerche
  const { data: ricercheData = [], refetch: fetchRicerche, error: ricercheError } = useQuery({
    queryKey: ['ricerche'],
    enabled: authenticated,
    queryFn: apiFetchRicerche,
    refetchInterval: 5000,
  });

  // Candidati
  const { data: candidatiData = [], refetch: fetchCandidati, error: candidatiError } = useQuery({
    queryKey: ['candidati'],
    enabled: authenticated,
    queryFn: apiFetchCandidati,
  });

  // Clienti
  const { data: clientiData = [], refetch: fetchClienti, error: clientiError } = useQuery({
    queryKey: ['clienti'],
    enabled: authenticated,
    queryFn: apiFetchClienti,
  });

  // Commerciali
  const { data: commercialiData = [], refetch: fetchCommerciali, error: commercialiError } = useQuery({
    queryKey: ['commerciali'],
    enabled: authenticated,
    queryFn: apiFetchCommerciali,
    refetchInterval: 5000,
  });

  // Operatori
  const { data: operatoriData = [], refetch: fetchOperatori, error: operatoriError } = useQuery({
    queryKey: ['operatori'],
    enabled: authenticated,
    queryFn: apiFetchOperatori,
  });

  // Pending Checklist
  const { data: pendingChecklistData = [], refetch: fetchPendingChecklist, error: pendingError } = useQuery({
    queryKey: ['pendingChecklist'],
    enabled: authenticated,
    queryFn: apiFetchPendingChecklist,
    refetchInterval: 10000,
  });

  // Client Accounts (Portale)
  const fetchClientAccountsFn = async () => {
    const res = await fetch(`${API_BASE}/clienti/portale`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Impossibile caricare gli account clienti');
    return json.data;
  };
  const { data: clientAccountsData = [], refetch: fetchClientAccounts, error: accountsError } = useQuery({
    queryKey: ['clientAccounts'],
    enabled: authenticated,
    queryFn: fetchClientAccountsFn,
    refetchInterval: 5000,
  });

  // Annunci
  const { data: annunciData = [], refetch: fetchAnnunci, error: annunciError } = useQuery({
    queryKey: ['annunci'],
    enabled: authenticated,
    queryFn: apiFetchAnnunci,
  });

  // Email Config
  const fetchEmailConfigFn = async () => {
    const res = await fetch(`${API_BASE}/configurazione-email`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Impossibile caricare la configurazione email');
    return json.data;
  };
  const { data: emailConfigData, refetch: fetchEmailConfig, error: emailConfigError } = useQuery({
    queryKey: ['emailConfig'],
    enabled: authenticated,
    queryFn: fetchEmailConfigFn,
  });

  const emailConfig = emailConfigData || { host: 'smtp.gmail.com', port: '465', user: '', pass: '', secure: true };

  // --- Notifications Logic ---

  // We need refs to avoid infinite re-renders or missing previous state
  const prevRicercheRef = useRef([]);
  const prevCommercialiRef = useRef([]);

  useEffect(() => {
    // Ricerche Notifications
    if (ricercheData.length > 0) {
      const pendingList = ricercheData.filter(r => r.stato_approvazione_tl === 'In attesa di approvazione');
      
      if (pendingList.length > lastPendingCount && prevRicercheRef.current.length > 0) {
        const newItems = pendingList.filter(p => !prevRicercheRef.current.some(r => r.id === p.id));
        if (newItems.length > 0) setNewMandatePopup(newItems[0]);
      }
      setLastPendingCount(pendingList.length);
      prevRicercheRef.current = ricercheData;
    }
  }, [ricercheData, lastPendingCount]);

  useEffect(() => {
    // Commerciali Notifications
    if (commercialiData.length > 0) {
      const pendingList = commercialiData.filter(c => c.stato_approvazione === 'Da Approvare');
      
      if (pendingList.length > lastPendingCommercialCount && prevCommercialiRef.current.length > 0) {
        const newItems = pendingList.filter(p => !prevCommercialiRef.current.some(c => c.id === p.id));
        if (newItems.length > 0) setNewCommercialPopup(newItems[0]);
      }
      setLastPendingCommercialCount(pendingList.length);
      prevCommercialiRef.current = commercialiData;
    }
  }, [commercialiData, lastPendingCommercialCount]);

  const prevClientAccountsRef = useRef([]);

  useEffect(() => {
    // Client Accounts Notifications
    if (clientAccountsData.length > 0) {
      const pendingList = clientAccountsData.filter(c => c.stato_approvazione === 'Da Approvare');
      
      if (pendingList.length > lastPendingClientCount && prevClientAccountsRef.current.length > 0) {
        const newItems = pendingList.filter(p => !prevClientAccountsRef.current.some(c => c.id === p.id));
        if (newItems.length > 0) setNewClientPopup(newItems[0]);
      }
      setLastPendingClientCount(pendingList.length);
      prevClientAccountsRef.current = clientAccountsData;
    }
  }, [clientAccountsData, lastPendingClientCount]);

  // --- Backward compatibility setters ---
  // To avoid breaking useAppController destructured variables and components that might expect setters (even if they don't call them).
  // Ideally, components should use mutations, but since we discovered they only do API calls then refetch, this is perfectly fine.
  const setRicerche = (data) => queryClient.setQueryData(['ricerche'], data);
  const setCandidati = (data) => queryClient.setQueryData(['candidati'], data);
  const setClienti = (data) => queryClient.setQueryData(['clienti'], data);
  const setCommerciali = (data) => queryClient.setQueryData(['commerciali'], data);
  const setOperatori = (data) => queryClient.setQueryData(['operatori'], data);
  const setPendingChecklist = (data) => queryClient.setQueryData(['pendingChecklist'], data);
  const setEmailConfig = (data) => queryClient.setQueryData(['emailConfig'], data);

  // Silent refetches map to normal refetches in React Query since RQ is inherently silent.
  const fetchRicercheSilent = fetchRicerche;
  const fetchCommercialiSilent = fetchCommerciali;

  return (
    <GlobalStateContext.Provider value={{
      ricerche: ricercheData, setRicerche, fetchRicerche, fetchRicercheSilent,
      candidati: candidatiData, setCandidati, fetchCandidati,
      clienti: clientiData, setClienti, fetchClienti,
      commerciali: commercialiData, setCommerciali, fetchCommerciali, fetchCommercialiSilent,
      operatori: operatoriData, setOperatori, fetchOperatori,
      annunci: annunciData, fetchAnnunci,
      pendingChecklist: pendingChecklistData, setPendingChecklist, fetchPendingChecklist,
      emailConfig, setEmailConfig, fetchEmailConfig,
      newMandatePopup, setNewMandatePopup,
      newCommercialPopup, setNewCommercialPopup,
      newClientPopup, setNewClientPopup,
      lastPendingCount, setLastPendingCount,
      lastPendingCommercialCount, setLastPendingCommercialCount,
      lastPendingClientCount, setLastPendingClientCount,
      clientAccounts: clientAccountsData, fetchClientAccounts
    }}>
      {authenticated && [ricercheError, candidatiError, clientiError, commercialiError, operatoriError, pendingError, accountsError, annunciError, emailConfigError].some(Boolean) && (
        <div role="alert" style={{ background: '#7f1d1d', color: 'white', padding: 12, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000 }}>
          Alcuni dati non sono stati caricati. Le liste potrebbero essere incomplete.
          <button type="button" onClick={() => queryClient.invalidateQueries()}>Riprova</button>
        </div>
      )}
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error('useGlobalState must be used within a GlobalStateProvider');
  return context;
};
