import { API_BASE } from './utils';

export const apiFetchRicerche = async () => {
  const res = await fetch(`${API_BASE}/ricerche`);
  if (!res.ok) throw new Error('Network response was not ok');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Errore fetch ricerche');
  return json.data;
};

export const apiFetchCandidati = async () => {
  const res = await fetch(`${API_BASE}/candidati`);
  if (!res.ok) throw new Error('Network response was not ok');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Errore fetch candidati');
  return json.data;
};

export const apiFetchClienti = async () => {
  const res = await fetch(`${API_BASE}/clienti`);
  if (!res.ok) throw new Error('Network response was not ok');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Errore fetch clienti');
  return json.data;
};

export const apiFetchCommerciali = async () => {
  const res = await fetch(`${API_BASE}/commerciali`);
  if (!res.ok) throw new Error('Network response was not ok');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Errore fetch commerciali');
  return json.data;
};

export const apiFetchOperatori = async () => {
  const res = await fetch(`${API_BASE}/operatori`);
  if (!res.ok) throw new Error('Network response was not ok');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Errore fetch operatori');
  return json.data;
};

export const apiFetchPendingChecklist = async () => {
  const res = await fetch(`${API_BASE}/dashboard/pending`);
  if (!res.ok) throw new Error('Network response was not ok');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Errore fetch pending checklist');
  return json.pending;
};

export const apiFetchAnnunci = async () => {
  const res = await fetch(`${API_BASE}/annunci`);
  if (!res.ok) throw new Error('Network response was not ok');
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Errore fetch annunci');
  return json.annunci;
};
