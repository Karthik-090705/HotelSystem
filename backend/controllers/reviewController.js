import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

export const createReview = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      res.status(403);
      throw new Error('Admins cannot write reviews');
    }

    const { booking: bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      res.status(400);
      throw new Error('Please provide booking, rating, and comment');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to review this booking');
    }

    if (booking.bookingStatus !== 'completed') {
      res.status(400);
      throw new Error('You can only review completed bookings');
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      res.status(400);
      throw new Error('You have already reviewed this booking');
    }

    const review = await Review.create({
      user: req.user._id,
      room: booking.room,
      booking: bookingId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const populated = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('room', 'roomNumber roomType');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Awaiting admin approval.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomReviews = async (req, res, next) => {
  try {
    const filter = { room: req.params.roomId, isApproved: true };

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('room', 'roomNumber roomType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('room', 'roomNumber roomType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    review.isApproved = isApproved;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'}`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
