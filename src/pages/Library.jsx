import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserPlaylists, createPlaylist } from '../services/playlistService'
import { useAuth } from '../hooks/useAuth'

// ── Icônes internes au composant ──────────────────────────────────────────────
const Icons = {
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 5v14M5 12h14"/></svg>,
  Note: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sw-muted"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>,
  Heart: () => <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-sw-muted"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Grid: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
}

export default function Library() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Récupération sécurisée et mise en cache des playlists de l'utilisateur
  const { data: playlists = [], isLoading, error } = useQuery({
    queryKey: ['playlists', profile?.id],
    queryFn: () => getUserPlaylists(profile?.id),
    enabled: !!profile?.id,
    staleTime: 30000,
  })

  // 2. Mutation pour créer une playlist à la volée
  const createPlaylistMutation = useMutation({
    mutationFn: () => createPlaylist({ name: `Ma playlist n°${playlists.length + 1}`, is_public: false }),
    onSuccess: (newPlaylist) => {
      // Invalide le cache pour forcer la Sidebar et la Library à se recharger
      queryClient.invalidateQueries({ queryKey: ['playlists', profile?.id] })
      // Redirige instantanément vers l'édition de la nouvelle playlist
      if (newPlaylist?.id) {
        navigate(`/playlist/${newPlaylist.id}`)
      }
    }
  })

  // Filtrage des playlists selon la barre de recherche interne
  const filteredPlaylists = playlists.filter(pl => 
    pl.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Gestion de l'état de chargement initial
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-sw-muted animate-pulse">
          <svg className="animate-spin w-5 h-5 text-sw-green" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm font-medium">Chargement de votre bibliothèque…</span>
        </div>
      </div>
    )
  }

  // Gestion de l'état d'erreur de la requête Supabase
  if (error) {
    return (
      <div className="p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <p className="text-sw-muted font-medium mb-3">Impossible de charger vos playlists</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['playlists', profile?.id] })}
          className="px-4 py-2 bg-sw-surface hover:bg-sw-surface-hover text-white rounded-full font-semibold text-sm transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 select-none">
      {/* En-tête de la bibliothèque */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Votre bibliothèque</h1>
        <button
          onClick={() => createPlaylistMutation.mutate()}
          disabled={createPlaylistMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 rounded-full font-bold text-sm transition-all duration-150 shadow-md"
        >
          <Icons.Plus />
          <span>Créer une playlist</span>
        </button>
      </div>

      {/* Barre de recherche et filtres de vue */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icons.Search />
          </span>
          <input
            type="text"
            placeholder="Rechercher une playlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-sw-surface text-white placeholder-sw-muted rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-sw-green transition-all border border-transparent focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 text-sw-muted">
          <button className="p-2 rounded-full bg-sw-surface text-white" title="Vue en grille">
            <Icons.Grid />
          </button>
        </div>
      </div>

      {/* Grille des contenus */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        
        {/* Case fixe : Titres Likés (Favoris) */}
        <NavLink 
          to="/liked"
          className="group bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 p-4 rounded-xl flex flex-col justify-end min-h-[200px] shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-sm group-hover:scale-105 transition-transform">
            <Icons.Heart />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight mb-1">Titres likés</h3>
            <p className="text-xs text-white/70 font-medium">Vos morceaux préférés</p>
          </div>
        </NavLink>

        {/* Liste dynamique des playlists créées */}
        {filteredPlaylists.map(pl => (
          <div 
            key={pl.id}
            onClick={() => navigate(`/playlist/${pl.id}`)}
            className="group bg-sw-surface hover:bg-sw-surface-hover p-4 rounded-xl cursor-pointer transition-all duration-200 flex flex-col"
          >
            {/* Jaquette de la playlist */}
            <div className="w-full aspect-square bg-sw-surface-hover rounded-lg overflow-hidden shadow-md mb-4 relative">
              {pl.cover_url ? (
                <img 
                  src={pl.cover_url} 
                  alt={pl.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.Note />
                </div>
              )}
            </div>

            {/* Infos de la playlist */}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate mb-1 group-hover:text-sw-green transition-colors">
                {pl.name}
              </h3>
              <p className="text-xs text-sw-muted truncate">
                {pl.is_public ? 'Playlist publique' : 'Playlist privée'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* État vide si aucune playlist ne correspond à la recherche */}
      {filteredPlaylists.length === 0 && searchQuery !== '' && (
        <div className="text-center py-12 text-sw-muted text-sm">
          Aucune playlist ne correspond à "{searchQuery}"
        </div>
      )}
    </div>
  )
}
