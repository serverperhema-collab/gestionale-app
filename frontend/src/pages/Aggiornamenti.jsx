import { aggiornamenti } from '../data/aggiornamenti';
import './Aggiornamenti.css';

export default function Aggiornamenti() {
  const releases = [...aggiornamenti].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="updates-page">
      <div className="updates-intro">
        <span className="updates-eyebrow">LE NOVITÀ, SPIEGATE IN MODO SEMPLICE</span>
        <h2>Cosa abbiamo migliorato?</h2>
        <p>Qui trovi le modifiche presenti in questa versione del gestionale. Quando faremo altri miglioramenti, aggiungeremo nuove spiegazioni. Quelle vecchie resteranno qui.</p>
      </div>
      {releases.map(release => (
        <article className="updates-release" key={release.id} aria-labelledby={`release-${release.id}`}>
          <div className="updates-release-heading">
            <time dateTime={release.data}>{new Date(`${release.data}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            <h2 id={`release-${release.id}`}>{release.titolo}</h2>
            <p>{release.descrizione}</p>
          </div>
          <div className="updates-grid">
            {release.sezioni.map(section => (
              <section className="updates-card" key={section.titolo}>
                <h3>{section.titolo}</h3>
                <ul>{section.modifiche.map(change => <li key={change}>{change}</li>)}</ul>
              </section>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
