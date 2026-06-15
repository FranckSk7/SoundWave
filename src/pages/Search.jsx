import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MoreHorizontal, Plus, Search as SearchIcon, X } from 'lucide-react'
import { supabase } from '../services/supabase'
import usePlayerStore from '../store/playerStore'
import { formatDuration, getUserPlaylists, addSongToPlaylist } from '../services/playlistService'

const GENRES = [
  { name: 'Makossa',      color: 'bg-green-700',  emoji: '🥁' },
  { name: 'Bikutsi',      color: 'bg-yellow-700', emoji: '🪘' },
  { name: 'Afrobeat',     color: 'bg-orange-700', emoji: '🎸' },
  { name: 'Coupé-Décalé', color: 'bg-red-700',    emoji: '💃' },
  { name: 'Gospel CM',    color: 'bg-purple-700', emoji: '🙏' },
  { name: 'Hip-Hop CM',   color: 'bg-blue-700',   emoji: '🎤' },
  { name: 'Ndombolo',     color: 'bg-pink-700',   emoji: '🎶' },
  { name: 'Zouk CM',      color: 'bg-teal-700',   emoji: '🌙' },
  { name: 'Rumba',        color: 'bg-amber-700',  emoji: '🌴' },
  { name: 'Highlife',     color: 'bg-lime-700',   emoji: '🎺' },
  { name: 'R&B Afro',     color: 'bg-violet-700', emoji: '✨' },
  { name: 'Traditionnel', color: 'bg-stone-700',  emoji: '🎵' },
]

async function searchAll(q) {
  if (!q?.trim()) return { songs: [], artists: [], playlists: [] }

  const [songs, artists, playlists] = await Promise.all([
    supabase.from('songs')
      .select('id, title, duration, audio_url, cover_url, artist, album')
      .ilike('title', `%${q}%`)
      .limit(8),
    supabase.from('artists')
      .select('id, name, image_url')
      .ilike('name', `%${q}%`)
      .limit(4),
    supabase.from('playlists')
      .select('id, name, cover_url, is_public')
      .eq('is_public', true)
      .ilike('name', `%${q}%`)
      .limit(4),
  ])

  return {
    songs:     songs.data     || [],
    artists:   artists.data   || [],
    playlists: playlists.data || [],
  }
}

