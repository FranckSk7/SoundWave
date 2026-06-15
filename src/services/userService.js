import { supabase } from "./supabase";

// ─── Récupérer le profil d'un utilisateur ────────────────────────────────────
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// ─── Mettre à jour le profil (nom, bio) ──────────────────────────────────────
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ─── Uploader un avatar dans Supabase Storage ────────────────────────────────
export const uploadAvatar = async (userId, file) => {
  const fileExt  = file.name.split(".").pop();
  const filePath = `avatars/${userId}.${fileExt}`;

  // Supprimer l'ancien avatar s'il existe
  await supabase.storage.from("covers").remove([filePath]);

  // Uploader le nouveau fichier
  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Récupérer l'URL publique
  const { data } = supabase.storage
    .from("covers")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// ─── Mettre à jour l'avatar dans la table profiles ───────────────────────────
export const updateAvatar = async (userId, file) => {
  // 1. Upload dans le storage
  const avatarUrl = await uploadAvatar(userId, file);

  // 2. Sauvegarder l'URL dans le profil
  const updatedProfile = await updateProfile(userId, { avatar_url: avatarUrl });

  return updatedProfile;
};

// ─── Récupérer l'utilisateur connecté ────────────────────────────────────────
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};