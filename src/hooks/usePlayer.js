import { useEffect, useRef } from 'react'
import usePlayerStore from '../store/playerStore'

export function usePlayer() {
  const audioRef = useRef(null)

  const {
    currentSong, isPlaying, volume, isRepeat,
    setCurrentTime, setDuration, nextSong,
  } = usePlayerStore()

  useEffect(() => {
    audioRef.current = new Audio()

    audioRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(audioRef.current.currentTime)
    })

    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current.duration)
    })

    audioRef.current.addEventListener('ended', () => {
      if (usePlayerStore.getState().isRepeat) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      } else {
        nextSong()
      }
    })

    return () => {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current || !currentSong) return
    audioRef.current.src = currentSong.audio_url
    audioRef.current.play()
  }, [currentSong])

  useEffect(() => {
    if (!audioRef.current || !audioRef.current.src) return
    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [volume])

  const seek = (time) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  return { seek }
}