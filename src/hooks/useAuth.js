import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  signIn           as svcSignIn,
  signUp           as svcSignUp,
  signOut          as svcSignOut,
  signInWithGoogle as svcGoogle,
  resetPassword    as svcReset,
  getSession,
  onAuthStateChange,
} from '../services/authService'
import { supabase } from '../services/supabase'

// Récupère le profil depuis Supabase — Sécurisé contre les crashs
async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.warn('useAuth (fetchProfile): non trouvé ou erreur', error.message)
      return null
    }
    return data ?? null
  } catch (err) {
    console.error('useAuth (fetchProfile) crash critique:', err)
    return null
  }
}

export function useAuth() {
  const {
    user, profile, loading, initialized,
    setUser, setProfile, setLoading, setInitialized, reset,
  } = useAuthStore()

  useEffect(() => {
    if (initialized) return

    let active = true

    // Timeout de sécurité — si tout prend plus de 8s, on débloque l'application quoi qu'il arrive
    const safetyTimer = setTimeout(() => {
      if (active && !useAuthStore.getState().initialized) {
        console.warn('useAuth: timeout de sécurité déclenché')
        setLoading(false)
        setInitialized(true)
      }
    }, 8000)

    async function init() {
      setLoading(true)

      try {
        const { session } = await getSession()
        if (!active) return

        if (session?.user) {
          setUser(session.user)
          const prof = await fetchProfile(session.user.id)
          if (active) setProfile(prof)
        }
      } catch (err) {
        console.error('useAuth init error:', err)
      } finally {
        // TOUJOURS exécuté pour débloquer l'interface au démarrage
        if (active) {
          setLoading(false)
          setInitialized(true)
          clearTimeout(safetyTimer)
        }
      }
    }

    init()

    // Écouter les changements d'état Supabase Auth
    const unsubscribe = onAuthStateChange(async (event, session) => {
      if (!active) return

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        if (active) {
          setProfile(prof)
          setLoading(false)
          setInitialized(true)
        }
      }

      if (event === 'SIGNED_OUT') {
        reset()
        // Sécurité essentielle : s'assurer que l'état se débloque si on est déconnecté
        if (active) {
          setLoading(false)
          setInitialized(true)
        }
      }

      if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      active = false
      clearTimeout(safetyTimer)
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [initialized, setUser, setProfile, setLoading, setInitialized, reset])

  // ── Actions ───────────────────────────────────────────────────────────────

  async function signIn(email, password) {
    setLoading(true)
    try {
      const { user: u, error } = await svcSignIn(email, password)
      if (!error && u) {
        setUser(u)
        const prof = await fetchProfile(u.id)
        setProfile(prof)
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email, password, username) {
    setLoading(true)
    try {
      const { user: u, error } = await svcSignUp(email, password, username)
      if (!error && u) {
        setUser(u)
        const prof = await fetchProfile(u.id)
        setProfile(prof)
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    return svcGoogle()
  }

  async function signOut() {
    try {
      await svcSignOut()
    } finally {
      reset()
    }
  }

  async function resetPassword(email) {
    return svcReset(email)
  }

  return {
    user,
    profile,
    loading,
    initialized,
    isLoggedIn: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  }
}
