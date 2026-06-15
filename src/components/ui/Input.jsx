import { useState } from "react";

const Input = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  disabled = false,
  icon = null,
  hint = "",
  className = "",
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">

      {/* Label */}
      {label && (
        <label className={`text-sm font-semibold transition-colors duration-200 ${focused ? "text-green-400" : "text-white/70"}`}>
          {label}
        </label>
      )}

      {/* Wrapper input */}
      <div className={`
        relative flex items-center
        bg-white/5 border rounded-xl px-4 py-2.5
        transition-all duration-300
        ${focused
          ? "border-green-500 bg-white/10 shadow-lg shadow-green-500/10"
          : error
          ? "border-red-500/70 bg-red-500/5"
          : "border-white/10 hover:border-white/25"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}>

        {/* Icône gauche */}
        {icon && (
          <span className={`mr-3 text-lg transition-colors duration-200 ${focused ? "text-green-400" : "text-white/40"}`}>
            {icon}
          </span>
        )}

        {/* Champ */}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            flex-1 bg-transparent text-white text-sm
            placeholder-white/30 focus:outline-none
            disabled:cursor-not-allowed
            ${className}
          `}
        />

        {/* Toggle mot de passe */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-white/40 hover:text-white/80 transition-colors duration-200 focus:outline-none"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        )}
      </div>

      {/* Hint ou Erreur */}
      {error ? (
        <span className="text-xs text-red-400 flex items-center gap-1">
          ⚠️ {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-white/40">{hint}</span>
      ) : null}

    </div>
  );
};

export default Input;