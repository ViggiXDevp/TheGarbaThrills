import { Response } from 'express';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Match } from '../models/Match';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { STICKER_IDS } from '../constants/stickers';
import { isBlockedEitherWay } from '../utils/blockHelpers';
import { ClearedChat } from '../models/ClearedChat';
import { ReadReceipt } from '../models/ReadReceipt';

const sendMessageSchema = z.object({
  type: z.enum(['text', 'sticker', 'gif']),
  content: z.string().min(1).max(1000),
});

// Verifies the current user is part of this match, and returns the match doc
const getAuthorizedMatch = async (matchId: string, userId: string) => {
  if (!Types.ObjectId.isValid(matchId)) return null;

  const match = await Match.findOne({
    _id: matchId,
    $or: [{ userA: userId }, { userB: userId }],
  });

  return match;
};

// GET /api/chat/:matchId/messages
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { matchId } = req.params;

  const match = await getAuthorizedMatch(matchId, req.userId as string);
  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  const clearedEntry = await ClearedChat.findOne({ userId: req.userId, matchId });
  const messageFilter: any = { matchId };
  if (clearedEntry) {
    messageFilter.createdAt = { $gt: clearedEntry.clearedAt };
  }

  const messages = await Message.find(messageFilter).sort({ createdAt: 1 }).limit(500).lean();

  res.status(200).json({ messages });
};

// POST /api/chat/:matchId/messages
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { matchId } = req.params;

  const match = await getAuthorizedMatch(matchId, req.userId as string);
  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten() });
    return;
  }

  const otherUserId =
    match.userA.toString() === req.userId ? match.userB.toString() : match.userA.toString();

  const blocked = await isBlockedEitherWay(req.userId as string, otherUserId);
  if (blocked) {
    res.status(403).json({ message: 'This conversation is no longer available' });
    return;
  }

  const { type, content } = parsed.data;

  if (type === 'sticker' && !STICKER_IDS.includes(content as (typeof STICKER_IDS)[number])) {
    res.status(400).json({ message: 'Unknown sticker' });
    return;
  }

  const message = await Message.create({
    matchId,
    senderId: req.userId,
    type,
    content,
  });

  res.status(201).json({ message });
};

// GET /api/chat/gifs/search?q=...
export const searchGifs = async (req: AuthRequest, res: Response): Promise<void> => {
  const query = (req.query.q as string) || '';
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    res.status(500).json({ message: 'GIF search is not configured' });
    return;
  }

  const endpoint = query.trim()
    ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=pg`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=pg`;

  try {
    const giphyRes = await fetch(endpoint);
    const data = (await giphyRes.json()) as { data?: any[] };

    const gifs = (data.data || []).map((gif: any) => ({
      id: gif.id,
      previewUrl: gif.images?.fixed_width_small?.url || gif.images?.fixed_width?.url,
      url: gif.images?.fixed_width?.url || gif.images?.original?.url,
    }));

    res.status(200).json({ gifs });
  } catch (error) {
    console.error('Giphy search failed:', error);
    res.status(500).json({ message: 'Could not search GIFs right now' });
  }
};

// POST /api/chat/:matchId/clear
export const clearChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const { matchId } = req.params;

  const match = await getAuthorizedMatch(matchId, req.userId as string);
  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  await ClearedChat.findOneAndUpdate(
    { userId: req.userId, matchId },
    { clearedAt: new Date() },
    { upsert: true },
  );

  res.status(200).json({ message: 'Chat cleared' });
};

// POST /api/chat/:matchId/read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { matchId } = req.params;

  const match = await getAuthorizedMatch(matchId, req.userId as string);
  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  await ReadReceipt.findOneAndUpdate(
    { userId: req.userId, matchId },
    { lastReadAt: new Date() },
    { upsert: true },
  );

  res.status(200).json({ message: 'Marked as read' });
};