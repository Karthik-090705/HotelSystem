import express from 'express';
import {
  createReview,
  getRoomReviews,
  getMyReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/room/:roomId', getRoomReviews);

router.use(protect);

router.get('/me', getMyReviews);
router.post('/', createReview);
router.delete('/:id', deleteReview);

router.get('/', adminOnly, getAllReviews);
router.put('/:id/status', adminOnly, updateReviewStatus);

export default router;
