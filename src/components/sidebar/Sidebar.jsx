import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getUserPlaylists } from '../../services/playlistService'
import { subscribeToPublicPlaylists, unsubscribe } from '../../services/playlistService'
import { useAuth } from '../../hooks/useAuth'
import usePlayerStore from '../../store/playerStore'
import UploadSong from '../UploadSong'

// ── Icônes ────────────────────────────────────────────────────────────────────
const Icons = {
  Home:      ({ filled }) => filled
    ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search:  ({ filled }) => filled
    ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Library: ({ filled }) => filled
    ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Globe:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  Plus:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>,
  Note:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>,
  Dot:     () => <span className="w-1.5 h-1.5 rounded-full bg-sw-green flex-shrink-0 mt-0.5" />,
  Upload:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>,
}

const navItems = [
  { to: '/',        label: 'Accueil',       icon: Icons.Home },
  { to: '/search',  label: 'Rechercher',      icon: Icons.Search },
  { to: '/library', label: 'Ma bibliothèque', icon: Icons.Library },
  { to: '/community', label: 'Communauté',    icon: Icons.Globe },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { currentSong, isPlaying } = usePlayerStore()
  const [newPlaylists, setNewPlaylists] = useState([])
  
  // État local pour afficher/masquer la fenêtre d'upload
  const [showUploadModal, setShowUploadModal] = useState(false)

  // On passe explicitement le profile.id et on n'exécute la requête que s'il est chargé
  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists', profile?.id],
    queryFn: () => getUserPlaylists(profile?.id),
    enabled: !!profile?.id,
    staleTime: 30_000,
  })

  // ── Realtime : nouvelles playlists publiques d'autres users ─────
  useEffect(() => {
    const channel = subscribeToPublicPlaylists((playlist) => {
      const userId = profile?.id
      if (playlist.user_id !== userId) {
        setNewPlaylists(prev => {
          const exists = prev.find(p => p.id === playlist.id)
          if (exists) return prev.map(p => p.id === playlist.id ? playlist : p)
          return [playlist, ...prev.slice(0, 4)]
        })
      }
    })
    return () => unsubscribe(channel)
  }, [profile?.id])

  const avatarInitial = profile?.username?.[0]?.toUpperCase() || profile?.full_name?.[0]?.toUpperCase() || '?'

  return (
    <div className="flex flex-col h-full bg-sw-bg select-none overflow-hidden relative">

      {/* ── Logo ── */}
      <div className="px-6 py-5 flex-shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 group">
          <div className="flex gap-0.5 items-end mr-2">
            {[5, 9, 7, 11, 8, 6].map((h, i) => (
              <div key={i} className="w-1 bg-sw-green rounded-full opacity-80 group-hover:opacity-100 transition-all"
                style={{ height: `${h}px`, transitionDelay: `${i * 30}ms` }} />
            ))}
          </div>
          <span className="font-black text-xl tracking-tight text-white">Sound<span className="text-sw-green">Wave</span></span>
        </button>
      </div>

      {/* ── Navigation principale ── */}
      <nav className="px-3 flex-shrink-0">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-150 font-semibold text-sm mb-0.5 ${
                isActive ? 'bg-sw-surface-hover text-white' : 'text-sw-muted hover:text-white hover:bg-sw-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon filled={isActive} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* ── NOUVEAU : Bouton pour ouvrir la modale d'upload de son ── */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg transition-all duration-150 font-semibold text-sm text-sw-muted hover:text-sw-green hover:bg-sw-surface/50 text-left mt-1"
        >
          <Icons.Upload />
          Ajouter un son
        </button>
      </nav>

      <hr className="border-white/5 mx-4 my-3" />

      {/* ── Section Playlists ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-bold text-sw-subtle uppercase tracking-widest">Mes playlists</span>
          <button
            onClick={() => navigate('/library')}
            className="w-7 h-7 rounded-full bg-sw-surface hover:bg-sw-surface-hover text-sw-muted hover:text-white flex items-center justify-center transition-colors"
            title="Créer une playlist"
          >
            <Icons.Plus />
          </button>
        </div>

        {/* Titres likés */}
        <NavLink to="/liked"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm mb-0.5 ${
              isActive ? 'bg-sw-surface-hover text-white' : 'text-sw-muted hover:text-white hover:bg-sw-surface'
            }`
          }
        >
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-white">Titres likés</p>
          </div>
        </NavLink>

        {/* Playlists de l'utilisateur */}
        <div className="space-y-0.5">
          {playlists.map(pl => {
            const isCurrentCtx = currentSong && usePlayerStore.getState().playlistContext === pl.id
            return (
              <NavLink key={pl.id} to={`/playlist/${pl.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                    isActive ? 'bg-sw-surface-hover text-white' : 'text-sw-muted hover:text-white hover:bg-sw-surface'
                  }`
                }
              >
                <div className="w-8 h-8 rounded bg-sw-surface-hover flex-shrink-0 overflow-hidden">
                  {pl.cover_url
                    ? <img src={pl.cover_url} alt={pl.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sw-subtle"><Icons.Note /></div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{pl.name}</p>
                </div>
                {isCurrentCtx && isPlaying && (
                  <div className="flex items-end gap-px h-3 flex-shrink-0">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-0.5 bg-sw-green rounded-full animate-[equalizerBar_1s_ease-in-out_infinite_alternate]"
                        style={{ height: '60%', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Playlists communauté (realtime) */}
        {newPlaylists.length > 0 && (
          <>
            <div className="px-3 mt-4 mb-2">
              <span className="text-xs font-bold text-sw-subtle uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sw-green animate-pulse" />
                Communauté
              </span>
            </div>
            {newPlaylists.map(pl => (
              <NavLink key={pl.id} to={`/playlist/${pl.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sw-muted hover:text-white hover:bg-sw-surface transition-all"
              >
                <div className="w-8 h-8 rounded bg-sw-surface-hover flex-shrink-0 overflow-hidden">
                  {pl.cover_url
                    ? <img src={pl.cover_url} alt={pl.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sw-subtle"><Icons.Note /></div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{pl.name}</p>
                  <p className="text-xs text-sw-subtle truncate">Communauté</p>
                </div>
                <Icons.Dot />
              </NavLink>
            ))}
          </>
        )}
      </div>

      {/* ── Profil en bas ── */}
      {profile && (
        <div className="px-3 pb-4 pt-2 border-t border-white/5 flex-shrink-0">
          <NavLink to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive ? 'bg-sw-surface-hover text-white' : 'text-sw-muted hover:text-white hover:bg-sw-surface'
              }`
            }
          >
            <div className="w-8 h-8 rounded-full bg-sw-green flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover rounded-full" />
                : avatarInitial
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">{profile.full_name || profile.username}</p>
              <p className="text-xs text-sw-subtle truncate">Voir le profil</p>
            </div>
          </NavLink>
        </div>
      )}

      {/* ── NOUVEAU : Fenêtre Modale d'upload en surcouche (Overlay) ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Bouton de fermeture de la modale */}
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-sw-muted hover:text-white text-xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
            >
              ✕
            </button>
            
            {/* Injection du formulaire d'upload */}
            <UploadSong onClose={() => setShowUploadModal(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
