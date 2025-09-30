import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronDown,
  User,
  Loader2,
  AlertCircle,
  Heart,
  Share2
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  createdBy?: {
    fullName: string;
    email: string;
  };
  rsvpCount?: number;
  isUserRSVPed?: boolean;
  category?: 'Tech' | 'Cultural' | 'Sports' | 'Academic' | 'Social';
}

interface FilterState {
  search: string;
  category: string;
  sort: string;
}

const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Academic', 'Social'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'alphabetical', label: 'Alphabetical' }
];

const PublicEvents: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    sort: 'newest'
  });
  const [searchDebounce, setSearchDebounce] = useState('');

  // ✅ Fetch real events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/events`);
        if (!res.ok) throw new Error('Failed to load events');
        const data = await res.json();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Filter & sort
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchDebounce.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchDebounce.toLowerCase()) ||
        (event.createdBy?.fullName || '').toLowerCase().includes(searchDebounce.toLowerCase());
      const matchesCategory =
        filters.category === 'All' || event.category === filters.category;
      return matchesSearch && matchesCategory;
    });

    switch (filters.sort) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.rsvpCount || 0) - (a.rsvpCount || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    return filtered;
  }, [events, searchDebounce, filters.category, filters.sort]);

  // RSVP handler
  const handleRSVP = async (eventId: string) => {
    if (!isAuthenticated) return;
    try {
      await fetch(`${API_BASE_URL}/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, eventId })
      });
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId
            ? {
                ...event,
                isUserRSVPed: !event.isUserRSVPed,
                rsvpCount: event.isUserRSVPed
                  ? (event.rsvpCount || 0) - 1
                  : (event.rsvpCount || 0) + 1
              }
            : event
        )
      );
    } catch (err) {
      console.error('RSVP failed', err);
    }
  };

  // Helpers
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

  const truncateDescription = (description: string, maxLength: number = 100) =>
    description.length > maxLength ? description.substring(0, maxLength) + '...' : description;

  const getCategoryColor = (category?: string) => {
    const colors = {
      Tech: 'bg-blue-100 text-blue-800',
      Cultural: 'bg-purple-100 text-purple-800',
      Sports: 'bg-green-100 text-green-800',
      Academic: 'bg-yellow-100 text-yellow-800',
      Social: 'bg-pink-100 text-pink-800'
    };
    return category ? colors[category as keyof typeof colors] : 'bg-gray-100 text-gray-800';
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ Render — design kept 100% same
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Campus Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exciting events happening on campus and connect with your community
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full lg:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events, keywords, or hosts..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Category */}
            <div className="relative w-full lg:w-48">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative w-full lg:w-48">
              <select
                value={filters.sort}
                onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Events */}
        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.category !== 'All'
                  ? "Try adjusting your filters to find more events."
                  : "No events are currently available. Check back later!"}
              </p>
              {(filters.search || filters.category !== 'All') && (
                <button
                  onClick={() => setFilters({ search: '', category: 'All', sort: 'newest' })}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredAndSortedEvents.length} event
                {filteredAndSortedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                >
                  {event.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {!event.imageUrl && (
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                    )}

                    <Link to={`/event/${event._id}`} className="block mb-3">
                      <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>
                    </Link>

                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-4">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        Hosted by {event.createdBy?.fullName || 'Unknown'}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                      {truncateDescription(event.description)}
                    </p>

                    <div className="flex items-center text-gray-600 mb-4">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {event.rsvpCount || 0} people attending
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/event/${event._id}`}
                        className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {isAuthenticated && user?.role === 'student' && (
                        <button
                          onClick={() => handleRSVP(event._id)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            event.isUserRSVPed
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {event.isUserRSVPed ? 'RSVP\'d ✓' : 'RSVP'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicEvents;
