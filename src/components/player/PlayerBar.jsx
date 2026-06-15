import { useState, useRef, useCallback } from 'react'
import usePlayerStore from '../../store/playerStore'

// ── Icônes ────────────────────────────────────────────────────────────────────
const Ic = {
  Play:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M8 5v14l11-7z"/></svg>,
  Pause:   () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>,
  Prev:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>,
  Next:    () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 18l8.5-6L6 6v12zm2.5-6 6-4.3V16l-6-4z M16 6h2v12h-2z"/></svg>,
  Shuffle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  RepeatAll: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  RepeatOne: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="10.5" y="15.5" fontSize="7" fill="currentColor" stroke="none">1</text></svg>,
  VolHigh: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>,
  VolLow:  () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>,
  VolMute: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>,
  Heart:   ({ filled }) => filled
    ? <svg viewBox="0 0 24 24" fill="#1DB954" className="w-4 h-4"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
}

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar() {
  const { currentTime, duration } = usePlayerStore()
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverPct, setHoverPct] = useState(null)

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  const seek = useCallback((e) => {
    if (!trackRef.current || !duration) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = x / rect.width
    window.__swSeek?.(ratio * duration)
  }, [duration])

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-sw-muted tabular-nums w-8 text-right">{formatTime(currentTime)}</span>
      <div
        ref={trackRef}
        className="progress-track flex-1"
        onMouseMove={(e) => {
          if (!trackRef.current) return
          const rect = trackRef.current.getBoundingClientRect()
          setHoverPct(((e.clientX - rect.left) / rect.width) * 100)
        }}
        onMouseLeave={() => setHoverPct(null)}
        onMouseDown={(e) => { setIsDragging(true); seek(e) }}
        onMouseUp={() => setIsDragging(false)}
        onClick={seek}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
        {hoverPct !== null && (
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white pointer-events-none shadow"
            style={{ left: `${hoverPct}%`, transform: 'translate(-50%, -50%)' }} />
        )}
      </div>
      <span className="text-xs text-sw-muted tabular-nums w-8">{formatTime(duration)}</span>
    </div>
  )
}

// ── Volume Slider ─────────────────────────────────────────────────────────────
function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore()
  const displayVol = isMuted ? 0 : volume

  const Icon = displayVol === 0 ? Ic.VolMute : displayVol < 0.5 ? Ic.VolLow : Ic.VolHigh

  return (
    <div className="flex items-center gap-1.5 group">
      <button onClick={toggleMute} className="text-sw-muted hover:text-white transition-colors">
        <Icon />
      </button>
      <div className="relative w-20 h-1 bg-sw-surface-hover rounded-full">
        <div
          className="absolute left-0 top-0 bottom-0 bg-white rounded-full group-hover:bg-sw-green transition-colors"
          style={{ width: `${displayVol * 100}%` }}
        />
        <input
          type="range" min="0" max="1" step="0.01"
          value={displayVol}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
      </div>
    </div>
  )
}

// ── Equalizer icon (animated bars) ────────────────────────────────────────────
function Equalizer() {
  return (
    <div className="flex items-end gap-px h-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="equalizer-bar" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  )
}

// ── Player Bar Principal ───────────────────────────────────────────────────────
export default function PlayerBar() {
  const {
    currentSong, isPlaying, isShuffle, repeatMode,
    togglePlay, toggleShuffle, cycleRepeat, nextSong, prevSong,
  } = usePlayerStore()

  const [liked, setLiked] = useState(false)

  if (!currentSong) return null

  const repeatActive = repeatMode !== 'none'
  const RepeatIcon = repeatMode === 'one' ? Ic.RepeatOne : Ic.RepeatAll

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-sw-bg/95 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="h-[90px] flex items-center px-4 md:px-6 gap-4">

        {/* ── Infos chanson (1/3 gauche) ── */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-sw-surface">
            {currentSong.cover_url
              ? <img src={currentSong.cover_url} alt={currentSong.title} className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} style={isPlaying ? { borderRadius: '50%' } : {}} />
              : <div className="w-full h-full bg-gradient-to-br from-sw-green-dark to-sw-green flex items-center justify-center text-black font-bold text-lg">♪</div>
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
            <p className="text-xs text-sw-muted truncate">{currentSong.artists?.name || currentSong.artist || '—'}</p>
          </div>
          <button
            onClick={() => setLiked(v => !v)}
            className="flex-shrink-0 text-sw-muted hover:text-white transition-colors hidden sm:block"
          >
            <Ic.Heart filled={liked} />
          </button>
        </div>

        {/* ── Contrôles centraux (1/3 milieu) ── */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[500px] mx-auto">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`transition-colors relative ${isShuffle ? 'text-sw-green' : 'text-sw-muted hover:text-white'}`}
              title="Aléatoire"
            >
              <Ic.Shuffle />
              {isShuffle && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sw-green" />}
            </button>

            <button onClick={prevSong} className="text-sw-muted hover:text-white transition-colors" title="Précédent">
              <Ic.Prev />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              title={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? <Ic.Pause /> : <Ic.Play />}
            </button>

            <button onClick={nextSong} className="text-sw-muted hover:text-white transition-colors" title="Suivant">
              <Ic.Next />
            </button>

            <button
              onClick={cycleRepeat}
              className={`transition-colors relative ${repeatActive ? 'text-sw-green' : 'text-sw-muted hover:text-white'}`}
              title="Répéter"
            >
              <RepeatIcon />
              {repeatActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sw-green" />}
            </button>
          </div>

          <ProgressBar />
        </div>

        {/* ── Volume + extras (1/3 droit) ── */}
        <div className="hidden md:flex items-center justify-end gap-3 w-[30%]">
          {isPlaying && <Equalizer />}
          <VolumeControl />
        </div>
      </div>
    </div>
  )
}
