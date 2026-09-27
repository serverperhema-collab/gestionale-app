import { useEffect, useState } from 'react';
import { API_BASE } from '../utils';
import { aggiornamenti } from '../data/aggiornamenti';
import './Aggiornamenti.css';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const emptyForm = () => ({ data: today(), titolo: '', descrizione: '', sezioneTitolo: '', modifiche: '' });

export default function Aggiornamenti() {
  const [manualUpdates, setManualUpdates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/aggiornamenti`)
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.data)) throw new Error(result.error || 'Caricamento non riuscito');
        if (active) { setManualUpdates(result.data); setLoadError(''); }
      })
      .catch(() => { if (active) setLoadError('Non riesco a caricare gli aggiornamenti scritti a mano. Riprova.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  const saveUpdate = async event => {
    event.preventDefault();
    setFormMessage('');
    const modifiche = form.modifiche.split('\n').map(line => line.trim()).filter(Boolean);
    if (modifiche.length < 1 || modifiche.length > 20) {
      setFormMessage('Scrivi da 1 a 20 punti, uno per riga.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/aggiornamenti`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, modifiche })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Salvataggio non riuscito');
      setManualUpdates(previous => [result.data, ...previous]);
      setForm(emptyForm());
      setFormMessage('Aggiornamento salvato. Lo trovi qui sotto.');
    } catch (error) {
      setFormMessage(error.message || 'Salvataggio non riuscito. Riprova.');
    } finally { setSaving(false); }
  };

  const releases = [...manualUpdates, ...aggiornamenti].sort((a, b) =>
    b.data.localeCompare(a.data) || (b.createdAt || '').localeCompare(a.createdAt || '')
  );

  return (
    <div className="updates-page">
      <div className="updates-intro">
        <span className="updates-eyebrow">LE NOVITÀ, SPIEGATE IN MODO SEMPLICE</span>
        <h2>Cosa abbiamo migliorato?</h2>
        <p>Qui trovi le novità del gestionale. Puoi aggiungerne anche tu: le tue voci avranno lo stesso aspetto delle altre e resteranno qui dopo i riavvii.</p>
      </div>
      <form className="updates-form" onSubmit={saveUpdate}>
        <h2>Aggiungi un aggiornamento</h2>
        <p>Scrivi con parole semplici cosa è cambiato. Non inserire password o dati personali.</p>
        <div className="updates-form-grid">
          <label>Data
            <input type="date" value={form.data} onChange={event => setForm({ ...form, data: event.target.value })} required />
          </label>
          <label>Titolo
            <input type="text" value={form.titolo} maxLength={160} onChange={event => setForm({ ...form, titolo: event.target.value })} placeholder="Per esempio: Una novità per i candidati" required />
          </label>
        </div>
        <label>Breve spiegazione
          <textarea value={form.descrizione} maxLength={1000} rows={2} onChange={event => setForm({ ...form, descrizione: event.target.value })} placeholder="Spiega in breve cosa è migliorato" required />
        </label>
        <label>Nome della sezione
          <input type="text" value={form.sezioneTitolo} maxLength={120} onChange={event => setForm({ ...form, sezioneTitolo: event.target.value })} placeholder="Per esempio: Colloqui e candidati" required />
        </label>
        <label>Modifiche (una per riga)
          <textarea value={form.modifiche} rows={4} onChange={event => setForm({ ...form, modifiche: event.target.value })} placeholder={'Ora puoi...\nIl gestionale ti avvisa quando...'} required />
        </label>
        <div className="updates-form-footer">
          <button type="submit" disabled={saving || loading}>{saving ? 'Salvataggio...' : 'Salva aggiornamento'}</button>
          {formMessage && <p role="status">{formMessage}</p>}
        </div>
      </form>
      {loading && <p role="status">Caricamento degli aggiornamenti...</p>}
      {loadError && <div className="updates-load-error" role="alert">{loadError} <button type="button" onClick={() => { setLoading(true); setReloadKey(key => key + 1); }}>Riprova</button></div>}
      {releases.map(release => (
        <article className="updates-release" key={release.id} aria-labelledby={`release-${release.id}`}>
          <div className="updates-release-heading">
            <time dateTime={release.data}>{new Date(`${release.data}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            <h2 id={`release-${release.id}`}>{release.titolo}</h2>
            <p>{release.descrizione}</p>
          </div>
          <div className="updates-grid">
            {release.sezioni.map((section, sectionIndex) => (
              <section className="updates-card" key={`${section.titolo}-${sectionIndex}`}>
                <h3>{section.titolo}</h3>
                <ul>{section.modifiche.map((change, changeIndex) => <li key={changeIndex}>{change}</li>)}</ul>
              </section>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
