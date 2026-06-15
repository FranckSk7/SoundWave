import { NavLink } from 'react-router-dom'
import usePlayerStore from '../../store/playerStore'

const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  Library: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>,
  Globe: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
  Profile: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
}

const tabs = [
  { to: '/',          label: 'Accueil',    Icon: Icons.Home    },
  { to: '/search',    label: 'Rechercher', Icon: Icons.Search  },
  { to: '/library',   label: 'Biblio',     Icon: Icons.Library },
  { to: '/community', label: 'Comm.',      Icon: Icons.Globe   },
  { to: '/profile',   label: 'Profil',     Icon: Icons.Profile },
]

export default function MobileNav() {
  const { currentSong } = usePlayerStore()

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sw-bg/95 backdrop-blur-xl border-t border-white/10 pb-safe ${currentSong ? 'translate-y-0' : ''}`}
      style={{ bottom: currentSong ? '90px' : '0' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-white' : 'text-sw-subtle hover:text-sw-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? 'text-sw-green' : ''}><Icon /></div>
                <span className="text-xs">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
