import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Rocket, Moon, User, Menu, X, Bell } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-space-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="relative">
              <Rocket className="w-8 h-8 text-accent-blue animate-subtle-float" />
              <div className="absolute inset-0 blur-lg bg-accent-blue/30 -z-10" />
            </div>
            <span className="font-['Outfit'] text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Space<span className="text-accent-blue">Conf</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-accent-blue ${isActive ? 'text-accent-blue' : 'text-gray-400'}`}>
              Discover
            </NavLink>
            <NavLink to="/saved" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-accent-blue ${isActive ? 'text-accent-blue' : 'text-gray-400'}`}>
              My List
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-accent-blue ${isActive ? 'text-accent-blue' : 'text-gray-400'}`}>
              Admin
            </NavLink>
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-blue rounded-full" />
            </button>
            <Link to="/auth" className="btn-primary">
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-space-900 px-4 py-6 space-y-4">
          <Link to="/" className="block text-lg font-medium text-gray-300 px-3 py-2" onClick={() => setIsOpen(false)}>Discover</Link>
          <Link to="/saved" className="block text-lg font-medium text-gray-300 px-3 py-2" onClick={() => setIsOpen(false)}>My List</Link>
          <Link to="/admin" className="block text-lg font-medium text-gray-300 px-3 py-2" onClick={() => setIsOpen(false)}>Admin</Link>
          <Link to="/auth" className="block btn-primary text-center" onClick={() => setIsOpen(false)}>Sign In</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
