import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  getInterestTags,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  getPublicProfile
} from '../controllers/profileController';

const router = Router();

router.get('/interest-tags', getInterestTags);
router.put('/', requireAuth, updateProfile);
router.post('/photo', requireAuth, upload.single('photo'), uploadPhoto);
router.delete('/photo', requireAuth, deletePhoto);
router.get('/:userId', requireAuth, getPublicProfile);

export default router;
