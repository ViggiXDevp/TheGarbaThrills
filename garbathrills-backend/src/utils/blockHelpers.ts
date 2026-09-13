import { Block } from '../models/Block';

// True if EITHER user has blocked the other — used to fully hide a pair
// from each other in deck/likes results.
export const isBlockedEitherWay = async (idA: string, idB: string): Promise<boolean> => {
  const block = await Block.findOne({
    $or: [
      { blocker: idA, blocked: idB },
      { blocker: idB, blocked: idA },
    ],
  });
  return !!block;
};

// Returns the set of all user IDs that should be excluded from `userId`'s
// deck/likes results — everyone they've blocked, and everyone who's blocked them.
export const getExcludedUserIds = async (userId: string): Promise<string[]> => {
  const blocks = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }],
  }).lean();

  const excluded = new Set<string>();
  blocks.forEach((b) => {
    excluded.add(b.blocker.toString());
    excluded.add(b.blocked.toString());
  });
  excluded.delete(userId);

  return Array.from(excluded);
};
