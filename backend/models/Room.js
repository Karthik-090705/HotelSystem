import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      trim: true,
      enum: {
        values: ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential'],
        message: '{VALUE} is not a valid room type',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((item) => typeof item === 'string' && item.trim().length > 0),
        message: 'Amenities must be non-empty strings',
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((imagePath) => typeof imagePath === 'string' && imagePath.trim().length > 0),
        message: 'Image paths must be non-empty strings',
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
