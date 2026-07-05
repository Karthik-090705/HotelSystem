import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatarController,
  deleteAvatarController,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/avatar', uploadAvatar.single('avatar'), uploadAvatarController);
router.delete('/avatar', deleteAvatarController);

export default router;
