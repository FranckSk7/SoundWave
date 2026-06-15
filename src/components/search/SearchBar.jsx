import { Search } from 'lucide-react'

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-800 rounded-full px-4 py-3 w-full max-w-xl">
      <Search size={20} className="text-zinc-400" />
      <input
        type="text"
        placeholder="Que voulez-vous écouter ?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-transparent outline-none text-white placeholder-zinc-400 w-full"
      />
    </div>
  )
}
