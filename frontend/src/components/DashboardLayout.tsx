import { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Database, 
  BarChart3, 
  Clock, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Sparkles,
  ChevronLeft,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      if (window.innerWidth < 1024) {
        setSidebarOpen(false); // Close sidebar on mobile by default
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine active page from current route
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/data-sources') return 'datasources';
    if (path === '/analysis') return 'analysis';
    if (path === '/history') return 'history';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const currentPage = getActivePage();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
    { id: 'datasources', icon: Database, label: 'Data Sources', path: '/data-sources' },
    { id: 'analysis', icon: BarChart3, label: 'Analysis', path: '/analysis' },
    { id: 'history', icon: Clock, label: 'History', path: '/history' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Mobile Overlay - Click outside to close */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          sidebarOpen && !isMobile ? 'w-72' : 'lg:w-20'
        } fixed lg:relative inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800/50 transition-all duration-300 flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-cyan-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                InsightIQ
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 transition-all rounded-lg hover:bg-cyan-500/10 text-slate-400 hover:text-white"
          >
            {sidebarOpen || isMobile ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {(sidebarOpen || isMobile) && <span className="font-medium">{item.label}</span>}
            </button>
          ))}

          {/* Logout - positioned after nav items with spacing */}
          <div className="pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 space-x-3 transition-all rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              {(sidebarOpen || isMobile) && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </nav>

        {/* Bottom spacing */}
        <div className="p-4"></div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="px-6 py-4 border-b bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={toggleSidebar}
                className="p-2 transition-all rounded-lg lg:hidden hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              {/* <div className="relative hidden md:block">
                <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 py-2 pl-10 pr-4 text-white transition border outline-none bg-slate-800/50 border-slate-700/50 rounded-xl placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div> */}

              {/* Notifications */}
              <button className="relative p-2 transition-all hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute w-2 h-2 rounded-full top-1 right-1 bg-cyan-400 animate-pulse"></span>
              </button>

              {/* User Menu */}
              <button className="flex items-center p-2 space-x-3 text-white transition-all hover:bg-slate-800 rounded-xl">
                <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                  {user?.full_name?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5" />}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-slate-400">
                    {user?.is_verified ? 'Verified' : 'Free Plan'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
