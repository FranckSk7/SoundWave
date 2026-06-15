import { useEffect, useRef, useCallback } from 'react'
import usePlayerStore from '../../store/playerStore'

/**
 * AudioEngine — Moteur audio invisible
 * Gère : lecture HTML5, Media Session API (arrière-plan mobile/PC),
 * cache audio offline, synchronisation avec le store Zustand
 */
export default function AudioEngine() {
  const audioRef = useRef(null)

  // Créer l'élément audio une seule fois (pas dans un useEffect — important pour iOS)
  if (!audioRef.current) {
    audioRef.current = new Audio()
    audioRef.current.preload = 'auto'
  }

  const {
    currentSong, isPlaying, volume, isMuted, repeatMode,
    setCurrentTime, setDuration, nextSong, setPlaying,
  } = usePlayerStore()

  // ── Changer la source quand la chanson change ──────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!currentSong?.audio_url) return

    audio.src = currentSong.audio_url
    audio.load()
    audio.play().catch(() => setPlaying(false))

    // Media Session API — permet les contrôles depuis l'écran de verrouillage,
    // les widgets de notification, et les touches Media des claviers
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title:  currentSong.title || 'Titre inconnu',
        artist: currentSong.artists?.name || currentSong.artist || 'Artiste inconnu',
        album:  currentSong.albums?.name || currentSong.album || '',
        artwork: currentSong.cover_url ? [
          { src: currentSong.cover_url, sizes: '512x512', type: 'image/jpeg' },
        ] : [],
      })

      navigator.mediaSession.setActionHandler('play',           () => { audio.play(); setPlaying(true) })
      navigator.mediaSession.setActionHandler('pause',          () => { audio.pause(); setPlaying(false) })
      navigator.mediaSession.setActionHandler('nexttrack',      () => nextSong())
      navigator.mediaSession.setActionHandler('previoustrack',  () => usePlayerStore.getState().prevSong())
      navigator.mediaSession.setActionHandler('seekbackward',   () => { audio.currentTime = Math.max(0, audio.currentTime - 10) })
      navigator.mediaSession.setActionHandler('seekforward',    () => { audio.currentTime = Math.min(audio.duration, audio.currentTime + 10) })
      navigator.mediaSession.setActionHandler('seekto',         (e) => { if (e.seekTime != null) audio.currentTime = e.seekTime })
    }
  }, [currentSong])

  // ── Play / Pause ───────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (isPlaying) {
      audio.play().catch(() => setPlaying(false))
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
    } else {
      audio.pause()
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
    }
  }, [isPlaying])

  // ── Volume / Mute ──────────────────────────────────────────────
  useEffect(() => {
    audioRef.current.volume  = isMuted ? 0 : volume
    audioRef.current.muted   = isMuted
  }, [volume, isMuted])

  // ── Événements audio ───────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      // Mettre à jour Media Session position
      if ('mediaSession' in navigator && audio.duration) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
          })
        } catch {}
      }
    }

    const onLoaded = () => setDuration(audio.duration || 0)

    const onEnded = () => {
      const { repeatMode } = usePlayerStore.getState()
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        nextSong()
      }
    }

    const onError = () => {
      console.warn('Audio error — skipping to next')
      nextSong()
    }

    audio.addEventListener('timeupdate',     onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('durationchange', onLoaded)
    audio.addEventListener('ended',          onEnded)
    audio.addEventListener('error',          onError)

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('durationchange', onLoaded)
      audio.removeEventListener('ended',          onEnded)
      audio.removeEventListener('error',          onError)
    }
  }, [repeatMode])

  // Exposer seek globalement pour la barre de progression
  useEffect(() => {
    window.__swSeek = (time) => { audioRef.current.currentTime = time }
    return () => { delete window.__swSeek }
  }, [])

  return null
}
