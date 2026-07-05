import api from './api';

// Rooms
export const getRooms = () => api.get('/rooms');
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const createRoom = (formData) => api.post('/rooms', formData);
export const updateRoom = (id, formData) => api.put(`/rooms/${id}`, formData);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);
export const generateRoomDescription = (data) => api.post('/rooms/generate-description', data);

// Bookings
export const getBookings = () => api.get('/bookings');
export const updateBookingStatus = (id, data) => api.put(`/bookings/${id}/status`, data);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

// Admin
export const getDashboardStats = () => api.get('/admin/stats');
export const getUsers = (search = '') =>
  api.get('/admin/users', { params: search ? { search } : {} });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const updateAdminProfile = (data) => api.put('/admin/profile', data);

// Reviews (admin)
export const getAllReviews = () => api.get('/reviews');
export const updateReviewStatus = (id, isApproved) =>
  api.put(`/reviews/${id}/status`, { isApproved });
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
