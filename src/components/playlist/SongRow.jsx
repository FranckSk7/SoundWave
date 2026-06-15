import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleLikeSong, removeSongFromPlaylist, formatDuration } from '../../services/playlistService'
import usePlayerStore from '../../store/playerStore'

function Equalizer() {
  return (
    <div className="flex items-end gap-px h-3">
      {[1,2,3,4].map(i => (
        <div key={i} className="w-0.5 bg-sw-green rounded-full"
          style={{ height: '60%', animation: `equalizerBar .8s ease-in-out ${i*.1}s infinite alternate` }} />
      ))}
    </div>
  )
}

const HeartIcon = ({ filled }) => filled
  ? <svg viewBox="0 0 24 24" fill="#1DB954" className="w-4 h-4"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sw-muted"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

const RemoveIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>

export default function SongRow({
  index, song, isLiked: initialLiked = false,
  isPlaying, isActive, playlistId, showRemove = false,
  onPlay, onLikeChange,
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [hovered, setHovered] = useState(false)
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: () => toggleLikeSong(song?.id, liked),
    onSuccess: (nowLiked) => {
      setLiked(nowLiked)
      onLikeChange?.(song?.id, nowLiked)
      queryClient.invalidateQueries({ queryKey: ['likedSongIds'] })
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => removeSongFromPlaylist(playlistId, song?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
    },
  })

  if (!song) return null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`grid items-center gap-3 px-4 py-2.5 rounded-lg group transition-colors cursor-pointer ${
        isActive ? 'bg-white/5' : 'hover:bg-white/5'
      }`}
      style={{ gridTemplateColumns: '28px 40px 1fr auto auto auto' }}
      onClick={() => onPlay(song)}
    >
      {/* Index / equalizer */}
      <div className="flex items-center justify-center">
        {isActive && isPlaying
          ? <Equalizer />
          : hovered
            ? <svg viewBox="0 0 24 24" fill={isActive ? '#1DB954' : 'white'} className="w-3.5 h-3.5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
            : <span className={`text-sm tabular-nums ${isActive ? 'text-sw-green' : 'text-sw-muted'}`}>{index}</span>
        }
      </div>

      {/* Cover */}
      <div className="w-10 h-10 rounded bg-sw-surface-hover overflow-hidden flex-shrink-0">
        {song.cover_url
          ? <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
        }
      </div>

      {/* Titre + artiste */}
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-sw-green' : 'text-white'}`}>{song.title}</p>
        <p className="text-xs text-sw-muted truncate">{song.artists?.name || song.artists?.[0]?.name || '—'}</p>
      </div>

      {/* Album (desktop) */}
      <span className="text-xs text-sw-muted truncate hidden md:block max-w-[120px]">
        {song.albums?.name || '—'}
      </span>

      {/* Like / Remove */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); removeMutation.mutate() }}
            className="p-1.5 text-sw-muted hover:text-red-400 transition-colors rounded"
            title="Retirer de la playlist"
          >
            <RemoveIcon />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); likeMutation.mutate() }}
          className="p-1.5 hover:scale-110 transition-transform rounded"
          title={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <HeartIcon filled={liked} />
        </button>
      </div>

      {/* Durée */}
      <span className="text-xs text-sw-muted tabular-nums">{formatDuration(song.duration)}</span>
    </div>
  )
}
