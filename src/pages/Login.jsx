/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Login.jsx — Page de connexion                               ║
 * ║  Membre 2 · SoundWave · feature/auth                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Page de connexion avec :
 *   - Connexion email / mot de passe
 *   - Connexion via Google (OAuth)
 *   - Lien vers la page d'inscription
 *   - Lien de réinitialisation de mot de passe
 *   - Gestion des erreurs avec messages clairs
 *   - Redirection automatique si déjà connecté
 *
 * ─── DÉPENDANCES (tous créés par les autres membres) ─────────────
 *  useAuth          → hooks/useAuth.js        (Membre 2)
 *  Button           → components/ui/Button.jsx (Membre 8)
 *  Input            → components/ui/Input.jsx  (Membre 8)
 */

import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

// ── Icône Google ──────────────────────────────────────────────────
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

// ── Icône SoundWave ───────────────────────────────────────────────
function WaveIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
      <rect width="40" height="40" rx="12" fill="#1DB954"/>
      <g stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <line x1="8"  y1="20" x2="8"  y2="20"/>
        <line x1="13" y1="14" x2="13" y2="26"/>
        <line x1="18" y1="10" x2="18" y2="30"/>
        <line x1="23" y1="14" x2="23" y2="26"/>
        <line x1="28" y1="17" x2="28" y2="23"/>
        <line x1="33" y1="20" x2="33" y2="20"/>
      </g>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isLoggedIn, initialized, resetPassword } = useAuth();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [googleLoad,   setGoogleLoad]   = useState(false);
  const [error,        setError]        = useState("");
  const [resetSent,    setResetSent]    = useState(false);
  const [showReset,    setShowReset]    = useState(false);
  const [resetEmail,   setResetEmail]   = useState("");

  // Déjà connecté → redirection directe
  if (initialized && isLoggedIn) return <Navigate to="/" replace />;

  // ── Connexion email / mot de passe ──────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim())    return setError("L'adresse email est requise.");
    if (!password)        return setError("Le mot de passe est requis.");

    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);

    if (err) {
      const msg = err.message?.toLowerCase() ?? "";
      if (msg.includes("invalid login"))  setError("Email ou mot de passe incorrect.");
      else if (msg.includes("email"))     setError("Adresse email invalide.");
      else                                setError("Une erreur est survenue. Réessayez.");
    } else {
      navigate("/");
    }
  }

  // ── Connexion Google ────────────────────────────────────────────
  async function handleGoogle() {
    setGoogleLoad(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError("Connexion Google échouée. Réessayez.");
      setGoogleLoad(false);
    }
    // Si ok → Supabase redirige automatiquement
  }

  // ── Réinitialisation mot de passe ───────────────────────────────
  async function handleReset(e) {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    const { error: err } = await resetPassword(resetEmail);
    if (!err) setResetSent(true);
    else setError("Impossible d'envoyer l'email. Vérifiez l'adresse.");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* ── Panneau gauche — visuel décoratif (desktop seulement) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-16">
        {/* Fond avec formes abstraites */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-green-400/5  blur-3xl translate-x-1/3  translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-emerald-600/8 blur-2xl -translate-x-1/2 -translate-y-1/2" />

        {/* Barres d'ondes sonores décoratives */}
        <div className="absolute bottom-24 left-16 flex items-end gap-1.5 opacity-20">
          {[40, 70, 55, 90, 45, 75, 60, 85, 50, 65].map((h, i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-green-400"
              style={{
                height: `${h}px`,
                animationName: "waveBar",
                animationDuration: `${0.8 + i * 0.15}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDirection: "alternate",
              }}
            />
          ))}
        </div>

        {/* Contenu central */}
        <div className="relative z-10 text-center">
          <div className="h-20 w-20 mx-auto mb-8">
            <WaveIcon />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-4">
            Sound<span className="text-green-400">Wave</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-xs mx-auto">
            Des millions de titres.<br/>Écoutez librement.
          </p>

          {/* Faux témoignages décoratifs */}
          <div className="mt-12 space-y-3">
            {[
              { name: "Kamga T.", text: "L'appli qui tue." },
              { name: "Bella N.", text: "Trop bien fait." },
            ].map(({ name, text }) => (
              <div key={name} className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 text-left">
                <p className="text-zinc-300 text-sm">"{text}"</p>
                <p className="text-zinc-500 text-xs mt-1">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="h-9 w-9"><WaveIcon /></div>
            <span className="text-xl font-black text-white tracking-tight">
              Sound<span className="text-green-400">Wave</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {showReset ? "Mot de passe oublié" : "Connexion"}
          </h2>
          <p className="text-sm text-zinc-500 mb-8">
            {showReset
              ? "Saisis ton email pour recevoir un lien de réinitialisation."
              : "Bienvenue. Connecte-toi pour continuer."}
          </p>

          {/* ── Mode reset mot de passe ── */}
          {showReset ? (
            resetSent ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-sm text-green-300">
                Email envoyé ! Vérifie ta boîte mail.
                <button
                  onClick={() => { setShowReset(false); setResetSent(false); }}
                  className="block mt-3 text-green-400 hover:text-green-300 font-medium underline underline-offset-2"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="ton@email.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  autoFocus
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" fullWidth>Envoyer le lien</Button>
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setError(""); }}
                  className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Annuler
                </button>
              </form>
            )
          ) : (
            <>
              {/* ── Bouton Google ── */}
              <Button
                variant="secondary"
                fullWidth
                loading={googleLoad}
                onClick={handleGoogle}
                leftIcon={<GoogleIcon />}
                className="mb-6"
              >
                Continuer avec Google
              </Button>

              {/* Séparateur */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600 font-medium">ou</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* ── Formulaire email ── */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />

                <Input
                  label="Mot de passe"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  rightIcon={
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {showPassword
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  }
                  onRightIconClick={() => setShowPassword(v => !v)}
                />

                {/* Lien reset */}
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setError(""); }}
                    className="text-xs text-zinc-500 hover:text-green-400 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                  <p className="flex items-center gap-1.5 text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={loading}
                >
                  Se connecter
                </Button>
              </form>

              {/* Lien inscription */}
              <p className="text-sm text-zinc-500 text-center mt-6">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-white font-semibold hover:text-green-400 transition-colors">
                  Créer un compte
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Styles pour l'animation des barres */}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1);   }
        }
      `}</style>
    </div>
  );
}
