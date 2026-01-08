import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`
                flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl border border-white/10
                ${type === 'success' ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}
            `}>
                {type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium text-sm tracking-wide">{message}</span>
            </div>
        </div>
    );
};