import { useEffect, useState } from "react";

// ─── Composant Toast individuel ───────────────────────────────────────────────
const Toast = ({ id, message, type = "success", duration = 3000, onRemove }) => {

  const [visible, setVisible] = useState(false);

  // Animation d'entrée
  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Animation de sortie avant suppression
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [id, duration, onRemove]);

  const types = {
    success: {
      icon:   "✅",
      bar:    "bg-green-400",
      border: "border-green-500/30",
      glow:   "shadow-green-500/20",
    },
    error: {
      icon:   "❌",
      bar:    "bg-red-400",
      border: "border-red-500/30",
      glow:   "shadow-red-500/20",
    },
    warning: {
      icon:   "⚠️",
      bar:    "bg-yellow-400",
      border: "border-yellow-500/30",
      glow:   "shadow-yellow-500/20",
    },
    info: {
      icon:   "ℹ️",
      bar:    "bg-blue-400",
      border: "border-blue-500/30",
      glow:   "shadow-blue-500/20",
    },
  };

  const t = types[type] || types.success;

  return (
    <div className={`
      relative flex items-center gap-3
      bg-zinc-900/95 backdrop-blur-xl
      border ${t.border} rounded-2xl
      px-4 py-3 shadow-xl ${t.glow}
      min-w-[260px] max-w-[360px]
      transition-all duration-300
      ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}
    `}>

      {/* Barre colorée à gauche */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${t.bar}`} />

      {/* Icône */}
      <span className="text-lg ml-2">{t.icon}</span>

      {/* Message */}
      <p className="text-white/90 text-sm font-medium flex-1">{message}</p>

      {/* Bouton fermer */}
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 300); }}
        className="text-white/30 hover:text-white/80 transition-colors duration-200 text-xs ml-1"
      >
        ✕
      </button>

    </div>
  );
};

// ─── Conteneur de tous les toasts ─────────────────────────────────────────────
export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
};

// ─── Hook pour utiliser les toasts facilement ─────────────────────────────────
import { useState as useStateHook } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useStateHook([]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export default Toast;