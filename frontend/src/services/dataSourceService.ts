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
}

export default DataSourceService;