function SongResult({ song, index, onPlay, isActive, isPlaying }) {
  const [showMenu, setShowMenu] = useState(false)
  const [playlists, setPlaylists] = useState([])

  useEffect(() => {
    if (showMenu) {
      getUserPlaylists()
        .then(data => setPlaylists(data))
        .catch(err => console.error("Erreur playlists:", err))
    }
  }, [showMenu])

  const handleAddSong = async (playlistId) => {
    try {
      await addSongToPlaylist(playlistId, song.id)
      alert(`Ajouté à la playlist avec succès !`)
      setShowMenu(false)
    } catch (error) {
      alert(error.message || "Erreur lors de l'ajout")
    }
  }

  return (
    <div
      onClick={() => onPlay(song)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors relative ${
        isActive ? 'bg-sw-surface-hover' : 'hover:bg-sw-surface'
      }`}
    >
      <span className="w-5 text-center text-xs text-sw-muted group-hover:hidden">{index + 1}</span>
      <div className="w-5 hidden group-hover:flex items-center justify-center">
        {isActive && isPlaying ? (
          <div className="flex items-end gap-px h-3">
            <div className="w-0.5 bg-sw-green rounded-full h-3 animate-pulse" />
            <div className="w-0.5 bg-sw-green rounded-full h-2 animate-pulse" />
            <div className="w-0.5 bg-sw-green rounded-full h-3 animate-pulse" />
          </div>
        ) : (
          <span className="text-white text-xs">▶</span>
        )}
      </div>
      
      <div className="w-10 h-10 rounded bg-sw-surface-hover flex-shrink-0 overflow-hidden">
        {song.cover_url ? (
          <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-sw-green' : 'text-white'}`}>{song.title}</p>
        <p className="text-xs text-sw-muted truncate">{song.artist || "Artiste inconnu"}</p>
      </div>

      <span className="text-xs text-sw-muted tabular-nums mr-2">{formatDuration(song.duration)}</span>

      <div className="relative z-30">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-zinc-700/50 transition"
        >
          <MoreHorizontal size={18} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 text-left">
            <p className="px-3 py-1.5 text-xs font-semibold text-zinc-500 border-b border-zinc-800/50">
              Ajouter à la playlist
            </p>
            <div className="max-h-40 overflow-y-auto">
              {playlists.length === 0 ? (
                <p className="px-3 py-2 text-xs text-zinc-500 italic">Aucune playlist trouvée</p>
              ) : (
                playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddSong(playlist.id)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2"
                  >
                    <Plus size={12} />
                    <span className="truncate">{playlist.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-20 cursor-default" onClick={(e) => {
          e.stopPropagation()
          setShowMenu(false)
        }} />
      )}
    </div>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const inputRef = useRef(null)
  const { playSong, currentSong, isPlaying } = usePlayerStore()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350)
    return () => clearTimeout(t)
  }, [query])

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQ],
    queryFn: () => searchAll(debouncedQ),
    enabled: debouncedQ.length >= 2,
  })

  const hasResults = data && (data.songs.length + data.artists.length + data.playlists.length) > 0

  return (
    <div className="px-6 pb-8 pt-4">
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Artistes, titres, playlists…"
          className="w-full pl-12 pr-10 py-3.5 bg-white text-black placeholder:text-gray-400 rounded-full text-sm font-medium focus:outline-none shadow-lg"
        />
        {query && (
          <button 
            onClick={() => setQuery('')} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {debouncedQ.length >= 2 ? (
        isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-400" />
          </div>
        ) : !hasResults ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white font-semibold">Aucun résultat pour « {debouncedQ} »</p>
            <p className="text-sw-muted text-sm mt-1">Essayez un autre terme de recherche</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.songs.length > 0 && (
              <section>
                <h2 className="text-white font-bold mb-3">Titres</h2>
                <div className="space-y-0.5">
                  {data.songs.map((song, i) => (
                    <SongResult
                      key={song.id} song={song} index={i}
                      onPlay={(s) => playSong(s, data.songs, i)}
                      isActive={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                    />
                  ))}
                </div>
              </section>
            )}

            {data.artists.length > 0 && (
              <section>
                <h2 className="text-white font-bold mb-3">Artistes</h2>
                <div className="flex gap-3 flex-wrap">
                  {data.artists.map(a => (
                    <div key={a.id} className="flex items-center gap-3 bg-sw-surface rounded-xl px-4 py-3 cursor-pointer hover:bg-sw-surface-hover transition-colors">
                      <div className="w-12 h-12 rounded-full bg-sw-surface-hover overflow-hidden flex-shrink-0">
                        {a.image_url ? (
                          <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🎤</div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{a.name}</p>
                        <p className="text-sw-muted text-xs">Artiste</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.playlists.length > 0 && (
              <section>
                <h2 className="text-white font-bold mb-3">Playlists</h2>
                <div className="flex gap-3 flex-wrap">
                  {data.playlists.map(pl => (
                    <a key={pl.id} href={`/playlist/${pl.id}`}
                      className="flex items-center gap-3 bg-sw-surface rounded-xl px-4 py-3 cursor-pointer hover:bg-sw-surface-hover transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg bg-sw-surface-hover overflow-hidden flex-shrink-0">
                        {pl.cover_url ? (
                          <img src={pl.cover_url} alt={pl.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🎶</div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{pl.name}</p>
                        <p className="text-sw-muted text-xs">Playlist publique</p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      ) : (
        <div>
          <h2 className="text-white font-bold mb-4">Parcourir par genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GENRES.map(g => (
              <button key={g.name}
                onClick={() => setQuery(g.name)}
                className={`relative ${g.color} rounded-xl p-4 h-24 text-left cursor-pointer overflow-hidden hover:scale-[1.02] active:scale-[.98] transition-transform`}
              >
                <span className="font-bold text-white text-sm leading-tight">{g.name}</span>
                <span className="absolute bottom-2 right-3 text-4xl opacity-80">{g.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
