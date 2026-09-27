import React, { createContext, useContext, useRef, useState } from 'react';
const DialogContext = createContext(null);
export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState('');
  const queue = useRef([]);
  const showNext = () => {
    const next = queue.current[0] || null;
    setDialog(next); setValue(next?.defaultValue || '');
  };
  const request = (message, defaultValue, kind) => new Promise(resolve => {
    queue.current.push({ message, defaultValue, kind, resolve });
    if (queue.current.length === 1) showNext();
  });
  const finish = result => { queue.current.shift()?.resolve(result); showNext(); };
  const askText = (message, defaultValue = '') => request(message, defaultValue, 'text');
  const askConfirm = message => request(message, '', 'confirm');
  return <DialogContext.Provider value={{ askText, askConfirm }}>
    {children}
    {dialog && <div className="modal-overlay" style={{ zIndex: 11000 }}>
      <form role="dialog" aria-modal="true" aria-label={dialog.message} className="modal-container" style={{ width: 'min(500px, 95vw)' }} onSubmit={event => { event.preventDefault(); finish(dialog.kind === 'confirm' ? true : value); }} onKeyDown={event => { if (event.key === 'Escape') finish(dialog.kind === 'confirm' ? false : null); }}>
        <div className="modal-body">
          <p>{dialog.message}</p>
          {dialog.kind === 'text' && <input autoFocus className="form-control" aria-label="Risposta" type={/password/i.test(dialog.message) ? 'password' : 'text'} value={value} onChange={event => setValue(event.target.value)} />}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" className="btn btn-secondary" onClick={() => finish(dialog.kind === 'confirm' ? false : null)}>Annulla</button>
            <button autoFocus={dialog.kind === 'confirm'} type="submit" className="btn btn-primary">Conferma</button>
          </div>
        </div>
      </form>
    </div>}
  </DialogContext.Provider>;
}
export const useDialogs = () => useContext(DialogContext);
