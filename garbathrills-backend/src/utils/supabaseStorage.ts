import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { supabase, SUPABASE_STORAGE_BUCKET } from '../config/supabase';

const PHOTO_PREFIX = 'profile-photos';

/**
 * Compresses/resizes an uploaded image buffer and pushes it to Supabase Storage.
 * Returns the public URL to store on the user's profile.
 */
export const uploadPhotoToSupabase = async (userId: string, buffer: Buffer): Promise<string> => {
  // Resize + compress, mirroring what Cloudinary used to do automatically.
  // Keeps photo sizes small so the free 1GB storage / 5GB bandwidth tier stretches further.
  const optimized = await sharp(buffer)
    .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const key = `${PHOTO_PREFIX}/${userId}/${uuidv4()}.jpg`;

  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(key, optimized, { contentType: 'image/jpeg', upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(key);
  return data.publicUrl;
};

/**
 * Deletes a photo from Supabase Storage given its public URL. Safe to call
 * even if the URL doesn't belong to our bucket — it just no-ops in that case.
 */
export const deletePhotoFromSupabase = async (photoUrl: string): Promise<void> => {
  const marker = `/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/`;
  const markerIndex = photoUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const key = photoUrl.slice(markerIndex + marker.length);

  try {
    await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([key]);
  } catch (error) {
    // Non-fatal — the profile update should still succeed even if cleanup fails
    console.error('Failed to delete photo from Supabase Storage:', error);
  }
};
