import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalRooms, availableRooms, totalUsers, totalBookings, totalReviews, recentBookings] =
      await Promise.all([
        Room.countDocuments(),
        Room.countDocuments({ availability: true }),
        User.countDocuments({ role: 'user' }),
        Booking.countDocuments(),
        Review.countDocuments(),
        Booking.find()
          .populate('user', 'name email')
          .populate('room', 'roomNumber roomType')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        availableRooms,
        bookedRooms: totalRooms - availableRooms,
        totalUsers,
        totalBookings,
        totalReviews,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an admin account');
    }

    await Booking.deleteMany({ user: user._id });
    await Review.deleteMany({ user: user._id });
    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const {
      name,
      currentPassword,
      newPassword,
      phoneNumber,
      gender,
      dob,
      address,
    } = req.body;

    if (name) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob ? new Date(dob) : null;
    
    if (address !== undefined) {
      let parsedAddress = address;
      if (typeof address === 'string') {
        try {
          parsedAddress = JSON.parse(address);
        } catch {
          parsedAddress = {};
        }
      }
      user.address = {
        street: parsedAddress.street || '',
        city: parsedAddress.city || '',
        state: parsedAddress.state || '',
        zipCode: parsedAddress.zipCode || '',
        country: parsedAddress.country || '',
      };
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400);
        throw new Error('Current password is required to set a new password');
      }
      const userWithPassword = await User.findById(req.user._id).select('+password');
      const isMatch = await userWithPassword.matchPassword(currentPassword);
      if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || 'prefer-not-to-say',
        dob: user.dob || null,
        address: user.address || { street: '', city: '', state: '', zipCode: '', country: '' },
      },
    });
  } catch (error) {
    next(error);
  }
};
