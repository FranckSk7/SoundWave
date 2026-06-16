import { useState } from 'react';
import { supabase } from '../services/supabase'; 
import { useAuth } from '../hooks/useAuth';

export default function UploadSong({ onClose }) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState(''); 
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null); 
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audioFile || !title.trim() || !artistName.trim()) {
      alert("Veuillez remplir le titre, l'artiste et sélectionner un fichier MP3.");
      return;
    }

    try {
      setUploading(true);

      // 1. Calculer automatiquement la durée du fichier audio
      const getAudioDuration = (file) => {
        return new Promise((resolve) => {
          const audio = new Audio();
          audio.src = URL.createObjectURL(file);
          audio.onloadedmetadata = () => {
            resolve(Math.round(audio.duration) || 180);
          };
          audio.onerror = () => resolve(180);
        });
      };
      const duration = await getAudioDuration(audioFile);

      // 2. Téléverser le fichier AUDIO dans le bucket 'tracks'
      const audioExt = audioFile.name.split('.').pop();
      const audioFileName = `${crypto.randomUUID()}.${audioExt}`;
      
      const { error: audioError } = await supabase.storage
        .from('tracks')
        .upload(audioFileName, audioFile);

      if (audioError) throw audioError;

      const { data: { publicUrl: audioUrl } } = supabase.storage
        .from('tracks')
        .getPublicUrl(audioFileName);

      // 3. Téléverser la COUVERTURE (Image) si elle existe
      let finalCoverUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'; // Image par défaut

      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverFileName = `${crypto.randomUUID()}.${coverExt}`;
        
        const { error: coverError } = await supabase.storage
          .from('tracks')
          .upload(`covers/${coverFileName}`, coverFile);

        if (!coverError) {
          const { data: { publicUrl } } = supabase.storage
            .from('tracks')
            .getPublicUrl(`covers/${coverFileName}`);
          finalCoverUrl = publicUrl;
        }
      }

      // 4. Insertion finale dans la table 'songs' (Sans artist_id pour éviter le crash)
      const { error: dbError } = await supabase
        .from('songs') 
        .insert([
          { 
            title: title, 
            audio_url: audioUrl,
            cover_url: finalCoverUrl, 
            artist: artistName,       
            duration: duration, 
            plays_count: 0
          }
        ]);

      if (dbError) throw dbError;

      alert('Son partagé avec succès sur SoundWave ! 🚀');
      if (onClose) onClose();
      
    } catch (error) {
      alert("Erreur lors du partage : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="text-white max-h-[85vh] overflow-y-auto px-2">
      <h2 className="text-xl font-bold mb-2 text-center">Partager un morceau</h2>
      <p className="text-xs text-sw-subtle mb-6 text-center">
        Ajoute tes fichiers. Ton morceau sera disponible immédiatement !
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Champ Titre */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sw-subtle mb-1.5">
            Titre de la chanson
          </label>
          <input 
            type="text" 
            placeholder="Ex: JOY" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sw-green transition-colors text-white placeholder-sw-subtle"
            required
          />
        </div>

        {/* Champ Artiste */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sw-subtle mb-1.5">
            Nom de l'artiste / Groupe
          </label>
          <input 
            type="text" 
            placeholder="Ex: Tayc" 
            value={artistName} 
            onChange={(e) => setArtistName(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sw-green transition-colors text-white placeholder-sw-subtle"
            required
          />
        </div>

        {/* Fichier de Couverture (Image) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sw-subtle mb-1.5">
            Image de couverture (Optionnel)
          </label>
          <div className="relative group flex items-center justify-between border border-white/10 hover:border-sw-green rounded-lg p-3 bg-[#1e1e1e] transition-colors cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-xs text-sw-muted truncate max-w-[200px]">
              {coverFile ? coverFile.name : 'Sélectionner une image (.jpg, .png)'}
            </span>
            <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded group-hover:bg-sw-green group-hover:text-black transition-colors">
              Parcourir
            </span>
          </div>
        </div>

        {/* Fichier Audio */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-sw-subtle mb-1.5">
            Fichier Audio (MP3)
          </label>
          <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-sw-green rounded-lg p-5 bg-[#1e1e1e] transition-colors cursor-pointer">
            <input 
              type="file" 
              accept="audio/mp3, audio/mpeg" 
              onChange={(e) => setAudioFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
              required
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-sw-muted group-hover:text-sw-green mb-1 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 10l12-3M7 10a3 3 0 11-6 0 3 3 0 016 0zm14 6a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-sw-muted font-medium truncate max-w-xs group-hover:text-white transition-colors">
              {audioFile ? audioFile.name : 'Sélectionner le fichier .mp3'}
            </span>
          </div>
        </div>

        {/* Bouton de validation */}
        <button 
          type="submit" 
          disabled={uploading}
          className="w-full mt-2 bg-sw-green hover:bg-sw-green/90 text-black font-bold py-2.5 px-4 rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Téléversement des fichiers...' : 'Mettre en ligne'}
        </button>
      </form>
    </div>
  );
}
