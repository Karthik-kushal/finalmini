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
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  detailedDescription: string;
  category: 'Tech' | 'Cultural' | 'Sports' | 'Academic' | 'Social' | 'Others';
  rsvpCount: number;
  tags: string[];
  imageUrl?: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
}

interface RelatedEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  rsvpCount: number;
}

function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<RelatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showRsvpSuccess, setShowRsvpSuccess] = useState(false);
  const [isUserRSVPed, setIsUserRSVPed] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) {
        setError('No event ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/events/${id}`);

        if (res.status === 404) {
          setError('Event not found');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch event details');
        }

        const data: Event = await res.json();
        setEvent(data);

        if (user?._id) {
          const rsvpRes = await fetch(`${API_BASE_URL}/events/${id}/rsvp/${user._id}`);
          if (rsvpRes.ok) {
            const rsvpData = await rsvpRes.json();
            setIsUserRSVPed(rsvpData.isRSVPed);
          }
        }

        const relatedRes = await fetch(`${API_BASE_URL}/events?category=${encodeURIComponent(data.category)}`);
        if (relatedRes.ok) {
          const relatedData: RelatedEvent[] = await relatedRes.json();
          setRelatedEvents(relatedData.filter(e => e._id !== data._id).slice(0, 3));
        }

      } catch (err) {
        console.error('Error fetching event:', err);
        setError((err as Error).message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, user]);

  const handleRSVP = async () => {
    if (!event || !user?._id) {
      alert('Please log in to RSVP');
      return;
    }

    setRsvpLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${event._id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!res.ok) {
        throw new Error('RSVP failed');
      }

      const result = await res.json();
      const newRSVPStatus = result.isRSVPed;

      setIsUserRSVPed(newRSVPStatus);
      setEvent(prev => prev ? {
        ...prev,
        rsvpCount: newRSVPStatus ? prev.rsvpCount + 1 : prev.rsvpCount - 1
      } : null);

      setShowRsvpSuccess(true);
      setTimeout(() => setShowRsvpSuccess(false), 3000);

    } catch (err) {
      console.error('Error toggling RSVP:', err);
      alert('Failed to update RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBookmark = () => {
    alert('Bookmark feature coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Tech: 'bg-blue-100 text-blue-800 border-blue-200',
      Cultural: 'bg-amber-100 text-amber-800 border-amber-200',
      Sports: 'bg-green-100 text-green-800 border-green-200',
      Academic: 'bg-orange-100 text-orange-800 border-orange-200',
      Social: 'bg-pink-100 text-pink-800 border-pink-200',
      Others: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Event Not Found</h2>
          <p className="text-gray-600 mb-8 text-lg">
            {error === 'Event not found'
              ? "We couldn't find the event you're looking for. It may have been removed or doesn't exist."
              : error || 'Something went wrong while loading the event.'}
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-24 h-24 text-blue-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute top-6 left-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
            </div>

            <div className="absolute top-6 right-6 flex space-x-3">
              <button
                onClick={handleShare}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                title="Share event"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleBookmark}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                title="Bookmark event"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                  {event.title}
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{formatTime(event.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">{event.location || 'Location TBA'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <User className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-medium">Hosted by {event.createdBy?.fullName || 'Unknown'}</span>
                  </div>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-sm font-medium hover:from-blue-200 hover:to-cyan-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:w-80">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-lg font-semibold text-gray-800">
                      {event.rsvpCount} {event.rsvpCount === 1 ? 'person' : 'people'} attending
                    </span>
                  </div>

                  {user ? (
                    <button
                      onClick={handleRSVP}
                      disabled={rsvpLoading}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-70 ${
                        isUserRSVPed
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                      }`}
                    >
                      {rsvpLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Processing...
                        </div>
                      ) : isUserRSVPed ? (
                        <div className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          You're Attending!
                        </div>
                      ) : (
                        'RSVP Now'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Login to RSVP
                    </button>
                  )}

                  {showRsvpSuccess && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm text-center font-medium">
                        {isUserRSVPed ? 'Successfully registered!' : 'RSVP cancelled'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">About This Event</h2>
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.detailedDescription || event.description || 'No description available.'}
            </div>
          </div>
        </div>

        {relatedEvents.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Related Events</h2>
              <Link
                to="/explore"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
              >
                View All Events
                <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((relatedEvent) => (
                <Link
                  key={relatedEvent._id}
                  to={`/event/${relatedEvent._id}`}
                  className="group block"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 leading-tight flex-1 mr-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedEvent.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryColor(relatedEvent.category)}`}>
                        {relatedEvent.category}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{formatDate(relatedEvent.date)}</span>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">{relatedEvent.location || 'Location TBA'}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
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