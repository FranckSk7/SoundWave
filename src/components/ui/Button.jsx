const Button = ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    icon = null,
    className = "",
  }) => {
  
    const base = `
      inline-flex items-center justify-center gap-2 font-semibold rounded-full
      transition-all duration-300 focus:outline-none select-none relative overflow-hidden
      before:absolute before:inset-0 before:rounded-full before:opacity-0
      before:transition-opacity before:duration-300 hover:before:opacity-100
    `;
  
    const variants = {
      primary: `
        bg-gradient-to-r from-green-500 to-emerald-400 text-black
        shadow-lg shadow-green-500/30
        hover:shadow-green-500/60 hover:scale-105 active:scale-95
        before:bg-white/10
      `,
      secondary: `
        bg-white/10 text-white border border-white/20
        backdrop-blur-sm
        hover:bg-white/20 hover:border-white/40 hover:scale-105 active:scale-95
        before:bg-white/5
      `,
      ghost: `
        bg-transparent text-white/80
        hover:text-white hover:bg-white/10 active:scale-95
        before:bg-white/5
      `,
      danger: `
        bg-gradient-to-r from-red-600 to-rose-500 text-white
        shadow-lg shadow-red-500/30
        hover:shadow-red-500/60 hover:scale-105 active:scale-95
        before:bg-white/10
      `,
      outline: `
        bg-transparent text-green-400 border border-green-500/50
        hover:bg-green-500/10 hover:border-green-400 hover:scale-105 active:scale-95
        before:bg-green-500/5
      `,
    };
  
    const sizes = {
      sm: "text-xs px-4 py-1.5",
      md: "text-sm px-6 py-2.5",
      lg: "text-base px-8 py-3.5",
    };
  
    const disabledStyle = disabled || loading
      ? "opacity-40 cursor-not-allowed pointer-events-none"
      : "cursor-pointer";
  
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${disabledStyle} ${className}`}
      >
        {/* Spinner si loading */}
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
  
        {/* Icône gauche */}
        {icon && !loading && <span className="text-lg">{icon}</span>}
  
        {children}
      </button>
    );
  };
  
  export default Button;