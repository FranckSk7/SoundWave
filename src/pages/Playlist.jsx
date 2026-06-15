import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import {
  getLikedSongIds,
  deletePlaylist, updatePlaylist, uploadPlaylistCover,
  formatTotalDuration, getTotalDuration,
} from '../services/playlistService'
import SongRow from '../components/playlist/SongRow'
import usePlayerStore from '../store/playerStore'

// ── Icônes ─────────────────────────────────────────────────────────────────────
const Ic = {
  Play: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5"><path d="M8 5v14l11-7z" /></svg>,
  Shuffle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>,
  Dots: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>,
  Back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>,
  Share: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" /></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  Lock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
}

// ── Modal édition ──────────────────────────────────────────────────────────────
function EditModal({ playlist, onClose, onSaved }) {
  const [name, setName] = useState(playlist.name)
  const [desc, setDesc] = useState(playlist.description ?? '')
  const [isPublic, setIsPublic] = useState(playlist.is_public ?? false)
  const [coverFile, setCoverFile] = useState(null)
  const [preview, setPreview] = useState(playlist.cover_url ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCover = e => {
    const f = e.target.files?.[0]
    if (f) { setCoverFile(f); setPreview(URL.createObjectURL(f)) }
  }

  const submit = async e => {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est requis'); return }
    setSaving(true); setError('')
    try {
      let updated = await updatePlaylist(playlist.id, { name: name.trim(), description: desc.trim(), is_public: isPublic })
      if (coverFile) {
        const url = await uploadPlaylistCover(playlist.id, coverFile)
        updated = await updatePlaylist(playlist.id, { cover_url: url })
      }
      onSaved(updated); onClose()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-md rounded-2xl bg-sw-popup border border-white/10 shadow-2xl p-6 animate-fade-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Modifier la playlist</h2>
          <button onClick={onClose} className="text-sw-muted hover:text-white p-1"><Ic.Close /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            <label className="relative w-24 h-24 rounded-xl overflow-hidden bg-sw-surface border-2 border-dashed border-white/20 hover:border-sw-green/50 cursor-pointer flex-shrink-0 group transition-colors">
              {preview
                ? <img src={preview} alt="Cover" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-sw-muted group-hover:text-sw-green transition-colors"><Ic.Upload /><span className="text-xs">Photo</span></div>
              }
              <input type="file" accept="image/*" onChange={handleCover} className="sr-only" />
            </label>
            <div className="flex-1 flex flex-col gap-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la playlist" maxLength={100}
                className="w-full bg-sw-surface border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-sw-muted text-sm focus:outline-none focus:border-sw-green/60 transition-colors" autoFocus />
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optionnel)" maxLength={300} rows={2}
                className="w-full bg-sw-surface border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder:text-sw-muted text-sm resize-none focus:outline-none focus:border-sw-green/60 transition-colors" />
            </div>
          </div>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-white">
              {isPublic ? <Ic.Globe /> : <Ic.Lock />}
              {isPublic ? 'Playlist publique (visible dans la communauté)' : 'Playlist privée'}
            </div>
            <button type="button" onClick={() => setIsPublic(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isPublic ? 'bg-sw-green' : 'bg-sw-surface-hover'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          {error && <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors">Annuler</button>
            <button type="submit" disabled={saving || !name.trim()}
              className="flex-1 py-2.5 rounded-full bg-sw-green text-black text-sm font-bold hover:bg-sw-green-light transition-colors disabled:opacity-50">
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page Playlist ──────────────────────────────────────────────────────────────
export default function Playlist() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { playSong, currentSong, isPlaying, toggleShuffle, isShuffle, setPlaylistContext } = usePlayerStore()

  const [editOpen, setEditOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [likedOvr, setLikedOvr] = useState({})
  const [searchQ, setSearchQ] = useState('')
  const [shareMsg, setShareMsg] = useState('')

  // REQUÊTE SÉCURISÉE ET EXPLICITE : Évite les jointures automatiques complexes cassées de playlistService
  const { data: playlist, isLoading, isError } = useQuery({
    queryKey: ['playlist', id],
    queryFn: async () => {
      // 1. Récupère d'abord les informations globales de la playlist
      const { data: plData, error: plError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single()

      if (plError || !plData) throw new Error('Playlist introuvable')

      // 2. Récupère les morceaux de la playlist ordonnés par leur position
      const { data: pivotData, error: pivotError } = await supabase
        .from('playlist_songs')
        .select(`
          id,
          position,
          songs (*)
        `)
        .eq('playlist_id', id)
        .order('position', { ascending: true })

      if (pivotError) throw pivotError

      // Renvoie un objet formaté identique à ce qu'attend le composant
      return {
        ...plData,
        playlist_songs: pivotData || []
      }
    },
    enabled: !!id,
  })

  const { data: likedIds = [] } = useQuery({
    queryKey: ['likedSongIds'],
    queryFn: getLikedSongIds,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] })
      navigate('/library')
    },
  })

  const isSongLiked = useCallback(sid => sid in likedOvr ? likedOvr[sid] : likedIds.includes(sid), [likedOvr, likedIds])

  const songs = playlist?.playlist_songs ?? []
  const allSongsList = songs.map(ps => ps.songs).filter(Boolean)

  const handlePlay = useCallback((song, alternativeList) => {
    const queue = alternativeList || allSongsList
    const idx = queue.findIndex(s => s?.id === song.id)
    playSong(song, queue, idx)
    setPlaylistContext(id)
  }, [playSong, id, allSongsList, setPlaylistContext])

  const handlePlayAll = () => {
    if (!allSongsList.length) return
    const idx = isShuffle ? Math.floor(Math.random() * allSongsList.length) : 0
    playSong(allSongsList[idx], allSongsList, idx)
    setPlaylistContext(id)
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: playlist?.name, url })
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareMsg('Lien copié !')
        setTimeout(() => setShareMsg(''), 2500)
      })
    }
  }

  const filteredSongs = searchQ
    ? songs.filter(ps =>
      ps.songs?.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      ps.songs?.artist?.toLowerCase().includes(searchQ.toLowerCase())
    )
    : songs
  const totalDur = formatTotalDuration(getTotalDuration(songs))

  if (isLoading) return <PlaylistSkeleton />
  if (isError || !playlist) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-sw-muted p-8">
      <p className="text-xl text-white">Playlist introuvable</p>
      <button onClick={() => navigate('/library')} className="text-sw-green hover:underline text-sm">← Bibliothèque</button>
    </div>
  )

  return (
    <div className="flex flex-col min-h-full animate-fade-in">
      {/* Hero */}
      <div className="relative">
        {playlist.cover_url && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={playlist.cover_url} alt="" className="w-full h-full object-cover blur-2xl scale-110 opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-sw-bg" />
          </div>
        )}
        <div className="relative flex flex-col sm:flex-row gap-6 px-6 pt-8 pb-8 items-end">
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 sm:hidden w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white">
            <Ic.Back />
          </button>

          <div className="w-44 h-44 sm:w-56 sm:h-56 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl mx-auto sm:mx-0 bg-sw-surface">
            {playlist.cover_url
              ? <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-sw-surface to-sw-surface-2 flex items-center justify-center text-6xl">🎶</div>
            }
          </div>

          <div className="flex flex-col gap-2 min-w-0 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-sw-muted font-medium flex items-center gap-1 justify-center sm:justify-start">
              {playlist.is_public ? <><Ic.Globe /> Playlist publique</> : <><Ic.Lock /> Playlist privée</>}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-sw-muted text-sm max-w-md line-clamp-2">{playlist.description}</p>
            )}
            <div className="text-xs text-sw-muted flex items-center gap-1.5 justify-center sm:justify-start flex-wrap">
              <span className="font-semibold text-white/90">Vous</span>
              <span>·</span>
              <span>{songs.length} titre{songs.length !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{totalDur}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-3 px-6 py-4">
        <button onClick={handlePlayAll} disabled={!allSongsList.length}
          className="w-14 h-14 rounded-full bg-sw-green flex items-center justify-center text-black shadow-lg hover:scale-105 hover:bg-sw-green-light transition-all disabled:opacity-40">
          <Ic.Play />
        </button>
        <button onClick={() => { toggleShuffle(); handlePlayAll() }}
          className={`w-10 h-10 flex items-center justify-center transition-colors ${isShuffle ? 'text-sw-green' : 'text-sw-muted hover:text-white'}`}>
          <Ic.Shuffle />
        </button>
        <button onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center text-sw-muted hover:text-white transition-colors" title="Partager">
          <Ic.Share />
        </button>
        {shareMsg && <span className="text-xs text-sw-green animate-fade-in">{shareMsg}</span>}

        <div className="relative ml-auto">
          <button onClick={() => setMenuOpen(v => !v)} className="w-10 h-10 flex items-center justify-center text-sw-muted hover:text-white transition-colors">
            <Ic.Dots />
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 z-50 w-52 rounded-xl bg-sw-popup border border-white/5 shadow-2xl overflow-hidden">
              <button onClick={() => { setEditOpen(true); setMenuOpen(false) }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors">
                <Ic.Edit /> Modifier la playlist
              </button>
              <button onClick={() => { setMenuOpen(false); if (confirm(`Supprimer « ${playlist.name} » ?`)) deleteMutation.mutate() }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors"
                disabled={deleteMutation.isPending}>
                <Ic.Trash /> {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recherche si > 10 titres */}
      {songs.length > 10 && (
        <div className="px-6 pb-3">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-sw-muted w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Rechercher dans la playlist"
              className="w-full pl-9 pr-8 py-2 bg-sw-surface border border-white/10 rounded-full text-sm text-white placeholder:text-sw-muted focus:outline-none focus:border-sw-green/50 transition-colors" />
            {searchQ && (
              <button onClick={() => setSearchQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sw-muted hover:text-white">
                <Ic.Close />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header colonne */}
      {songs.length > 0 && (
        <div className="grid items-center gap-3 px-4 mx-6 mb-1 border-b border-white/5 pb-2"
          style={{ gridTemplateColumns: '28px 40px 1fr auto auto auto' }}>
          <span className="text-xs text-sw-muted text-center">#</span>
          <span />
          <span className="text-xs text-sw-muted uppercase tracking-wider">Titre</span>
          <span className="text-xs text-sw-muted uppercase tracking-wider hidden md:block">Album</span>
          <span />
          <span className="text-xs text-sw-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </span>
        </div>
      )}

      {/* Liste */}
      <div className="flex flex-col px-6 pb-8">
        {songs.length === 0
          ? <div className="text-center py-16 text-sw-muted"><p className="font-medium text-white mb-1">Playlist vide</p><p className="text-sm">Ajoutez des titres depuis la recherche</p></div>
          : filteredSongs.length === 0
            ? <div className="text-center py-12 text-sw-muted text-sm">Aucun résultat pour « {searchQ} »</div>
            : filteredSongs.map((ps, idx) => (
              <SongRow key={ps.id} index={idx + 1} song={ps.songs}
                isLiked={isSongLiked(ps.songs?.id)}
                isPlaying={isPlaying && currentSong?.id === ps.songs?.id}
                isActive={currentSong?.id === ps.songs?.id}
                playlistId={id} showRemove
                onPlay={(s) => handlePlay(s, filteredSongs.map(item => item.songs).filter(Boolean))}
                onLikeChange={(sid, v) => setLikedOvr(p => ({ ...p, [sid]: v }))}
              />
            ))
        }
      </div>

      {editOpen && (
        <EditModal playlist={playlist} onClose={() => setEditOpen(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['playlist', id] })
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
            queryClient.invalidateQueries({ queryKey: ['publicPlaylists'] })
          }}
        />
      )}
    </div>
  )
}

function PlaylistSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
      <div className="flex gap-6 items-end">
        <div className="w-56 h-56 rounded-xl bg-sw-surface flex-shrink-0" />
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-3 w-20 rounded bg-sw-surface" />
          <div className="h-10 w-64 rounded bg-sw-surface" />
          <div className="h-3 w-40 rounded bg-sw-surface" />
          <div className="h-3 w-32 rounded bg-sw-surface" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-full bg-sw-surface" />
        <div className="w-10 h-10 rounded-full bg-sw-surface" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2">
          <div className="w-6 h-3 rounded bg-sw-surface" />
          <div className="w-10 h-10 rounded bg-sw-surface" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-36 rounded bg-sw-surface" />
            <div className="h-2.5 w-24 rounded bg-sw-surface" />
          </div>
          <div className="h-3 w-10 rounded bg-sw-surface" />
        </div>
      ))}
    </div>
  )
}
