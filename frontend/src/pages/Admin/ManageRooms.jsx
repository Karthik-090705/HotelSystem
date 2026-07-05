import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Loader2, X, ImagePlus } from 'lucide-react';
import { getRooms, createRoom, updateRoom, deleteRoom, generateRoomDescription } from '../../services/adminService';
import { getImageUrl } from '../../utils/imageUtils';

const ROOM_TYPES = ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential'];

const emptyForm = {
  roomNumber: '',
  roomType: 'Single',
  description: '',
  price: '',
  capacity: '',
  amenities: '',
  availability: true,
};

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchRooms = async () => {
    try {
      const { data } = await getRooms();
      setRooms(data.data);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setExistingImages([]);
    setNewImages([]);
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      amenities: room.amenities?.join(', ') || '',
      availability: room.availability,
    });
    setExistingImages(room.images || []);
    setNewImages([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRoom(null);
    setForm(emptyForm);
    setExistingImages([]);
    setNewImages([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (imagePath) => {
    setExistingImages((prev) => prev.filter((img) => img !== imagePath));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('roomNumber', form.roomNumber.trim());
    formData.append('roomType', form.roomType);
    formData.append('description', form.description.trim());
    formData.append('price', form.price);
    formData.append('capacity', form.capacity);
    formData.append('amenities', form.amenities);
    formData.append('availability', form.availability);

    if (editingRoom) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    newImages.forEach((file) => {
      formData.append('images', file);
    });

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = buildFormData();

    try {
      if (editingRoom) {
        await updateRoom(editingRoom._id, formData);
        toast.success('Room updated successfully');
      } else {
        await createRoom(formData);
        toast.success('Room created successfully');
      }
      closeModal();
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateDescription = async () => {
    const { roomType, capacity, price, amenities } = form;

    if (!roomType) {
      toast.error('Please select a room type first');
      return;
    }

    toast.info('Generating AI description...');
    try {
      const { data } = await generateRoomDescription({
        roomType,
        capacity: capacity ? Number(capacity) : undefined,
        price: price ? Number(price) : undefined,
        amenities: amenities || undefined,
      });

      if (data.success && data.description) {
        setForm((prev) => ({ ...prev, description: data.description }));
        toast.success('AI description generated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate AI description');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoom(id);
      toast.success('Room deleted successfully');
      setDeleteId(null);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete room');
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
          <p className="mt-1 text-sm text-gray-500">{rooms.length} rooms total</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Room
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Room</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Capacity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No rooms found. Add your first room.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => {
                  const thumbnail = getImageUrl(room.images?.[0]);

                  return (
                    <tr key={room._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={`Room ${room.roomNumber}`}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <ImagePlus className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{room.roomNumber}</td>
                      <td className="px-6 py-4">{room.roomType}</td>
                      <td className="px-6 py-4">${room.price}/night</td>
                      <td className="px-6 py-4">{room.capacity} guests</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            room.availability
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {room.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(room)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(room._id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Room Number</label>
                  <input
                    name="roomNumber"
                    value={form.roomNumber}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Room Type</label>
                  <select
                    name="roomType"
                    value={form.roomType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Generate Description
                  </button>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Price ($/night)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    name="capacity"
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Amenities (comma-separated)
                </label>
                <input
                  name="amenities"
                  value={form.amenities}
                  onChange={handleChange}
                  placeholder="WiFi, TV, AC, Mini Bar"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Room Images</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  JPEG, PNG, WEBP, or GIF. Max 5 MB per file.
                </p>

                {(existingImages.length > 0 || newImages.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {existingImages.map((imagePath) => (
                      <div key={imagePath} className="relative">
                        <img
                          src={getImageUrl(imagePath)}
                          alt="Room"
                          className="h-20 w-24 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(imagePath)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {newImages.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-20 w-24 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2">
                <input
                  name="availability"
                  type="checkbox"
                  checked={form.availability}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Room is available</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Room?</h3>
            <p className="mt-2 text-sm text-gray-500">
              This action cannot be undone. All associated images will be removed.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
