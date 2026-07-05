import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2, CalendarCheck, BedDouble, Compass, Calendar, MapPin } from 'lucide-react';
import { getUserDashboardStats } from '../../services/userService';
import BookingCard from '../../components/BookingCard/BookingCard';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getUserDashboardStats();
        setStats(data.data);
      } catch {
        toast.error('Failed to load dashboard');
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Luxurious Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-8 text-white shadow-soft-lg animate-fade-in">
        {/* Decorative ambient lights */}
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-500/10 blur-[80px]" />
        <div className="absolute right-12 bottom-[-40px] h-40 w-40 rounded-full bg-amber-500/10 blur-[60px]" />

        <div className="relative max-w-lg z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Welcome back, <span className="bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">{user?.name}</span>!
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Manage your bookings, explore new luxurious suites, and customise your upcoming stays all from your grand stayed portal.
          </p>
        </div>
      </div>

      {/* Elegant Interactive Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
        <div className="glass-panel hover:-translate-y-1 hover:shadow-soft-md rounded-2xl p-6 border border-slate-200/60 transition-all duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalBookings}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary-100/60 text-primary-600 flex items-center justify-center">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel hover:-translate-y-1 hover:shadow-soft-md rounded-2xl p-6 border border-slate-200/60 transition-all duration-300 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Stays</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.upcomingBooking ? '1 Upcoming' : 'None'}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center">
            <BedDouble className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel hover:-translate-y-1 hover:shadow-soft-md rounded-2xl p-6 border border-slate-200/60 transition-all duration-300 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Discover</p>
            <Link 
              to="/rooms" 
              className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700 mt-2 transition"
            >
              Book a new room →
            </Link>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center">
            <Compass className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Modern stay showcase (with images!) */}
      {stats.upcomingBooking && (
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Your Next Luxury Stay</h2>
          
          <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-soft-md flex flex-col md:flex-row">
            {/* Room Image */}
            <div className="relative h-56 w-full md:h-auto md:w-80 shrink-0 bg-slate-100 overflow-hidden">
              {stats.upcomingBooking.room?.images?.[0] ? (
                <img 
                  src={getImageUrl(stats.upcomingBooking.room.images[0])} 
                  alt={`Room ${stats.upcomingBooking.room.roomNumber}`} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <BedDouble className="h-10 w-10 text-slate-300" />
                </div>
              )}
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold tracking-wider text-white shadow-sm">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Room Details & Actions */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  Room {stats.upcomingBooking.room?.roomNumber} — {stats.upcomingBooking.room?.roomType}
                </h3>
                
                <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm text-slate-600 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-primary-500" />
                    <span>Check In: <strong>{formatDate(stats.upcomingBooking.checkIn)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-primary-500" />
                    <span>Check Out: <strong>{formatDate(stats.upcomingBooking.checkOut)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-primary-500" />
                    <span>Price: <strong>${stats.upcomingBooking.room?.price}/night</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Total Cost: <strong>${stats.upcomingBooking.totalPrice}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link 
                  to={`/rooms/${stats.upcomingBooking.room?._id}`}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-95"
                >
                  View Room Details
                </Link>
                <Link 
                  to="/user/bookings"
                  className="rounded-xl bg-gradient-gold px-5 py-2.5 text-center text-sm font-bold text-slate-950 shadow-soft hover:brightness-105 transition active:scale-95"
                >
                  Manage Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings History list */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="mb-4 text-xl font-bold text-slate-900 font-display">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentBookings?.length === 0 ? (
            <div className="text-center py-10 glass-panel rounded-2xl border border-slate-200/60">
              <p className="text-slate-500 font-medium">No bookings yet. Browse rooms to get started!</p>
            </div>
          ) : (
            stats.recentBookings?.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
