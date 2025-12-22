import { useState } from 'react';
import { Database, Loader2, AlertCircle, CheckCircle2, X, Server } from 'lucide-react';
import DataSourceService from '../services/dataSourceService';
import { DatabaseConnection } from '../types/dataSource';

interface DatabaseConnectionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DatabaseConnectionModal = ({ onClose, onSuccess }: DatabaseConnectionModalProps) => {
  const [step, setStep] = useState<'form' | 'testing' | 'success'>('form');
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  
  const [formData, setFormData] = useState<DatabaseConnection & { name: string; table_name?: string }>({
    db_type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    name: '',
    table_name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'db_type') {
      const defaultPorts: Record<string, number> = {
        postgresql: 5432,
        mysql: 3306,
        sqlite: 0,
      };
      setFormData(prev => ({
        ...prev,
        [name]: value,
        port: defaultPorts[value] || 5432,
      }));
    } else if (name === 'port') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    setError('');
  };

  const handleTestConnection = async () => {
    setError('');
    setStep('testing');
    
    try {
      const connection: DatabaseConnection = {
        db_type: formData.db_type as any,
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
      };
      
      const result = await DataSourceService.testDatabaseConnection(connection);
      setTestResult(result);
      
      if (result.status === 'success') {
        setTimeout(() => setStep('form'), 2000);
      } else {
        setError(result.message);
        setStep('form');
      }
    } catch (err: any) {
      console.error('Test connection error:', err);
      setError(err.response?.data?.detail || 'Connection test failed');
      setStep('form');
    }
  };

  const handleConnect = async () => {
    setError('');
    setStep('testing');
    
    try {
      const connection: DatabaseConnection = {
        db_type: formData.db_type as any,
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
      };
      
      await DataSourceService.connectDatabase(
        connection,
        formData.name || `${formData.db_type} - ${formData.database}`,
        formData.table_name || undefined
      );
      
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.response?.data?.detail || 'Connection failed');
      setStep('form');
    }
  };

  const isFormValid = 
    formData.database &&
    formData.name &&
    (formData.db_type !== 'sqlite' ? (formData.host && formData.username && formData.password) : true);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-20 blur-xl" />
        
        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Connect Database</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && step === 'form' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Testing State */}
          {step === 'testing' && (
            <div className="py-12 text-center">
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Testing Connection...</h3>
              <p className="text-slate-400">Connecting to {formData.db_type} database</p>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connected Successfully!</h3>
              <p className="text-slate-400">Database added to your data sources</p>
            </div>
          )}

          {/* Form State */}
          {step === 'form' && (
            <form className="space-y-5">
              {/* Row 1: Database Type + Connection Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Database Type
                  </label>
                  <select
                    name="db_type"
                    value={formData.db_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL / MariaDB</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="My Production Database"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Host + Port (for PostgreSQL/MySQL) */}
              {formData.db_type !== 'sqlite' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Host
                    </label>
                    <input
                      type="text"
                      name="host"
                      value={formData.host}
                      onChange={handleChange}
                      placeholder="localhost or IP address"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Port
                    </label>
                    <input
                      type="number"
                      name="port"
                      value={formData.port}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Row 3: Database Name + Username (or Database for SQLite) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {formData.db_type === 'sqlite' ? 'Database File Path' : 'Database Name'}
                  </label>
                  <input
                    type="text"
                    name="database"
                    value={formData.database}
                    onChange={handleChange}
                    placeholder={formData.db_type === 'sqlite' ? '/path/to/database.db' : 'database_name'}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                    required
                  />
                </div>

                {formData.db_type !== 'sqlite' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="database_user"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Row 4: Password + Table Name (for PostgreSQL/MySQL) */}
              {formData.db_type !== 'sqlite' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Table Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="table_name"
                      value={formData.table_name}
                      onChange={handleChange}
                      placeholder="Leave empty for all tables"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                    />
                  </div>
                </div>
              )}

              {/* SQLite: Just Table Name (Full Width) */}
              {formData.db_type === 'sqlite' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Table Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="table_name"
                    value={formData.table_name}
                    onChange={handleChange}
                    placeholder="Leave empty to access all tables"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Specify a table to query, or leave empty to browse all tables later
                  </p>
                </div>
              )}

              {/* Test Result (if tested successfully) */}
              {testResult && testResult.status === 'success' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-emerald-400 font-medium">Connection Test Successful!</p>
                    <p className="text-xs text-slate-400 mt-1">{testResult.message}</p>
                    {testResult.version && (
                      <p className="text-xs text-slate-500 mt-1">Version: {testResult.version}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={!isFormValid}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Server className="w-5 h-5 mr-2" />
                  Test
                </button>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={!isFormValid}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Connect
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionModal;
