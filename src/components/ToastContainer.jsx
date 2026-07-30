"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import useToastStore from '@/store/useToastStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'error': return <AlertCircle size={20} className="text-rose-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex items-start gap-3 p-4 w-[350px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl border bg-white/90 dark:bg-black/80 backdrop-blur-xl border-white/20 dark:border-white/10"
          >
            <div className="shrink-0 mt-0.5">
              {getIcon(t.type)}
            </div>
            
            <div className="flex-1 flex flex-col justify-center min-h-[24px]">
              <p className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {t.message}
              </p>
              {t.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {t.description}
                </p>
              )}
            </div>
            
            <button 
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
