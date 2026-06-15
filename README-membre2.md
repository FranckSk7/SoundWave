# Membre 2 — Authentification

> Module complet d'authentification pour SoundWave.
> Branche : `feature/auth`

---

## Fichiers créés

```
src/
├── pages/
│   ├── Login.jsx                    ← Page de connexion
│   └── Register.jsx                 ← Page d'inscription
├── components/
│   └── auth/
│       └── PrivateRoute.jsx         ← Protection des routes
├── hooks/
│   └── useAuth.js                   ← Hook principal (à utiliser dans les composants)
├── store/
│   └── authStore.js                 ← État global Zustand
└── services/
    └── authService.js               ← Appels directs à Supabase Auth
```

---

## Architecture — Comment les fichiers s'articulent

```
Supabase Auth (serveur)
        ↑↓
authService.js          ← parle à Supabase directement
        ↑↓
useAuth.js              ← hook qui utilise authService + authStore
        ↑↓              ← point d'entrée pour les composants
authStore.js            ← état global (user, profile, loading)
        ↑↓
Login.jsx / Register.jsx / PrivateRoute.jsx   ← utilisent useAuth()
```

**Règle simple :** Dans un composant, importe toujours `useAuth` — jamais `authService` directement.

---

## Comment utiliser dans un composant

### Vérifier si l'utilisateur est connecté

```jsx
import { useAuth } from '../hooks/useAuth';

function MonComposant() {
  const { isLoggedIn, user, profile } = useAuth();

  if (!isLoggedIn) return <p>Non connecté</p>;

  return <p>Bonjour, {profile?.full_name}</p>;
}
```

### Se connecter (formulaire)

```jsx
import { useAuth } from '../hooks/useAuth';

function LoginForm() {
  const { signIn } = useAuth();

  const handleSubmit = async () => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error(error.message);
    } else {
      // Connexion réussie → rediriger
    }
  };
}
```

### Se déconnecter

```jsx
import { useAuth } from '../hooks/useAuth';

function LogoutButton() {
  const { signOut } = useAuth();

  return <button onClick={signOut}>Se déconnecter</button>;
}
```

### Afficher les infos de l'utilisateur

```jsx
const { user, profile } = useAuth();

// user.id          → identifiant unique Supabase
// user.email       → adresse email
// profile.username → nom d'utilisateur choisi à l'inscription
// profile.full_name→ nom complet
// profile.avatar_url → URL de la photo de profil
```

---

## Protéger une route (Membre 3 — App.jsx)

```jsx
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/auth/PrivateRoute';
import Login    from './pages/Login';
import Register from './pages/Register';
import Home     from './pages/Home';
import Profile  from './pages/Profile';

function App() {
  return (
    <Routes>
      {/* Pages publiques — accessibles sans connexion */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages privées — redirigent vers /login si non connecté */}
      <Route element={<PrivateRoute />}>
        <Route path="/"        element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search"  element={<Search />} />
        <Route path="/library" element={<Library />} />
      </Route>
    </Routes>
  );
}
```

---

## Intégrer ToastProvider (Membre 3 — App.jsx)

Le système de notifications du Membre 8 doit envelopper toute l'app :

```jsx
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* ...routes... */}
      </Routes>
    </ToastProvider>
  );
}
```

---

## Ce que retourne useAuth()

| Valeur | Type | Description |
|---|---|---|
| `user` | object \| null | Utilisateur Supabase Auth |
| `profile` | object \| null | Profil de la table `profiles` |
| `loading` | boolean | true pendant la vérification de session |
| `initialized` | boolean | true une fois la session vérifiée au démarrage |
| `isLoggedIn` | boolean | raccourci : `!!user` |
| `signIn(email, pw)` | function | Connexion → retourne `{ error }` |
| `signUp(email, pw, username)` | function | Inscription → retourne `{ error }` |
| `signInWithGoogle()` | function | OAuth Google → retourne `{ error }` |
| `signOut()` | function | Déconnexion |
| `resetPassword(email)` | function | Email de reset → retourne `{ error }` |

---

## Ce que fait authService.js

Fonctions bas niveau — à utiliser via `useAuth`, pas directement.

| Fonction | Description |
|---|---|
| `signUp(email, pw, username)` | Crée le compte Auth + insère dans `profiles` |
| `signIn(email, pw)` | Connexion email/mot de passe |
| `signInWithGoogle()` | Connexion OAuth Google |
| `signOut()` | Déconnexion |
| `getSession()` | Récupère la session active |
| `onAuthStateChange(cb)` | Écoute les changements d'état |
| `resetPassword(email)` | Envoie l'email de réinitialisation |

---

## Ce que fait authStore.js

Store Zustand qui contient l'état global. Géré automatiquement par `useAuth`.

| État | Type | Description |
|---|---|---|
| `user` | object \| null | Utilisateur connecté |
| `profile` | object \| null | Profil de la base de données |
| `loading` | boolean | En cours de chargement |
| `initialized` | boolean | Session vérifiée au démarrage |

---

## Ce que fait PrivateRoute.jsx

Composant wrapper pour React Router. Trois comportements :

```
Session en vérification  →  Affiche PageLoader (spinner plein écran)
Non connecté             →  Redirige vers /login
Connecté                 →  Affiche la page demandée (<Outlet />)
```

---

## Page Login.jsx — Fonctionnalités

- Connexion email + mot de passe
- Connexion Google (OAuth Supabase)
- Affichage / masquage du mot de passe
- Réinitialisation du mot de passe (envoi d'email)
- Messages d'erreur clairs selon le type d'erreur Supabase
- Redirection automatique si déjà connecté
- Panel décoratif gauche (desktop uniquement)

---

## Page Register.jsx — Fonctionnalités

- Inscription email + mot de passe + username
- Connexion Google (OAuth)
- Validation complète : email, username, longueur mot de passe
- Indicateur de force du mot de passe (5 niveaux)
- Checkbox conditions d'utilisation
- Messages d'erreur par champ
- Redirection automatique si déjà connecté

---

## Dépendances avec les autres membres

| Fichier utilisé | Créé par | Pourquoi |
|---|---|---|
| `src/services/supabase.js` | Membre 1 | Client Supabase partagé |
| `src/components/ui/Button.jsx` | Membre 8 | Boutons dans les formulaires |
| `src/components/ui/Input.jsx` | Membre 8 | Champs de saisie |
| `src/components/ui/Loader.jsx` | Membre 8 | Spinner dans PrivateRoute |

---

## Dépendances npm requises

Ces packages doivent être installés par le Membre 1 :

```bash
npm install zustand react-router-dom @supabase/supabase-js
```

---

## Variables d'environnement requises

Demander les valeurs au Membre 1 :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ta_cle_anon_publique
```

---

## Table Supabase requise

La table `profiles` doit être créée par le Membre 1 :

```sql
CREATE TABLE profiles (
  id          uuid      REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username    text      UNIQUE NOT NULL,
  full_name   text,
  avatar_url  text,
  bio         text,
  created_at  timestamp DEFAULT NOW()
);

-- Permettre aux utilisateurs de lire/modifier leur propre profil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Modification propre profil"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

## Activer Google OAuth (Membre 1 — Supabase Dashboard)

```
Supabase Dashboard
  → Authentication
  → Providers
  → Google
  → Enable Google provider
  → Renseigner Client ID et Client Secret Google Cloud Console
  → Authorized redirect URI : https://xxx.supabase.co/auth/v1/callback
```

---

*Membre 2 · SoundWave · feature/auth*
