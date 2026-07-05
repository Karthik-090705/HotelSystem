import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import BrowseRooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import AdminLayout from './components/AdminLayout/AdminLayout';
import UserLayout from './components/UserLayout/UserLayout';

import AdminDashboard from './pages/Admin/Dashboard';
import ManageRooms from './pages/Admin/ManageRooms';
import ManageBookings from './pages/Admin/ManageBookings';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageReviews from './pages/Admin/ManageReviews';
import AdminProfile from './pages/Admin/Profile';

import UserDashboard from './pages/User/Dashboard';
import BookRoom from './pages/User/BookRoom';
import MyBookings from './pages/User/MyBookings';
import UserProfile from './pages/User/Profile';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    const redirectTo = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/rooms" element={<BrowseRooms />} />
      <Route path="/rooms/:id" element={<RoomDetails />} />

      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      <Route
        path="/user"
        element={
          <ProtectedRoute userOnly>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="book/:roomId" element={<BookRoom />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="rooms" element={<ManageRooms />} />
        <Route path="bookings" element={<ManageBookings />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reviews" element={<ManageReviews />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
