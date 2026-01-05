import apiClient from './api';
import {
  DataSource,
  DataSourceUpdate,
  DatabaseConnection,
  DatabaseConnectionTest,
  TableList,
  TableInfo,
  DataPreview,
  ExcelSheets,
  QualityReport,       // NEW
  CleaningReport,      // NEW
  ReprocessResponse,   // NEW
} from '../types/dataSource';

export class DataSourceService {
  /**
   * Upload a file (CSV, Excel, JSON, Parquet, TSV)
   */
  static async uploadFile(
    file: File,
    name?: string,
    sheetName?: string
  ): Promise<DataSource> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (sheetName) formData.append('sheet_name', sheetName);

    const response = await apiClient.post<DataSource>('/data-sources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get Excel sheet names before uploading
   */
  static async getExcelSheets(file: File): Promise<ExcelSheets> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ExcelSheets>(
      '/data-sources/excel/sheets',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Get all data sources for current user
   */
  static async getDataSources(skip = 0, limit = 100): Promise<DataSource[]> {
    const response = await apiClient.get<DataSource[]>('/data-sources', {
      params: { skip, limit },
    });
    return response.data;
  }

  /**
   * Get single data source by ID
   */
  static async getDataSource(id: string): Promise<DataSource> {
    const response = await apiClient.get<DataSource>(`/data-sources/${id}`);
    return response.data;
  }

  /**
   * Delete data source
   */
  static async deleteDataSource(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/data-sources/${id}`
    );
    return response.data;
  }

  /**
   * Update data source metadata
   */
  static async updateDataSource(
    id: string,
    updateData: DataSourceUpdate
  ): Promise<DataSource> {
    const response = await apiClient.put<DataSource>(
      `/data-sources/${id}`,
      updateData
    );
    return response.data;
  }

  /**
   * Get data preview (first N rows)
   */
  static async getPreview(id: string, limit = 100): Promise<DataPreview> {
    const response = await apiClient.get<DataPreview>(
      `/data-sources/${id}/preview`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  // ========================================
  // NEW: Pipeline Quality Endpoints
  // ========================================

  /**
   * Get data quality report
   */
  static async getQualityReport(id: string): Promise<QualityReport> {
    const response = await apiClient.get<QualityReport>(
      `/data-sources/${id}/quality`
    );
    return response.data;
  }

  /**
   * Get detailed cleaning report
   */
  static async getCleaningReport(id: string): Promise<CleaningReport> {
    const response = await apiClient.get<CleaningReport>(
      `/data-sources/${id}/cleaning-report`
    );
    return response.data;
  }

  /**
   * Reprocess data source through pipeline
   */
  static async reprocessDataSource(id: string): Promise<ReprocessResponse> {
    const response = await apiClient.post<ReprocessResponse>(
      `/data-sources/${id}/reprocess`
    );
    return response.data;
  }

  // ========================================
  // Database Connection Methods (unchanged)
  // ========================================

  /**
   * Test database connection
   */
  static async testDatabaseConnection(
    connection: DatabaseConnection
  ): Promise<DatabaseConnectionTest> {
    const response = await apiClient.post<DatabaseConnectionTest>(
      '/data-sources/database/test',
      connection
    );
    return response.data;
  }

  /**
   * Connect to database
   */
  static async connectDatabase(
    connection: DatabaseConnection,
    name: string,
    tableName?: string
  ): Promise<DataSource> {
    const response = await apiClient.post<DataSource>(
      '/data-sources/database/connect',
      {
        ...connection,
        name,
        table_name: tableName,
      }
    );
    return response.data;
  }

  /**
   * List tables in connected database
   */
  static async listDatabaseTables(dataSourceId: string): Promise<TableList> {
    const response = await apiClient.get<TableList>(
      `/data-sources/database/${dataSourceId}/tables`
    );
    return response.data;
  }

  /**
   * Get table metadata
   */
  static async getTableInfo(
    dataSourceId: string,
    tableName: string
  ): Promise<TableInfo> {
    const response = await apiClient.get<TableInfo>(
      `/data-sources/database/${dataSourceId}/tables/${tableName}/info`
    );
    return response.data;
  }

  /**
   * Preview database table
   */
  static async previewDatabaseTable(
    dataSourceId: string,
    tableName: string,
    limit = 100
  ): Promise<DataPreview> {
    const response = await apiClient.get<DataPreview>(
      `/data-sources/database/${dataSourceId}/tables/${tableName}/preview`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  // ========================================
  // Helper/Utility Methods
  // ========================================

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number | null): string {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Get file type icon color
   */
  static getFileTypeColor(type: string): {
    gradient: string;
    iconColor: string;
  } {
    const colorMap: Record<string, { gradient: string; iconColor: string }> = {
      csv: {
        gradient: 'from-green-600/20 to-green-600/5',
        iconColor: 'text-green-400',
      },
      excel: {
        gradient: 'from-emerald-600/20 to-emerald-600/5',
        iconColor: 'text-emerald-400',
      },
      json: {
        gradient: 'from-yellow-600/20 to-yellow-600/5',
        iconColor: 'text-yellow-400',
      },
      parquet: {
        gradient: 'from-orange-600/20 to-orange-600/5',
        iconColor: 'text-orange-400',
      },
      tsv: {
        gradient: 'from-blue-600/20 to-blue-600/5',
        iconColor: 'text-blue-400',
      },
      database_postgresql: {
        gradient: 'from-blue-600/20 to-blue-600/5',
        iconColor: 'text-blue-400',
      },
      database_mysql: {
        gradient: 'from-cyan-600/20 to-cyan-600/5',
        iconColor: 'text-cyan-400',
      },
      database_sqlite: {
        gradient: 'from-slate-600/20 to-slate-600/5',
        iconColor: 'text-slate-400',
      },
      default: {
        gradient: 'from-purple-600/20 to-purple-600/5',
        iconColor: 'text-purple-400',
      },
    };

    return colorMap[type] || colorMap.default;
  }

  // ========================================
  // NEW: Quality Helper Methods
  // ========================================

  /**
   * Get quality badge color based on score
   */
  static getQualityColor(score: number | null | undefined): {
    bg: string;
    text: string;
    border: string;
    label: string;
  } {
    if (!score && score !== 0) {
      return {
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/20',
        label: 'Unknown',
      };
    }

    if (score >= 90) {
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        label: 'Excellent',
      };
    } else if (score >= 80) {
      return {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/20',
        label: 'Good',
      };
    } else if (score >= 70) {
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/20',
        label: 'Fair',
      };
    } else if (score >= 60) {
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
        label: 'Poor',
      };
    } else {
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        label: 'Critical',
      };
    }
  }

  /**
   * Get quality level emoji
   */
  static getQualityEmoji(level: string | null | undefined): string {
    const emojiMap: Record<string, string> = {
      excellent: '✅',
      good: '👍',
      fair: '⚠️',
      poor: '⚠️',
      critical: '❌',
    };

    return emojiMap[level || ''] || '❓';
  }

  /**
   * Format processing duration
   */
  static formatProcessingDuration(seconds: number | null | undefined): string {
    if (!seconds) return '-';
    
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`;
    } else if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    }
  }
}

export default DataSourceService;
