import { Outlet } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import MobileNav from '../sidebar/MobileNav'
import Header from './Header'
import PlayerBar from '../player/PlayerBar'
import AudioEngine from '../player/AudioEngine'
import usePlayerStore from '../../store/playerStore'

export default function MainLayout() {
  const { currentSong } = usePlayerStore()

  return (
    <div className="flex h-screen bg-sw-bg overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/5">
        <Sidebar />
      </aside>

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: currentSong ? '90px' : '0' }}
        >
          <Outlet />
        </main>
      </div>

      {/* Moteur audio invisible */}
      <AudioEngine />

      {/* Barre de lecture */}
      <PlayerBar />

      {/* Navigation mobile */}
      <MobileNav />
    </div>
  )
}
