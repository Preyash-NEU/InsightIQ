import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Database,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Star,
  Download,
  BarChart3,
  Table as TableIcon,
  Zap,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart as RechartsLine,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import QueryService from "../services/queryService";
import DataSourceService from "../services/dataSourceService";
import { DataSource } from "../types/dataSource";
import { Query as QueryType } from "../types/query";

const Analysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Data sources
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const selectedSourceData = dataSources.find((ds) => ds.id === selectedSource);
  const [loadingSources, setLoadingSources] = useState(true);

  // Query
  const [queryText, setQueryText] = useState("");
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState("");

  // Results
  const [currentQuery, setCurrentQuery] = useState<QueryType | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Recent queries in session
  const [recentQueries, setRecentQueries] = useState<QueryType[]>([]);

  // Load data sources
  useEffect(() => {
    fetchDataSources();
  }, []);

  // Check URL params for pre-filled data
  useEffect(() => {
    const sourceId = searchParams.get("source");
    const queryParam = searchParams.get("query");

    if (sourceId) {
      setSelectedSource(sourceId);
    }

    if (queryParam) {
      setQueryText(decodeURIComponent(queryParam));
    }
  }, [searchParams]);

  const fetchDataSources = async () => {
    try {
      setLoadingSources(true);
      const sources = await DataSourceService.getDataSources();
      setDataSources(sources);

      // Auto-select first source if none selected
      if (sources.length > 0 && !selectedSource) {
        setSelectedSource(sources[0].id);
      }
    } catch (err) {
      console.error("Error fetching data sources:", err);
    } finally {
      setLoadingSources(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!queryText.trim() || !selectedSource) {
      setError("Please select a data source and enter a query");
      return;
    }

    setExecuting(true);
    setError("");
    setShowResults(false);

    try {
      const result = await QueryService.naturalLanguageQuery({
        data_source_id: selectedSource,
        query_text: queryText,
      });

      setCurrentQuery(result);
      setShowResults(true);

      // Add to recent queries
      setRecentQueries((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10
    } catch (err: any) {
      console.error("Query execution error:", err);
      const errorMessage =
        err.response?.data?.detail ||
        "Failed to execute query. Please try again.";
      setError(errorMessage);
    } finally {
      setExecuting(false);
    }
  };

  const handleSaveQuery = async () => {
    if (!currentQuery) return;

    try {
      await QueryService.saveQuery(currentQuery.id);
      setCurrentQuery({ ...currentQuery, is_saved: true });
    } catch (err) {
      console.error("Error saving query:", err);
    }
  };

  const handleRerunQuery = (query: QueryType) => {
    setQueryText(query.query_text);
    if (query.data_source_id) {
      setSelectedSource(query.data_source_id);
    }
    setShowResults(false);
    setCurrentQuery(null);
  };

  const exampleQueries = [
    "What is the sum of all values in the revenue column?",
    "Show me the top 10 rows sorted by sales",
    "Calculate the average of the price column",
    "How many rows are in the dataset?",
    "What are the unique values in the category column?",
  ];

  return (
    <DashboardLayout title="Analysis">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Analysis Area */}
        <div className="space-y-6 lg:col-span-3">
          {/* Data Source Selector */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
            <div className="relative p-6 border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
              <label className="block mb-3 text-sm font-medium text-slate-300">
                Select Data Source
              </label>
              {loadingSources ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : dataSources.length === 0 ? (
                <div className="py-8 text-center">
                  <Database className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                  <p className="mb-4 text-slate-400">
                    No data sources available
                  </p>
                  <button
                    onClick={() => navigate("/data-sources?action=upload")}
                    className="px-6 py-2 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30"
                  >
                    Upload Data Source
                  </button>
                </div>
              ) : (
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full px-4 py-3 text-white transition border outline-none bg-slate-800/50 border-slate-700/50 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  {dataSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name} ({source.type}) -{" "}
                      {source.row_count?.toLocaleString()} rows
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Quality Warning */}
          {selectedSourceData?.quality_score != null &&
            selectedSourceData.quality_score < 80 && (
              <div className="p-4 mb-4 border rounded-xl bg-yellow-500/10 border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">
                      Data Quality:{" "}
                      {selectedSourceData.quality_score.toFixed(0)}% (
                      {selectedSourceData.quality_level})
                    </p>
                    <p className="mt-1 text-xs text-yellow-400/70">
                      This data may have quality issues. Results might be less
                      accurate.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Query Input */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
            <div className="relative p-6 border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Sparkles className="absolute w-6 h-6 text-cyan-400 left-4 top-4 animate-pulse" />
                    <textarea
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleExecuteQuery();
                        }
                      }}
                      placeholder="Ask anything about your data... (e.g., 'What is the total revenue?')"
                      className="w-full py-4 pr-4 text-white transition border outline-none resize-none pl-14 bg-slate-800/50 border-slate-700/50 rounded-xl placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      rows={4}
                    />
                  </div>

                  {/* Example Queries */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {exampleQueries.slice(0, 3).map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setQueryText(example)}
                        className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-xs hover:bg-cyan-500/20 transition-all"
                      >
                        {example.substring(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleExecuteQuery}
                  disabled={executing || !queryText.trim() || !selectedSource}
                  className="flex items-center self-start px-8 py-4 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {executing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze
                    </>
                  )}
                </button>
              </div>

              {/* Keyboard shortcut hint */}
              <p className="mt-2 text-xs text-slate-500">
                Press{" "}
                <kbd className="px-2 py-1 rounded bg-slate-800">
                  Ctrl + Enter
                </kbd>{" "}
                to execute
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 border bg-red-500/10 border-red-500/20 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Results Area */}
          {showResults && currentQuery && (
            <div className="space-y-6 animate-fade-in">
              {/* Results Header */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
                <div className="relative p-6 border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Query Results
                        </h3>
                      </div>
                      <p className="mb-3 text-sm text-slate-400">
                        {currentQuery.query_text}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-slate-500">
                          <Database className="inline w-3 h-3 mr-1" />
                          {selectedSourceData?.name}
                        </span>
                        {currentQuery.execution_time_ms && (
                          <span className="text-slate-500">
                            <Zap className="inline w-3 h-3 mr-1" />
                            {QueryService.formatExecutionTime(
                              currentQuery.execution_time_ms
                            )}
                          </span>
                        )}
                        <span className="text-slate-500">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {QueryService.formatDate(currentQuery.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveQuery}
                        disabled={currentQuery.is_saved}
                        className={`p-2 rounded-lg transition-all ${
                          currentQuery.is_saved
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-slate-800 text-slate-400 hover:bg-yellow-500/20 hover:text-yellow-400"
                        }`}
                        title={currentQuery.is_saved ? "Saved" : "Save query"}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            currentQuery.is_saved ? "fill-current" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          /* TODO: Export */
                        }}
                        className="p-2 transition-all rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-400"
                        title="Export results"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setShowResults(false);
                          setCurrentQuery(null);
                        }}
                        className="p-2 transition-all rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                        title="Clear results"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualization */}
              {currentQuery.result_data && (
                <ResultsVisualization resultData={currentQuery.result_data} />
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Recent Queries */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
              <div className="relative overflow-hidden border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
                <div className="p-4 border-b border-slate-800/50">
                  <h3 className="text-sm font-semibold text-white">
                    Recent Queries
                  </h3>
                </div>

                <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                  {recentQueries.length > 0 ? (
                    recentQueries.map((query, i) => (
                      <button
                        key={i}
                        onClick={() => handleRerunQuery(query)}
                        className="w-full p-3 text-left transition-all border rounded-lg bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/5 group/item"
                      >
                        <p className="mb-1 text-sm text-white transition-colors line-clamp-2 group-hover/item:text-cyan-400">
                          {query.query_text}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {QueryService.formatDate(query.created_at)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      <p className="text-xs text-slate-500">
                        No recent queries
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 mt-6 border bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border-cyan-500/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="mb-1 text-sm font-semibold text-white">
                    Quick Tips
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• Ask questions in plain English</li>
                    <li>• Be specific about what you want</li>
                    <li>• Use Ctrl+Enter to execute</li>
                    <li>• Save useful queries with ⭐</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Results Visualization Component
const ResultsVisualization = ({ resultData }: { resultData: any }) => {
  // Determine visualization type from result
  const getVisualizationType = () => {
    if (!resultData) return null;

    // Single value (KPI)
    if (typeof resultData === "number" || typeof resultData === "string") {
      return "kpi";
    }

    // Check if it's array of objects (for charts)
    if (
      Array.isArray(resultData) &&
      resultData.length > 0 &&
      typeof resultData[0] === "object"
    ) {
      return "table"; // Default to table for array data
    }

    // Object with single key-value
    if (typeof resultData === "object" && !Array.isArray(resultData)) {
      const keys = Object.keys(resultData);
      if (keys.length === 1) {
        return "kpi";
      }
      return "table";
    }

    return "table";
  };

  const vizType = getVisualizationType();

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity" />
      <div className="relative p-6 border shadow-xl bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl">
        <h3 className="mb-4 text-sm font-medium text-slate-400">Results</h3>

        {/* KPI Display */}
        {vizType === "kpi" && (
          <div className="py-12 text-center">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute rounded-full -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-30 blur-2xl" />
                <div className="relative p-8 border bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-slate-700/50">
                  <p className="mb-2 text-6xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                    {typeof resultData === "object"
                      ? Object.values(resultData)[0]
                      : resultData}
                  </p>
                  <p className="text-sm text-slate-400">
                    {typeof resultData === "object"
                      ? Object.keys(resultData)[0]
                      : "Result"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Display */}
        {vizType === "table" && (
          <div className="overflow-x-auto">
            <div className="p-4 border bg-slate-800/50 border-slate-700/50 rounded-xl">
              <pre className="font-mono text-sm text-white whitespace-pre-wrap">
                {JSON.stringify(resultData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Chart Display (if data is suitable) */}
        {Array.isArray(resultData) &&
          resultData.length > 0 &&
          resultData.length <= 20 && (
            <div className="mt-6">
              <div className="p-6 border bg-gradient-to-br from-cyan-600/5 to-blue-600/5 border-cyan-500/20 rounded-xl">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resultData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey={Object.keys(resultData[0])[0]}
                      stroke="#94a3b8"
                    />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey={
                        Object.keys(resultData[0])[1] ||
                        Object.keys(resultData[0])[0]
                      }
                      fill="#06b6d4"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Analysis;
