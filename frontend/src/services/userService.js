import api from './api';

export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (data) => api.put('/users/profile', data);
export const uploadUserAvatar = (formData) =>
  api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
export const deleteUserAvatar = () => api.delete('/users/avatar');

export const getRooms = (available) =>
  api.get('/rooms', { params: available ? { available: 'true' } : {} });
export const getRoomById = (id) => api.get(`/rooms/${id}`);

export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);
export const getUserDashboardStats = () => api.get('/bookings/stats');

export const getRoomReviews = (roomId) => api.get(`/reviews/room/${roomId}`);
export const createReview = (data) => api.post('/reviews', data);
export const getMyReviews = () => api.get('/reviews/me');
