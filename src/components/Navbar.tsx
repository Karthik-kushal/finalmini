import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Calendar,
  Plus,
  BarChart3,
  Menu,
  X
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const NavLink: React.FC<{ to: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ 
    to, 
    children, 
    icon 
  }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActivePath(to)
          ? 'bg-indigo-100 text-indigo-700 shadow-sm'
          : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/events'} className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">Campus Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user?.role === 'admin' ? (
              <>
                <NavLink to="/admin/dashboard" icon={<BarChart3 className="w-4 h-4" />}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/create-event" icon={<Plus className="w-4 h-4" />}>
                  Create Event
                </NavLink>
                <NavLink to="/admin/my-events" icon={<Calendar className="w-4 h-4" />}>
                  My Events
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/events" icon={<Calendar className="w-4 h-4" />}>
                  Events
                </NavLink>
                <NavLink to="/student/my-rsvps" icon={<User className="w-4 h-4" />}>
                  My RSVPs
                </NavLink>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-800">{user?.fullName}</p>
                <p className="text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="space-y-2">
              {user?.role === 'admin' ? (
                <>
                  <NavLink to="/admin/dashboard" icon={<BarChart3 className="w-4 h-4" />}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/create-event" icon={<Plus className="w-4 h-4" />}>
                    Create Event
                  </NavLink>
                  <NavLink to="/admin/my-events" icon={<Calendar className="w-4 h-4" />}>
                    My Events
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/events" icon={<Calendar className="w-4 h-4" />}>
                    Events
                  </NavLink>
                  <NavLink to="/student/my-rsvps" icon={<User className="w-4 h-4" />}>
                    My RSVPs
                  </NavLink>
                </>
              )}
              
              {/* User Info */}
              <div className="px-4 py-3 bg-gray-50 rounded-lg mx-4 mt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">{user?.fullName}</p>
                    <p className="text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;