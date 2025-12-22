import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Search,
  Star,
  Trash2,
  Eye,
  BarChart3,
  Zap,
  Database,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import QueryService from '../services/queryService';
import DataSourceService from '../services/dataSourceService';
import { Query as QueryType } from '../types/query';
import { DataSource } from '../types/dataSource';

const History = () => {
  const navigate = useNavigate();
  
  const [queries, setQueries] = useState<QueryType[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'saved' | 'natural_language' | 'direct'>('all');
  const [filterDataSource, setFilterDataSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'execution_time_ms'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Selected query for details modal
  const [selectedQuery, setSelectedQuery] = useState<QueryType | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterType, filterDataSource, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch queries with filters
      const filters: any = {
        skip: 0,
        limit: 100,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      
      if (filterType === 'saved') {
        filters.saved_only = true;
      } else if (filterType !== 'all') {
        filters.query_type = filterType;
      }
      
      if (filterDataSource !== 'all') {
        filters.data_source_id = filterDataSource;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery;
      }
      
      const queriesData = await QueryService.getQueries(filters);
      setQueries(queriesData);
      
      // Fetch data sources for filter dropdown
      const sourcesData = await DataSourceService.getDataSources();
      setDataSources(sourcesData);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuery = async (queryId: string) => {
    try {
      await QueryService.saveQuery(queryId);
      // Update local state
      setQueries(queries.map(q => 
        q.id === queryId ? { ...q, is_saved: !q.is_saved } : q
      ));
    } catch (error) {
      console.error('Error saving query:', error);
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    try {
      await QueryService.deleteQuery(queryId);
      setQueries(queries.filter(q => q.id !== queryId));
      setDeleteConfirmOpen(false);
      setSelectedQuery(null);
    } catch (error) {
      console.error('Error deleting query:', error);
    }
  };

  const handleRerunQuery = (query: QueryType) => {
    // Navigate to analysis page with pre-filled query
    navigate(`/analysis?source=${query.data_source_id}&query=${encodeURIComponent(query.query_text)}`);
  };

  // Get data source name for a query
  const getDataSourceName = (dataSourceId: string | null | undefined) => {
    if (!dataSourceId) return 'Unknown';
    const source = dataSources.find(ds => ds.id === dataSourceId);
    return source?.name || 'Deleted source';
  };

  return (
    <DashboardLayout title="History">
      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              className="w-full py-3 pl-12 pr-4 text-white transition border outline-none bg-slate-900/50 border-slate-700/50 rounded-xl placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap w-full gap-3 lg:w-auto">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 text-white transition border outline-none bg-slate-900/50 border-slate-700/50 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="all">All Types</option>
              <option value="saved">Saved Only</option>
              <option value="natural_language">Natural Language</option>
              <option value="direct">Direct Code</option>
            </select>

            {/* Data Source Filter */}
            <select
              value={filterDataSource}
              onChange={(e) => setFilterDataSource(e.target.value)}
              className="px-4 py-3 text-white transition border outline-none bg-slate-900/50 border-slate-700/50 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="all">All Sources</option>
              {dataSources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as any);
                setSortOrder(order as any);
              }}
              className="px-4 py-3 text-white transition border outline-none bg-slate-900/50 border-slate-700/50 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="execution_time_ms-desc">Slowest First</option>
              <option value="execution_time_ms-asc">Fastest First</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
              <p className="text-slate-400">Loading history...</p>
            </div>
          </div>
        ) : queries.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center">
            <div className="relative inline-block group">
              <div className="absolute transition-opacity rounded-full -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 group-hover:opacity-30 blur-xl" />
              <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl">
                <Clock className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">No Query History</h3>
            <p className="max-w-md mx-auto mb-8 text-slate-400">
              {searchQuery || filterType !== 'all' || filterDataSource !== 'all'
                ? 'No queries match your search criteria'
                : 'Start analyzing your data to build your query history'
              }
            </p>
            {(!searchQuery && filterType === 'all' && filterDataSource === 'all') && (
              <button
                onClick={() => navigate('/analysis')}
                className="inline-flex items-center px-8 py-3 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Start Analyzing
              </button>
            )}
          </div>
        ) : (
          /* Query List */
          <div className="space-y-4">
            {queries.map((query) => {
              const typeColors = QueryService.getQueryTypeColor(query.query_type);
              
              return (
                <div key={query.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                  
                  <div className="relative p-6 transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl hover:border-slate-700/50">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Query Info */}
                      <div className="flex-1 min-w-0">
                        {/* Query Text */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-cyan-500/10 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="mb-1 text-base font-medium text-white line-clamp-2">
                              {query.query_text}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {/* Type Badge */}
                              <span className={`px-2 py-1 rounded-full border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
                                {QueryService.getQueryTypeLabel(query.query_type)}
                              </span>
                              
                              {/* Data Source */}
                              <span className="text-slate-400">
                                <Database className="inline w-3 h-3 mr-1" />
                                {getDataSourceName(query.data_source_id)}
                              </span>
                              
                              {/* Execution Time */}
                              {query.execution_time_ms && (
                                <span className="text-slate-400">
                                  <Zap className="inline w-3 h-3 mr-1" />
                                  {QueryService.formatExecutionTime(query.execution_time_ms)}
                                </span>
                              )}
                              
                              {/* Timestamp */}
                              <span className="text-slate-500">
                                <Clock className="inline w-3 h-3 mr-1" />
                                {QueryService.formatDate(query.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Results Preview (if exists) */}
                        {query.result_data && (
                          <div className="p-3 mt-2 border rounded-lg ml-13 bg-slate-800/50 border-slate-700/50">
                            <p className="mb-1 text-xs font-medium text-slate-400">Result:</p>
                            <p className="font-mono text-sm text-white">
                              {typeof query.result_data === 'object' 
                                ? JSON.stringify(query.result_data).substring(0, 150) + '...'
                                : String(query.result_data).substring(0, 150)
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center flex-shrink-0 gap-2">
                        {/* Save/Unsave */}
                        <button
                          onClick={() => handleSaveQuery(query.id)}
                          className={`p-2 rounded-lg transition-all ${
                            query.is_saved
                              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-yellow-400'
                          }`}
                          title={query.is_saved ? 'Unsave' : 'Save'}
                        >
                          <Star className={`w-5 h-5 ${query.is_saved ? 'fill-current' : ''}`} />
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedQuery(query);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 transition-all rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Re-run Query */}
                        <button
                          onClick={() => handleRerunQuery(query)}
                          className="p-2 transition-all rounded-lg bg-slate-800/50 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400"
                          title="Re-run query"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            setSelectedQuery(query);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-2 transition-all rounded-lg bg-slate-800/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {!loading && queries.length > 0 && (
          <div className="text-sm text-center text-slate-500">
            Showing {queries.length} {queries.length === 1 ? 'query' : 'queries'}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedQuery && (
        <QueryDetailsModal
          query={selectedQuery}
          dataSourceName={getDataSourceName(selectedQuery.data_source_id)}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedQuery(null);
          }}
          onRerun={() => handleRerunQuery(selectedQuery)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedQuery && (
        <DeleteConfirmModal
          query={selectedQuery}
          onConfirm={() => handleDeleteQuery(selectedQuery.id)}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setSelectedQuery(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

// Query Details Modal
const QueryDetailsModal = ({
  query,
  dataSourceName,
  onClose,
  onRerun,
}: {
  query: QueryType;
  dataSourceName: string;
  onClose: () => void;
  onRerun: () => void;
}) => {
  const typeColors = QueryService.getQueryTypeColor(query.query_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh]">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-20 blur-xl" />
        
        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
                {QueryService.getQueryTypeLabel(query.query_type)}
              </div>
              <span className="text-sm text-slate-400">
                {QueryService.formatDate(query.created_at)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 transition-all rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Query Text */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-400">Query</h3>
              <div className="p-4 border bg-slate-800/50 border-slate-700/50 rounded-xl">
                <p className="leading-relaxed text-white">{query.query_text}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="mb-1 text-xs text-slate-500">Data Source</p>
                <p className="text-sm font-medium text-white">{dataSourceName}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-slate-500">Execution Time</p>
                <p className="text-sm font-medium text-white">
                  {QueryService.formatExecutionTime(query.execution_time_ms)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-slate-500">Type</p>
                <p className="text-sm font-medium text-white capitalize">
                  {QueryService.getQueryTypeLabel(query.query_type)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs text-slate-500">Saved</p>
                <p className="text-sm font-medium text-white">
                  {query.is_saved ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Results */}
            {query.result_data && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-slate-400">Results</h3>
                <div className="p-4 overflow-x-auto border bg-slate-800/50 border-slate-700/50 rounded-xl">
                  <pre className="font-mono text-sm text-white">
                    {JSON.stringify(query.result_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 border-t border-slate-700/50">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 font-medium text-white transition-all bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={() => {
                onRerun();
                onClose();
              }}
              className="flex items-center justify-center flex-1 px-6 py-3 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Re-run Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({
  query,
  onConfirm,
  onCancel,
}: {
  query: QueryType;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl opacity-30 blur-xl" />
        
        <div className="relative p-8 border shadow-2xl bg-slate-900/90 backdrop-blur-2xl border-slate-700/50 rounded-3xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-xl">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-center text-white">Delete Query?</h2>
          <p className="mb-6 text-center text-slate-400">
            Are you sure you want to delete this query? This action cannot be undone.
          </p>
          <div className="p-3 mb-6 border rounded-lg bg-slate-800/50 border-slate-700/50">
            <p className="text-sm text-white line-clamp-3">{query.query_text}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 px-6 py-3 font-medium text-white transition-all bg-slate-800 hover:bg-slate-700 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center flex-1 px-6 py-3 font-semibold text-white transition-all bg-gradient-to-r from-red-500 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
