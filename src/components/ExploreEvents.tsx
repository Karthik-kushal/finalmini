import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronDown,
  User,
  Loader2,
  AlertCircle,
  Plus
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  hostName: string;
  description: string;
  category: 'Tech' | 'Cultural' | 'Sports' | 'Academic' | 'Social';
  rsvpCount: number;
  isUserRSVPed: boolean;
}

interface FilterState {
  search: string;
  category: string;
  sort: string;
}

// Sample data for demonstration
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'AI & Machine Learning Workshop',
    date: '2025-02-15',
    time: '14:00',
    location: 'Computer Science Building, Room 101',
    hostName: 'Tech Society',
    description: 'Join us for an intensive workshop on artificial intelligence and machine learning fundamentals. Learn about neural networks, deep learning, and practical applications in modern technology.',
    category: 'Tech',
    rsvpCount: 45,
    isUserRSVPed: false
  },
  {
    id: '2',
    title: 'Cultural Night: Diversity Celebration',
    date: '2025-02-20',
    time: '19:00',
    location: 'Main Auditorium',
    hostName: 'International Students Association',
    description: 'Experience the rich diversity of our campus community through music, dance, food, and cultural performances from around the world.',
    category: 'Cultural',
    rsvpCount: 120,
    isUserRSVPed: true
  },
  {
    id: '3',
    title: 'Basketball Championship Finals',
    date: '2025-02-18',
    time: '16:30',
    location: 'Sports Complex Arena',
    hostName: 'Athletics Department',
    description: 'Cheer for our university team in the championship finals! Free entry for all students with valid ID.',
    category: 'Sports',
    rsvpCount: 200,
    isUserRSVPed: false
  },
  {
    id: '4',
    title: 'Research Symposium 2025',
    date: '2025-02-25',
    time: '09:00',
    location: 'Library Conference Hall',
    hostName: 'Graduate School',
    description: 'Present your research findings and discover groundbreaking work from fellow students and faculty members.',
    category: 'Academic',
    rsvpCount: 75,
    isUserRSVPed: false
  },
  {
    id: '5',
    title: 'Spring Mixer: Meet & Greet',
    date: '2025-02-22',
    time: '18:00',
    location: 'Student Union Building',
    hostName: 'Student Government',
    description: 'Connect with fellow students, make new friends, and enjoy refreshments in a relaxed social setting.',
    category: 'Social',
    rsvpCount: 85,
    isUserRSVPed: true
  },
  {
    id: '6',
    title: 'Startup Pitch Competition',
    date: '2025-02-28',
    time: '13:00',
    location: 'Business School Auditorium',
    hostName: 'Entrepreneurship Club',
    description: 'Watch innovative student startups pitch their ideas to industry experts and compete for funding opportunities.',
    category: 'Tech',
    rsvpCount: 60,
    isUserRSVPed: false
  }
];

const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Academic', 'Social'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'alphabetical', label: 'Alphabetical' }
];

function ExploreEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    sort: 'newest'
  });
  const [searchDebounce, setSearchDebounce] = useState('');

  // Simulate loading data
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(sampleEvents);
        setError(null);
      } catch (err) {
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchDebounce.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchDebounce.toLowerCase()) ||
                           event.hostName.toLowerCase().includes(searchDebounce.toLowerCase());
      
      const matchesCategory = filters.category === 'All' || event.category === filters.category;
      
      return matchesSearch && matchesCategory;
    });

    // Sort events
    switch (filters.sort) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.rsvpCount - a.rsvpCount);
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

  const handleRSVP = (eventId: string) => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId
          ? {
              ...event,
              isUserRSVPed: !event.isUserRSVPed,
              rsvpCount: event.isUserRSVPed ? event.rsvpCount - 1 : event.rsvpCount + 1
            }
          : event
      )
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'
      : description;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Tech: 'bg-blue-100 text-blue-800',
      Cultural: 'bg-purple-100 text-purple-800',
      Sports: 'bg-green-100 text-green-800',
      Academic: 'bg-yellow-100 text-yellow-800',
      Social: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <nav className="flex flex-wrap justify-center gap-6">
            <span className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1">
              Explore Events
            </span>
            <Link to="/my-events" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              My Events
            </Link>
            <Link to="/my-rsvps" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              My RSVPs
            </Link>
          </nav>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Explore Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exciting events happening on campus and connect with your community
          </p>
          
          {/* Add Event Button */}
          <div className="mt-8">
            <Link
              to="/add-event"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Filter Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
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

            {/* Category Filter */}
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

            {/* Sort Dropdown */}
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

          {/* Active Filters Display */}
          {(filters.search || filters.category !== 'All') && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                  Search: "{filters.search}"
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Category: {filters.category}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: 'All' }))}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Events Grid Section */}
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
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredAndSortedEvents.length} event{filteredAndSortedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}`}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                >
                  {/* Event Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 leading-tight flex-1 mr-2 group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {formatDate(event.date)} • {formatTime(event.time)}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{event.location}</span>
                    </div>

                    {/* Host */}
                    <div className="flex items-center text-gray-600 mb-4">
                      <User className="w-4 h-4 mr-2" />
                      <span className="text-sm">Hosted by {event.hostName}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                      {truncateDescription(event.description)}
                    </p>

                    {/* RSVP Count */}
                    <div className="flex items-center text-gray-600 mb-4">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {event.rsvpCount} people attending
                      </span>
                    </div>
                  </div>

                  {/* RSVP Button */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRSVP(event.id);
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform group-hover:scale-105 ${
                        event.isUserRSVPed
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                      }`}
                    >
                      {event.isUserRSVPed ? 'RSVP\'d ✓' : 'RSVP Now'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ExploreEvents;