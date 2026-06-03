/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        window.setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full sm:w-96 pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300
                            ${toast.type === 'success' ? 'bg-white border-green-100' : 
                              toast.type === 'error' ? 'bg-white border-red-100' : 
                              'bg-white border-blue-100'}`}
                    >
                        <div className={`mt-0.5 shrink-0
                            ${toast.type === 'success' ? 'text-green-500' : 
                              toast.type === 'error' ? 'text-red-500' : 
                              'text-blue-500'}`}
                        >
                            {toast.type === 'success' ? <CheckCircle2 size={20} /> : 
                             toast.type === 'error' ? <AlertCircle size={20} /> : 
                             <Info size={20} />}
                        </div>
                        
                        <div className="flex-1">
                            <p className={`text-sm font-bold 
                                ${toast.type === 'success' ? 'text-green-800' : 
                                  toast.type === 'error' ? 'text-red-800' : 
                                  'text-blue-800'}`}
                            >
                                {toast.type === 'success' ? 'Success' : 
                                 toast.type === 'error' ? 'Error' : 
                                 'Information'}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                                {toast.message}
                            </p>
                        </div>

                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
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
