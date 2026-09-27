const has = (value, field) => Object.prototype.hasOwnProperty.call(value, field);
const pipelineStates = new Set(['CV Ricevuto', 'Presentato', 'Colloquio Fissato', 'Colloquio Superato', 'Colloquio Assente', 'In Prova', 'Approvato/Assunto', 'Assunto', 'CV Scartato', 'Escluso']);
const trialStates = new Set(['', 'In Corso', 'Prova Superata', 'Prova Non Superata', 'Non Superata']);
pipelineStates.add('Colloquio Annullato');
pipelineStates.add('Idoneo');
function dateValid(value) {
  if (value === '' || value === null) return true;
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function validatePipeline(body, existing = {}) {
  if (has(body, 'stato_avanzamento') && !pipelineStates.has(body.stato_avanzamento)) return 'Stato candidato non valido';
  if (has(body, 'stato_prova') && body.stato_prova !== null && !trialStates.has(body.stato_prova)) return 'Stato prova non valido';
  for (const field of ['data_invio_cv', 'data_inizio_prova', 'data_scadenza_prova']) {
    if (has(body, field) && !dateValid(body[field])) return 'Data non valida: ' + field;
  }
  const start = has(body, 'data_inizio_prova') ? body.data_inizio_prova : existing.data_inizio_prova;
  const end = has(body, 'data_scadenza_prova') ? body.data_scadenza_prova : existing.data_scadenza_prova;
  if (start && end && end < start) return 'La scadenza della prova non può precedere la data di inizio';
  if (has(body, 'ore_contratto') && body.ore_contratto !== null && body.ore_contratto !== '' && (!Number.isInteger(Number(body.ore_contratto)) || Number(body.ore_contratto) <= 0)) return 'Ore contratto non valide';
  return null;
}
function validateResearch(body) {
  if (has(body, 'nr_risorse') && (!Number.isSafeInteger(Number(body.nr_risorse)) || Number(body.nr_risorse) < 1)) return 'Il numero di risorse deve essere un intero positivo';
  if (has(body, 'ore_lavoro') && body.ore_lavoro !== null && body.ore_lavoro !== '' && (!Number.isSafeInteger(Number(body.ore_lavoro)) || Number(body.ore_lavoro) <= 0)) return 'Ore di lavoro non valide';
  return null;
}
function validateAppointment(body) {
  if (has(body, 'data') && (!body.data || !dateValid(body.data))) return 'Data del colloquio non valida';
  if (has(body, 'ora') && !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.ora)) return 'Ora del colloquio non valida';
  // The existing "Altro" button supports custom interview outcomes.
  if (has(body, 'stato') && (typeof body.stato !== 'string' || !body.stato.trim() || body.stato.length > 80)) return 'Stato del colloquio non valido';
  return null;
}
module.exports = { validatePipeline, validateResearch, validateAppointment };
