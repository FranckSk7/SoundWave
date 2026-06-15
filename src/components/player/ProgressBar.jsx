import usePlayerStore from '../../store/playerStore'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ProgressBar({ onSeek }) {
  const { currentTime, duration } = usePlayerStore()
  const percent = duration ? (currentTime / duration) * 100 : 0

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(ratio * duration)
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-gray-400 w-8">{formatTime(currentTime)}</span>
      <div
        className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer relative group"
        onClick={handleClick}
      >
        <div
          className="h-full bg-pink-500 rounded-full relative"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{formatTime(duration)}</span>
    </div>
  )
}