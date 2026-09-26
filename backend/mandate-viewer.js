const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const shown = value => escapeHtml(value === null || value === undefined || value === '' ? 'N/D' : value);
const formatDate = value => {
  if (!value) return 'N/D';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? escapeHtml(value) : new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};
const formatMoment = value => {
  if (!value) return 'N/D';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? escapeHtml(value) : new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' }).format(date);
};

function metricRow(label, value, detail) {
  return `<tr><th scope="row">${label}</th><td class="metric-value">${value}</td><td>${detail}</td></tr>`;
}

function renderMandateViewer({ ricerca, pipeline, appointments, reports, token, generatedAt = new Date() }) {
  const candidates = pipeline.length;
  const positive = pipeline.filter(item => item.feedback_stato === 'Feedback Positivo').length;
  const negative = pipeline.filter(item => item.feedback_stato === 'Feedback Negativo').length;
  const waiting = candidates - positive - negative;
  const hired = pipeline.filter(item => ['Approvato/Assunto', 'Assunto'].includes(item.stato_avanzamento)).length;
  const trials = pipeline.filter(item => item.stato_avanzamento === 'In Prova' || Boolean(item.stato_prova)).length;
  const trialsPassed = pipeline.filter(item => ['Superata', 'Prova Superata'].includes(item.stato_prova)).length;
  const trialsFailed = pipeline.filter(item => ['Non Superata', 'Prova Non Superata'].includes(item.stato_prova)).length;
  const atClient = appointments.filter(item => /azienda|cliente|presso/i.test(item.tipo_colloquio || '')).length;
  const insertedAt = new Date(ricerca.data_inserimento);
  const daysOpen = Number.isNaN(insertedAt.getTime()) ? null : Math.max(0, Math.floor((generatedAt.getTime() - insertedAt.getTime()) / 86400000));
  const detail = (label, value) => `<div class="fact"><span>${label}</span><strong>${shown(value)}</strong></div>`;
  const candidateRows = pipeline.map((item, index) => `<tr>
    <td><strong>${index + 1}. ${shown([item.nome, item.cognome].filter(Boolean).join(' '))}</strong></td>
    <td>${shown(item.email)}<br>${shown(item.telefono)}</td>
    <td>${shown(item.stato_avanzamento || 'CV Ricevuto')}</td>
    <td><strong>${shown(item.feedback_stato || 'In attesa')}</strong>${item.feedback_note ? `<small>${escapeHtml(item.feedback_note)}</small>` : ''}</td>
    <td>${shown(item.stato_prova)}${item.data_scadenza_prova ? `<small>Scadenza: ${formatDate(item.data_scadenza_prova)}</small>` : ''}</td>
  </tr>`).join('') || '<tr><td colspan="5" class="empty">Nessun candidato collegato.</td></tr>';
  const appointmentRows = appointments.map(item => `<tr><td>${shown(item.candidato_nome)}</td><td>${formatDate(item.data_colloquio)}${item.ora_colloquio ? ` · ${escapeHtml(item.ora_colloquio)}` : ''}</td><td>${shown(item.tipo_colloquio)}</td><td>${shown(item.luogo)}</td><td>${shown(item.stato_appuntamento)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Nessun colloquio registrato.</td></tr>';
  const reportCards = reports.map(report => `<article class="report-card"><strong>Settimana del ${formatDate(report.week_start)}</strong><time>${formatMoment(report.created_at)}</time><p>${escapeHtml(report.report_text)}</p></article>`).join('') || '<p class="empty-panel">Nessun report settimanale ancora inserito. I dati qui sopra sono comunque aggiornati.</p>';
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ricerca ${escapeHtml(ricerca.azienda)} · HEMA WORK</title><style>
    :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#e8edf3;color:#2d3748;font:13px/1.5 'Helvetica Neue',Helvetica,Arial,sans-serif}.toolbar{max-width:1100px;margin:20px auto 0;padding:0 22px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px}.toolbar p{margin:0;color:#596579}.toolbar a{display:inline-block;background:#2d3748;color:white;text-decoration:none;padding:9px 15px;border-radius:5px;font-weight:700}.sheet{max-width:1100px;margin:16px auto 36px;background:#fff;padding:34px 42px;box-shadow:0 12px 35px #1e293b20}.header{border-bottom:2px solid #4a5568;padding-bottom:14px;margin-bottom:20px}.title{font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:.025em}.meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:7px;color:#718096;font-size:11px;margin-top:6px}.section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;background:#f7fafc;border:1px solid #e2e8f0;padding:7px 10px;margin:26px 0 11px}.facts{display:grid;grid-template-columns:1fr 1fr;gap:2px 30px}.fact{display:grid;grid-template-columns:160px 1fr;gap:8px;padding:6px 8px;border-bottom:1px solid #edf2f7}.fact span{font-weight:700;color:#4a5568}.fact strong{overflow-wrap:anywhere}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:670px}th,td{border:1px solid #cbd5e0;padding:8px;text-align:left;vertical-align:top}thead th{background:#edf2f7;text-transform:uppercase;font-size:11px}tbody th{font-weight:700}.metric-value{text-align:center;font-weight:800;font-size:16px;width:110px}.empty{text-align:center;color:#718096}.empty-panel{color:#718096;font-style:italic}.status{display:inline-block;border:1px solid #cbd5e0;background:#f7fafc;padding:3px 9px;border-radius:4px;font-weight:700}.report-card{border:1px solid #cbd5e0;padding:12px;margin:9px 0}.report-card strong{display:block}.report-card time{display:block;color:#718096;font-size:11px}.report-card p{white-space:pre-wrap;margin:8px 0 0}small{display:block;color:#718096;font-style:italic;white-space:pre-wrap}.footer{border-top:1px solid #e2e8f0;margin-top:34px;padding-top:12px;text-align:center;color:#a0aec0;font-size:10px}@media(max-width:700px){.sheet{margin:12px;padding:20px 16px}.facts{grid-template-columns:1fr}.fact{grid-template-columns:130px 1fr}.title{font-size:18px}}@media print{body{background:white}.toolbar{display:none}.sheet{margin:0;box-shadow:none;max-width:none;padding:10px}thead{display:table-header-group}tr{break-inside:avoid}}
    </style></head><body><nav class="toolbar" aria-label="Aggiornamento"><p>Dati letti direttamente dalla Ricerca · aggiornamento automatico ogni 30 secondi</p><a href="/mandato/${escapeHtml(token)}">Aggiorna ora</a></nav><main class="sheet">
    <header class="header"><div class="title">HEMA WORK - REPORT TECNICO RICERCA</div><div class="meta"><span><strong>Stato mandato:</strong> ${shown(ricerca.stato_approvazione_tl)}</span><span><strong>Dati aggiornati il:</strong> ${formatMoment(generatedAt)}</span></div></header>
    <section><h2 class="section-title">Dati identificativi ricerca</h2><div class="facts">${detail('ID Mandato', ricerca.id)}${detail('Azienda cliente', ricerca.azienda)}${detail('Ruolo ricercato', ricerca.ruolo)}${detail('Settore riferimento', ricerca.settore)}${detail('Sede di lavoro', ricerca.sede_lavoro)}${detail('Data inserimento', `${formatDate(ricerca.data_inserimento)}${daysOpen === null ? '' : ` (${daysOpen} giorni di attività)`}`)}${detail('Referente cliente', ricerca.referente)}${detail('Email referente', ricerca.email)}${detail('Telefono referente', ricerca.telefono_mobile)}${detail('Ore di lavoro', ricerca.ore_lavoro ? `${ricerca.ore_lavoro} ore ${ricerca.ore_lavoro_tipo || 'settimanali'}` : null)}${detail('Orario di lavoro', ricerca.orario_lavoro || 'Opzionale/Flessibile')}${detail('Stato ricerca', ricerca.stato_ricerca || 'In attesa di avvio')}${detail('Stato annuncio', ricerca.stato_annuncio)}</div></section>
    <section><h2 class="section-title">Statistiche generali di avanzamento</h2><div class="table-wrap"><table><thead><tr><th>Metrica di avanzamento</th><th>Valore</th><th>Dettaglio / suddivisione</th></tr></thead><tbody>${metricRow('Candidati presentati totali', candidates, `CV con feedback positivo: <strong>${positive}</strong> · negativo: <strong>${negative}</strong> · in attesa: <strong>${waiting}</strong>`)}${metricRow('Colloqui registrati', appointments.length, `Presso sede cliente: <strong>${atClient}</strong> · online/agenzia: <strong>${appointments.length - atClient}</strong>`)}${metricRow('Fasi di prova attivate', trials, `In corso: <strong>${Math.max(0, trials - trialsPassed - trialsFailed)}</strong> · superate: <strong>${trialsPassed}</strong> · non superate: <strong>${trialsFailed}</strong>`)}${metricRow('Assunzioni contrattualizzate', hired, 'Risorse inserite con successo in organico.')}</tbody></table></div></section>
    <section><h2 class="section-title">Dettaglio dello stato dei candidati</h2><div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Contatti</th><th>Stato avanzamento</th><th>Feedback CV cliente</th><th>Periodo di prova</th></tr></thead><tbody>${candidateRows}</tbody></table></div></section>
    <section><h2 class="section-title">Colloqui della ricerca</h2><div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Data e ora</th><th>Tipo</th><th>Luogo</th><th>Stato</th></tr></thead><tbody>${appointmentRows}</tbody></table></div></section>
    <section><h2 class="section-title">Report settimanali archiviati</h2>${reportCards}</section><footer class="footer">HEMA WORK - Report di Ricerca Tecnico Riservato · Vista in sola lettura</footer></main></body></html>`;
}

module.exports = { renderMandateViewer };
