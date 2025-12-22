import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Key,
  Bell,
  Database,
  BarChart3,
  HardDrive,
  AlertTriangle,
  Trash2,
  Save,
  X,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  Sparkles,
  Settings as SettingsIcon,
  Lock,
  Unlock,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

interface UserStats {
  total_queries: number;
  total_data_sources: number;
  storage_used_mb: number;
  member_since: string;
}

type TabType = 'profile' | 'security' | 'account' | 'danger';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await apiClient.get('/users/me/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: SettingsIcon },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
          <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/30">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  user?.full_name?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.full_name}</h1>
                <p className="text-slate-400">{user?.email}</p>
                {user?.oauth_provider && (
                  <p className="text-xs text-cyan-400 mt-1">
                    Connected via {user.oauth_provider.charAt(0).toUpperCase() + user.oauth_provider.slice(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && <ProfileTab user={user} />}
          {activeTab === 'security' && <SecurityTab user={user} />}
          {activeTab === 'account' && <AccountTab stats={stats} loading={loading} />}
          {activeTab === 'danger' && <DangerZoneTab />}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Profile Tab
const ProfileTab = ({ user }: { user: any }) => {
  const { setUserFromOAuth } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const updateData: any = {};
      if (formData.full_name !== user?.full_name) {
        updateData.full_name = formData.full_name;
      }
      if (formData.email !== user?.email) {
        updateData.email = formData.email;
      }

      if (Object.keys(updateData).length === 0) {
        setEditing(false);
        return;
      }

      await apiClient.put('/users/me', updateData);
      
      // Refresh user data
      await setUserFromOAuth();
      
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
    });
    setEditing(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm text-emerald-400">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Profile Information */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                />
              ) : (
                <p className="text-white px-4 py-3 bg-slate-800/30 rounded-xl">{user?.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              {editing && !user?.oauth_provider ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-white px-4 py-3 bg-slate-800/30 rounded-xl flex-1">{user?.email}</p>
                  {user?.is_verified && (
                    <span className="px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              )}
              {user?.oauth_provider && (
                <p className="text-xs text-slate-500 mt-1">
                  Email is managed by {user.oauth_provider} and cannot be changed here
                </p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Account Type
              </label>
              <div className="px-4 py-3 bg-slate-800/30 rounded-xl">
                {user?.oauth_provider ? (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">OAuth Account ({user.oauth_provider})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-white">Email/Password Account</span>
                  </div>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Member Since
              </label>
              <p className="text-white px-4 py-3 bg-slate-800/30 rounded-xl flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {editing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-800/50">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!formData.full_name.trim())}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Security Tab
const SecurityTab = ({ user }: { user: any }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changing, setChanging] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'red',
  });

  useEffect(() => {
    if (passwordData.new_password) {
      checkPasswordStrength(passwordData.new_password);
    }
  }, [passwordData.new_password]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strength = {
      0: { label: 'Very Weak', color: 'red' },
      1: { label: 'Weak', color: 'red' },
      2: { label: 'Fair', color: 'orange' },
      3: { label: 'Good', color: 'yellow' },
      4: { label: 'Strong', color: 'green' },
      5: { label: 'Very Strong', color: 'emerald' },
      6: { label: 'Excellent', color: 'emerald' },
    };

    setPasswordStrength({
      score,
      label: strength[score as keyof typeof strength].label,
      color: strength[score as keyof typeof strength].color,
    });
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setChanging(true);
    setError('');
    setSuccess(false);

    try {
      await apiClient.post('/users/me/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setSuccess(true);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  const isOAuthAccount = !!user?.oauth_provider;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm text-emerald-400">Password changed successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Change Password */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Password</h3>
                <p className="text-sm text-slate-400">
                  {isOAuthAccount ? 'OAuth account - no password' : 'Change your account password'}
                </p>
              </div>
            </div>
            {!isOAuthAccount && !showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-all"
              >
                Change Password
              </button>
            )}
          </div>

          {isOAuthAccount ? (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-400 font-medium">OAuth Account</p>
                <p className="text-sm text-slate-400 mt-1">
                  You're using {user.oauth_provider} to sign in. Password management is handled by {user.oauth_provider}.
                </p>
              </div>
            </div>
          ) : showPasswordForm ? (
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordData.new_password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Password Strength</span>
                      <span className={`text-xs font-medium text-${passwordStrength.color}-400`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                  placeholder="Confirm new password"
                />
                {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-800/30 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-400 mb-2">Password Requirements:</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li className={passwordData.new_password.length >= 8 ? 'text-emerald-400' : ''}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(passwordData.new_password) ? 'text-emerald-400' : ''}>
                    • One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(passwordData.new_password) ? 'text-emerald-400' : ''}>
                    • One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(passwordData.new_password) ? 'text-emerald-400' : ''}>
                    • One number
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                    setError('');
                  }}
                  disabled={changing}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={
                    changing ||
                    !passwordData.current_password ||
                    !passwordData.new_password ||
                    passwordData.new_password !== passwordData.confirm_password ||
                    passwordStrength.score < 3
                  }
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {changing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : !isOAuthAccount ? (
            <div className="bg-slate-800/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-400" />
                <span className="text-white">Password is set and secure</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Login Activity (Future) */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Login Activity</h3>
              <p className="text-sm text-slate-400">Recent login sessions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Current Session</p>
                <p className="text-xs text-slate-400">
                  Last login: {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Account Tab
const AccountTab = ({ stats, loading }: { stats: UserStats | null; loading: boolean }) => {
  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Usage Statistics</h3>
              <p className="text-sm text-slate-400">Your account activity</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <BarChart3 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white mb-1">{stats?.total_queries || 0}</p>
                <p className="text-sm text-slate-400">Total Queries</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white mb-1">{stats?.total_data_sources || 0}</p>
                <p className="text-sm text-slate-400">Data Sources</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <HardDrive className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white mb-1">{stats?.storage_used_mb.toFixed(2) || '0'}</p>
                <p className="text-sm text-slate-400">MB Used</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Preferences</h3>
              <p className="text-sm text-slate-400">Customize your experience</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-slate-400">Receive updates about your queries</p>
              </div>
              <button className="relative w-12 h-6 bg-slate-700 rounded-full transition-colors">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>

            {/* Auto-save Queries */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">Auto-save Queries</p>
                <p className="text-xs text-slate-400">Automatically save successful queries</p>
              </div>
              <button className="relative w-12 h-6 bg-cyan-500 rounded-full transition-colors">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Danger Zone Tab
const DangerZoneTab = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    if (!deletePassword) {
      setError('Please enter your password');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await apiClient.delete('/users/me', {
        data: { password: deletePassword }
      });

      // Logout and redirect
      await logout();
      navigate('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err.response?.data?.detail || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-300">
              These actions are irreversible and will permanently affect your account.
              Please proceed with caution.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-20 blur transition-opacity" />
        <div className="relative bg-slate-900/50 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Delete Account
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400 font-medium mb-2">This will delete:</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Your account and profile</li>
                  <li>• All data sources and uploaded files</li>
                  <li>• All queries and analysis history</li>
                  <li>• All saved queries and favorites</li>
                  <li>• All visualizations and results</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="relative w-full max-w-lg">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl opacity-50 blur-xl animate-pulse" />
            
            <div className="relative bg-slate-900/95 backdrop-blur-2xl border-2 border-red-500/50 rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3 text-center">Delete Account?</h2>
              <p className="text-slate-300 text-center mb-6">
                This is a <span className="text-red-400 font-semibold">permanent action</span> and cannot be undone.
                All your data will be deleted immediately.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Confirmation Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type <span className="text-red-400 font-mono">DELETE MY ACCOUNT</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition outline-none"
                  placeholder="Type here..."
                />
              </div>

              {/* Password Confirmation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition outline-none"
                  placeholder="Your password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteConfirmText('');
                    setError('');
                  }}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== 'DELETE MY ACCOUNT' || !deletePassword}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mr-2" />
                      Yes, Delete Everything
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                This action is permanent and cannot be undone
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
