import React, { useEffect } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { useToast } from '../contexts/ToastContext';
import { API_BASE } from '../utils';

export default function ConfigurazioneEmail() {
  const { emailConfig, fetchEmailConfig } = useGlobalState();
  const { showStatus } = useToast();

  useEffect(() => {
    fetchEmailConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveEmailConfig = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      host: formData.get('host'),
      port: formData.get('port'),
      user: formData.get('user'),
      pass: formData.get('pass'),
      secure: formData.get('secure') === 'on'
    };
    
    try {
      showStatus('loading', 'Salvataggio...', 'Salvataggio configurazione SMTP...');
      const res = await fetch(`${API_BASE}/configurazione-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        showStatus('success', 'Configurazione Salvata!', json.message);
        fetchEmailConfig();
      } else {
        showStatus('error', 'Errore', json.error);
      }
    } catch (err) {
      showStatus('error', 'Errore di connessione', err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 700 }}>Configurazione Server SMTP per invio E-mail</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
        Configura i parametri del server e-mail per consentire al gestionale di inviare automaticamente i curricula ai clienti e le email di notifica ai commerciali. 
        <br/><br/>
        💡 <strong>Per Gmail/Google Workspace:</strong> Usa come host <code>smtp.gmail.com</code>, come porta <code>465</code> (con SSL attivo) e inserisci come password una <strong>Password per le App</strong> generata dal tuo account Google (non la tua password principale).
      </p>
      
      <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <form onSubmit={handleSaveEmailConfig}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Server Host SMTP *</label>
            <input type="text" name="host" className="form-control" required defaultValue={emailConfig.host} placeholder="Es: smtp.gmail.com" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Porta SMTP *</label>
              <input type="number" name="port" className="form-control" required min="1" max="65535" defaultValue={emailConfig.port} placeholder="Es: 465, 587" />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', height: '100%', paddingTop: '20px' }}>
              <input type="checkbox" name="secure" id="emailSecure" defaultChecked={emailConfig.secure} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
              <label htmlFor="emailSecure" style={{ cursor: 'pointer', userSelect: 'none' }}>Usa Connessione Sicura (SSL/TLS)</label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Nome Utente / E-mail di Invio *</label>
            <input type="text" name="user" className="form-control" required defaultValue={emailConfig.user} placeholder="latuamail@gmail.com" />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Password Server / Password per le App *</label>
            <input type="password" name="pass" className="form-control" required defaultValue={emailConfig.pass} placeholder="Password per le app Google a 16 caratteri" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontWeight: '700' }}>
            💾 Salva Configurazione SMTP
          </button>
        </form>
      </div>
    </div>
  );
}
