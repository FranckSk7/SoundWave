import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { usePlayer } from './hooks/usePlayer'
import PlayerBar from './components/player/PlayerBar'

function AppContent() {
  const { seek } = usePlayer() // ← ici, une seule fois

  return (
    <div className="pb-24"> {/* espace pour le player en bas */}
      {/* tes routes ici */}
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
      </Routes>

      <PlayerBar onSeek={seek} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}