/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  authStore.js — État global d'authentification (Zustand)     ║
 * ║  Membre 2 · SoundWave · feature/auth                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Ce store Zustand contient l'état global lié à l'utilisateur connecté.
 * Il est accessible depuis n'importe quel composant sans prop drilling.
 *
 * ─── ÉTAT (STATE) ────────────────────────────────────────────────
 *  user       {object|null}  L'utilisateur Supabase Auth connecté
 *  profile    {object|null}  Le profil de la table `profiles`
 *  loading    {boolean}      true pendant la vérification initiale
 *  initialized {boolean}     true une fois la session vérifiée au démarrage
 *
 * ─── ACTIONS ─────────────────────────────────────────────────────
 *  setUser(user)           → Met à jour l'utilisateur
 *  setProfile(profile)     → Met à jour le profil
 *  setLoading(bool)        → Met à jour l'état de chargement
 *  setInitialized(bool)    → Marque l'initialisation comme terminée
 *  reset()                 → Remet tout à zéro (déconnexion)
 *
 * ─── UTILISATION ──────────────────────────────────────────────────
 *  // Lire l'état depuis n'importe quel composant
 *  import { useAuthStore } from '../store/authStore';
 *
 *  function MonComposant() {
 *    const user    = useAuthStore(state => state.user);
 *    const profile = useAuthStore(state => state.profile);
 *    const loading = useAuthStore(state => state.loading);
 *    ...
 *  }
 *
 *  // Modifier l'état
 *  const setUser = useAuthStore(state => state.setUser);
 *  setUser(newUser);
 *
 * NOTE : Dans la pratique, utilise plutôt le hook useAuth.js
 * qui encapsule ce store avec toute la logique nécessaire.
 */

import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // ── État initial ──────────────────────────────────────────────
  user:        null,
  profile:     null,
  loading:     true,
  initialized: false,

  // ── Actions ───────────────────────────────────────────────────
  setUser: (user) =>
    set({ user }),

  setProfile: (profile) =>
    set({ profile }),

  setLoading: (loading) =>
    set({ loading }),

  setInitialized: (initialized) =>
    set({ initialized }),

  // Réinitialisation complète à la déconnexion
  reset: () =>
    set({
      user:        null,
      profile:     null,
      loading:     false,
      initialized: true,
    }),
}));
