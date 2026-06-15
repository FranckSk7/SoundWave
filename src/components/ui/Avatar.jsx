const Avatar = ({
    src = "",
    alt = "avatar",
    name = "",
    size = "md",
    online = false,
    className = "",
    onClick = null,
  }) => {
  
    const sizes = {
      xs:   "w-7 h-7 text-xs",
      sm:   "w-9 h-9 text-sm",
      md:   "w-12 h-12 text-base",
      lg:   "w-16 h-16 text-xl",
      xl:   "w-24 h-24 text-3xl",
      "2xl":"w-32 h-32 text-4xl",
    };
  
    const dotSizes = {
      xs:   "w-2 h-2 border",
      sm:   "w-2.5 h-2.5 border",
      md:   "w-3 h-3 border-2",
      lg:   "w-3.5 h-3.5 border-2",
      xl:   "w-4 h-4 border-2",
      "2xl":"w-5 h-5 border-2",
    };
  
    // Génère des initiales depuis le nom
    const getInitials = (n) => {
      if (!n) return "?";
      return n.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    };
  
    // Génère une couleur de fond unique basée sur le nom
    const getColor = (n) => {
      const colors = [
        "from-green-500 to-emerald-400",
        "from-purple-500 to-violet-400",
        "from-blue-500 to-cyan-400",
        "from-pink-500 to-rose-400",
        "from-orange-500 to-amber-400",
        "from-teal-500 to-green-400",
      ];
      if (!n) return colors[0];
      const index = n.charCodeAt(0) % colors.length;
      return colors[index];
    };
  
    const isClickable = typeof onClick === "function";
  
    return (
      <div
        className={`relative inline-flex shrink-0 ${isClickable ? "cursor-pointer" : ""}`}
        onClick={onClick}
      >
        {/* Anneau brillant au hover si cliquable */}
        <div className={`
          ${sizes[size]} rounded-full
          ${isClickable ? "ring-2 ring-transparent hover:ring-green-500 hover:ring-offset-2 hover:ring-offset-black transition-all duration-300 hover:scale-105" : ""}
          ${className}
        `}>
  
          {src ? (
            // Photo de profil
            <img
              src={src}
              alt={alt}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            // Initiales avec dégradé unique
            <div className={`
              w-full h-full rounded-full
              bg-gradient-to-br ${getColor(name)}
              flex items-center justify-center
              font-bold text-black select-none
              ${sizes[size].split(" ").find(c => c.startsWith("text-"))}
            `}>
              {getInitials(name)}
            </div>
          )}
        </div>
  
        {/* Indicateur en ligne */}
        {online && (
          <span className={`
            absolute bottom-0 right-0
            ${dotSizes[size]} rounded-full
            bg-green-400 border-black
          `} />
        )}
      </div>
    );
  };
  
  export default Avatar;