import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '../uploads');

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
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
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
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

export const uploadAvatarController = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Delete old avatar file if exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(uploadsRoot, user.avatar.replace('/uploads/', ''));
      fs.promises.unlink(oldPath).catch(() => {});
    }

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
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

export const deleteAvatarController = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(uploadsRoot, user.avatar.replace('/uploads/', ''));
      fs.promises.unlink(oldPath).catch(() => {});
    }

    user.avatar = '';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar removed successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: '',
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
