import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  ArrowLeft, 
  Share2, 
  Bookmark,
  CheckCircle,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface Event {
  _id: string; // backend MongoDB id
  title: string;
  date: string;
  time: string;
  location: string;
  hostName: string;
  description: string;
  category: 'Tech' | 'Cultural' | 'Sports' | 'Academic' | 'Social';
  rsvpCount: number;
  isUserRSVPed: boolean;
  tags: string[];
  imageUrl?: string;
  detailedDescription: string;
}

function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showRsvpSuccess, setShowRsvpSuccess] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!res.ok) throw new Error('Failed to fetch event details');
        const data: Event = await res.json();
        setEvent(data);
        setError(null);

        // Fetch related events by category
        const relatedRes = await fetch(`http://localhost:5000/api/events?category=${encodeURIComponent(data.category)}`);
        if (relatedRes.ok) {
          const relatedData: Event[] = await relatedRes.json();
          setRelatedEvents(relatedData.filter(e => e._id !== data._id).slice(0, 3));
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEventDetails();
  }, [id]);

  const handleRSVP = async () => {
    if (!event) return;
    setRsvpLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/events/${event._id}/rsvp`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('RSVP failed');

      setEvent(prev => prev ? {
        ...prev,
        isUserRSVPed: !prev.isUserRSVPed,
        rsvpCount: prev.isUserRSVPed ? prev.rsvpCount - 1 : prev.rsvpCount + 1
      } : null);

      setShowRsvpSuccess(true);
      setTimeout(() => setShowRsvpSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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
      Tech: 'bg-blue-100 text-blue-800 border-blue-200',
      Cultural: 'bg-purple-100 text-purple-800 border-purple-200',
      Sports: 'bg-green-100 text-green-800 border-green-200',
      Academic: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Social: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Events
          </button>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Event Image */}
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex space-x-3">
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Event Info */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              {/* Left Column - Event Details */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                  {event.title}
                </h1>

                {/* Event Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                    <span className="font-medium">{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-indigo-600" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <User className="w-5 h-5 mr-3 text-indigo-600" />
                    <span className="font-medium">Hosted by {event.hostName}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-full text-sm font-medium hover:from-indigo-200 hover:to-purple-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column - RSVP Section */}
              <div className="lg:w-80">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-indigo-600 mr-2" />
                    <span className="text-lg font-semibold text-gray-800">
                      {event.rsvpCount} people attending
                    </span>
                  </div>

                  <button
                    onClick={handleRSVP}
                    disabled={rsvpLoading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70 ${
                      event.isUserRSVPed
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {rsvpLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : event.isUserRSVPed ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        You're Attending!
                      </div>
                    ) : (
                      'RSVP Now'
                    )}
                  </button>

                  {showRsvpSuccess && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm text-center font-medium">
                        {event.isUserRSVPed ? 'Successfully registered!' : 'RSVP cancelled'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">About This Event</h2>
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.detailedDescription}
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        {getRelatedEvents().length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Related Events</h2>
              <Link
                to="/events"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors group"
              >
                View All Events
                <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRelatedEvents().map((relatedEvent) => (
                <Link
                  key={relatedEvent.id}
                  to={`/event/${relatedEvent.id}`}
                  className="group block"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 leading-tight flex-1 mr-2 group-hover:text-indigo-600 transition-colors">
                        {relatedEvent.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(relatedEvent.category)}`}>
                        {relatedEvent.category}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{formatDate(relatedEvent.date)}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{relatedEvent.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{relatedEvent.rsvpCount} attending</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;