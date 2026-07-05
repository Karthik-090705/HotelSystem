import { Link } from 'react-router-dom';
import { BedDouble, Users } from 'lucide-react';
import { getRoomImage } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';

const RoomCard = ({ room }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const imageUrl = getRoomImage(room.images);
  const canBook = isAuthenticated && !isAdmin;

  return (
    <div className="group overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Room ${room.roomNumber}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <BedDouble className="mb-2 h-10 w-10 text-slate-300" />
            <span className="text-sm">No image available</span>
          </div>
        )}
        {/* Availability Badge */}
        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-sm tracking-wide ${
              room.availability 
                ? 'bg-emerald-500/90 text-white' 
                : 'bg-rose-500/90 text-white'
            }`}
          >
            {room.availability ? 'Available' : 'Booked'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
              Room {room.roomNumber}
            </h3>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-0.5">{room.roomType}</p>
          </div>
        </div>
        
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="h-4 w-4 text-slate-400" />
            <span>Up to {room.capacity} guest{room.capacity > 1 ? 's' : ''}</span>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ${room.price}<span className="text-xs font-normal text-slate-400">/night</span>
          </p>
        </div>
        
        <div className="mt-6 flex gap-3">
          <Link
            to={`/rooms/${room._id}`}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            Details
          </Link>
          {canBook && room.availability && (
            <Link
              to={`/user/book/${room._id}`}
              className="flex-1 rounded-xl bg-gradient-gold py-3 text-center text-sm font-bold text-slate-950 shadow-soft hover:brightness-105 active:scale-[0.98] transition-all"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
