// CleaningReportModal Component
// Shows detailed data cleaning report

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Download,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import DataSourceService from '../services/dataSourceService';
import { CleaningReport, DataSource } from '../types/dataSource';

interface CleaningReportModalProps {
  dataSource: DataSource;
  onClose: () => void;
}

const CleaningReportModal: React.FC<CleaningReportModalProps> = ({
  dataSource,
  onClose,
}) => {
  const [report, setReport] = useState<CleaningReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await DataSourceService.getCleaningReport(dataSource.id);
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load cleaning report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = `
Data Cleaning Report
Data Source: ${dataSource.name}
Generated: ${new Date().toLocaleString()}

=== STRUCTURAL ISSUES FIXED ===
${report.structural_issues.length > 0 ? report.structural_issues.map(issue => `• ${issue}`).join('\n') : '• No structural issues found'}

=== COLUMN TRANSFORMATIONS ===
${report.column_transformations.length > 0 ? report.column_transformations.map(t => `• "${t.original}" → ${t.normalized}`).join('\n') : '• No transformations needed'}

=== TYPE CONVERSIONS ===
${Object.entries(report.type_conversions).map(([col, info]) => `• ${col}: ${info.detected_type} (${info.success_rate}% success)`).join('\n')}

=== DATA CLEANING APPLIED ===
${Object.entries(report.data_cleaning).map(([col, info]) => `• ${col}: ${info.imputed_nulls} values imputed, ${info.outliers_handled} outliers handled`).join('\n')}

=== SUMMARY ===
• Rows removed: ${report.summary.rows_removed}
• Columns removed: ${report.summary.columns_removed}
• Values imputed: ${report.summary.values_imputed}
• Outliers handled: ${report.summary.outliers_handled}
${report.storage ? `• Storage compression: ${report.storage.compression_ratio_percent.toFixed(1)}%` : ''}

Quality Score: ${dataSource.quality_score || 'N/A'}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaning_report_${dataSource.name}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden border shadow-2xl bg-slate-900 border-slate-700/50 rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-600/5">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Data Processing Report</h2>
              <p className="text-sm text-slate-400">{dataSource.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadReport}
              disabled={!report}
              className="p-2 text-white transition-all border rounded-lg border-slate-700 hover:bg-slate-800 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white transition-all border rounded-lg border-slate-700 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 border rounded-xl bg-red-500/10 border-red-500/20">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {report && (
            <>
              {/* Quality Score */}
              <div className="p-6 text-center border rounded-2xl bg-slate-800/50 border-slate-700/50">
                <p className="mb-2 text-sm text-slate-400">Overall Quality Score</p>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {dataSource.quality_score?.toFixed(0) || 'N/A'}
                  </span>
                  {dataSource.quality_score && <span className="text-3xl text-slate-500">%</span>}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    DataSourceService.getQualityColor(dataSource.quality_score).bg
                  } ${DataSourceService.getQualityColor(dataSource.quality_score).text} border ${
                    DataSourceService.getQualityColor(dataSource.quality_score).border
                  }`}>
                    {DataSourceService.getQualityColor(dataSource.quality_score).label}
                  </span>
                </div>
              </div>

              {/* Structural Issues */}
              {report.structural_issues.length > 0 && (
                <div className="p-6 border rounded-2xl bg-slate-800/30 border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Structural Issues Fixed</h3>
                  </div>
                  <ul className="space-y-2">
                    {report.structural_issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Column Transformations */}
              {report.column_transformations.length > 0 && (
                <div className="p-6 border rounded-2xl bg-slate-800/30 border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Columns Normalized</h3>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {report.column_transformations.slice(0, 10).map((transform, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50">
                        <code className="text-sm text-slate-300">{transform.original}</code>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <code className="text-sm text-cyan-400">{transform.normalized}</code>
                      </div>
                    ))}
                    {report.column_transformations.length > 10 && (
                      <p className="text-xs text-slate-500 text-center pt-2">
                        +{report.column_transformations.length - 10} more transformations
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Data Cleaning Summary */}
              {(report.summary.values_imputed > 0 || report.summary.outliers_handled > 0) && (
                <div className="p-6 border rounded-2xl bg-slate-800/30 border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Data Cleaning Applied</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <p className="mb-1 text-xs text-slate-500">Values Imputed</p>
                      <p className="text-2xl font-bold text-white">{report.summary.values_imputed.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <p className="mb-1 text-xs text-slate-500">Outliers Handled</p>
                      <p className="text-2xl font-bold text-white">{report.summary.outliers_handled.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <p className="mb-1 text-xs text-slate-500">Rows Removed</p>
                      <p className="text-2xl font-bold text-white">{report.summary.rows_removed.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <p className="mb-1 text-xs text-slate-500">Columns Removed</p>
                      <p className="text-2xl font-bold text-white">{report.summary.columns_removed.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Storage Optimization */}
              {report.storage && (
                <div className="p-6 border rounded-2xl bg-slate-800/30 border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Storage Optimization</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 text-center rounded-lg bg-slate-900/50">
                      <p className="mb-1 text-xs text-slate-500">Original Size</p>
                      <p className="text-lg font-bold text-white">
                        {DataSourceService.formatFileSize(report.storage.original_size_bytes)}
                      </p>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-slate-900/50">
                      <p className="mb-1 text-xs text-slate-500">Cleaned Size</p>
                      <p className="text-lg font-bold text-white">
                        {DataSourceService.formatFileSize(report.storage.cleaned_size_bytes)}
                      </p>
                    </div>
                    <div className="p-4 text-center rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                      <p className="mb-1 text-xs text-emerald-400">Compression</p>
                      <p className="text-lg font-bold text-emerald-300">
                        {report.storage.compression_ratio_percent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing Info */}
              {dataSource.processing_duration_seconds && (
                <div className="p-4 border rounded-xl bg-slate-800/30 border-slate-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Processing Time:</span>
                    <span className="font-medium text-white">
                      {DataSourceService.formatProcessingDuration(dataSource.processing_duration_seconds)}
                    </span>
                  </div>
                  {dataSource.last_processed_at && (
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className="text-slate-400">Last Processed:</span>
                      <span className="font-medium text-white">
                        {new Date(dataSource.last_processed_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-6 py-2 font-medium text-white transition-all border rounded-lg border-slate-700 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CleaningReportModal;
