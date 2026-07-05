import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { getAllReviews, updateReviewStatus, deleteReview } from '../../services/adminService';
import StarRating from '../../components/StarRating/StarRating';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await getAllReviews();
      setReviews(data.data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatus = async (id, isApproved) => {
    try {
      await updateReviewStatus(id, isApproved);
      toast.success(`Review ${isApproved ? 'approved' : 'rejected'}`);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">{reviews.length} review(s)</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{review.user?.name}</p>
                  <p className="text-sm text-gray-500">
                    Room {review.room?.roomNumber} — {review.room?.roomType}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating rating={review.rating} readonly size="sm" />
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      review.isApproved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!review.isApproved && (
                  <button
                    onClick={() => handleStatus(review._id, true)}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
                {review.isApproved && (
                  <button
                    onClick={() => handleStatus(review._id, false)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review._id)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageReviews;
