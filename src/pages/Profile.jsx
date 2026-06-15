import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { getUserPlaylists, getLikedSongs } from '../services/playlistService'

export default function Profile() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const { data: playlists = [] } = useQuery({ queryKey: ['playlists'], queryFn: getUserPlaylists })
  const { data: liked = [] }     = useQuery({ queryKey: ['likedSongs'], queryFn: getLikedSongs })

  const handleSignOut = async () => {
    setLoggingOut(true)
    await signOut()
    navigate('/login')
  }

  const initial = profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || '?'
  const publicPlaylists = playlists.filter(p => p.is_public)

  return (
    <div className="max-w-2xl mx-auto px-6 pb-8 pt-6 animate-fade-up">
      {/* Avatar + nom */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-sw-green flex items-center justify-center text-black text-3xl font-black mb-4 overflow-hidden shadow-xl ring-4 ring-sw-green/30">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            : initial
          }
        </div>
        <h1 className="text-2xl font-black text-white">{profile?.full_name || profile?.username || '—'}</h1>
        <p className="text-sw-muted text-sm mt-1">{user?.email}</p>
        {profile?.username && (
          <p className="text-sw-subtle text-xs mt-0.5">@{profile.username}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Playlists',    value: playlists.length },
          { label: 'Titres likés', value: liked.length },
          { label: 'Partagées',    value: publicPlaylists.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-sw-surface rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs text-sw-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Playlists publiques */}
      {publicPlaylists.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sw-green"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Playlists partagées
          </h2>
          <div className="space-y-1">
            {publicPlaylists.map(pl => (
              <button key={pl.id} onClick={() => navigate(`/playlist/${pl.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-sw-surface hover:bg-sw-surface-hover transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-sw-surface-hover overflow-hidden flex-shrink-0">
                  {pl.cover_url
                    ? <img src={pl.cover_url} alt={pl.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">🎶</div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate">{pl.name}</p>
                  <p className="text-sw-muted text-xs">Publique</p>
                </div>
                <span className="text-xs text-sw-green flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sw-green" /> Live
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Infos app */}
      <div className="bg-sw-surface rounded-xl p-4 mb-6">
        <h3 className="text-white font-semibold text-sm mb-3">À propos de SoundWave CM</h3>
        <div className="space-y-1.5 text-xs text-sw-muted">
          <p>Version 1.0.0 — React 19 + Supabase + PWA</p>
          <p>Playlists partagées en temps réel via Supabase Realtime</p>
          <p>Lecture en arrière-plan (Media Session API)</p>
          <p>Application disponible hors ligne (Service Worker)</p>
          <p className="text-sw-green mt-2">🇨🇲 Fait pour la musique camerounaise et africaine</p>
        </div>
      </div>

      {/* Déconnexion */}
      <button onClick={handleSignOut} disabled={loggingOut}
        className="w-full py-3 rounded-full border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50">
        {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
      </button>
    </div>
  )
}
