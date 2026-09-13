import { Response } from 'express';
import { Types } from 'mongoose';
import { Match } from '../models/Match';
import { Message } from '../models/Message';
import { Block } from '../models/Block';
import { ClearedChat } from '../models/ClearedChat';
import { ReadReceipt } from '../models/ReadReceipt';
import { AuthRequest } from '../middleware/auth';

const publicProfileFields = 'name age gender bio interests photos';

const previewText = (type: string, content: string): string => {
  if (type === 'text') return content;
  if (type === 'sticker') return 'Sent a sticker';
  if (type === 'gif') return 'Sent a GIF';
  return '';
};

// GET /api/matches — everyone the current user has matched with, most recent activity first.
// Optimized to use a handful of batched queries instead of several round-trips per match.
export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  const matches = await Match.find({
    $or: [{ userA: req.userId }, { userB: req.userId }],
  })
    .populate('userA', publicProfileFields)
    .populate('userB', publicProfileFields)
    .lean();

  if (matches.length === 0) {
    res.status(200).json({ matches: [] });
    return;
  }

  const otherIdOf = (match: any) =>
    match.userA._id.toString() === req.userId ? match.userB : match.userA;

  const matchIds = matches.map((m) => m._id);
  const otherIds = matches.map((m) => otherIdOf(m)._id.toString());

  const [blocksAgainstMe, blocksByMe, clearedEntries, readEntries, allMessages] =
    await Promise.all([
      Block.find({ blocker: { $in: otherIds }, blocked: req.userId }).lean(),
      Block.find({ blocker: req.userId, blocked: { $in: otherIds } }).lean(),
      ClearedChat.find({ userId: req.userId, matchId: { $in: matchIds } }).lean(),
      ReadReceipt.find({ userId: req.userId, matchId: { $in: matchIds } }).lean(),
      Message.find(
        { matchId: { $in: matchIds } },
        { matchId: 1, type: 1, content: 1, senderId: 1, createdAt: 1 },
      )
        .sort({ createdAt: -1 })
        .lean(),
    ]);

  const blockedAgainstMeSet = new Set(blocksAgainstMe.map((b) => b.blocker.toString()));
  const blockedByMeSet = new Set(blocksByMe.map((b) => b.blocked.toString()));
  const clearedMap = new Map(clearedEntries.map((c) => [c.matchId.toString(), c.clearedAt]));
  const readMap = new Map(readEntries.map((r) => [r.matchId.toString(), r.lastReadAt]));

  const messagesByMatch = new Map<string, typeof allMessages>();
  for (const msg of allMessages) {
    const key = msg.matchId.toString();
    if (!messagesByMatch.has(key)) messagesByMatch.set(key, []);
    messagesByMatch.get(key)!.push(msg);
  }
  // allMessages is already sorted newest-first, so each per-match array is too

  const results = matches
    .map((match) => {
      const other = otherIdOf(match);
      const otherId = other._id.toString();
      const matchIdStr = match._id.toString();

      // If the other person blocked ME, this match silently disappears from
      // my list entirely — they should never know they were blocked.
      if (blockedAgainstMeSet.has(otherId)) return null;

      const isBlockedByMe = blockedByMeSet.has(otherId);
      const clearedAt = clearedMap.get(matchIdStr);
      const readAt = readMap.get(matchIdStr);

      const matchMessages = messagesByMatch.get(matchIdStr) || [];

      const visibleMessages = clearedAt
        ? matchMessages.filter((m) => new Date(m.createdAt) > clearedAt)
        : matchMessages;

      const lastMessage = visibleMessages[0] || null;

      const cutoffCandidates = [clearedAt, readAt].filter((d): d is Date => !!d);
      const cutoff =
        cutoffCandidates.length > 0
          ? new Date(Math.max(...cutoffCandidates.map((d) => d.getTime())))
          : null;

      const unreadCount = matchMessages.filter(
        (m) => m.senderId.toString() !== req.userId && (!cutoff || new Date(m.createdAt) > cutoff),
      ).length;

      return {
        matchId: match._id,
        matchedAt: match.createdAt,
        user: other,
        isBlockedByMe,
        unreadCount,
        lastMessage: lastMessage
          ? {
              preview: previewText(lastMessage.type, lastMessage.content),
              sentByMe: lastMessage.senderId.toString() === req.userId,
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  results.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.matchedAt;
    const bTime = b.lastMessage?.createdAt || b.matchedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  res.status(200).json({ matches: results });
};

// GET /api/matches/:matchId — a single match's partner details (used to reliably
// populate the chat header regardless of how the page was navigated to)
export const getMatchById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { matchId } = req.params;

  if (!Types.ObjectId.isValid(matchId)) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  const match = await Match.findOne({
    _id: matchId,
    $or: [{ userA: req.userId }, { userB: req.userId }],
  })
    .populate('userA', publicProfileFields)
    .populate('userB', publicProfileFields)
    .lean();

  if (!match) {
    res.status(404).json({ message: 'Match not found' });
    return;
  }

  const other = match.userA._id.toString() === req.userId ? match.userB : match.userA;
  const otherId = other._id.toString();

  const [blockedByMe, blockedByThem] = await Promise.all([
    Block.findOne({ blocker: req.userId, blocked: otherId }),
    Block.findOne({ blocker: otherId, blocked: req.userId }),
  ]);

  res.status(200).json({
    user: other,
    blockedByMe: !!blockedByMe,
    blockedByThem: !!blockedByThem,
  });
};