import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { Swipe } from '../models/Swipe';
import { Match, sortedPair } from '../models/Match';
import { AuthRequest } from '../middleware/auth';
import { getExcludedUserIds } from '../utils/blockHelpers';

const publicProfileFields = 'name age gender bio interests photos';

const swipeSchema = z.object({
  toUserId: z.string().min(1),
  direction: z.enum(['like', 'pass']),
});

// GET /api/swipe/deck — candidates to show in the swipe stack
export const getDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  const me = await User.findById(req.userId);
  if (!me) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (!me.lookingFor) {
    res.status(400).json({ message: 'Please set your dating preference in your profile first' });
    return;
  }

  // Users I've already swiped on (like or pass) should not reappear
  const alreadySwiped = await Swipe.find({ fromUser: me._id }).select('toUser').lean();
  const excludedIds: (string | Types.ObjectId)[] = alreadySwiped.map((s) => s.toUser);

  // Also exclude anyone involved in a block in either direction
  const blockedIds = await getExcludedUserIds(req.userId as string);
  excludedIds.push(...blockedIds);

  const genderFilter = me.lookingFor === 'anyone' ? {} : { gender: me.lookingFor };

  const candidates = await User.find({
    _id: { $ne: me._id, $nin: excludedIds },
    profileComplete: true,
    ...genderFilter,
    $or: [{ lookingFor: 'anyone' }, { lookingFor: me.gender }],
  })
    .select(publicProfileFields)
    .limit(20)
    .lean();

  res.status(200).json({ profiles: candidates });
};

// POST /api/swipe — record a like/pass, detect mutual match
export const recordSwipe = async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = swipeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const { toUserId, direction } = parsed.data;

  if (!Types.ObjectId.isValid(toUserId)) {
    res.status(400).json({ message: 'Invalid user id' });
    return;
  }

  if (toUserId === req.userId) {
    res.status(400).json({ message: "You can't swipe on yourself" });
    return;
  }

  const targetUser = await User.findById(toUserId).select(publicProfileFields);
  if (!targetUser) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  try {
    await Swipe.create({ fromUser: req.userId, toUser: toUserId, direction });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: 'You already swiped on this profile' });
      return;
    }
    throw error;
  }

  if (direction === 'pass') {
    res.status(200).json({ matched: false });
    return;
  }

  // Check if the other user already liked me back
  const reciprocal = await Swipe.findOne({
    fromUser: toUserId,
    toUser: req.userId,
    direction: 'like',
  });

  if (!reciprocal) {
    res.status(200).json({ matched: false });
    return;
  }

  const [userA, userB] = sortedPair(req.userId as string, toUserId);

  try {
    await Match.create({ userA, userB });
  } catch (error: any) {
    // Match already exists (race condition or duplicate call) — not an error for the client
    if (error?.code !== 11000) {
      throw error;
    }
  }

  res.status(200).json({ matched: true, matchedUser: targetUser });
};

// GET /api/swipe/likes-received — people who liked me, that I haven't swiped on yet
export const getLikesReceived = async (req: AuthRequest, res: Response): Promise<void> => {
  const blockedIds = await getExcludedUserIds(req.userId as string);

  const likesToMe = await Swipe.find({ toUser: req.userId, direction: 'like' })
    .select('fromUser')
    .lean();

  const likerIds = likesToMe
    .map((s) => s.fromUser)
    .filter((id) => !blockedIds.includes(id.toString()));

  if (likerIds.length === 0) {
    res.status(200).json({ profiles: [] });
    return;
  }

  const alreadySwipedBack = await Swipe.find({
    fromUser: req.userId,
    toUser: { $in: likerIds },
  })
    .select('toUser')
    .lean();

  const respondedIds = new Set(alreadySwipedBack.map((s) => s.toUser.toString()));
  const pendingIds = likerIds.filter((id) => !respondedIds.has(id.toString()));

  const profiles = await User.find({ _id: { $in: pendingIds } })
    .select(publicProfileFields)
    .lean();

  res.status(200).json({ profiles });
};
