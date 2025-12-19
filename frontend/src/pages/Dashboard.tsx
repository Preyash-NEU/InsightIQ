import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Activity,
  TrendingUp,
  Zap,
  Upload,
  FileText,
  Globe,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

// Type definitions for dashboard stats
type TrendType = 'up' | 'down' | 'neutral';
type ColorType = 'slate' | 'cyan' | 'blue' | 'purple';

interface StatCard {
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit?: string;
  change: string | number;
  changeText: string;
  trend: TrendType;
  color: ColorType;
}

interface DashboardStats {
  data_sources_count: number;
  queries_count: number;
  queries_this_month: number;
  active_datasets: number;
  storage_used_bytes: number;
  storage_limit_bytes: number;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats from backend
        const statsResponse = await apiClient.get('/stats/dashboard');
        setStats(statsResponse.data);

        // Fetch recent activity
        const activityResponse = await apiClient.get('/stats/activity');
        setRecentActivity(activityResponse.data.recent_activity || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default empty data
        setStats({
          data_sources_count: 0,
          queries_count: 0,
          queries_this_month: 0,
          active_datasets: 0,
          storage_used_bytes: 0,
          storage_limit_bytes: 10737418240, // 10 GB
        });
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate storage in GB
  const storageUsedGB = stats ? (stats.storage_used_bytes / (1024 * 1024 * 1024)).toFixed(2) : '0';
  const storageLimitGB = stats ? (stats.storage_limit_bytes / (1024 * 1024 * 1024)).toFixed(0) : '10';
  const storagePercentage = stats ? ((stats.storage_used_bytes / stats.storage_limit_bytes) * 100).toFixed(0) : '0';

  // Quick actions
  const quickActions = [
    { 
      icon: Upload, 
      label: 'Upload CSV', 
      color: 'from-slate-600/20 to-slate-600/5', 
      iconColor: 'text-slate-400',
      action: () => navigate('/data-sources?action=upload')
    },
    { 
      icon: FileText, 
      label: 'Connect Sheets', 
      color: 'from-cyan-600/20 to-cyan-600/5', 
      iconColor: 'text-cyan-400',
      action: () => navigate('/data-sources?action=sheets')
    },
    { 
      icon: Globe, 
      label: 'Connect API', 
      color: 'from-blue-600/20 to-blue-600/5', 
      iconColor: 'text-blue-400',
      action: () => navigate('/data-sources?action=api')
    },
    { 
      icon: BarChart3, 
      label: 'New Analysis', 
      color: 'from-purple-600/20 to-purple-600/5', 
      iconColor: 'text-purple-400',
      action: () => navigate('/analysis')
    },
  ];

  // Mock insights - can be replaced with backend data
  const insights = [
    {
      title: 'Getting Started',
      description: 'Upload your first data source to start analyzing your data with AI-powered insights.',
      icon: Sparkles,
      color: 'from-cyan-600/10 to-blue-600/10',
      borderColor: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      title: 'Quick Tip',
      description: 'Try asking questions in plain English like "What was revenue last quarter?" for instant insights.',
      icon: TrendingUp,
      color: 'from-purple-600/10 to-pink-600/10',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
            <p className="text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
          <div className="relative p-6 border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
                </h2>
                <p className="text-slate-400">Here's what's happening with your data today.</p>
              </div>
              <button 
                onClick={() => navigate('/analysis')}
                className="flex items-center px-6 py-3 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {([
            {
              icon: Database,
              label: 'Data Sources',
              value: stats?.data_sources_count || 0,
              change: '+2',
              changeText: 'this week',
              trend: 'up',
              color: 'slate',
            },
            {
              icon: Activity,
              label: 'Total Queries',
              value: stats?.queries_count || 0,
              change: `+${stats?.queries_this_month || 0}`,
              changeText: 'this month',
              trend: 'up',
              color: 'cyan',
            },
            {
              icon: TrendingUp,
              label: 'Active Datasets',
              value: stats?.active_datasets || 0,
              change: stats?.active_datasets || 0,
              changeText: 'syncing now',
              trend: 'neutral',
              color: 'blue',
            },
            {
              icon: Zap,
              label: 'Storage Used',
              value: storageUsedGB,
              unit: 'GB',
              change: storagePercentage + '%',
              changeText: `of ${storageLimitGB} GB`,
              trend: 'neutral',
              color: 'purple',
            },
          ] as StatCard[]).map((stat, i) => (
            <div
              key={i}
              className="relative group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${
                stat.color === 'cyan' ? 'from-cyan-500 to-blue-500' :
                stat.color === 'blue' ? 'from-blue-500 to-indigo-500' :
                stat.color === 'purple' ? 'from-purple-500 to-pink-500' :
                'from-slate-500 to-slate-600'
              } rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity`} />
              
              <div className="relative p-6 text-center transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl group-hover:border-slate-700/50">
                <div className="flex justify-center mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${
                    stat.color === 'cyan' ? 'from-cyan-600/20 to-cyan-600/5' :
                    stat.color === 'blue' ? 'from-blue-600/20 to-blue-600/5' :
                    stat.color === 'purple' ? 'from-purple-600/20 to-purple-600/5' :
                    'from-slate-600/20 to-slate-600/5'
                  } rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-7 h-7 ${
                      stat.color === 'cyan' ? 'text-cyan-400' :
                      stat.color === 'blue' ? 'text-blue-400' :
                      stat.color === 'purple' ? 'text-purple-400' :
                      'text-slate-400'
                    }`} />
                  </div>
                </div>
                
                <p className="mb-2 text-sm font-medium text-slate-400">{stat.label}</p>
                
                <div className="flex items-baseline justify-center mb-3 space-x-1">
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  {stat.unit && <span className="text-lg text-slate-400">{stat.unit}</span>}
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  {stat.trend === 'up' && (
                    <div className="flex items-center text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  )}
                  {stat.trend === 'down' && (
                    <div className="flex items-center text-red-400">
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <span className="text-sm text-slate-400">{stat.change}</span>
                  )}
                  <span className="text-xs text-slate-500">{stat.changeText}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                <div className="relative flex flex-col items-center justify-center h-full p-6 text-center transition-all border-2 border-dashed bg-slate-900/50 backdrop-blur-xl border-slate-700/50 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-500/5">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <p className="text-sm font-medium text-white">{action.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity and Insights */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
            <div className="relative overflow-hidden border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button 
                  onClick={() => navigate('/history')}
                  className="flex items-center text-sm transition-colors text-cyan-400 hover:text-cyan-300"
                >
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-start p-3 space-x-3 transition-all cursor-pointer group/item hover:bg-cyan-500/5 rounded-xl"
                      >
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-cyan-500/10 rounded-xl">
                          {activity.type === 'query' ? (
                            <BarChart3 className="w-5 h-5 text-cyan-400" />
                          ) : activity.type === 'upload' ? (
                            <Database className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Activity className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs truncate text-slate-400">
                            {activity.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                    <p className="mb-2 text-slate-400">No recent activity</p>
                    <p className="text-sm text-slate-500">
                      Start by uploading a data source or running a query
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
            <div className="relative overflow-hidden border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
              <div className="p-6 border-b border-slate-800/50">
                <h3 className="text-lg font-semibold text-white">Getting Started</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-br ${insight.color} rounded-xl p-5 border ${insight.borderColor}`}
                  >
                    <div className="flex items-start space-x-3">
                      <insight.icon className={`w-6 h-6 ${insight.iconColor} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="mb-2 text-sm font-semibold text-white">{insight.title}</p>
                        <p className="text-sm leading-relaxed text-slate-300">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Start Checklist */}
                <div className="mt-6 space-y-3">
                  <p className="mb-3 text-sm font-semibold text-white">Quick Start Checklist</p>
                  {[
                    { label: 'Create your account', done: true },
                    { label: 'Upload your first data source', done: (stats?.data_sources_count || 0) > 0 },
                    { label: 'Run your first query', done: (stats?.queries_count || 0) > 0 },
                    { label: 'Share your first insight', done: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 text-sm"
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 border-2 rounded-full border-slate-700" />
                      )}
                      <span className={item.done ? 'text-slate-300 line-through' : 'text-slate-400'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources Preview (if any exist) */}
        {stats && stats.data_sources_count > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
            <div className="relative p-6 border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Data Sources</h3>
                <button
                  onClick={() => navigate('/data-sources')}
                  className="flex items-center text-sm transition-colors text-cyan-400 hover:text-cyan-300"
                >
                  Manage All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* These would be populated from backend */}
                <div className="p-4 transition-all border cursor-pointer bg-slate-800/50 border-slate-700/50 rounded-xl hover:border-cyan-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="w-8 h-8 text-slate-400" />
                    <span className="px-2 py-1 text-xs border rounded-full bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                      Connected
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-medium text-white">Click to add data sources</p>
                  <p className="text-xs text-slate-400">Connect your first dataset</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
