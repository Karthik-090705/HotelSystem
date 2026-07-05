import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

const checkDateOverlap = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    room: roomId,
    bookingStatus: { $in: ['pending', 'approved'] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(filter);
};

const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

export const createBooking = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      res.status(403);
      throw new Error('Admins cannot create bookings');
    }

    const { room: roomId, checkIn, checkOut } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      res.status(400);
      throw new Error('Please provide room, check-in, and check-out dates');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      res.status(400);
      throw new Error('Check-in date cannot be in the past');
    }

    if (checkOutDate <= checkInDate) {
      res.status(400);
      throw new Error('Check-out date must be after check-in date');
    }

    const room = await Room.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    if (!room.availability) {
      res.status(400);
      throw new Error('Room is not available');
    }

    const overlap = await checkDateOverlap(roomId, checkInDate, checkOutDate);
    if (overlap) {
      res.status(400);
      throw new Error('Room is already booked for the selected dates');
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = nights * room.price;

    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
    });

    const populated = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('room', 'roomNumber roomType price images');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('room', 'roomNumber roomType price images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('room', 'roomNumber roomType price images description amenities');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'refunded'];

    if (bookingStatus && !validStatuses.includes(bookingStatus)) {
      res.status(400);
      throw new Error('Invalid booking status');
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      res.status(400);
      throw new Error('Invalid payment status');
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    if (bookingStatus === 'approved') {
      await Room.findByIdAndUpdate(booking.room, { availability: false });
    }
    if (['cancelled', 'rejected', 'completed'].includes(bookingStatus)) {
      await Room.findByIdAndUpdate(booking.room, { availability: true });
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('room', 'roomNumber roomType price');

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this booking');
    }

    if (req.user.role !== 'admin' && !['pending', 'approved'].includes(booking.bookingStatus)) {
      res.status(400);
      throw new Error('Only pending or approved bookings can be cancelled');
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();
    await Room.findByIdAndUpdate(booking.room, { availability: true });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [totalBookings, upcomingBooking, recentBookings] = await Promise.all([
      Booking.countDocuments({ user: userId }),
      Booking.findOne({
        user: userId,
        checkIn: { $gte: now },
        bookingStatus: { $in: ['pending', 'approved'] },
      })
        .populate('room', 'roomNumber roomType')
        .sort({ checkIn: 1 }),
      Booking.find({ user: userId })
        .populate('room', 'roomNumber roomType price')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: { totalBookings, upcomingBooking, recentBookings },
    });
  } catch (error) {
    next(error);
  }
};
