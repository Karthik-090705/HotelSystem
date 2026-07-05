import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  UserCircle,
  LogOut,
  X,
  Hotel,
  Star,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/rooms', label: 'Manage Rooms', icon: BedDouble },
  { to: '/rooms', label: 'Browse Rooms', icon: Search },
  { to: '/admin/bookings', label: 'Manage Bookings', icon: CalendarCheck },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/reviews', label: 'Manage Reviews', icon: Star },
  { to: '/admin/profile', label: 'Profile', icon: UserCircle },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-primary-600 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
        <div className="flex items-center gap-2 text-primary-700">
          <Hotel className="h-6 w-6" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
        {user?.avatar ? (
          <img
            src={getImageUrl(user.avatar)}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <UserCircle className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
};

export default Sidebar;
