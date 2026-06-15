const Loader = ({ size = "md", variant = "spinner", fullscreen = false, text = "" }) => {

    const sizes = {
      sm: "w-5 h-5",
      md: "w-9 h-9",
      lg: "w-14 h-14",
    };
  
    // Spinner classique mais stylé
    const Spinner = () => (
      <div className={`relative ${sizes[size]}`}>
        {/* Cercle extérieur */}
        <div className={`absolute inset-0 rounded-full border-2 border-white/10`} />
        {/* Arc vert animé */}
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-green-400 border-r-green-400 animate-spin`} />
        {/* Point central brillant */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
    );
  
    // Barres style Spotify (equalizer)
    const Equalizer = () => (
      <div className="flex items-end gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 bg-green-400 rounded-full animate-bounce"
            style={{
              height: size === "sm" ? "12px" : size === "lg" ? "28px" : "20px",
              animationDelay: `${i * 0.12}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    );
  
    // Points pulsants
    const Dots = () => (
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-full bg-green-400 animate-bounce"
            style={{
              width:  size === "sm" ? "6px"  : size === "lg" ? "14px" : "10px",
              height: size === "sm" ? "6px"  : size === "lg" ? "14px" : "10px",
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.7s",
            }}
          />
        ))}
      </div>
    );
  
    const loaderMap = { spinner: <Spinner />, equalizer: <Equalizer />, dots: <Dots /> };
    const content = loaderMap[variant] || <Spinner />;
  
    if (fullscreen) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4">
          {content}
          {text && <p className="text-white/60 text-sm animate-pulse">{text}</p>}
        </div>
      );
    }
  
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {content}
        {text && <p className="text-white/60 text-sm animate-pulse">{text}</p>}
      </div>
    );
  };
  
  export default Loader;