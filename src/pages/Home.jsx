import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPopularSongs, getRecentSongs, getAllArtists, getAllAlbums } from '../services/songsService'
import { getPublicPlaylists } from '../services/playlistService'
import { useAuth } from '../hooks/useAuth'
import usePlayerStore from '../store/playerStore'

// ── Icônes ───────────────────────────────────────────────────────────────────
const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>

function Equalizer() {
  return (
    <div className="flex items-end gap-px h-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="w-0.5 bg-sw-green rounded-full"
          style={{ height: '60%', animation: `equalizerBar 1s ease-in-out ${i * 0.12}s infinite alternate` }} />
      ))}
    </div>
  )
}

// ── Composants Cards ─────────────────────────────────────────────────────────
function SongCard({ song }) {
  const { playSong, currentSong, isPlaying, queue, setQueue } = usePlayerStore()
  const isActive = currentSong?.id === song.id

  return (
    <div
      className="flex-shrink-0 w-40 cursor-pointer group"
      onClick={() => playSong(song)}
    >
      <div className="relative w-40 h-40 bg-sw-surface rounded-lg mb-3 overflow-hidden shadow-lg">
        {song.cover_url
          ? <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
        }
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isActive && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-10 h-10 rounded-full bg-sw-green flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            {isActive && isPlaying ? <Equalizer /> : <PlayIcon />}
          </div>
        </div>
        {isActive && isPlaying && (
          <div className="absolute bottom-2 right-2"><Equalizer /></div>
        )}
      </div>
      <p className="text-white text-sm font-semibold truncate">{song.title}</p>
      <p className="text-sw-muted text-xs truncate">{song.artists?.name}</p>
    </div>
  )
}

function ArtistCard({ artist }) {
  const navigate = useNavigate()
  return (
    <div className="flex-shrink-0 w-40 cursor-pointer group text-center" onClick={() => navigate(`/artist/${artist.id}`)}>
      <div className="relative w-40 h-40 rounded-full overflow-hidden bg-sw-surface mb-3 shadow-lg mx-auto">
        {artist.image_url
          ? <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">🎤</div>
        }
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
      </div>
      <p className="text-white text-sm font-semibold truncate">{artist.name}</p>
      <p className="text-sw-muted text-xs">Artiste</p>
    </div>
  )
}

function PlaylistCard({ playlist }) {
  const navigate = useNavigate()
  const songCount = playlist.playlist_songs?.[0]?.count ?? 0
  return (
    <div className="flex-shrink-0 w-40 cursor-pointer group" onClick={() => navigate(`/playlist/${playlist.id}`)}>
      <div className="relative w-40 h-40 bg-sw-surface rounded-lg mb-3 overflow-hidden shadow-lg">
        {playlist.cover_url
          ? <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          : <div className="w-full h-full bg-gradient-to-br from-sw-surface-hover to-sw-surface-2 flex items-center justify-center text-4xl">🎶</div>
        }
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="w-10 h-10 rounded-full bg-sw-green flex items-center justify-center"><PlayIcon /></div>
        </div>
        {/* Badge partage en temps réel */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-sw-green font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sw-green" />
          Live
        </div>
      </div>
      <p className="text-white text-sm font-semibold truncate">{playlist.name}</p>
      <p className="text-sw-muted text-xs truncate">
        {playlist.profiles?.username || 'Communauté'} · {songCount} titre{songCount > 1 ? 's' : ''}
      </p>
    </div>
  )
}

function Section({ title, emoji, children, loading }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40">
                <div className="w-40 h-40 bg-sw-surface rounded-lg mb-3 animate-pulse" />
                <div className="h-3 bg-sw-surface rounded animate-pulse mb-2" />
                <div className="h-3 bg-sw-surface rounded animate-pulse w-2/3" />
              </div>
            ))
          : children
        }
      </div>
    </div>
  )
}

