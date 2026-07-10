import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [status, setStatus] = useState({ type: '', title: '', message: '' });

  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => setStatus({ type: '', title: '', message: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const showStatus = (type, title, message) => {
    setStatus({ type, title, message });
  };

  return (
    <ToastContext.Provider value={{ showStatus }}>
      {children}
      
      {/* STATUS BANNER */}
      {status.type && (
        <div className={`status-banner ${status.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {status.type === 'success' && <span style={{ fontSize: '18px' }}>✅</span>}
            {status.type === 'error' && <span style={{ fontSize: '18px' }}>❌</span>}
            {status.type === 'warning' && <span style={{ fontSize: '18px' }}>⚠️</span>}
            {status.type === 'loading' && <span style={{ fontSize: '18px' }}>⏳</span>}
            <strong style={{ fontSize: '15px' }}>{status.title}</strong>
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>{status.message}</div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
