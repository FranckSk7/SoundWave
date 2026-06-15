import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim() === '') {
      setResults({ songs: [], artists: [], albums: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [songs, artists, albums] = await Promise.all([
          supabase.from('songs').select('*, artists(name)').ilike('title', `%${query}%`).limit(10),
          supabase.from('artists').select('*').ilike('name', `%${query}%`).limit(10),
          supabase.from('albums').select('*, artists(name)').ilike('title', `%${query}%`).limit(10),
        ])
        setResults({
          songs: songs.data || [],
          artists: artists.data || [],
          albums: albums.data || [],
        })
      } catch (error) {
        console.error('Erreur recherche:', error)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  return { query, setQuery, results, loading }
}
