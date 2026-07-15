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

const GlobalStateContext = createContext(null);

export const GlobalStateProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const [lastPendingCount, setLastPendingCount] = useState(0);
  const [lastPendingCommercialCount, setLastPendingCommercialCount] = useState(0);
  const [lastPendingClientCount, setLastPendingClientCount] = useState(0);
  const [newMandatePopup, setNewMandatePopup] = useState(null);
  const [newCommercialPopup, setNewCommercialPopup] = useState(null);
  const [newClientPopup, setNewClientPopup] = useState(null);

  // --- React Query Hooks ---

  // Ricerche
  const { data: ricercheData = [], refetch: fetchRicerche } = useQuery({
    queryKey: ['ricerche'],
    queryFn: apiFetchRicerche,
    refetchInterval: 5000,
  });

  // Candidati
  const { data: candidatiData = [], refetch: fetchCandidati } = useQuery({
    queryKey: ['candidati'],
    queryFn: apiFetchCandidati,
  });

  // Clienti
  const { data: clientiData = [], refetch: fetchClienti } = useQuery({
    queryKey: ['clienti'],
    queryFn: apiFetchClienti,
  });

  // Commerciali
  const { data: commercialiData = [], refetch: fetchCommerciali } = useQuery({
    queryKey: ['commerciali'],
    queryFn: apiFetchCommerciali,
    refetchInterval: 5000,
  });

  // Operatori
  const { data: operatoriData = [], refetch: fetchOperatori } = useQuery({
    queryKey: ['operatori'],
    queryFn: apiFetchOperatori,
  });

  // Pending Checklist
  const { data: pendingChecklistData = [], refetch: fetchPendingChecklist } = useQuery({
    queryKey: ['pendingChecklist'],
    queryFn: apiFetchPendingChecklist,
    refetchInterval: 10000,
  });

  // Client Accounts (Portale)
  const fetchClientAccountsFn = async () => {
    const res = await fetch(`${API_BASE}/clienti/portale`);
    const json = await res.json();
    return json.success ? json.data : [];
  };
  const { data: clientAccountsData = [], refetch: fetchClientAccounts } = useQuery({
    queryKey: ['clientAccounts'],
    queryFn: fetchClientAccountsFn,
    refetchInterval: 5000,
  });

  // Annunci
  const { data: annunciData = [], refetch: fetchAnnunci } = useQuery({
    queryKey: ['annunci'],
    queryFn: apiFetchAnnunci,
  });

  // Email Config
  const fetchEmailConfigFn = async () => {
    const res = await fetch(`${API_BASE}/configurazione-email`);
    const json = await res.json();
    return json.success ? json.data : { host: 'smtp.gmail.com', port: '465', user: '', pass: '', secure: true };
  };
  const { data: emailConfigData, refetch: fetchEmailConfig } = useQuery({
    queryKey: ['emailConfig'],
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
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error('useGlobalState must be used within a GlobalStateProvider');
  return context;
};
