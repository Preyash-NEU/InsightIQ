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
  Table as TableIcon,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import DataSourceService from '../services/dataSourceService';
import { DataSource as DataSourceType } from '../types/dataSource';

// Type definitions matching ACTUAL backend response
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

// Backend response structure (nested)
interface DashboardStats {
  data_sources: {
    total: number;
    connected: number;
    syncing: number;
    most_queried: {
      name: string | null;
      query_count: number;
    };
  };
  queries: {
    total: number;
    saved: number;
    this_month: number;
    last_7_days: number;
    last_30_days: number;
    avg_execution_time_ms: number;
  };
  storage: {
    used_bytes: number;
    used_mb: number;
    used_gb: number;
    limit_bytes: number;
    limit_gb: number;
    percentage_used: number;
  };
  last_data_sync: string | null;
  user_since: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats from backend (nested structure)
        const statsResponse = await apiClient.get('/stats/dashboard');
        console.log('Stats response:', statsResponse.data); // Debug
        setStats(statsResponse.data);

        // Fetch recent activity (direct array)
        const activityResponse = await apiClient.get('/stats/activity');
        console.log('Activity response:', activityResponse.data); // Debug
        
        // Backend returns array directly, not { recent_activity: [...] }
        setRecentActivity(Array.isArray(activityResponse.data) ? activityResponse.data : []);

        // Fetch actual data sources to display (first 3)
        const dataSourcesResponse = await DataSourceService.getDataSources(0, 3);
        setDataSources(dataSourcesResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default empty data with nested structure
        setStats({
          data_sources: {
            total: 0,
            connected: 0,
            syncing: 0,
            most_queried: { name: null, query_count: 0 }
          },
          queries: {
            total: 0,
            saved: 0,
            this_month: 0,
            last_7_days: 0,
            last_30_days: 0,
            avg_execution_time_ms: 0
          },
          storage: {
            used_bytes: 0,
            used_mb: 0,
            used_gb: 0,
            limit_bytes: 10737418240,
            limit_gb: 10,
            percentage_used: 0
          },
          last_data_sync: null,
          user_since: new Date().toISOString()
        });
        setRecentActivity([]);
        setDataSources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Quick actions with "Connect Database"
  const quickActions = [
    { 
      icon: Upload, 
      label: 'Upload File', 
      color: 'from-green-600/20 to-green-600/5', 
      iconColor: 'text-green-400',
      action: () => navigate('/data-sources?action=upload')
    },
    { 
      icon: Database, 
      label: 'Connect Database', 
      color: 'from-blue-600/20 to-blue-600/5', 
      iconColor: 'text-blue-400',
      action: () => navigate('/data-sources?action=database')
    },
    { 
      icon: FileText, 
      label: 'Connect Sheets', 
      color: 'from-cyan-600/20 to-cyan-600/5', 
      iconColor: 'text-cyan-400',
      action: () => navigate('/data-sources?action=sheets')
    },
    { 
      icon: BarChart3, 
      label: 'New Analysis', 
      color: 'from-purple-600/20 to-purple-600/5', 
      iconColor: 'text-purple-400',
      action: () => navigate('/analysis')
    },
  ];

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
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
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
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! 👋
                </h2>
                <p className="text-slate-400">Here's what's happening with your data today.</p>
              </div>
              <button 
                onClick={() => navigate('/analysis')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - UPDATED to use nested structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {([
            {
              icon: Database,
              label: 'Data Sources',
              value: stats?.data_sources?.total || 0,
              change: stats?.data_sources?.total && stats.data_sources.total > 0 ? `+${stats.data_sources.total}` : '0',
              changeText: 'connected',
              trend: 'up',
              color: 'slate',
            },
            {
              icon: Activity,
              label: 'Total Queries',
              value: stats?.queries?.total || 0,
              change: `+${stats?.queries?.this_month || 0}`,
              changeText: 'this month',
              trend: 'up',
              color: 'cyan',
            },
            {
              icon: TrendingUp,
              label: 'Active Datasets',
              value: stats?.data_sources?.connected || 0,
              change: stats?.data_sources?.syncing || 0,
              changeText: 'syncing now',
              trend: 'neutral',
              color: 'blue',
            },
            {
              icon: Zap,
              label: 'Storage Used',
              value: stats?.storage?.used_gb ? Number(stats.storage.used_gb).toFixed(2) : '0.00',
              unit: 'GB',
              change: stats?.storage?.percentage_used ? Number(stats.storage.percentage_used).toFixed(0) + '%' : '0%',
              changeText: `of ${stats?.storage?.limit_gb || 10} GB`,
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
              
              <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 group-hover:border-slate-700/50 transition-all text-center">
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
                
                <p className="text-sm font-medium text-slate-400 mb-2">{stat.label}</p>
                
                <div className="flex items-baseline justify-center space-x-1 mb-3">
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
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                <div className="relative bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-center h-full flex flex-col items-center justify-center">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button 
                  onClick={() => navigate('/history')}
                  className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center transition-colors"
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
                        key={activity.id || i}
                        className="flex items-start space-x-3 group/item hover:bg-cyan-500/5 p-3 rounded-xl transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          {activity.type === 'query' ? (
                            <BarChart3 className="w-5 h-5 text-cyan-400" />
                          ) : activity.type === 'upload' || activity.type === 'data_source' ? (
                            <Database className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <Activity className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">No recent activity</p>
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
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-xl overflow-hidden">
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
                        <p className="text-sm font-semibold text-white mb-2">{insight.title}</p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Start Checklist */}
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-white mb-3">Quick Start Checklist</p>
                  {[
                    { label: 'Create your account', done: true },
                    { label: 'Upload your first data source', done: (stats?.data_sources?.total || 0) > 0 },
                    { label: 'Run your first query', done: (stats?.queries?.total || 0) > 0 },
                    { label: 'Share your first insight', done: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 text-sm"
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-700" />
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

        {/* Data Sources Preview - Shows real data sources */}
        {stats && (stats.data_sources?.total || 0) > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Data Sources</h3>
                <button
                  onClick={() => navigate('/data-sources')}
                  className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors flex items-center"
                >
                  Manage All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dataSources.length > 0 ? (
                  dataSources.map((source) => {
                    const colors = DataSourceService.getFileTypeColor(source.type);
                    return (
                      <button
                        key={source.id}
                        onClick={() => navigate('/data-sources')}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          {source.type.startsWith('database') ? (
                            <Database className={`w-8 h-8 ${colors.iconColor}`} />
                          ) : source.type === 'excel' ? (
                            <TableIcon className={`w-8 h-8 ${colors.iconColor}`} />
                          ) : (
                            <FileText className={`w-8 h-8 ${colors.iconColor}`} />
                          )}
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full">
                            {source.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white mb-1 truncate">{source.name}</p>
                        <p className="text-xs text-slate-400 capitalize">
                          {source.type.replace(/_/g, ' ')} • {source.row_count?.toLocaleString()} rows
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer"
                       onClick={() => navigate('/data-sources')}>
                    <div className="flex items-center justify-between mb-3">
                      <FileText className="w-8 h-8 text-slate-400" />
                      <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs rounded-full">
                        Add Source
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Add your first data source</p>
                    <p className="text-xs text-slate-400">Click to upload a file or connect a database</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
