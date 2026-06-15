import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
    }),
    {
      name: 'sw-player',
      partialize: (s) => ({ volume: s.volume, isMuted: s.isMuted, isShuffle: s.isShuffle, repeatMode: s.repeatMode }),
    }
  )
)

export default usePlayerStore
