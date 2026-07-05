import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { BedDouble, Users, CalendarCheck, CheckCircle, Loader2 } from 'lucide-react';
import StatCard from '../../components/StatCard/StatCard';
import { getDashboardStats } from '../../services/adminService';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.data);
      } catch {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your hotel management system</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={BedDouble} color="blue" />
        <StatCard title="Available Rooms" value={stats.availableRooms} icon={CheckCircle} color="green" />
        <StatCard title="Booked Rooms" value={stats.bookedRooms} icon={BedDouble} color="orange" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="purple" />
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} color="red" />
        <StatCard title="Total Reviews" value={stats.totalReviews ?? 0} icon={Users} color="purple" />
      </div>

      <div className="mt-8 rounded-2xl bg-white shadow-soft">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Guest</th>
                <th className="px-6 py-3">Room</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentBookings?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No bookings yet
                  </td>
                </tr>
              ) : (
                stats.recentBookings?.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking.user?.name}</p>
                      <p className="text-xs text-gray-500">{booking.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {booking.room?.roomNumber} — {booking.room?.roomType}
                    </td>
                    <td className="px-6 py-4">{formatDate(booking.checkIn)}</td>
                    <td className="px-6 py-4">{formatDate(booking.checkOut)}</td>
                    <td className="px-6 py-4 font-medium">${booking.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          statusColors[booking.bookingStatus]
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
