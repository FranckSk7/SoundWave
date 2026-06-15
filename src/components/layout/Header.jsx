import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Accueil'
    if (path === '/search') return 'Recherche'
    if (path === '/library') return 'Ma bibliothèque'
    if (path === '/profile') return 'Profil'
    if (path.startsWith('/playlist')) return 'Playlist'
    if (path.startsWith('/artist')) return 'Artiste'
    if (path.startsWith('/album')) return 'Album'
    return 'SoundWave'
  }

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <ChevronLeft />
        </button>
        <button onClick={() => navigate(1)} className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-white/10 transition-all">
          <ChevronRight />
        </button>
        <span className="md:hidden text-white font-bold text-lg tracking-tight">{getPageTitle()}</span>
      </div>

      <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <span className="text-[#1db954] font-black text-xl tracking-tighter">SOUND</span>
        <span className="text-white font-black text-xl tracking-tighter">WAVE</span>
      </div>

      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 bg-black/50 hover:bg-white/10 transition-all px-3 py-1.5 rounded-full text-white/80 hover:text-white">
          <div className="w-7 h-7 rounded-full bg-[#1db954] flex items-center justify-center">
            <UserIcon />
          </div>
          <span className="hidden md:inline text-sm font-medium">Mon compte</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-lg shadow-xl overflow-hidden z-50 border border-white/10">
            <button onClick={() => { navigate('/profile'); setMenuOpen(false) }} className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
              Profil
            </button>
            <hr className="border-white/10" />
            <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors">
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
