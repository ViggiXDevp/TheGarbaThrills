import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Report } from '../models/Report';
import { AuthRequest } from '../middleware/auth';

const reportSchema = z.object({
  reason: z.enum(['harassment', 'fake_profile', 'inappropriate_content', 'spam', 'other']),
  details: z.string().max(500).optional(),
});

// POST /api/report/:userId
export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: 'Invalid user id' });
    return;
  }

  if (userId === req.userId) {
    res.status(400).json({ message: "You can't report yourself" });
    return;
  }

  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const { reason, details } = parsed.data;

  await Report.create({
    reporter: req.userId,
    reportedUser: userId,
    reason,
    details,
  });

  res.status(201).json({ message: 'Report submitted' });
};