import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMatches, getMatchById } from '../controllers/matchController';

const router = Router();

router.get('/', requireAuth, getMatches);
router.get('/:matchId', requireAuth, getMatchById);

export default router;
