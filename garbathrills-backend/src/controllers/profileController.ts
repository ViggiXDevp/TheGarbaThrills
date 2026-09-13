import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { uploadPhotoToSupabase, deletePhotoFromSupabase } from '../utils/supabaseStorage';
import { INTEREST_TAGS } from '../constants/interests';

// ---------- Validation ----------

const updateProfileSchema = z.object({
  age: z.number().int().min(18).max(100),
  bio: z.string().max(150).optional().default(''),
  interests: z.array(z.enum(INTEREST_TAGS)).max(8),
  lookingFor: z.enum(['male', 'female', 'other', 'anyone']),
});

// ---------- Controllers ----------

export const getInterestTags = (_req: AuthRequest, res: Response): void => {
  res.status(200).json({ tags: INTEREST_TAGS });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const { age, bio, interests, lookingFor } = parsed.data;

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  user.age = age;
  user.bio = bio;
  user.interests = interests;
  user.lookingFor = lookingFor;

  // Profile is complete once details are filled AND at least 1 photo is uploaded
  user.profileComplete = user.photos.length > 0;

  await user.save();

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      lookingFor: user.lookingFor,
      age: user.age,
      bio: user.bio,
      interests: user.interests,
      photos: user.photos,
      profileComplete: user.profileComplete,
    },
  });
};

export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: 'No photo file provided' });
    return;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (user.photos.length >= 3) {
    res.status(400).json({ message: 'You can only upload up to 3 photos' });
    return;
  }

  try {
    const photoUrl = await uploadPhotoToSupabase(req.userId as string, file.buffer);

    user.photos.push(photoUrl);

    // Profile becomes complete once age/interests are set AND at least 1 photo exists
    if (user.age && user.interests.length > 0) {
      user.profileComplete = true;
    }

    await user.save();

    res.status(200).json({ photos: user.photos, profileComplete: user.profileComplete });
  } catch (error) {
    console.error('Supabase Storage upload failed:', error);
    res.status(500).json({ message: 'Photo upload failed. Please try again.' });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  const { photoUrl } = req.body as { photoUrl?: string };

  if (!photoUrl) {
    res.status(400).json({ message: 'photoUrl is required' });
    return;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  user.photos = user.photos.filter((p) => p !== photoUrl);

  if (user.photos.length === 0) {
    user.profileComplete = false;
  }

  await user.save();
  await deletePhotoFromSupabase(photoUrl);

  res.status(200).json({ photos: user.photos, profileComplete: user.profileComplete });
};

// GET /api/profile/:userId — public profile info for viewing someone else's profile
export const getPublicProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  const user = await User.findById(userId).select(
    'name age gender bio interests photos',
  );

  if (!user) {
    res.status(404).json({ message: 'Profile not found' });
    return;
  }

  res.status(200).json({ user });
};
