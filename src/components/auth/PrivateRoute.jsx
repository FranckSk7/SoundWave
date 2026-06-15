/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  PrivateRoute.jsx — Protection des pages connectées          ║
 * ║  Membre 2 · SoundWave · feature/auth                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Composant qui protège une route : si l'utilisateur n'est pas
 * connecté, il est redirigé vers /login automatiquement.
 *
 * ─── COMMENT ÇA MARCHE ───────────────────────────────────────────
 *
 *  1. La session est en cours de vérification → affiche PageLoader
 *  2. Utilisateur NON connecté → redirige vers /login
 *  3. Utilisateur connecté → affiche la page demandée (children)
 *
 * ─── UTILISATION (dans App.jsx — Membre 3) ───────────────────────
 *
 *  import PrivateRoute from './components/auth/PrivateRoute';
 *
 *  // Entourer toutes les routes qui nécessitent d'être connecté :
 *  <Routes>
 *    <Route path="/login"    element={<Login />} />
 *    <Route path="/register" element={<Register />} />
 *
 *    <Route element={<PrivateRoute />}>
 *      <Route path="/"         element={<Home />} />
 *      <Route path="/search"   element={<Search />} />
 *      <Route path="/library"  element={<Library />} />
 *      <Route path="/profile"  element={<Profile />} />
 *    </Route>
 *  </Routes>
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PageLoader } from "../ui/Loader";

export default function PrivateRoute() {
  const { isLoggedIn, initialized } = useAuth();

  // Attendre la vérification de la session avant de décider
  if (!initialized) return <PageLoader message="Vérification de la session…" />;

  // Non connecté → redirection vers /login
  // "replace" évite d'avoir /login dans l'historique de navigation
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Connecté → afficher la page demandée
  return <Outlet />;
}
