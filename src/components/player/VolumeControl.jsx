import usePlayerStore from '../../store/playerStore'
import { Volume1, Volume2, VolumeX } from 'lucide-react'

export default function VolumeControl() {
  const { volume, setVolume } = usePlayerStore()

  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-gray-400" />
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-20 accent-pink-500 cursor-pointer"
      />
    </div>
  )
}