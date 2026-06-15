import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Music, User } from 'lucide-react'

export default function Artist() {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArtist() {
      const [artistData, songsData, albumsData] = await Promise.all([
        supabase.from('artists').select('*').eq('id', id).single(),
        supabase.from('songs').select('*').eq('artist_id', id).limit(10),
        supabase.from('albums').select('*').eq('artist_id', id),
      ])
      setArtist(artistData.data)
      setSongs(songsData.data || [])
      setAlbums(albumsData.data || [])
      setLoading(false)
    }
    fetchArtist()
  }, [id])

  if (loading) return <div className="p-6 text-zinc-400">Chargement...</div>
  if (!artist) return <div className="p-6 text-zinc-400">Artiste introuvable</div>

  return (
    <div className="text-white">
      <div className="relative h-64 bg-gradient-to-b from-zinc-600 to-zinc-900 flex items-end p-6">
        {artist.image_url && (
          <img src={artist.image_url} alt={artist.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative">
          <p className="text-sm font-medium text-zinc-300">Artiste</p>
          <h1 className="text-4xl font-bold">{artist.name}</h1>
        </div>
      </div>
      <div className="p-6 space-y-8">
        {artist.bio && (
          <div>
            <h2 className="text-xl font-bold mb-2">À propos</h2>
            <p className="text-zinc-400">{artist.bio}</p>
          </div>
        )}
        {songs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Chansons populaires</h2>
            <div className="space-y-2">
              {songs.map((song, index) => (
                <div key={song.id} className="flex items-center gap-4 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
                  <span className="text-zinc-400 w-4 text-sm">{index + 1}</span>
                  <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center">
                    {song.cover_url
                      ? <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover rounded" />
                      : <Music size={16} className="text-zinc-400" />}
                  </div>
                  <p className="text-white text-sm font-medium">{song.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {albums.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Albums</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {albums.map(album => (
                <div key={album.id} className="bg-zinc-800 p-3 rounded-lg cursor-pointer hover:bg-zinc-700">
                  <div className="w-full aspect-square bg-zinc-700 rounded mb-3 flex items-center justify-center">
                    {album.cover_url
                      ? <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover rounded" />
                      : <Music size={24} className="text-zinc-400" />}
                  </div>
                  <p className="text-white text-sm font-medium truncate">{album.title}</p>
                  <p className="text-zinc-400 text-xs">{album.release_year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
