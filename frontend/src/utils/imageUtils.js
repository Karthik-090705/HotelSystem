const API_ORIGIN = (
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000'
).replace(/\/$/, '');

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_ORIGIN}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

export const getRoomImage = (images = []) => {
  if (!images.length) return null;
  return getImageUrl(images[0]);
};
