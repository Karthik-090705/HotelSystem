import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Hotel, Shield, Star } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import RoomCard from '../components/RoomCard/RoomCard';
import { getRooms } from '../services/userService';

const Landing = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);

  useEffect(() => {
    getRooms(true)
      .then(({ data }) => setFeaturedRooms(data.data.slice(0, 3)))
      .catch(() => { });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Stunning Luxury Hero Section */}
        <section className="bg-gradient-dark relative overflow-hidden px-4 py-24 text-white sm:py-32">
          {/* Subtle Decorative Ambient Lights */}
          <div className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-[120px]" />
          <div className="absolute -right-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl text-center">
            <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-md">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-amber-100 font-medium font-display">Luxury stays at affordable prices</span>
            </div>

            <h1 className="animate-slide-up text-4xl font-extrabold leading-tight sm:text-5xl lg:text-7xl font-display text-white">
              Experience the Art of <span className="bg-gradient-to-r from-primary-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Grand Hospitality</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl animate-slide-up text-base text-slate-300 sm:text-lg">
              Discover comfort, elegance, and world-class hospitality. Book your ideal room in just a few clicks and build memories of a lifetime.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up">
              <Link
                to="/rooms"
                className="flex items-center gap-2 rounded-xl bg-gradient-gold px-8 py-3.5 font-semibold text-slate-950 shadow-soft-lg hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                Browse Rooms <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-md hover:bg-white/10 active:scale-95 transition-all duration-200"
              >
                Account
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Rooms Section */}
        {featuredRooms.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Featured Accommodations</h2>
              <p className="mt-2 text-slate-500">Handpicked selections of our most comfortable and premium spaces</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRooms.map((room, idx) => (
                <div
                  key={room._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <RoomCard room={room} />
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/rooms"
                className="inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700 transition"
              >
                View all rooms <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Core Pillars / Services Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-200">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Hotel, title: 'Premium Rooms', desc: 'Beautifully designed suites equipped with state of the art amenities and comfort.' },
              { icon: Shield, title: 'Secure Booking', desc: 'Encrypted, swift reservation and secure arrival guarantee for complete peace of mind.' },
              { icon: Star, title: '5-Star Hospitality', desc: 'Our dedicated concierge service is available around the clock to meet your every need.' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className="glass-panel hover:translate-y-[-6px] hover:shadow-soft-lg rounded-3xl p-8 text-center transition-all duration-300 border border-slate-200/60"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
