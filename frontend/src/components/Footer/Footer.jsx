import { Link } from 'react-router-dom';
import { Hotel } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-primary-700">
            <Hotel className="h-5 w-5" />
            <span className="font-semibold">GrandStay Hotel</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} GrandStay Hotel. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
            <Link to="/login" className="hover:text-primary-600">
              Login
            </Link>
            <Link to="/signup" className="hover:text-primary-600">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
