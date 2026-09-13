import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { blockUser, unblockUser } from '../controllers/blockController';

const router = Router();

router.post('/:userId', requireAuth, blockUser);
router.delete('/:userId', requireAuth, unblockUser);

export default router;
