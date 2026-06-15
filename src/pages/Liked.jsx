import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getLikedSongs, toggleLikeSong, formatDuration, formatTotalDuration } from '../services/playlistService'
import usePlayerStore from '../store/playerStore'

const HeartFilled = () => (
  <svg viewBox="0 0 24 24" fill="#1DB954" className="w-5 h-5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

function Equalizer() {
  return (
    <div className="flex items-end gap-px h-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="w-0.5 bg-sw-green rounded-full"
          style={{ height: '60%', animation: `equalizerBar .8s ease-in-out ${i * .1}s infinite alternate` }} />
      ))}
    </div>
  )
}

function SongRow({ song, index, isActive, isPlaying, onPlay, onUnlike }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(song)}
      className={`grid items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-white/5' : 'hover:bg-white/5'
      }`}
      style={{ gridTemplateColumns: '28px 44px 1fr auto auto' }}
    >
      {/* Index / play indicator */}
      <div className="flex items-center justify-center">
        {isActive && isPlaying
          ? <Equalizer />
          : hovered
            ? <svg viewBox="0 0 24 24" fill={isActive ? '#1DB954' : 'white'} className="w-3.5 h-3.5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
            : <span className={`text-sm tabular-nums ${isActive ? 'text-sw-green' : 'text-sw-muted'}`}>{index}</span>
        }
      </div>

      {/* Cover */}
      <div className="w-11 h-11 rounded-md overflow-hidden flex-shrink-0 bg-sw-surface-hover">
        {song.cover_url
          ? <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
        }
      </div>

      {/* Titre + artiste */}
      <div className="min-w-0">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-sw-green' : 'text-white'}`}>{song.title}</p>
        {/* 🔥 CORRIGÉ : On lit directement song.artist au lieu de song.artists?.name */}
        <p className="text-xs text-sw-muted truncate">{song.artist || 'Artiste inconnu'}</p>
      </div>

      {/* Unlike */}
      <button
        onClick={e => { e.stopPropagation(); onUnlike(song.id) }}
        className={`p-1.5 transition-all rounded ${hovered ? 'opacity-100' : 'opacity-0'} hover:scale-110`}
        title="Retirer des favoris"
      >
        <HeartFilled />
      </button>

      {/* Durée */}
      <span className="text-xs text-sw-muted tabular-nums">{formatDuration(song.duration)}</span>
    </div>
  )
}

export default function Liked() {
  const queryClient = useQueryClient()
  const { playSong, currentSong, isPlaying } = usePlayerStore()
  const [likedOverrides, setLikedOverrides] = useState({})

  const { data: songs = [], isLoading, isError } = useQuery({
    queryKey: ['likedSongs'],
    queryFn: getLikedSongs,
    // On s'assure que si getLikedSongs() renvoie directement le tableau plat des morceaux nettoyés,
    // on l'associe correctement ici.
    select: (data) => data || [],
  })

  // Filtrer les morceaux retirés localement en temps réel
  const visibleSongs = songs.filter(song => likedOverrides[song.id] !== false)

  const totalDuration = visibleSongs.reduce((s, song) => s + (song.duration || 0), 0)

  const handlePlay = useCallback((song) => {
    const idx = visibleSongs.findIndex(s => s.id === song.id)
    playSong(song, visibleSongs, idx >= 0 ? idx : 0)
  }, [visibleSongs, playSong])

  const handlePlayAll = () => {
    if (!visibleSongs.length) return
    playSong(visibleSongs[0], visibleSongs, 0)
  }

  const handleUnlike = async (songId) => {
    setLikedOverrides(prev => ({ ...prev, [songId]: false }))
    try {
      await toggleLikeSong(songId, true)
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] })
      queryClient.invalidateQueries({ queryKey: ['likedSongIds'] })
    } catch {
      // Annulation du masquage si Supabase échoue
      setLikedOverrides(prev => { const n = { ...prev }; delete n[songId]; return n })
    }
  }

  return (
    <div className="min-h-full animate-fade-in">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 via-purple-900/40 to-sw-bg" />
        <div className="relative flex flex-col sm:flex-row gap-6 px-6 pt-8 pb-8 items-end">
          <div className="w-44 h-44 sm:w-56 sm:h-56 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl mx-auto sm:mx-0
            bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-20 h-20 opacity-90">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>

          <div className="flex flex-col gap-2 min-w-0 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-sw-muted font-medium">Playlist</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">Titres likés</h1>
            <div className="text-xs text-sw-muted flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
              <span className="font-semibold text-white/90">Votre bibliothèque</span>
              <span>·</span>
              <span>{visibleSongs.length} titre{visibleSongs.length !== 1 ? 's' : ''}</span>
              {totalDuration > 0 && (
                <>
                  <span>·</span>
                  <span>{formatTotalDuration(totalDuration)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Boutons d'action ── */}
      {visibleSongs.length > 0 && (
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-sw-green flex items-center justify-center text-black shadow-lg hover:scale-105 hover:bg-sw-green-light transition-all">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button
            onClick={() => { usePlayerStore.getState().toggleShuffle(); handlePlayAll() }}
            className="text-sw-muted hover:text-white transition-colors"
            title="Lecture aléatoire"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
              <line x1="4" y1="4" x2="9" y2="9"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Contenu ── */}
      <div className="px-6 pb-8">
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
                <div className="w-6 h-3 rounded bg-sw-surface" />
                <div className="w-11 h-11 rounded-md bg-sw-surface" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-36 rounded bg-sw-surface" />
                  <div className="h-2.5 w-24 rounded bg-sw-surface" />
                </div>
                <div className="h-3 w-10 rounded bg-sw-surface" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-sw-muted">
            <p className="text-white font-semibold mb-2">Impossible de charger vos titres</p>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['likedSongs'] })}
              className="text-sw-green hover:underline text-sm">Réessayer</button>
          </div>
        ) : visibleSongs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-sw-surface mx-auto mb-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-sw-muted">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p className="text-white font-semibold text-lg mb-1">Aucun titre liké pour l'instant</p>
            <p className="text-sw-muted text-sm">Cliquez sur le cœur sur un titre pour l'ajouter ici</p>
          </div>
        ) : (
          <>
            <div className="grid items-center gap-3 px-4 mb-2 border-b border-white/5 pb-2"
              style={{ gridTemplateColumns: '28px 44px 1fr auto auto' }}>
              <span className="text-xs text-sw-muted text-center">#</span>
              <span />
              <span className="text-xs text-sw-muted uppercase tracking-wider">Titre</span>
              <span />
              <span className="text-xs text-sw-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
            </div>

            <div className="space-y-0.5">
              {visibleSongs.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i + 1}
                  isActive={currentSong?.id === song.id}
                  isPlaying={isPlaying && currentSong?.id === song.id}
                  onPlay={handlePlay}
                  onUnlike={handleUnlike}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
