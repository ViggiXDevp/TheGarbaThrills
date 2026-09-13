import { Response } from 'express';
import { Types } from 'mongoose';
import { Block } from '../models/Block';
import { AuthRequest } from '../middleware/auth';

// POST /api/block/:userId
export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: 'Invalid user id' });
    return;
  }

  if (userId === req.userId) {
    res.status(400).json({ message: "You can't block yourself" });
    return;
  }

  try {
    await Block.create({ blocker: req.userId, blocked: userId });
  } catch (error: any) {
    // Already blocked — treat as success, not an error, so the button is idempotent
    if (error?.code !== 11000) {
      throw error;
    }
  }

  res.status(200).json({ message: 'User blocked' });
};

// DELETE /api/block/:userId
export const unblockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: 'Invalid user id' });
    return;
  }

  await Block.deleteOne({ blocker: req.userId, blocked: userId });

  res.status(200).json({ message: 'User unblocked' });
};
