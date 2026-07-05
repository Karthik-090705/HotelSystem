import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const BookingCard = ({ booking, onCancel, onReview, showUser = false }) => {
  const thumbnail = getImageUrl(booking.room?.images?.[0]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-40">
          {thumbnail ? (
            <img src={thumbnail} alt="Room" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">
                Room {booking.room?.roomNumber} — {booking.room?.roomType}
              </h3>
              {showUser && (
                <p className="text-sm text-gray-500">
                  {booking.user?.name} ({booking.user?.email})
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                statusColors[booking.bookingStatus]
              }`}
            >
              {booking.bookingStatus}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              ${booking.totalPrice} total
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/rooms/${booking.room?._id || booking.room}`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              View Room
            </Link>
            {onCancel && ['pending', 'approved'].includes(booking.bookingStatus) && (
              <button
                onClick={() => onCancel(booking._id)}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Cancel Booking
              </button>
            )}
            {onReview && booking.bookingStatus === 'completed' && (
              <button
                onClick={() => onReview(booking)}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
              >
                Write Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
