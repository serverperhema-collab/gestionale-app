import React, { useEffect, useState } from 'react';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { useToast } from '../contexts/ToastContext';
import { API_BASE } from '../utils';

export default function ConfigurazioneEmail() {
  const { emailConfig = {}, fetchEmailConfig } = useGlobalState() || {};
  const { showStatus } = useToast();

  const [useSmtpCreds, setUseSmtpCreds] = useState(true);
  const [smtpUser, setSmtpUser] = useState('');
  const [imapHost, setImapHost] = useState('');
  const [smtpHost, setSmtpHost] = useState('');

  useEffect(() => {
    fetchEmailConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state with loaded configuration
  useEffect(() => {
    if (emailConfig) {
      setUseSmtpCreds(emailConfig.use_smtp_creds !== undefined ? emailConfig.use_smtp_creds : true);
      setSmtpUser(emailConfig.user || '');
      setImapHost(emailConfig.imap_host || '');
      setSmtpHost(emailConfig.host || '');
    }
  }, [emailConfig]);

  // Auto-complete rules for common providers
  const handleEmailChange = (val) => {
    setSmtpUser(val);
    if (val.endsWith('@aruba.it')) {
      if (!smtpHost) setSmtpHost('smtps.aruba.it');
      if (!imapHost) setImapHost('imaps.aruba.it');
    } else if (val.endsWith('@gmail.com')) {
      if (!smtpHost) setSmtpHost('smtp.gmail.com');
      if (!imapHost) setImapHost('imap.gmail.com');
    }
  };

  const handleSaveEmailConfig = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      host: formData.get('host'),
      port: formData.get('port'),
      user: formData.get('user'),
      pass: formData.get('pass'),
      secure: formData.get('secure') === 'on',
      
      imap_host: formData.get('imap_host'),
      imap_port: formData.get('imap_port'),
      imap_secure: formData.get('imap_secure') === 'on',
      imap_user: formData.get('imap_user') || '',
      imap_pass: formData.get('imap_pass') || '',
      use_smtp_creds: useSmtpCreds
    };
    
    try {
      showStatus('loading', 'Salvataggio...', 'Salvataggio configurazione server...');
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
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
        ⚙️ Configurazione Server E-mail (SMTP & IMAP)
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
        Configura il server per abilitare l'invio delle comunicazioni (SMTP) e la ricezione in tempo reale delle e-mail passate e future (IMAP). 
      </p>
      
      <form onSubmit={handleSaveEmailConfig} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. SMTP SERVER CARD */}
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📤</span> Server SMTP (Invio e-mail)
          </h3>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Server Host SMTP *</label>
            <input 
              type="text" 
              name="host" 
              className="form-control" 
              required 
              value={smtpHost} 
              onChange={e => setSmtpHost(e.target.value)}
              placeholder="Es: smtps.aruba.it o smtp.gmail.com" 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Porta SMTP *</label>
              <input type="number" name="port" className="form-control" required min="1" max="65535" defaultValue={emailConfig.port || '465'} placeholder="Es: 465 o 587" />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', height: '100%', paddingTop: '20px' }}>
              <input type="checkbox" name="secure" id="emailSecure" defaultChecked={emailConfig.secure !== undefined ? emailConfig.secure : true} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
              <label htmlFor="emailSecure" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '13px' }}>Usa Connessione Sicura (SSL/TLS)</label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Nome Utente / E-mail *</label>
            <input 
              type="text" 
              name="user" 
              className="form-control" 
              required 
              value={smtpUser} 
              onChange={e => handleEmailChange(e.target.value)} 
              placeholder="latuamail@aruba.it" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label>Password *</label>
            <input type="password" name="pass" className="form-control" required defaultValue={emailConfig.pass} placeholder="Password dell'account e-mail" />
          </div>
        </div>

        {/* 2. IMAP SERVER CARD */}
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📥</span> Server IMAP (Ricezione e-mail)
          </h3>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Server Host IMAP *</label>
            <input 
              type="text" 
              name="imap_host" 
              className="form-control" 
              required 
              value={imapHost} 
              onChange={e => setImapHost(e.target.value)}
              placeholder="Es: imaps.aruba.it" 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label>Porta IMAP *</label>
              <input type="number" name="imap_port" className="form-control" required min="1" max="65535" defaultValue={emailConfig.imap_port || '993'} placeholder="Es: 993" />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', height: '100%', paddingTop: '20px' }}>
              <input type="checkbox" name="imap_secure" id="imapSecure" defaultChecked={emailConfig.imap_secure !== undefined ? emailConfig.imap_secure : true} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
              <label htmlFor="imapSecure" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '13px' }}>Usa Connessione Sicura (SSL/TLS)</label>
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="checkbox" 
              id="useSmtpCreds" 
              checked={useSmtpCreds} 
              onChange={e => setUseSmtpCreds(e.target.checked)} 
              style={{ cursor: 'pointer', width: '18px', height: '18px' }} 
            />
            <label htmlFor="useSmtpCreds" style={{ cursor: 'pointer', userSelect: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
              Usa le stesse credenziali dell'SMTP per IMAP
            </label>
          </div>

          {/* Reveal credentials if unchecked */}
          {!useSmtpCreds && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div className="form-group">
                <label>Nome Utente IMAP *</label>
                <input type="text" name="imap_user" className="form-control" defaultValue={emailConfig.imap_user || smtpUser} placeholder="username@aruba.it" />
              </div>
              <div className="form-group">
                <label>Password IMAP *</label>
                <input type="password" name="imap_pass" className="form-control" defaultValue={emailConfig.imap_pass || emailConfig.pass} placeholder="Password per IMAP" />
              </div>
            </div>
          )}
        </div>

        {/* SAVE BUTTON */}
        <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontWeight: '700', borderRadius: '8px', fontSize: '15px' }}>
          💾 Salva Configurazione Server
        </button>

      </form>
    </div>
  );
}
