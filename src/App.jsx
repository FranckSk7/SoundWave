import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Playlist from './pages/Playlist'
import Artist from './pages/Artist'
import Album from './pages/Album'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Community from './pages/Community'
import Liked from './pages/Liked'
import { useAuth } from './hooks/useAuth'

// Configuration globale du cache pour TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime:    1000 * 60 * 10, // 10 minutes
      retry: 1,
    },
  },
})

// Protection des routes : Redirige vers /login si l'utilisateur n'est pas connecté
function PrivateRoute({ children }) {
  const { isLoggedIn, initialized } = useAuth()
  
  if (!initialized) return (
    <div className="min-h-screen bg-sw-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-sw-muted">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-sm">Chargement…</span>
      </div>
    </div>
  )
  
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

// Gestion de l'installation de l'application (PWA)
function InstallCapture() {
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      window.__swInstallPrompt = () => e.prompt()
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  return null
}

// Définition du système de routage de SoundWave
function AppRoutes() {
  return (
    <>
      <InstallCapture />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Private Routes (Wrapped inside MainLayout) */}
          <Route element={<MainLayout />}>
            <Route path="/"             element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/search"       element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="/library"      element={<PrivateRoute><Library /></PrivateRoute>} />
            <Route path="/community"    element={<PrivateRoute><Community /></PrivateRoute>} />
            <Route path="/liked"        element={<PrivateRoute><Liked /></PrivateRoute>} />
            <Route path="/playlist/:id" element={<PrivateRoute><Playlist /></PrivateRoute>} />
            <Route path="/artist/:id"   element={<PrivateRoute><Artist /></PrivateRoute>} />
            <Route path="/album/:id"    element={<PrivateRoute><Album /></PrivateRoute>} />
            <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Route>
          
          {/* Fallback : Redirection automatique vers l'accueil pour les routes inconnues */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

// Composant racine de l'application
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  )
}
