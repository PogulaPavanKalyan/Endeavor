import React, { createContext, useContext, useState, useCallback } from 'react';

const AdminDialogContext = createContext();

export const AdminDialogProvider = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    isAlert: false,
    onConfirm: null,
    onCancel: null,
  });

  const confirmDialog = useCallback((message, title = "Confirm Action") => {
    return new Promise((resolve) => {
      setDialogConfig({
        isOpen: true,
        title,
        message,
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
    <AdminDialogContext.Provider value={{ confirmDialog, alertDialog }}>
      {children}
      
      {dialogConfig.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center gap-3 ${dialogConfig.isAlert ? 'bg-blue-50/50' : 'bg-red-50/50'}`}>
              {!dialogConfig.isAlert ? (
                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              ) : (
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900 m-0">
                {dialogConfig.title}
              </h3>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-gray-600 text-sm leading-relaxed m-0 whitespace-pre-wrap">
                {dialogConfig.message}
              </p>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl border-t">
              {!dialogConfig.isAlert && (
                <button
                  type="button"
                  onClick={dialogConfig.onCancel}
                  className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={dialogConfig.onConfirm}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  dialogConfig.isAlert 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {dialogConfig.isAlert ? 'Got it' : 'Confirm Action'}
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
