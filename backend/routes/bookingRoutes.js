import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getUserDashboardStats,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getUserDashboardStats);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id/status', adminOnly, updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;
