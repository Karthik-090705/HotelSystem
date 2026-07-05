import Room from '../models/Room.js';
import {
  deleteImageFiles,
  mapUploadedFiles,
  parseAmenities,
  parseExistingImages,
} from '../utils/fileUtils.js';

export const getRooms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.available === 'true') {
      filter.availability = true;
    }

    const rooms = await Room.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, description, price, capacity, availability } = req.body;

    if (!roomNumber || !roomType || !description || price == null || !capacity) {
      res.status(400);
      throw new Error('Please provide room number, type, description, price, and capacity');
    }

    const images = mapUploadedFiles(req.files);

    const room = await Room.create({
      roomNumber,
      roomType,
      description,
      price: Number(price),
      capacity: Number(capacity),
      amenities: parseAmenities(req.body.amenities),
      images,
      availability: availability === undefined ? true : availability === 'true' || availability === true,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    if (req.files?.length) {
      await deleteImageFiles(mapUploadedFiles(req.files));
    }

    if (error.code === 11000) {
      res.status(400);
      next(new Error('Room number already exists'));
    } else {
      next(error);
    }
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    const existingImages = parseExistingImages(req.body.existingImages);
    const newImages = mapUploadedFiles(req.files);
    const images = [...existingImages, ...newImages];

    const removedImages = room.images.filter((imagePath) => !images.includes(imagePath));

    const updateData = {
      roomNumber: req.body.roomNumber ?? room.roomNumber,
      roomType: req.body.roomType ?? room.roomType,
      description: req.body.description ?? room.description,
      price: req.body.price != null ? Number(req.body.price) : room.price,
      capacity: req.body.capacity != null ? Number(req.body.capacity) : room.capacity,
      amenities: req.body.amenities != null ? parseAmenities(req.body.amenities) : room.amenities,
      images,
      availability:
        req.body.availability !== undefined
          ? req.body.availability === 'true' || req.body.availability === true
          : room.availability,
    };

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await deleteImageFiles(removedImages);

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom,
    });
  } catch (error) {
    if (req.files?.length) {
      await deleteImageFiles(mapUploadedFiles(req.files));
    }

    if (error.code === 11000) {
      res.status(400);
      next(new Error('Room number already exists'));
    } else {
      next(error);
    }
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    await deleteImageFiles(room.images);
    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const generateDescription = async (req, res, next) => {
  const { roomType, capacity, price, amenities } = req.body;

  // Local description builder function
  const buildLocalDescription = () => {
    let desc = `Experience the ultimate comfort in our premium ${roomType} Room. `;
    if (capacity) {
      desc += `Perfectly designed to accommodate up to ${capacity} guest${Number(capacity) > 1 ? 's' : ''}, `;
    } else {
      desc += `Spaciously configured, `;
    }
    if (price) {
      desc += `this room offers outstanding luxury and value at just $${price} per night. `;
    } else {
      desc += `this room offers outstanding luxury and comfort. `;
    }
    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      if (amenityList.length > 0) {
        const formattedAmenities =
          amenityList.length > 1
            ? `${amenityList.slice(0, -1).join(', ')} and ${amenityList[amenityList.length - 1]}`
            : amenityList[0];
        desc += `It is fully equipped with top-tier amenities, including ${formattedAmenities}.`;
      }
    } else {
      desc += `It features modern decor, elegant furnishings, and a cozy atmosphere for a relaxing stay.`;
    }
    return desc;
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

    if (!apiKey) {
      console.warn('Gemini API key is not configured. Falling back to local generation.');
      return res.status(200).json({
        success: true,
        description: buildLocalDescription(),
        isFallback: true,
      });
    }

    const promptText = `Generate a compelling, detailed hotel room description for the following details:
- Room Type: ${roomType}
- Capacity: ${capacity} guests
- Price: $${price}/night
- Amenities: ${amenities}

Please write an engaging marketing description (maximum 400 characters, no bullet points, just cohesive paragraphs) suitable for a booking system. Make it feel luxurious and clean. Output only the final description text, without any introductory phrases, titles, quotes, or conversational prefix.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptText,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Gemini API error (Status ${response.status}): ${errText}. Falling back to local generation.`);
      return res.status(200).json({
        success: true,
        description: buildLocalDescription(),
        isFallback: true,
      });
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedText) {
      console.warn('Gemini API failed to return content. Falling back to local generation.');
      return res.status(200).json({
        success: true,
        description: buildLocalDescription(),
        isFallback: true,
      });
    }

    res.status(200).json({
      success: true,
      description: generatedText,
      isFallback: false,
    });
  } catch (error) {
    console.error('Error during AI generation:', error.message);
    res.status(200).json({
      success: true,
      description: buildLocalDescription(),
      isFallback: true,
    });
  }
};

