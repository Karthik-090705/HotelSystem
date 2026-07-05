import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2, Users, Check, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import StarRating from '../components/StarRating/StarRating';
import { getRoomById, getRoomReviews } from '../services/userService';
import { getImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState({ data: [], avgRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, reviewsRes] = await Promise.all([
          getRoomById(id),
          getRoomReviews(id),
        ]);
        setRoom(roomRes.data.data);
        setReviews(reviewsRes.data);
      } catch {
        toast.error('Failed to load room details');
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const images = room.images?.length ? room.images : [];
  const mainImage = getImageUrl(images[activeImage]);
  const canBook = isAuthenticated && !isAdmin && room.availability;

  const content = (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/rooms" className="mb-6 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
        <ArrowLeft className="h-4 w-4" /> Back to rooms
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            {mainImage ? (
              <img src={mainImage} alt={`Room ${room.roomNumber}`} className="h-80 w-full object-cover" />
            ) : (
              <div className="flex h-80 items-center justify-center text-gray-400">No image available</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === i ? 'border-primary-600' : 'border-transparent'
                    }`}
                >
                  <img src={getImageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Room {room.roomNumber}</h1>
              <p className="text-lg text-gray-500">{room.roomType}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${room.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
            >
              {room.availability ? 'Available' : 'Unavailable'}
            </span>
          </div>

          {reviews.count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <StarRating rating={Math.round(reviews.avgRating)} readonly size="sm" />
              <span className="text-sm text-gray-600">
                {reviews.avgRating} ({reviews.count} reviews)
              </span>
            </div>
          )}

          <p className="mt-2 text-3xl font-bold text-primary-600">${room.price}<span className="text-base font-normal text-gray-500">/night</span></p>

          <div className="mt-4 flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span>Up to {room.capacity} guests</span>
          </div>

          <p className="mt-6 text-gray-700">{room.description}</p>

          {room.amenities?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900">Amenities</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {room.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    <Check className="h-3 w-3 text-green-600" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {canBook && (
            <Link
              to={`/user/book/${room._id}`}
              className="mt-8 block w-full rounded-lg bg-primary-600 py-3 text-center font-semibold text-white hover:bg-primary-700"
            >
              Book This Room
            </Link>
          )}
          {!isAuthenticated && (
            <Link
              to="/login"
              className="mt-8 block w-full rounded-lg bg-primary-600 py-3 text-center font-semibold text-white hover:bg-primary-700"
            >
              Login to Book
            </Link>
          )}
        </div>
      </div>

      {reviews.data?.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Guest Reviews</h2>
          <div className="space-y-4">
            {reviews.data.map((review) => (
              <div key={review._id} className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{review.user?.name}</p>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
};

export default RoomDetails;
