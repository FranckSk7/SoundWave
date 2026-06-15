import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlaylist } from '../../services/playlistService';

// ─── ICÔNES SVG ───────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-sw-muted">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);

// ─── COMPOSANT ────────────────────────────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {Object}   props.playlist   - Objet playlist Supabase
 * @param {boolean}  props.editable   - Affiche les options d'édition/suppression
 * @param {Function} props.onEdit     - Callback pour ouvrir le modal d'édition
 */
export default function PlaylistCard({ playlist, editable = false, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const songCount = playlist.playlist_songs?.[0]?.count ?? playlist.playlist_songs?.length ?? 0;

  const deleteMutation = useMutation({
    mutationFn: () => deletePlaylist(playlist.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Supprimer « ${playlist.name} » ? Cette action est irréversible.`)) {
      deleteMutation.mutate();
    }
    setMenuOpen(false);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(playlist);
    setMenuOpen(false);
  };

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Déclenche la lecture via le store Zustand (à connecter)
    navigate(`/playlist/${playlist.id}`);
  };

  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className="playlist-card group relative flex flex-col gap-3 p-3 rounded-xl bg-sw-surface hover:bg-sw-surface-hover transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
    >
      {/* Cover */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-sw-bg shadow-lg">
        {playlist.cover_url ? (
          <img
            src={playlist.cover_url}
            alt={playlist.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sw-surface to-sw-bg">
            <MusicIcon />
          </div>
        )}

        {/* Play button overlay */}
        <button
          onClick={handlePlay}
          className={`
            absolute bottom-2 right-2 w-10 h-10 rounded-full
            bg-sw-green text-black flex items-center justify-center
            shadow-xl transition-all duration-300 hover:scale-105 hover:bg-sw-green-light
            ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
          aria-label={`Lire ${playlist.name}`}
        >
          <PlayIcon />
        </button>
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="font-semibold text-sw-text text-sm truncate leading-tight">
          {playlist.name}
        </p>
        <p className="text-xs text-sw-muted truncate">
          {playlist.description || `${songCount} titre${songCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Menu contextuel (éditable) */}
      {editable && (
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(v => !v); }}
            className={`
              w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm
              flex items-center justify-center text-sw-text
              transition-all duration-200 hover:bg-black/80
              ${hovered || menuOpen ? 'opacity-100' : 'opacity-0'}
            `}
            aria-label="Options"
          >
            <DotsIcon />
          </button>

          {menuOpen && (
            <div className="absolute top-8 right-0 z-50 w-40 rounded-xl bg-sw-popup shadow-2xl border border-white/5 overflow-hidden">
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-sw-text hover:bg-white/10 transition-colors"
              >
                <EditIcon /> Modifier
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors"
                disabled={deleteMutation.isPending}
              >
                <TrashIcon /> {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
