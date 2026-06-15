import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
      <rect width="40" height="40" rx="12" fill="#1DB954"/>
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <line x1="8" y1="20" x2="8" y2="20"/>
        <line x1="13" y1="14" x2="13" y2="26"/>
        <line x1="18" y1="10" x2="18" y2="30"/>
        <line x1="23" y1="14" x2="23" y2="26"/>
        <line x1="28" y1="17" x2="28" y2="23"/>
        <line x1="33" y1="20" x2="33" y2="20"/>
      </g>
    </svg>
  );
}

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Très faible", color: "bg-red-500" };
  if (score === 2) return { score, label: "Faible", color: "bg-orange-500" };
  if (score === 3) return { score, label: "Moyen", color: "bg-yellow-500" };
  if (score === 4) return { score, label: "Fort", color: "bg-green-500" };
  return { score, label: "Très fort", color: "bg-emerald-400" };
}

export default function Register() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, isLoggedIn, initialized } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (initialized && isLoggedIn) return <Navigate to="/" replace />;

  const strength = passwordStrength(password);

  function validate() {
    const e = {};
    if (!username.trim() || username.length < 3)
      e.username = "Le nom d'utilisateur doit contenir au moins 3 caractères.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      e.email = "Adresse email invalide.";
    if (!password || password.length < 8)
      e.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (!agreed)
      e.agreed = "Tu dois accepter les conditions.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const { error } = await signUp(email, password, username);
    setLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("already registered") || msg.includes("already exists"))
        setErrors({ email: "Un compte existe déjà avec cet email." });
      else
        setErrors({ form: error.message || "Une erreur est survenue." });
    } else {
      navigate("/");
    }
  }

  async function handleGoogle() {
    const { error } = await signInWithGoogle();
    if (error) setErrors({ form: "Connexion Google échouée." });
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-9 w-9"><WaveIcon /></div>
          <span className="text-xl font-black text-white tracking-tight">
            Sound<span className="text-green-400">Wave</span>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Créer un compte</h2>
        <p className="text-sm text-zinc-500 mb-8">Rejoins des millions d'auditeurs.</p>
        <Button variant="secondary" fullWidth onClick={handleGoogle} leftIcon={<GoogleIcon />} className="mb-5">
          Continuer avec Google
        </Button>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-zinc-800"/>
          <span className="text-xs text-zinc-600 font-medium">ou</span>
          <div className="flex-1 h-px bg-zinc-800"/>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input label="Nom d'utilisateur" type="text" placeholder="ton_pseudo" value={username}
            onChange={e => setUsername(e.target.value)} error={errors.username} required autoFocus />
          <Input label="Adresse email" type="email" placeholder="ton@email.com" value={email}
            onChange={e => setEmail(e.target.value)} error={errors.email} required />
          <div className="space-y-2">
            <Input label="Mot de passe" type={showPassword ? "text" : "password"} placeholder="8 caractères minimum"
              value={password} onChange={e => setPassword(e.target.value)} error={errors.password} required
              rightIcon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {showPassword
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>}
              onRightIconClick={() => setShowPassword(v => !v)} />
            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-zinc-800"}`} />
                  ))}
                </div>
                <p className="text-xs text-zinc-500">Force : <span className="font-medium text-zinc-300">{strength.label}</span></p>
              </div>
            )}
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5 shrink-0">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
              <div className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${agreed ? "bg-green-500 border-green-500" : "border-zinc-600"}`}>
                {agreed && <svg className="h-2.5 w-2.5 text-black" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>}
              </div>
            </div>
            <span className="text-xs text-zinc-500 leading-relaxed">
              J'accepte les <span className="text-zinc-300 underline">conditions d'utilisation</span> de SoundWave.
            </span>
          </label>
          {errors.agreed && <p className="text-xs text-red-400">{errors.agreed}</p>}
          {errors.form && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{errors.form}</p>}
          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Créer mon compte
          </Button>
        </form>
        <p className="text-sm text-zinc-500 text-center mt-6">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-white font-semibold hover:text-green-400 transition-colors">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
