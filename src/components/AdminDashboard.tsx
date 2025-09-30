import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  Edit3,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalEvents: number;
  totalRSVPs: number;
  upcomingEvents: number;
  activeEvents: number;
}

interface RecentEvent {
  id: string;
  title: string;
  date: string;
  rsvpCount: number;
  status: 'published' | 'draft';
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRSVPs: 0,
    upcomingEvents: 0,
    activeEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setStats({
          totalEvents: 12,
          totalRSVPs: 245,
          upcomingEvents: 8,
          activeEvents: 5
        });

        setRecentEvents([
          {
            id: '1',
            title: 'Web Development Bootcamp',
            date: '2025-03-05',
            rsvpCount: 32,
            status: 'published'
          },
          {
            id: '2',
            title: 'Photography Exhibition Opening',
            date: '2025-03-12',
            rsvpCount: 45,
            status: 'published'
          },
          {
            id: '3',
            title: 'Career Fair Preparation Workshop',
            date: '2025-02-28',
            rsvpCount: 0,
            status: 'draft'
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {trend && (
            <p className="text-green-600 text-sm mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xl text-gray-600">
            Here's what's happening with your events today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend="+2 this month"
          />
          <StatCard
            title="Total RSVPs"
            value={stats.totalRSVPs}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend="+15% this week"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
          />
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/create-event"
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Create New Event</h3>
                <p className="text-sm opacity-90">Start organizing your next event</p>
              </div>
            </Link>
            
            <Link
              to="/admin/my-events"
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105"
            >
              <Edit3 className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Manage Events</h3>
                <p className="text-sm opacity-90">Edit and update your events</p>
              </div>
            </Link>
            
            <Link
              to="/events"
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
            >
              <Eye className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">View All Events</h3>
                <p className="text-sm opacity-90">See what's happening on campus</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Events</h2>
            <Link
              to="/admin/my-events"
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-gray-800">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {event.rsvpCount} RSVPs
                    </p>
                    <div className="flex items-center space-x-1">
                      {event.status === 'published' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`text-xs capitalize ${
                        event.status === 'published' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/event/${event.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;