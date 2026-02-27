import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  hideCancel?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  hideCancel = false
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideCancel ? undefined : onCancel}
            className="absolute inset-0 bg-premium-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm glass-premium rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="p-8 text-center space-y-6">
              <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center border shadow-lg ${
                type === 'danger' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10' : 
                type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10' : 
                'bg-gold/10 text-gold border-gold/20 shadow-gold/10'
              }`}>
                <AlertCircle size={40} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-serif font-bold italic text-white">{title}</h3>
                <p className="text-zinc-400 font-serif italic text-base leading-relaxed">{message}</p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={onConfirm}
                  className={`w-full py-5 rounded-2xl font-bold transition-all active:scale-95 uppercase tracking-widest text-xs ${
                    type === 'danger' ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 
                    type === 'warning' ? 'bg-amber-500 text-premium-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 
                    'bg-gold text-premium-black shadow-[0_0_20_rgba(212,175,55,0.3)]'
                  }`}
                >
                  {confirmText}
                </button>
                {!hideCancel && (
                  <button
                    onClick={onCancel}
                    className="w-full py-5 rounded-2xl font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all active:scale-95 uppercase tracking-widest text-xs border border-transparent hover:border-white/10"
                  >
                    {cancelText}
                  </button>
                )}
              </div>
            </div>
            
            {!hideCancel && (
              <button 
                onClick={onCancel}
                className="absolute top-6 right-6 p-2.5 text-zinc-600 hover:text-zinc-400 transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
              >
                <X size={24} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
