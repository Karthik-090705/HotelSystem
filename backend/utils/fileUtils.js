import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '../uploads');

export const deleteImageFiles = async (imagePaths = []) => {
  const deletions = imagePaths.map((imagePath) => {
    if (!imagePath || !imagePath.startsWith('/uploads/')) return Promise.resolve();

    const filePath = path.join(uploadsRoot, imagePath.replace('/uploads/', ''));

    return fs.promises.unlink(filePath).catch(() => {});
  });

  await Promise.all(deletions);
};

export const mapUploadedFiles = (files = []) =>
  files.map((file) => `/uploads/rooms/${file.filename}`);

export const parseAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;
  return amenities
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseExistingImages = (existingImages) => {
  if (!existingImages) return [];
  if (Array.isArray(existingImages)) return existingImages;

  try {
    const parsed = JSON.parse(existingImages);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
