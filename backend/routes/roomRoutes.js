import express from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  generateDescription,
} from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { uploadRoomImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
  uploadRoomImages.array('images', 10)(req, res, (error) => {
    if (error) {
      res.status(400);
      next(error);
    } else {
      next();
    }
  });
};

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/generate-description', protect, adminOnly, generateDescription);
router.post('/', protect, adminOnly, handleUpload, createRoom);
router.put('/:id', protect, adminOnly, handleUpload, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

export default router;
