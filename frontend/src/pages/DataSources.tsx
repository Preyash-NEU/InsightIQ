import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Upload,
  Database,
  FileText,
  Globe,
  Search,
  Plus,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Filter,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  BarChart3,
  Table as TableIcon,
  ChevronDown,
  Server,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import DataSourceService from "../services/dataSourceService";
import DatabaseConnectionModal from "../components/DatabaseConnectionModal";
import { DataSource as DataSourceType } from "../types/dataSource";
import QualityBadge, { QualityProgressBar } from "../components/QualityBadge";
import CleaningReportModal from "../components/CleaningReportModal";
import { Sparkles } from "lucide-react";

const DataSources = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cleaningReportOpen, setCleaningReportOpen] = useState(false);
  const [reprocessing, setReprocessing] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [databaseModalOpen, setDatabaseModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSourceType | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Load data sources on mount
  useEffect(() => {
    fetchDataSources();

    // Check if redirected from dashboard with action
    const action = searchParams.get("action");
    if (action === "upload") {
      setUploadModalOpen(true);
    } else if (action === "database") {
      setDatabaseModalOpen(true);
    }
  }, [searchParams]);

  const fetchDataSources = async () => {
    try {
      setLoading(true);
      const sources = await DataSourceService.getDataSources();
      setDataSources(sources);
    } catch (error) {
      console.error("Error fetching data sources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DataSourceService.deleteDataSource(id);
      setDataSources(dataSources.filter((ds) => ds.id !== id));
      setDeleteConfirmOpen(false);
      setSelectedDataSource(null);
    } catch (error) {
      console.error("Error deleting data source:", error);
    }
  };

  // Filter and search
  const filteredDataSources = dataSources.filter((ds) => {
    const matchesSearch = ds.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || ds.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleReprocess = async (id: string) => {
    try {
      setReprocessing(id);
      await DataSourceService.reprocessDataSource(id);
      await fetchDataSources();
    } catch (error) {
      console.error("Error reprocessing:", error);
    } finally {
      setReprocessing(null);
    }
  };
  // Get unique types for filter
  const dataSourceTypes = ["all", ...new Set(dataSources.map((ds) => ds.type))];

  return (
    <DashboardLayout title="Data Sources">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-4 text-white transition border outline-none bg-slate-900/50 border-slate-700/50 rounded-xl placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 text-white transition border outline-none bg-slate-900/50 border-slate-700/50 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            >
              {dataSourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Add Data Source - Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center px-6 py-3 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Data Source
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {/* Dropdown Menu */}
              {showAddMenu && (
                <div className="absolute right-0 z-20 w-64 mt-2 overflow-hidden border shadow-2xl bg-slate-900/95 backdrop-blur-xl border-slate-700/50 rounded-xl">
                  <button
                    onClick={() => {
                      setUploadModalOpen(true);
                      setShowAddMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 space-x-3 text-left text-white transition-all hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-600/20 to-green-600/5">
                      <Upload className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload File</p>
                      <p className="text-xs text-slate-400">
                        CSV, Excel, JSON, Parquet
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setDatabaseModalOpen(true);
                      setShowAddMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 space-x-3 text-left text-white transition-all border-t hover:bg-slate-800 border-slate-800/50"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-600/5">
                      <Database className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Connect Database</p>
                      <p className="text-xs text-slate-400">
                        PostgreSQL, MySQL, SQLite
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
              <p className="text-slate-400">Loading data sources...</p>
            </div>
          </div>
        ) : filteredDataSources.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center">
            <div className="relative inline-block group">
              <div className="absolute transition-opacity rounded-full -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 group-hover:opacity-30 blur-xl" />
              <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl">
                <Database className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-white">
              No Data Sources Yet
            </h3>
            <p className="max-w-md mx-auto mb-8 text-slate-400">
              {searchQuery || filterType !== "all"
                ? "No data sources match your search criteria"
                : "Get started by uploading a file or connecting a database"}
            </p>
            {!searchQuery && filterType === "all" && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center px-8 py-3 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload File
                </button>
                <button
                  onClick={() => setDatabaseModalOpen(true)}
                  className="inline-flex items-center px-8 py-3 font-semibold text-white transition-all border bg-slate-800 hover:bg-slate-700 border-slate-700/50 rounded-xl hover:scale-105"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Connect Database
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Data Sources Grid */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDataSources.map((source) => {
              const colors = DataSourceService.getFileTypeColor(source.type);
              const statusColor =
                source.status === "connected"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : source.status === "syncing"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : source.status === "error"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/20";

              return (
                <div key={source.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />

                  <div className="relative p-6 transition-all border bg-slate-900/50 backdrop-blur-xl border-slate-800/50 rounded-2xl hover:border-slate-700/50">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        {source.type.startsWith("database") ? (
                          <Database className={`w-7 h-7 ${colors.iconColor}`} />
                        ) : source.type === "excel" ? (
                          <TableIcon
                            className={`w-7 h-7 ${colors.iconColor}`}
                          />
                        ) : (
                          <FileText className={`w-7 h-7 ${colors.iconColor}`} />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}
                      >
                        {source.status}
                      </span>

                      {/* Quality Badge */}
                      {source.quality_score && (
                          <QualityBadge
                            score={source.quality_score}
                            level={source.quality_level}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="mb-1 text-lg font-semibold text-white truncate">
                      {source.name}
                    </h3>
                    <p className="mb-4 text-sm capitalize text-slate-400">
                      {source.type.replace(/_/g, " ")}
                    </p>
                    
                    {/* Quality Progress Bar */}
                      {/* {source.quality_score && (
                          <div className="mb-4">
                            <QualityProgressBar score={source.quality_score} />
                          </div>
                        )} */}

                    {/* Stats */} 
                    <div className="pb-4 mb-4 space-y-2 text-sm border-b text-slate-400 border-slate-700/50">
                      {source.row_count !== null && (
                        <div className="flex justify-between">
                          <span>Rows:</span>
                          <span className="font-medium text-white">
                            {source.row_count.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {source.file_size !== null && source.file_size > 0 && (
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium text-white">
                            {DataSourceService.formatFileSize(source.file_size)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Added:</span>
                        <span className="font-medium text-white">
                          {new Date(source.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {/* Row 1: Preview & Analyze */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDataSource(source);
                            setPreviewModalOpen(true);
                          }}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600"
                        >
                          <Eye className="inline w-4 h-4 mr-2" />
                          Preview
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/analysis?source=${source.id}`)
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-white border rounded-lg bg-slate-800/50"
                        >
                          <BarChart3 className="inline w-4 h-4 mr-2" />
                          Analyze
                        </button>
                      </div>

                      {/* Row 2: View Report & Reprocess (only if processed) */}
                      {source.quality_score !== null &&
                        source.quality_score !== undefined && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedDataSource(source);
                                setCleaningReportOpen(true);
                              }}
                              className="flex-1 px-4 py-2 text-sm font-medium border rounded-lg text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                            >
                              <Sparkles className="inline w-4 h-4 mr-2" />
                              View Report
                            </button>
                            <button
                              onClick={() => handleReprocess(source.id)}
                              disabled={reprocessing === source.id}
                              className="flex-1 px-4 py-2 text-sm font-medium border rounded-lg text-slate-400 bg-slate-800/50"
                            >
                              <RefreshCw
                                className={`inline w-4 h-4 mr-2 ${
                                  reprocessing === source.id
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                              Reprocess
                            </button>
                          </div>
                        )}

                      {/* Row 3: Delete */}
                      <button
                        onClick={() => {
                          setSelectedDataSource(source);
                          setDeleteConfirmOpen(true);
                        }}
                        className="w-full px-4 py-2 text-sm font-medium text-red-400 border rounded-lg bg-red-500/10 border-red-500/20"
                      >
                        <Trash2 className="inline w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowAddMenu(false)}
        />
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            fetchDataSources();
            setUploadModalOpen(false);
          }}
        />
      )}

      {/* Database Connection Modal */}
      {databaseModalOpen && (
        <DatabaseConnectionModal
          onClose={() => setDatabaseModalOpen(false)}
          onSuccess={() => {
            fetchDataSources();
            setDatabaseModalOpen(false);
          }}
        />
      )}

      {/* Cleaning Report Modal */}
      {cleaningReportOpen && selectedDataSource && (
        <CleaningReportModal
          dataSource={selectedDataSource}
          onClose={() => {
            setCleaningReportOpen(false);
            setSelectedDataSource(null);
          }}
        />
      )}
      
      {/* Preview Modal */}
      {previewModalOpen && selectedDataSource && (
        <PreviewModal
          dataSource={selectedDataSource}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedDataSource(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedDataSource && (
        <DeleteConfirmModal
          dataSource={selectedDataSource}
          onConfirm={() => handleDelete(selectedDataSource.id)}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setSelectedDataSource(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

// Upload Modal Component (same as before)
const UploadModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [isExcel, setIsExcel] = useState(false);
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [loadingSheets, setLoadingSheets] = useState(false);

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError("");

    if (
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls")
    ) {
      setIsExcel(true);
      setLoadingSheets(true);
      try {
        const sheetsData = await DataSourceService.getExcelSheets(selectedFile);
        setExcelSheets(sheetsData.sheets);
        if (sheetsData.sheets.length > 0) {
          setSelectedSheet(sheetsData.sheets[0]);
        }
      } catch (err) {
        console.error("Error loading Excel sheets:", err);
        setError(
          "Could not read Excel file. Make sure it's a valid Excel file."
        );
      } finally {
        setLoadingSheets(false);
      }
    } else {
      setIsExcel(false);
      setExcelSheets([]);
      setSelectedSheet("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      await DataSourceService.uploadFile(
        file,
        name || undefined,
        selectedSheet || undefined
      );
      onSuccess();
    } catch (err: any) {
      console.error("Upload error:", err);
      const errorMessage =
        err.response?.data?.detail || "Upload failed. Please try again.";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const supportedFormats = ["CSV", "Excel", "JSON", "Parquet", "TSV"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-20 blur-xl" />

        <div className="relative p-8 border shadow-2xl bg-slate-900/90 backdrop-blur-2xl border-slate-700/50 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Upload Data File</h2>
            <button
              onClick={onClose}
              className="p-2 transition-all rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-start p-4 mb-6 space-x-3 border bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive
                ? "border-cyan-500 bg-cyan-500/5"
                : "border-slate-700/50 hover:border-slate-600/50"
            }`}
          >
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="mb-1 text-lg font-semibold text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setIsExcel(false);
                    setExcelSheets([]);
                  }}
                  className="text-sm transition-colors text-cyan-400 hover:text-cyan-300"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="mb-2 text-lg font-semibold text-white">
                  Drop your file here or click to browse
                </p>
                <p className="mb-4 text-sm text-slate-400">
                  Supported formats: {supportedFormats.join(", ")}
                </p>
                <input
                  type="file"
                  onChange={(e) =>
                    e.target.files && handleFileChange(e.target.files[0])
                  }
                  accept=".csv,.xlsx,.xls,.json,.parquet,.tsv,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-2 text-white transition-all rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700"
                >
                  Browse Files
                </label>
              </>
            )}
          </div>

          {isExcel && excelSheets.length > 0 && (
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Select Sheet
              </label>
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full px-4 py-3 text-white transition border outline-none bg-slate-800/50 border-slate-700/50 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                {excelSheets.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>
          )}

          {file && (
            <div className="mt-6">
              <label className="block mb-2 text-sm font-medium text-slate-300">
                Data Source Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={file.name.replace(/\.[^/.]+$/, "")}
                className="w-full px-4 py-3 text-white transition border outline-none bg-slate-800/50 border-slate-700/50 rounded-xl placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 font-medium text-white transition-all bg-slate-800 hover:bg-slate-700 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading || (isExcel && loadingSheets)}
              className="flex items-center justify-center flex-1 px-6 py-3 font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : loadingSheets ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading sheets...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview Modal (same as before)
const PreviewModal = ({
  dataSource,
  onClose,
}: {
  dataSource: DataSourceType;
  onClose: () => void;
}) => {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const previewData = await DataSourceService.getPreview(
          dataSource.id,
          100
        );
        setPreview(previewData);
      } catch (err: any) {
        console.error("Preview error:", err);
        setError(err.response?.data?.detail || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [dataSource.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh]">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-20 blur-xl" />

        <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {dataSource.name}
              </h2>
              <p className="text-sm capitalize text-slate-400">
                {dataSource.type.replace(/_/g, " ")} •{" "}
                {dataSource.row_count?.toLocaleString()} rows
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 transition-all rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
                  <p className="text-slate-400">Loading preview...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-start p-4 space-x-3 border bg-red-500/10 border-red-500/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : preview ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      {preview.columns.map((col: string, i: number) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-sm font-semibold text-left text-slate-300 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row: any, i: number) => (
                      <tr
                        key={i}
                        className="transition-colors border-b border-slate-800/50 hover:bg-slate-800/30"
                      >
                        {preview.columns.map((col: string, j: number) => (
                          <td
                            key={j}
                            className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap"
                          >
                            {row[col] !== null && row[col] !== undefined
                              ? String(row[col])
                              : "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-sm text-center text-slate-500">
                  Showing {preview.preview_rows} of {preview.total_rows} rows
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal (same as before)
const DeleteConfirmModal = ({
  dataSource,
  onConfirm,
  onCancel,
}: {
  dataSource: DataSourceType;
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

          <h2 className="mb-2 text-2xl font-bold text-center text-white">
            Delete Data Source?
          </h2>
          <p className="mb-6 text-center text-slate-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              "{dataSource.name}"
            </span>
            ? This action cannot be undone.
          </p>

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

export default DataSources;
