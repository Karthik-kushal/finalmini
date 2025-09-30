import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Edit3, 
  Trash2, 
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  Filter
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
  status: 'draft' | 'published' | 'cancelled';
  createdAt: string;
}

interface DeleteModalProps {
  isOpen: boolean;
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

// Sample user events data
const sampleUserEvents: Event[] = [
  {
    id: '7',
    title: 'Web Development Bootcamp',
    date: '2025-03-05',
    time: '10:00',
    location: 'Computer Lab 205',
    hostName: 'John Doe',
    description: 'Comprehensive web development workshop covering HTML, CSS, JavaScript, and React fundamentals.',
    category: 'Tech',
    rsvpCount: 32,
    status: 'published',
    createdAt: '2025-01-15'
  },
  {
    id: '8',
    title: 'Photography Exhibition Opening',
    date: '2025-03-12',
    time: '18:30',
    location: 'Art Gallery, Main Building',
    hostName: 'John Doe',
    description: 'Showcase of student photography work from the past semester.',
    category: 'Cultural',
    rsvpCount: 45,
    status: 'published',
    createdAt: '2025-01-20'
  },
  {
    id: '9',
    title: 'Career Fair Preparation Workshop',
    date: '2025-02-28',
    time: '14:00',
    location: 'Career Services Center',
    hostName: 'John Doe',
    description: 'Learn how to prepare for career fairs, write effective resumes, and network professionally.',
    category: 'Academic',
    rsvpCount: 0,
    status: 'draft',
    createdAt: '2025-01-25'
  },
  {
    id: '10',
    title: 'Spring Festival Planning Meeting',
    date: '2025-02-20',
    time: '16:00',
    location: 'Student Union Room 301',
    hostName: 'John Doe',
    description: 'Planning meeting for the upcoming spring festival. All volunteers welcome.',
    category: 'Social',
    rsvpCount: 12,
    status: 'cancelled',
    createdAt: '2025-01-10'
  }
];

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, eventTitle, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Delete Event</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete "<span className="font-semibold">{eventTitle}</span>"? 
          This will permanently remove the event and all associated data.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Event'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function MyEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'cancelled'>('all');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    eventId: string;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: '',
    eventTitle: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadUserEvents = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(sampleUserEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  const handleDeleteEvent = async () => {
    setDeleteLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEvents(prev => prev.filter(event => event.id !== deleteModal.eventId));
      setDeleteModal({ isOpen: false, eventId: '', eventTitle: '' });
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setDeleteLoading(false);
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

  const getStatusConfig = (status: string) => {
    const configs = {
      published: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        label: 'Published'
      },
      draft: {
        icon: Edit3,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        label: 'Draft'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        label: 'Cancelled'
      }
    };
    return configs[status as keyof typeof configs];
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
              <span className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-1">
                My Events
              </span>
              <Link to="/my-rsvps" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                My RSVPs
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            My Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage all the events you've created and track their performance
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700 font-medium">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Events' },
                { key: 'published', label: 'Published' },
                { key: 'draft', label: 'Drafts' },
                { key: 'cancelled', label: 'Cancelled' }
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
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {filter === 'all' ? 'No Events Created Yet' : `No ${filter} Events`}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {filter === 'all' 
                  ? "Start building your campus community by creating your first event. Share knowledge, organize activities, and bring people together!"
                  : `You don't have any ${filter} events at the moment.`
                }
              </p>
              <Link
                to="/admin/create-event"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Event
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredEvents.map((event) => {
                const statusConfig = getStatusConfig(event.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                  >
                    {/* Event Card Header with Gradient */}
                    <div className={`h-2 bg-gradient-to-r ${getCategoryColor(event.category)}`} />
                    
                    <div className="p-6">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.label}
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {event.category}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </h3>

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
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{event.location}</span>
                      </div>

                      {/* RSVP Count */}
                      <div className="flex items-center text-gray-600 mb-6">
                        <Eye className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          {event.rsvpCount} {event.rsvpCount === 1 ? 'person' : 'people'} attending
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/event/${event.id}`}
                          className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => {
                            // Navigate to edit page (would be implemented)
                            console.log('Edit event:', event.id);
                          }}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            eventId: event.id,
                            eventTitle: event.title
                          })}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <Link
        to="/admin/create-event"
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center group z-40"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-200" />
      </Link>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        eventTitle={deleteModal.eventTitle}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteModal({ isOpen: false, eventId: '', eventTitle: '' })}
        loading={deleteLoading}
      />
    </div>
  );
}

export default MyEvents;