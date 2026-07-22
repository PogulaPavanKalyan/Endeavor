import React, { createContext, useContext, useState, useCallback } from 'react';
import './AdminToast.css';

const AdminDialogContext = createContext();

export const AdminDialogProvider = ({ children }) => {
  // Modal Dialog State
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm Action',
    cancelText: 'Cancel',
    isAlert: false,
    onConfirm: null,
    onCancel: null,
  });

  // Toasts State
  const [toasts, setToasts] = useState([]);

  // Toast Functionality
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    const newToast = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
  };

  // Confirmation Modal Functionality
  const confirmDialog = useCallback((message, title = "Confirm Action", confirmText = "Delete", cancelText = "Cancel") => {
    return new Promise((resolve) => {
      setDialogConfig({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        isAlert: false,
        onConfirm: () => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const alertDialog = useCallback((message, title = "Notice") => {
    return new Promise((resolve) => {
      setDialogConfig({
        isOpen: true,
        title,
        message,
        confirmText: "Got it",
        cancelText: "Close",
        isAlert: true,
        onConfirm: () => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogConfig(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
      });
    });
  }, []);

  return (
    <AdminDialogContext.Provider value={{ confirmDialog, alertDialog, showToast, toast }}>
      {children}

      {/* Top Right Toast Notifications Container */}
      <div className="admin-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`admin-toast-item admin-toast-${t.type}`}>
            <div className="admin-toast-icon">
              {t.type === 'success' && '✓'}
              {t.type === 'error' && '✕'}
              {t.type === 'warning' && '⚠️'}
              {t.type === 'info' && 'ℹ️'}
            </div>
            <div className="admin-toast-content">
              <span className="admin-toast-title">
                {t.type === 'success' && 'Success'}
                {t.type === 'error' && 'Error'}
                {t.type === 'warning' && 'Warning'}
                {t.type === 'info' && 'Notice'}
              </span>
              <p className="admin-toast-message">{t.message}</p>
            </div>
            <button
              type="button"
              className="admin-toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation / Alert Modal */}
      {dialogConfig.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            maxWidth: '440px',
            width: 'calc(100% - 32px)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: dialogConfig.isAlert ? '#eff6ff' : '#fef2f2'
            }}>
              <span style={{ fontSize: '1.25rem' }}>
                {dialogConfig.isAlert ? 'ℹ️' : '⚠️'}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                {dialogConfig.title}
              </h3>
            </div>
            
            {/* Body */}
            <div style={{ padding: '1.25rem' }}>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {dialogConfig.message}
              </p>
            </div>
            
            {/* Footer */}
            <div style={{
              padding: '0.875rem 1.25rem',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              borderTop: '1px solid #e2e8f0'
            }}>
              {!dialogConfig.isAlert && (
                <button
                  type="button"
                  onClick={dialogConfig.onCancel}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {dialogConfig.cancelText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={dialogConfig.onConfirm}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: dialogConfig.isAlert ? '#0052cc' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {dialogConfig.confirmText || (dialogConfig.isAlert ? 'Got it' : 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDialogContext.Provider>
  );
};

export const useAdminDialog = () => {
  const context = useContext(AdminDialogContext);
  if (context === undefined) {
    throw new Error('useAdminDialog must be used within an AdminDialogProvider');
  }
  return context;
};
