import { useEffect } from "react";

const Modal = ({
  isOpen = false,
  onClose,
  title = "",
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {

  const sizes = {
    sm:   "max-w-sm",
    md:   "max-w-md",
    lg:   "max-w-lg",
    xl:   "max-w-xl",
    full: "max-w-3xl",
  };

  // Bloquer le scroll quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose?.(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop flouté */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Boîte modale */}
      <div className={`
        relative z-10 w-full ${sizes[size]}
        bg-gradient-to-b from-zinc-800/90 to-zinc-900/95
        border border-white/10 rounded-2xl shadow-2xl
        backdrop-blur-xl
        animate-scale-in
      `}>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
            {title && (
              <h2 className="text-white font-bold text-lg tracking-tight">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto text-white/40 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Contenu */}
        <div className="px-6 py-5">
          {children}
        </div>

      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-fade-in  { animation: fade-in  0.2s ease forwards; }
        .animate-scale-in { animation: scale-in 0.25s ease forwards; }
      `}</style>

    </div>
  );
};

export default Modal;