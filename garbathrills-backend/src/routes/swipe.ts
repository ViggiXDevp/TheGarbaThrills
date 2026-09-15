import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getDeck, recordSwipe, getLikesReceived, searchProfiles } from '../controllers/swipeController';

const router = Router();

router.get('/deck', requireAuth, getDeck);
router.get('/search', requireAuth, searchProfiles);
router.post('/', requireAuth, recordSwipe);
router.get('/likes-received', requireAuth, getLikesReceived);

export default router;