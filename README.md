<div align="center">

# 🎵 SoundWave CM

**La plateforme musicale camerounaise — Spotify-like, temps réel, offline**

React 19 · Supabase · PWA · Media Session API · Realtime

</div>

---

## Aperçu

SoundWave CM est une application de streaming musical inspirée de Spotify, conçue pour la musique camerounaise et africaine. Elle fonctionne **en ligne et hors ligne**, joue en **arrière-plan** sur mobile et PC, et permet le **partage de playlists en temps réel** entre utilisateurs connectés.

---

## Fonctionnalités

### Musique
- Lecture audio HTML5 avec contrôles complets (play/pause, suivant, précédent)
- Barre de progression cliquable avec seek
- Contrôle du volume avec slider
- Modes : lecture aléatoire (shuffle), répéter tout, répéter un titre
- File d'attente (queue) persistée entre sessions

### Lecture en arrière-plan
La lecture continue quand l'écran est verrouillé ou l'application en arrière-plan.  
Utilise la **Media Session API** :
- Contrôles depuis l'écran de verrouillage du téléphone
- Widget de notification avec pochette et boutons
- Touches Media du clavier (PC)
- Compatible : Android Chrome, iOS Safari 15+, Windows, macOS

### Playlists partagées (temps réel)
- Créer une playlist et l'activer **"Publique"** → elle apparaît instantanément pour tous les autres utilisateurs
- Section **Communauté** : toutes les playlists publiques visibles en direct
- La sidebar affiche les nouvelles playlists sans recharger la page
- Technologie : **Supabase Realtime** (WebSocket PostgreSQL)

### PWA (Progressive Web App)
- Installable sur Android, iOS, Windows, macOS comme une vraie app
- Mode hors-ligne : navigation et données en cache
- Cache audio : les titres écoutés restent disponibles offline
- Service Worker Workbox généré automatiquement

### Genres camerounais
- Makossa, Bikutsi, Afrobeat, Coupé-Décalé, Gospel CM, Hip-Hop CM, Ndombolo, Zouk CM, Rumba, Highlife, R&B Afro, Traditionnel

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | React 19 |
| Routing | React Router v7 |
| État global | Zustand (persist) |
| Données serveur | TanStack React Query v5 |
| Backend / BDD | Supabase (PostgreSQL) |
| Temps réel | Supabase Realtime (postgres_changes) |
| Auth | Supabase Auth (email + Google OAuth) |
| Stockage fichiers | Supabase Storage |
| Audio arrière-plan | Media Session API |
| PWA / Offline | Vite PWA Plugin + Workbox |
| Styles | Tailwind CSS v3 |
| Build | Vite 8 |

---

## Structure de la base de données Supabase

```sql
-- Profiles (créés automatiquement à l'inscription)
profiles (id, username, full_name, avatar_url, created_at)

-- Artistes et albums
artists (id, name, image_url, bio)
albums  (id, title, cover_url, release_year, artist_id)

-- Titres musicaux
songs (id, title, duration, audio_url, cover_url, plays, artist_id, album_id, created_at)

-- Playlists (is_public = partage temps réel)
playlists (id, name, description, cover_url, is_public, user_id, created_at, updated_at)

-- Chansons dans les playlists
playlist_songs (id, playlist_id, song_id, position, added_at)

-- Titres likés
liked_songs (user_id, song_id, liked_at)
```

**RLS (Row Level Security)** : chaque utilisateur ne voit que ses propres playlists privées. Les playlists publiques sont accessibles à tous.

---

## Installation et démarrage

### Prérequis
- Node.js 18+ — [nodejs.org](https://nodejs.org)
- Un compte Supabase avec les tables créées (voir schéma ci-dessus)

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/votre-equipe/soundwave-cm.git
cd soundwave-cm

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 4. Lancer en développement
npm run dev
# → http://localhost:5173

# 5. Build production
npm run build
npm run preview
```

### Variables d'environnement

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme
```

---

## Lecture en arrière-plan — Comment ça marche

```
Utilisateur → lecture d'un titre
         ↓
AudioEngine.jsx crée un <Audio> HTML5
         ↓
Media Session API enregistre les métadonnées (titre, artiste, pochette)
         ↓
Système d'exploitation → crée une notification de lecture
         ↓
Boutons de la notification → déclenchent les handlers MediaSession
         ↓
Zustand store mis à jour → UI synchronisée
```

**Fichier clé** : `src/components/player/AudioEngine.jsx`

---

## Partage de playlists en temps réel — Comment ça marche

```
Utilisateur A crée une playlist et la rend publique
         ↓
Supabase INSERT dans la table playlists (is_public = true)
         ↓
Supabase Realtime diffuse l'événement à tous les clients connectés
         ↓
Utilisateur B : sidebar affiche la nouvelle playlist (badge "Nouveau")
               page Communauté mise à jour automatiquement
               Home page section "Communauté" actualisée
```

**Fichier clé** : `src/services/playlistService.js` → `subscribeToPublicPlaylists()`

---

## Installation comme application mobile

### Android (Chrome)
1. Ouvrir l'URL dans Chrome
2. Menu ⋮ → "Ajouter à l'écran d'accueil"
3. L'icône SoundWave apparaît comme une vraie app

### iOS (Safari)
1. Ouvrir l'URL dans Safari
2. Bouton Partager → "Sur l'écran d'accueil"

### PC (Chrome / Edge)
1. Icône d'installation dans la barre d'adresse
2. Ou menu → "Installer SoundWave CM"

---

## Architecture des composants

```
src/
├── App.jsx                      # Router + QueryClient + InstallCapture
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx       # Layout global + AudioEngine
│   │   └── Header.jsx           # Header avec navigation
│   ├── player/
│   │   ├── AudioEngine.jsx      # Moteur audio + Media Session API
│   │   └── PlayerBar.jsx        # Barre de lecture (progress, volume, contrôles)
│   ├── playlist/
│   │   ├── SongRow.jsx          # Ligne chanson avec like + remove
│   │   └── PlaylistCard.jsx     # Carte playlist
│   └── sidebar/
│       ├── Sidebar.jsx          # Sidebar desktop (playlists Realtime)
│       └── MobileNav.jsx        # Navigation mobile (5 onglets)
├── pages/
│   ├── Home.jsx                 # Accueil avec genres camerounais
│   ├── Search.jsx               # Recherche avec debounce
│   ├── Library.jsx              # Bibliothèque personnelle
│   ├── Community.jsx            # Playlists publiques en temps réel
│   ├── Playlist.jsx             # Page playlist avec share + edit
│   ├── Profile.jsx              # Profil utilisateur + stats
│   ├── Login.jsx                # Connexion (email + Google)
│   └── Register.jsx             # Inscription
├── services/
│   ├── supabase.js              # Client Supabase
│   ├── authService.js           # Authentification
│   ├── playlistService.js       # CRUD playlists + Realtime subscription
│   └── songsService.js          # Chansons, artistes, albums
├── store/
│   ├── authStore.js             # État auth (Zustand)
│   └── playerStore.js           # État lecteur (Zustand + persist)
└── hooks/
    ├── useAuth.js               # Hook d'authentification
    └── useSearch.js             # Hook de recherche
```

---

## Équipe

Projet académique — Développement Mobile  
Université de Yaoundé — 2026

---

<div align="center">
🇨🇲 Fait avec passion pour la musique camerounaise
</div>
