import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../services/supabase' // 👈 Assure-toi que ce chemin vers ton client Supabase est correct

const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,
      isShuffle: false,
      repeatMode: 'none', // 'none' | 'all' | 'one'
      queue: [],
      queueIndex: 0,
      playlistContext: null, // id de la playlist en cours
      likedSongs: [], // 👈 1. État initial pour stocker tes morceaux likés

      playSong: (song, queue = null, index = 0) => {
        const newQueue = queue || get().queue
        const newIndex = queue ? index : newQueue.findIndex(s => s.id === song.id)
        set({
          currentSong: song,
          isPlaying: true,
          currentTime: 0,
          queue: newQueue,
          queueIndex: newIndex >= 0 ? newIndex : 0,
        })
      },

      togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
      setPlaying: (v) => set({ isPlaying: v }),
      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),
      setVolume: (v) => set({ volume: v, isMuted: v === 0 }),
      toggleMute: () => set(s => ({ isMuted: !s.isMuted })),
      toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),
      cycleRepeat: () => set(s => ({
        repeatMode: s.repeatMode === 'none' ? 'all' : s.repeatMode === 'all' ? 'one' : 'none'
      })),
      setQueue: (songs, index = 0) => set({ queue: songs, queueIndex: index }),
      setPlaylistContext: (id) => set({ playlistContext: id }),

      nextSong: () => {
        const { queue, queueIndex, isShuffle, repeatMode, currentSong } = get()
        if (!queue.length) return
        let next
        if (isShuffle) {
          const idx = Math.floor(Math.random() * queue.length)
          next = { song: queue[idx], index: idx }
        } else if (queueIndex < queue.length - 1) {
          next = { song: queue[queueIndex + 1], index: queueIndex + 1 }
        } else if (repeatMode === 'all') {
          next = { song: queue[0], index: 0 }
        } else {
          return set({ isPlaying: false })
        }
        set({ currentSong: next.song, queueIndex: next.index, currentTime: 0, isPlaying: true })
      },

      prevSong: () => {
        const { queue, queueIndex, currentTime } = get()
        if (!queue.length) return
        // Si > 3s, recommencer la chanson
        if (currentTime > 3) {
          return set({ currentTime: 0 })
        }
        const prev = queueIndex > 0
          ? { song: queue[queueIndex - 1], index: queueIndex - 1 }
          : { song: queue[queue.length - 1], index: queue.length - 1 }
        set({ currentSong: prev.song, queueIndex: prev.index, currentTime: 0, isPlaying: true })
      },

      // 👈 2. Charge les chansons likées depuis Supabase au démarrage
      fetchLikedSongs: async (userId) => {
        if (!userId) return
        try {
          const { data, error } = await supabase
            .from('liked_songs')
            .select(`
              song_id,
              songs (*)
            `) // Récupère le morceau lié grâce à la clé étrangère song_id
            .eq('user_id', userId)

          if (error) throw error

          // On extrait uniquement les objets "songs" complets
          const songs = data.map((item) => item.songs).filter(Boolean)
          set({ likedSongs: songs })
        } catch (error) {
          console.error("Erreur fetchLikedSongs:", error.message)
        }
      },

      // 👈 3. Ajoute ou supprime un Like au clic sur le cœur
      toggleLike: async (songId, userId) => {
        if (!userId) return alert("Connectez-vous pour aimer un morceau !")
        
        const { likedSongs } = get()
        const isLiked = likedSongs.some((song) => song.id === songId)

        try {
          if (isLiked) {
            // Déjà liké -> On le retire de Supabase
            const { error } = await supabase
              .from('liked_songs')
              .delete()
              .eq('user_id', userId)
              .eq('song_id', songId)

            if (error) throw error

            // UI : On filtre pour l'enlever de l'affichage immédiatement
            set({ likedSongs: likedSongs.filter((song) => song.id !== songId) })
          } else {
            // Pas encore liké -> On l'ajoute dans Supabase
            const { error } = await supabase
              .from('liked_songs')
              .insert([{ user_id: userId, song_id: songId }])

            if (error) throw error

            // On récupère les infos du morceau pour l'ajouter proprement à notre état local
            const { data: songData } = await supabase
              .from('songs')
              .select('*')
              .eq('id', songId)
              .single()

            if (songData) {
              set({ likedSongs: [...likedSongs, songData] })
            }
          }
        } catch (error) {
          console.error("Erreur toggleLike:", error.message)
        }
      },
    }),
    {
      name: 'sw-player',
      // On ne sauvegarde dans le stockage local du navigateur que les réglages du lecteur (pas la liste des likes qui vient de Supabase)
      partialize: (s) => ({ volume: s.volume, isMuted: s.isMuted, isShuffle: s.isShuffle, repeatMode: s.repeatMode }),
    }
  )
)

export default usePlayerStore
