import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Loader2,
  AlertCircle,
  Filter,
  ArrowRight
} from 'lucide-react';

interface RSVPEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  hostName: string;
  description: string;
  category: 'Tech' | 'Cultural' | 'Sports' | 'Academic' | 'Social';
  rsvpStatus: 'going' | 'maybe' | 'not-going';
  rsvpDate: string;
  isPastEvent: boolean;
}

interface CancelRSVPModalProps {
  isOpen: boolean;
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

// Sample RSVP events data
const sampleRSVPEvents: RSVPEvent[] = [
  {
    id: '2',
    title: 'Cultural Night: Diversity Celebration',
    date: '2025-02-20',
    time: '19:00',
    location: 'Main Auditorium',
    hostName: 'International Students Association',
    description: 'Experience the rich diversity of our campus community through music, dance, food, and cultural performances.',
    category: 'Cultural',
    rsvpStatus: 'going',
    rsvpDate: '2025-01-15',
    isPastEvent: false
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
    rsvpStatus: 'going',
    rsvpDate: '2025-01-18',
    isPastEvent: false
  },
  {
    id: '11',
    title: 'Data Science Workshop',
    date: '2025-03-08',
    time: '15:00',
    location: 'Engineering Building, Lab 302',
    hostName: 'Data Science Club',
    description: 'Learn about data analysis, visualization, and machine learning techniques with hands-on exercises.',
    category: 'Tech',
    rsvpStatus: 'maybe',
    rsvpDate: '2025-01-22',
    isPastEvent: false
  },
  {
    id: '12',
    title: 'Campus Sustainability Fair',
    date: '2025-01-15',
    time: '11:00',
    location: 'Campus Green',
    hostName: 'Environmental Club',
    description: 'Learn about sustainable practices and environmental initiatives on campus.',
    category: 'Academic',
    rsvpStatus: 'going',
    rsvpDate: '2025-01-10',
    isPastEvent: true
  },
  {
    id: '13',
    title: 'Winter Concert Series',
    date: '2025-01-20',
    time: '20:00',
    location: 'Music Hall',
    hostName: 'Music Department',
    description: 'Enjoy performances by student musicians and guest artists.',
    category: 'Cultural',
    rsvpStatus: 'not-going',
    rsvpDate: '2025-01-12',
    isPastEvent: true
  }
];

const CancelRSVPModal: React.FC<CancelRSVPModalProps> = ({ isOpen, eventTitle, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Cancel RSVP</h3>
            <p className="text-sm text-gray-600">You can always RSVP again later</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to cancel your RSVP for "<span className="font-semibold">{eventTitle}</span>"?
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep RSVP
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              'Cancel RSVP'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function MyRSVPs() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<RSVPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'going' | 'maybe' | 'not-going'>('all');
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    eventId: string;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: '',
    eventTitle: ''
  });
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const loadUserRSVPs = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(sampleRSVPEvents);
      } catch (error) {
        console.error('Failed to load RSVPs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRSVPs();
  }, []);

  const filteredEvents = events.filter(event => {
    switch (filter) {
      case 'upcoming':
        return !event.isPastEvent;
      case 'past':
        return event.isPastEvent;
      case 'going':
      case 'maybe':
      case 'not-going':
        return event.rsvpStatus === filter;
      default:
        return true;
    }
  });

  // Sort events: upcoming first (by date), then past events (most recent first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.isPastEvent !== b.isPastEvent) {
      return a.isPastEvent ? 1 : -1; // Upcoming events first
    }
    
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (a.isPastEvent) {
      return dateB - dateA; // Most recent past events first
    } else {
      return dateA - dateB; // Earliest upcoming events first
    }
  });

  const handleCancelRSVP = async () => {
    setCancelLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEvents(prev => prev.filter(event => event.id !== cancelModal.eventId));
      setCancelModal({ isOpen: false, eventId: '', eventTitle: '' });
    } catch (error) {
      console.error('Failed to cancel RSVP:', error);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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

  const getCategoryColor = (category: string) => {
    const colors = {
      Tech: 'from-blue-500 to-cyan-500',
      Cultural: 'from-purple-500 to-pink-500',
      Sports: 'from-green-500 to-emerald-500',
      Academic: 'from-yellow-500 to-orange-500',
      Social: 'from-pink-500 to-rose-500'
    };
    return colors[category as keyof typeof colors] || 'from-indigo-500 to-purple-500';
  };

  const getRSVPStatusConfig = (status: string) => {
    const configs = {
      going: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        label: 'Going'
      },
      maybe: {
        icon: ClockIcon,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        label: 'Maybe'
      },
      'not-going': {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        label: 'Not Going'
      }
    };
    return configs[status as keyof typeof configs];
  };

  const getEventCounts = () => {
    return {
      total: events.length,
      upcoming: events.filter(e => !e.isPastEvent).length,
      past: events.filter(e => e.isPastEvent).length,
      going: events.filter(e => e.rsvpStatus === 'going').length,
      maybe: events.filter(e => e.rsvpStatus === 'maybe').length,
      notGoing: events.filter(e => e.rsvpStatus === 'not-going').length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex space-x-8">
              <Link to="/explore" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                Explore Events
              </Link>
              <Link to="/my-events" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                My Events
              </Link>
              <span className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1">
                My RSVPs
              </span>
            </nav>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading your RSVPs...</p>
          </div>
        </div>
      </div>
    );
  }

  const counts = getEventCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            My RSVPs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Keep track of all the events you've signed up for
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-indigo-600">{counts.total}</div>
            <div className="text-sm text-gray-600">Total RSVPs</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-blue-600">{counts.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-gray-600">{counts.past}</div>
            <div className="text-sm text-gray-600">Past</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">{counts.going}</div>
            <div className="text-sm text-gray-600">Going</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-yellow-600">{counts.maybe}</div>
            <div className="text-sm text-gray-600">Maybe</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-red-600">{counts.notGoing}</div>
            <div className="text-sm text-gray-600">Not Going</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700 font-medium">Filter events:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Events' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
                { key: 'going', label: 'Going' },
                { key: 'maybe', label: 'Maybe' },
                { key: 'not-going', label: 'Not Going' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === key
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid or Empty State */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {filter === 'all' ? 'No RSVPs Yet' : `No ${filter} Events`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {filter === 'all' 
                  ? "Start exploring campus events and RSVP to the ones that interest you. Build connections and make the most of your campus experience!"
                  : `You don't have any ${filter} events at the moment.`
                }
              </p>
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Explore Events
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.map((event) => {
                const statusConfig = getRSVPStatusConfig(event.rsvpStatus);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={event.id}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group ${
                      event.isPastEvent ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Event Card Header with Gradient */}
                    <div className={`h-2 bg-gradient-to-r ${getCategoryColor(event.category)}`} />
                    
                    <div className="p-6">
                      {/* Status and Past Event Indicators */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.label}
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.isPastEvent && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              Past Event
                            </span>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {event.category}
                          </span>
                        </div>
                      </div>

                      {/* Event Title */}
                      <Link
                        to={`/event/${event.id}`}
                        className="block mb-3"
                      >
                        <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </h3>
                      </Link>

                      {/* Date & Time */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {formatDate(event.date)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600 mb-3">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">{formatTime(event.time)}</span>
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

                      {/* RSVP Date */}
                      <div className="text-xs text-gray-500 mb-6 bg-gray-50 px-3 py-2 rounded-lg">
                        RSVP'd on {new Date(event.rsvpDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/event/${event.id}`}
                          className="flex-1 py-2 px-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-center text-sm font-medium flex items-center justify-center"
                        >
                          View Details
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </Link>
                        {!event.isPastEvent && (
                          <button
                            onClick={() => setCancelModal({
                              isOpen: true,
                              eventId: event.id,
                              eventTitle: event.title
                            })}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Cancel RSVP Confirmation Modal */}
      <CancelRSVPModal
        isOpen={cancelModal.isOpen}
        eventTitle={cancelModal.eventTitle}
        onConfirm={handleCancelRSVP}
        onCancel={() => setCancelModal({ isOpen: false, eventId: '', eventTitle: '' })}
        loading={cancelLoading}
      />
    </div>
  );
}

export default MyRSVPs;