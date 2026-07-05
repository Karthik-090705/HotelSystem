import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Shield,
  Camera,
  Trash2,
  CalendarDays,
  Users,
  Hotel
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/adminService';
import {
  updateUserProfile,
  uploadUserAvatar,
  deleteUserAvatar
} from '../../services/userService';
import { getImageUrl } from '../../utils/imageUtils';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  // Tab control: 'personal' | 'address' | 'security'
  const [activeTab, setActiveTab] = useState('personal');

  // Input states
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [gender, setGender] = useState(user?.gender || 'prefer-not-to-say');
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '');
  
  // Address states
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [country, setCountry] = useState(user?.address?.country || '');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalBookings: 0 });

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load fresh admin stats
    const fetchAdminStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setAdminStats(data.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      }
    };
    fetchAdminStats();
  }, []);

  // Update inputs when user context changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setGender(user.gender || 'prefer-not-to-say');
      setDob(user.dob ? new Date(user.dob).toISOString().split('T')[0] : '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setZipCode(user.address?.zipCode || '');
      setCountry(user.address?.country || '');
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Maximum photo size is 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);
    try {
      const { data } = await uploadUserAvatar(formData);
      updateUser(data.data);
      toast.success('Admin avatar updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Remove profile photo?')) return;

    setAvatarUploading(true);
    try {
      const { data } = await deleteUserAvatar();
      updateUser(data.data);
      toast.success('Admin avatar removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab === 'security') {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
    }

    setSubmitting(true);
    try {
      let payload = {};

      if (activeTab === 'personal') {
        payload = {
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          gender,
          dob: dob || null
        };
      } else if (activeTab === 'address') {
        payload = {
          address: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            country: country.trim()
          }
        };
      } else if (activeTab === 'security') {
        payload = {
          currentPassword,
          newPassword
        };
      }

      const { data } = await updateUserProfile(payload);
      updateUser(data.data);
      toast.success('Profile updated successfully');
      
      if (activeTab === 'security') {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-display">Admin Account</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your administrator profile details, settings, and console authentication keys</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Summary Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition duration-300 hover:shadow-soft-md">
            <div className="flex flex-col items-center text-center">
              {/* Profile Image with Camera Hover */}
              <div 
                onClick={handleAvatarClick}
                className="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-primary-500/10 bg-slate-50 overflow-hidden transition-all hover:brightness-95 hover:border-primary-500"
              >
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
                
                {/* Camera Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white">
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px] mt-0.5 font-medium">Change</span>
                </div>

                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Remove Photo Trigger */}
              {user?.avatar && !avatarUploading && (
                <button
                  onClick={handleRemoveAvatar}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 className="h-3 w-3" /> Remove Photo
                </button>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <h2 className="mt-4 text-xl font-bold text-gray-900 font-display">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 border border-primary-200/50">
                <Shield className="h-3.5 w-3.5" />
                Administrator
              </span>
            </div>

            {/* Quick System Stats */}
            <div className="mt-6 border-t border-slate-100 pt-6 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-slate-50/50 p-3 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                  <Users className="h-4 w-4 text-primary-500" />
                  {adminStats.totalUsers}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/50 p-3 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-slate-900">
                  <Hotel className="h-4 w-4 text-primary-500" />
                  {adminStats.totalBookings}
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Member since {joinDate}
            </div>
          </div>

          {/* Navigation Tabs Selector */}
          <div className="flex flex-col gap-1 rounded-2xl bg-white p-2 shadow-soft border border-slate-100">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'personal'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'address'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
              }`}
            >
              <MapPin className="h-4.5 w-4.5" />
              Address Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
              }`}
            >
              <Lock className="h-4.5 w-4.5" />
              Security & Password
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Tab Panel View */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-soft transition duration-300 hover:shadow-soft-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* TAB 1: PERSONAL INFO */}
              {activeTab === 'personal' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 font-display">Personal Details</h3>
                  <p className="text-xs text-gray-400">Keep your details updated for official administrative record sheets.</p>
                  
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="John Doe"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full rounded-xl border border-slate-200 bg-slate-100 cursor-not-allowed pl-10 pr-4 py-2.5 text-sm text-gray-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="prefer-not-to-say">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESS DETAILS */}
              {activeTab === 'address' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 font-display">Corporate / Postal Address</h3>
                  <p className="text-xs text-gray-400">Provide official contact billing coordinates for invoice statements.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Street Address</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="123 Corporate Ave"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="San Francisco"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">State / Region</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="California"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">ZIP / Postal Code</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="94103"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="United States"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <div className="space-y-5 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-900 font-display">Console Security Settings</h3>
                  <p className="text-xs text-gray-400">Regularly changing key phrase codes ensures root server auth protection.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end border-t border-slate-100 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-soft transition-all duration-200 hover:bg-primary-700 active:scale-95 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                  Save Admin Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
