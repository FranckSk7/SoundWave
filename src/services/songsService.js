import { supabase } from './supabase'

// 1. Récupère les morceaux populaires (triés de manière sécurisée par titre ou date si 'plays' n'existe pas)
export async function getPopularSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*') // Nettoyé : suppression de , artists(name) qui provoquait l'erreur 400
    .order('title', { ascending: true }) // Sécurisé : tri par titre car la colonne 'plays' n'existe pas
    .limit(10)
    
  if (error) throw error
  return data || []
}

// 2. Récupère les morceaux récents
export async function getRecentSongs() {
  const { data, error } = await supabase
    .from('songs')
    .select('*') // Nettoyé : suppression de , artists(name)
    .order('created_at', { ascending: false })
    .limit(10)
    
  if (error) throw error
  return data || []
}

// 3. Récupère tous les artistes
export async function getAllArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .limit(10)
    
  if (error) throw error
  return data || []
}

// 4. Récupère tous les albums
export async function getAllAlbums() {
  const { data, error } = await supabase
    .from('albums')
    .select('*') // Nettoyé : suppression de , artists(name)
    .limit(10)
    
  if (error) throw error
  return data || []
}

// 5. Fonction de recherche (utilisée par ta page de recherche globale)
export async function searchSongs(query) {
  let request = supabase
    .from('songs')
    .select('*')

  if (query) {
    // Recherche par titre ou par le champ texte 'artist'
    request = request.or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
  }

  const { data, error } = await request.order('title', { ascending: true }).limit(10)

  if (error) throw error
  return data || []
}
