import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getDeck, recordSwipe, getLikesReceived } from '../controllers/swipeController';

const router = Router();

router.get('/deck', requireAuth, getDeck);
router.post('/', requireAuth, recordSwipe);
router.get('/likes-received', requireAuth, getLikesReceived);

export default router;
