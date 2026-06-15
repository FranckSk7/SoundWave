import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Music, Clock } from 'lucide-react'

function formatDuration(seconds) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Album() {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlbum() {
      const [albumData, songsData] = await Promise.all([
        supabase.from('albums').select('*, artists(name)').eq('id', id).single(),
        supabase.from('songs').select('*').eq('album_id', id),
      ])
      setAlbum(albumData.data)
      setSongs(songsData.data || [])
      setLoading(false)
    }
    fetchAlbum()
  }, [id])

  if (loading) return <div className="p-6 text-zinc-400">Chargement...</div>
  if (!album) return <div className="p-6 text-zinc-400">Album introuvable</div>

  return (
    <div className="text-white">
      <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-zinc-600 to-zinc-900">
        <div className="w-40 h-40 bg-zinc-700 rounded shadow-lg flex items-center justify-center flex-shrink-0">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover rounded" />
          ) : (
            <Music size={48} className="text-zinc-400" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-300 uppercase">Album</p>
          <h1 className="text-3xl font-bold mt-1">{album.title}</h1>
          <p className="text-zinc-300 mt-2">
            {album.artists?.name} • {album.release_year} • {songs.length} titres
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 text-zinc-400 text-sm border-b border-zinc-700 pb-2 mb-2">
          <span className="w-6">#</span>
          <span className="flex-1">Titre</span>
          <Clock size={16} />
        </div>
        {songs.map((song, index) => (
          <div key={song.id} className="flex items-center gap-4 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer group">
            <span className="text-zinc-400 w-6 text-sm">{index + 1}</span>
            <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center flex-shrink-0">
              {song.cover_url ? (
                <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover rounded" />
              ) : (
                <Music size={16} className="text-zinc-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{song.title}</p>
            </div>
            <span className="text-zinc-400 text-sm">{formatDuration(song.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