// ── Catégories musicales camerounaises ────────────────────────────────────────
const CATEGORIES = [
  { name: 'Makossa',    color: 'from-green-800 to-green-600',   emoji: '🥁' },
  { name: 'Bikutsi',   color: 'from-yellow-700 to-yellow-500',  emoji: '🪘' },
  { name: 'Afrobeat',  color: 'from-orange-800 to-orange-600',  emoji: '🎸' },
  { name: 'Coupé-Décalé', color: 'from-red-800 to-red-600',    emoji: '💃' },
  { name: 'Gospel CM', color: 'from-purple-800 to-purple-600',  emoji: '🙏' },
  { name: 'Hip-Hop CM', color: 'from-blue-800 to-blue-600',     emoji: '🎤' },
  { name: 'Ndombolo',  color: 'from-pink-800 to-pink-600',      emoji: '🎶' },
  { name: 'Zouk CM',   color: 'from-teal-800 to-teal-600',      emoji: '🌙' },
]

// ── Page Home ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { profile } = useAuth()
  const { setQueue, playSong } = usePlayerStore()

  const { data: popularSongs = [], isLoading: l1 } = useQuery({ queryKey: ['popular'], queryFn: getPopularSongs })
  const { data: recentSongs  = [], isLoading: l2 } = useQuery({ queryKey: ['recent'],  queryFn: getRecentSongs  })
  const { data: artists      = [], isLoading: l3 } = useQuery({ queryKey: ['artists'], queryFn: getAllArtists   })
  const { data: publicPlaylists = [], isLoading: l4 } = useQuery({ queryKey: ['publicPlaylists'], queryFn: getPublicPlaylists, staleTime: 10_000 })

  useEffect(() => {
    if (popularSongs.length) setQueue(popularSongs)
  }, [popularSongs])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const name = profile?.full_name?.split(' ')[0] || profile?.username || ''

  return (
    <div className="px-6 pb-8 pt-4 animate-fade-up">

      {/* ── Hero greeting ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">
          {greeting()}{name ? `, ${name}` : ''} 👋
        </h1>
        <p className="text-sw-muted text-sm">Découvrez la musique camerounaise et africaine</p>
      </div>

      {/* ── Catégories camerounaises ── */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">🇨🇲 Genres camerounais</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(cat => (
            <div key={cat.name}
              className={`relative bg-gradient-to-br ${cat.color} rounded-xl p-4 h-20 cursor-pointer overflow-hidden hover:scale-[1.02] transition-transform`}
            >
              <span className="font-bold text-white text-sm">{cat.name}</span>
              <span className="absolute bottom-2 right-3 text-3xl opacity-80">{cat.emoji}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tendances ── */}
      <Section title="Tendances du moment" emoji="🔥" loading={l1}>
        {popularSongs.map(s => <SongCard key={s.id} song={s} />)}
      </Section>

      {/* ── Playlists partagées en temps réel ── */}
      {(l4 || publicPlaylists.length > 0) && (
        <Section title="Playlists de la communauté" emoji="🌍" loading={l4}>
          {publicPlaylists.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)}
        </Section>
      )}

      {/* ── Nouveautés ── */}
      <Section title="Nouvelles sorties" emoji="🆕" loading={l2}>
        {recentSongs.map(s => <SongCard key={s.id} song={s} />)}
      </Section>

      {/* ── Artistes ── */}
      <Section title="Artistes populaires" emoji="🎤" loading={l3}>
        {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
      </Section>

      {/* ── Bannière promo offline ── */}
      <div className="rounded-2xl bg-gradient-to-r from-sw-green-dark/40 to-sw-green/20 border border-sw-green/20 p-5 flex items-center gap-4">
        <div className="text-3xl">📱</div>
        <div>
          <p className="font-bold text-white text-sm">Disponible hors ligne</p>
          <p className="text-sw-muted text-xs mt-0.5">SoundWave fonctionne même sans connexion. Installez l'appli pour une expérience optimale.</p>
        </div>
        <button
          onClick={() => window.__swInstallPrompt?.()}
          className="ml-auto flex-shrink-0 px-4 py-2 rounded-full bg-sw-green text-black text-xs font-bold hover:bg-sw-green-light transition-colors"
        >
          Installer
        </button>
      </div>
    </div>
  )
}
