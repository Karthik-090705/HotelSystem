import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import RoomCard from '../components/RoomCard/RoomCard';
import { getRooms } from '../services/userService';

const BrowseRooms = ({ embedded = false }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await getRooms(filter === 'available');
        setRooms(data.data);
      } catch {
        toast.error('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [filter]);

  const content = (
    <div className={embedded ? '' : 'mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'}>
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">Browse Rooms</h1>
          <p className="mt-1 text-sm text-slate-500">Discover your next luxury getaway with ease</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none shadow-soft hover:border-slate-300 focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
        >
          <option value="all">All Available & Booked</option>
          <option value="available">Available Only</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-slate-500 font-medium">No rooms match your filter. Please check back later!</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room, idx) => (
            <div 
              key={room._id} 
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <RoomCard room={room} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
};

export default BrowseRooms;
