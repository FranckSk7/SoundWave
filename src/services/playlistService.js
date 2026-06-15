import { supabase } from './supabase'

// 1. Récupérer les playlists de l'utilisateur connecté
export async function getUserPlaylists() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return []

  const { data, error } = await supabase
    .from('playlists')
    .select('*') 
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// 2. Récupérer une playlist spécifique par son ID (Playlist)
export async function getPlaylistById(playlistId) {
  if (!playlistId) return null
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      id, name, description, cover_url, is_public, created_at, updated_at, user_id,
      playlist_songs (
        id, position, created_at,
        songs (
          id, title, duration, audio_url, cover_url, artist, album
        )
      )
    `)
    .eq('id', playlistId)
    .single()

  if (error) throw error
  
  if (data?.playlist_songs) {
    data.playlist_songs.sort((a, b) => a.position - b.position)
  }
  
  return data
}

// 3. Récupérer toutes les playlists publiques (Home / Community)
export async function getPublicPlaylists() {
  const { data, error } = await supabase
    .from('playlists')
    .select('id, name, description, cover_url, is_public, user_id, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 4. Créer une nouvelle playlist (Library / Sidebar)
export async function createPlaylist(playlistData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  const { data, error } = await supabase
    .from('playlists')
    .insert([
      {
        name: playlistData.name || "Ma superbe playlist",
        description: playlistData.description || "",
        is_public: playlistData.is_public ?? false,
        user_id: user.id,
        cover_url: playlistData.cover_url || null
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// 5. Supprimer une playlist (Playlist / Library)
export async function deletePlaylist(playlistId) {
  const { data, error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)

  if (error) throw error
  return data
}

// 6. Mettre à jour les informations d'une playlist (Playlist)
export async function updatePlaylist(playlistId, updates) {
  const { data, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', playlistId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 7. Récupérer la liste complète des morceaux likés (Library / Liked)
export async function getLikedSongs() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Requête simplifiée au maximum : pas d'id, pas de created_at, pas de tri complexe
    const { data, error } = await supabase
      .from('liked_songs')
      .select(`
        songs (
          id, title, duration, audio_url, cover_url, artist, album
        )
      `)
      .eq('user_id', user.id)

    if (error) throw error
    
    return data ? data.map(item => item.songs).filter(Boolean) : []
  } catch (err) {
    console.error("Erreur critique getLikedSongs :", err)
    return []
  }
}

// 8. Récupérer uniquement les IDs des morceaux likés (Playlist / SongRow)
export async function getLikedSongIds() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', user.id)

  if (error) throw error
  return data ? data.map(item => item.song_id) : []
}

// 9. Liker ou retirer le like d'un morceau
export async function toggleLikeSong(songId, isLikedCurrently) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Utilisateur non connecté")

  if (isLikedCurrently) {
    const { error } = await supabase
      .from('liked_songs')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId)

    if (error) throw error
    return { songId, liked: false }
  } else {
    const { error } = await supabase
      .from('liked_songs')
      .insert([{ user_id: user.id, song_id: songId }])

    if (error) throw error
    return { songId, liked: true }
  }
}

// 10. Téléverser une image de couverture pour la playlist (Playlist)
export async function uploadPlaylistCover(playlistId, file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${playlistId}-${Math.random()}.${fileExt}`
  const filePath = `covers/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('playlist-covers')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('playlist-covers')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// 11. Ajouter une chanson à une playlist (Search)
export async function addSongToPlaylist(playlistId, songId) {
  const { data: songs, error: countError } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)

  if (countError) throw countError

  const nextPosition = songs && songs.length > 0 
    ? Math.max(...songs.map(s => s.position ?? 0)) + 1 
    : 0

  const { data, error } = await supabase
    .from('playlist_songs')
    .insert([
      { playlist_id: playlistId, song_id: songId, position: nextPosition }
    ])
    .select()

  if (error) throw error
  return data
}

// 12. Supprimer une chanson d'une playlist (Playlist)
export async function removeSongFromPlaylist(playlistId, songId) {
  const { data, error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId)

  if (error) throw error
  return data
}

// 13. Calculer la durée totale d'une playlist en secondes (Playlist)
export function getTotalDuration(playlistSongs = []) {
  return playlistSongs.reduce((acc, curr) => acc + (curr.songs?.duration || 0), 0)
}

// 14. Formater le temps global lisiblement (Playlist)
export function formatTotalDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) {
    return `${hours} h ${minutes} min`
  }
  return `${minutes} min`
}

// 15. Formater la durée d'une seule chanson ex: 215 -> "3:35" (Search / SongRow)
export function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// 16. Écouter en temps réel les changements des playlists publiques (Sidebar)
export function subscribeToPublicPlaylists(callback) {
  return supabase
    .channel('public-playlists-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'playlists', filter: 'is_public=eq.true' },
      () => {
        callback()
      }
    )
    .subscribe()
}

// 17. Désabonner un canal de communication en temps réel actif (Sidebar)
export function unsubscribe(channel) {
  if (channel) {
    supabase.removeChannel(channel)
  }
}
