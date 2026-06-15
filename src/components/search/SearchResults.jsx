import { useState, useEffect } from 'react'
import { Music, User, Play, MoreHorizontal, Plus } from 'lucide-react'
import { getUserPlaylists, addSongToPlaylist } from '../services/playlistService'

function SongItem({ song, index }) {
  const [showMenu, setShowMenu] = useState(false)
  const [playlists, setPlaylists] = useState([])

  // Charger les playlists de l'utilisateur à l'ouverture du menu
  useEffect(() => {
    if (showMenu) {
      getUserPlaylists()
        .then(data => setPlaylists(data))
        .catch(err => console.error("Erreur chargement playlists:", err))
    }
  }, [showMenu])

  const handleAddSong = async (playlistId) => {
    try {
      await addSongToPlaylist(playlistId, song.id)
      alert(`Morceau ajouté avec succès !`)
      setShowMenu(false)
    } catch (error) {
      alert(error.message || "Erreur lors de l'ajout")
    }
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-md hover:bg-zinc-800/60 group transition cursor-pointer relative w-full">
      
      {/* 1. Index ou Icône Play au survol */}
      <div className="w-6 flex items-center justify-center">
        <span className="text-sm text-zinc-400 group-hover:hidden">{index}</span>
        <Play size={14} className="hidden group-hover:block text-white fill-white" />
      </div>
      
      {/* 2. Image de couverture du morceau */}
      <div className="w-10 h-10 bg-zinc-700 rounded overflow-hidden flex-shrink-0 shadow-md">
        {song.cover_url ? (
          <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <Music size={16} className="text-zinc-400 m-auto h-full" />
        )}
      </div>

      {/* 3. Infos : Titre & Artiste */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{song.title}</p>
        <p className="text-zinc-400 text-xs truncate mt-0.5">{song.artist || "Artiste inconnu"}</p>
      </div>
      
      {/* 4. Durée du morceau */}
      <span className="text-zinc-400 text-sm mr-4">
        {song.duration ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}` : '--:--'}
      </span>

      {/* 5. Bouton d'options à droite (MoreHorizontal) */}
      <div className="relative z-20">
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation() // Empêche de lancer la musique en cliquant sur le bouton
            setShowMenu(!showMenu)
          }}
          className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-700 transition"
        >
          <MoreHorizontal size={20} />
        </button>

        {/* Menu Contextuel Déroulant */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-850 rounded-md shadow-2xl z-50 py-1 text-left">
            <p className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/60">
              Ajouter à la playlist
            </p>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {playlists.length === 0 ? (
                <p className="px-3 py-2.5 text-xs text-zinc-500 italic">Aucune playlist créée</p>
              ) : (
                playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddSong(playlist.id)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition"
                  >
                    <Plus size={14} className="text-zinc-400" />
                    <span className="truncate">{playlist.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay transparent pour fermer le menu si on clique à côté */}
      {showMenu && (
        <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => {
          e.stopPropagation()
          setShowMenu(false)
        }} />
      )}
    </div>
  )
}

function ArtistItem({ artist }) {
  return (
    <div className="flex-shrink-0 w-36 cursor-pointer group text-center">
      <div className="w-36 h-36 rounded-full mx-auto mb-3 bg-zinc-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition overflow-hidden">
        {artist.cover_url ? (
          <img src={artist.cover_url} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <User size={40} className="text-zinc-400" />
        )}
      </div>
      <p className="text-white text-sm font-medium truncate">{artist.name}</p>
      <p className="text-zinc-400 text-xs">Artiste</p>
    </div>
  )
}

function AlbumItem({ album }) {
  return (
    <div className="cursor-pointer group">
      <div className="aspect-square rounded-lg mb-3 bg-zinc-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition overflow-hidden">
        {album.cover_url ? (
          <img src={album.cover_url} alt={album.name} className="w-full h-full object-cover" />
        ) : (
          <Music size={32} className="text-zinc-400" />
        )}
      </div>
      <p className="text-white text-sm font-medium truncate">{album.name}</p>
      <p className="text-zinc-400 text-xs truncate">{album.artist}</p>
    </div>
  )
}

export default function SearchResults({ results, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <p className="text-zinc-400 animate-pulse">Recherche en cours...</p>
    </div>
  )

  const isEmpty = !results || (!results.songs?.length && !results.artists?.length && !results.albums?.length)

  if (isEmpty) return (
    <div className="text-center py-16 text-zinc-400">
      <p className="text-lg">Aucun résultat trouvé</p>
    </div>
  )

  return (
    <div className="space-y-8 mt-6">
      {/* Section Artistes */}
      {results.artists?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Artistes</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {results.artists.map(artist => <ArtistItem key={artist.id} artist={artist} />)}
          </div>
        </div>
      )}
      
      {/* Section Albums */}
      {results.albums?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.albums.map(album => <AlbumItem key={album.id} album={album} />)}
          </div>
        </div>
      )}
      
      {/* Section Titres */}
      {results.songs?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Titres</h2>
          <div className="flex flex-col bg-zinc-900/40 p-2 rounded-lg divide-y divide-zinc-800/30">
            {results.songs.map((song, index) => (
              <SongItem key={song.id} song={song} index={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
