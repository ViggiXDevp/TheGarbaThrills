import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMessages, sendMessage, searchGifs, clearChat, markAsRead } from '../controllers/chatController';

const router = Router();

router.get('/gifs/search', requireAuth, searchGifs);
router.get('/:matchId/messages', requireAuth, getMessages);
router.post('/:matchId/messages', requireAuth, sendMessage);
router.post('/:matchId/clear', requireAuth, clearChat);
router.post('/:matchId/read', requireAuth, markAsRead);

export default router;