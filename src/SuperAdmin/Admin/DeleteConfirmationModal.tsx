import React from 'react';
import { AlertTriangle, Trash2, Loader2, X, ShieldAlert } from 'lucide-react';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  message?: string;
  warning?: string;
  blockedMessage?: string | null;
  isDeleting?: boolean;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  title,
  itemName,
  message,
  warning = "This action cannot be undone. All associated configuration parameters will be permanently removed.",
  blockedMessage = null,
  isDeleting = false,
  confirmText = "Delete Permanently",
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col space-y-0 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-950 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${blockedMessage ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {blockedMessage ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-wider font-mono uppercase">
                {title}
              </h3>
              {itemName && (
                <p className="text-[11px] text-rose-400 font-semibold font-mono truncate max-w-xs mt-0.5">
                  "{itemName}"
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {blockedMessage ? (
            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Deletion Blocked by Data Integrity Constraints</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed font-sans">
                {blockedMessage}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {message || `Are you sure you want to permanently delete ${itemName ? `"${itemName}"` : 'this record'}?`}
              </p>
              
              {warning && (
                <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{warning}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-950 border-t border-slate-800/80 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {blockedMessage ? 'Close' : 'Cancel'}
          </button>

          {!blockedMessage && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
