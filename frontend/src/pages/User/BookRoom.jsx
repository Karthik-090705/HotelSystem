import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2, Calendar } from 'lucide-react';
import { getRoomById, createBooking } from '../../services/userService';
import { getImageUrl } from '../../utils/imageUtils';

const BookRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await getRoomById(roomId);
        setRoom(data.data);
      } catch {
        toast.error('Room not found');
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
      : 0;
  const totalPrice = nights * (room?.price || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (nights <= 0) {
      toast.error('Check-out must be after check-in');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({ room: roomId, checkIn, checkOut });
      toast.success('Booking submitted successfully!');
      navigate('/user/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const thumbnail = getImageUrl(room.images?.[0]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Book Room {room.roomNumber}</h1>
      <p className="mt-1 text-sm text-gray-500">{room.roomType} — ${room.price}/night</p>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-soft">
        {thumbnail && (
          <img src={thumbnail} alt="Room" className="h-48 w-full object-cover" />
        )}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" /> Check In
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" /> Check Out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="rounded-xl bg-primary-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{nights} night(s) × ${room.price}</span>
                <span className="font-bold text-primary-700">${totalPrice}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">Total price (payment on arrival)</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !room.availability}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {room.availability ? 'Confirm Booking' : 'Room Unavailable'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookRoom;
