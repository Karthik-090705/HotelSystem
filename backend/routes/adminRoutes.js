import express from 'express';
import {
  getDashboardStats,
  getUsers,
  deleteUser,
  updateProfile,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/profile', updateProfile);

export default router;
