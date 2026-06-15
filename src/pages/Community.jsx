import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPublicPlaylists, subscribeToPublicPlaylists, unsubscribe } from '../services/playlistService'
import usePlayerStore from '../store/playerStore'

function PlaylistCard({ playlist }) {
  const navigate = useNavigate()
  const songCount = playlist.playlist_songs?.[0]?.count ?? playlist.playlist_songs?.length ?? 0

  return (
    <div
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      className="bg-sw-surface rounded-xl overflow-hidden cursor-pointer group hover:bg-sw-surface-hover transition-all duration-200 animate-fade-up"
    >
      <div className="relative aspect-square overflow-hidden">
        {playlist.cover_url
          ? <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full bg-gradient-to-br from-sw-surface-hover to-sw-surface-2 flex items-center justify-center text-5xl">🎶</div>
        }
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <div className="w-12 h-12 rounded-full bg-sw-green flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-white text-sm truncate">{playlist.name}</p>
        <p className="text-sw-muted text-xs truncate mt-0.5">
          Par {playlist.profiles?.username || 'Anonyme'} · {songCount} titre{songCount > 1 ? 's' : ''}
        </p>
        {playlist.description && (
          <p className="text-sw-subtle text-xs mt-1 line-clamp-2">{playlist.description}</p>
        )}
      </div>
    </div>
  )
}

export default function Community() {
  const queryClient = useQueryClient()
  const [liveUpdates, setLiveUpdates] = useState(0)

  const { data: playlists = [], isLoading, isError } = useQuery({
    queryKey: ['publicPlaylists'],
    queryFn: getPublicPlaylists,
    staleTime: 5_000,
  })

  // Realtime — nouvelles playlists publiques
  useEffect(() => {
    const channel = subscribeToPublicPlaylists(() => {
      setLiveUpdates(n => n + 1)
      queryClient.invalidateQueries({ queryKey: ['publicPlaylists'] })
    })
    return () => unsubscribe(channel)
  }, [])

  return (
    <div className="px-6 pb-8 pt-4 animate-fade-up">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            🌍 Communauté
            {liveUpdates > 0 && (
              <span className="text-xs bg-sw-green text-black px-2 py-0.5 rounded-full font-bold animate-fade-in">
                {liveUpdates} new
              </span>
            )}
          </h1>
          <p className="text-sw-muted text-sm">
            Playlists partagées par la communauté · Mise à jour en temps réel
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-sw-green bg-sw-green/10 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-sw-green animate-pulse" />
          Live
        </div>
      </div>

      {/* Bannière info partage */}
      <div className="bg-sw-surface-2 border border-white/5 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="text-2xl mt-0.5">💡</div>
        <div>
          <p className="text-white text-sm font-semibold">Comment partager une playlist ?</p>
          <p className="text-sw-muted text-xs mt-1">
            Allez dans <strong className="text-white">Ma bibliothèque</strong>, créez ou modifiez une playlist et activez
            <strong className="text-white"> "Rendre publique"</strong>. Elle apparaîtra ici immédiatement pour tous les utilisateurs !
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-sw-surface rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-sw-surface-hover" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-sw-surface-hover rounded w-3/4" />
                <div className="h-2.5 bg-sw-surface-hover rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-sw-muted">
          <p className="text-lg mb-2">Impossible de charger les playlists</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['publicPlaylists'] })}
            className="text-sw-green hover:underline text-sm">Réessayer</button>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-white font-semibold text-lg mb-1">Aucune playlist publique pour l'instant</p>
          <p className="text-sw-muted text-sm">Soyez le premier à partager une playlist avec la communauté !</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)}
        </div>
      )}
    </div>
  )
}
