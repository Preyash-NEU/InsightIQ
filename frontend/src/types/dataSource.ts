// Data Source Types - matching backend schemas

export interface ColumnInfo {
  name: string;
  type: string;
  nullable?: boolean;
}

export interface DataSourceBase {
  name: string;
  type: 'csv' | 'excel' | 'json' | 'parquet' | 'tsv' | 'google_sheets' | 'api' | 'database' | 'database_postgresql' | 'database_mysql' | 'database_sqlite';
}

export interface DataSourceCreate extends DataSourceBase {
  connection_info?: Record<string, any> | null;
}

export interface DataSourceUpdate {
  name?: string;
  status?: 'connected' | 'syncing' | 'error' | 'disconnected';
}

export interface DataSource extends DataSourceBase {
  id: string;
  user_id: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  file_path: string | null;
  row_count: number | null;
  file_size: number | null;
  columns_info: ColumnInfo[] | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
}

export interface DataSourcePublic {
  id: string;
  name: string;
  type: string;
  status: string;
  row_count: number | null;
  file_size: number | null;
  created_at: string;
  last_synced_at: string | null;
}

export interface DatabaseConnection {
  db_type: 'postgresql' | 'mysql' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface DatabaseConnectionTest {
  status: string;
  message: string;
  version?: string;
}

export interface TableList {
  tables: string[];
  table_count: number;
}

export interface TableInfo {
  table_name: string;
  columns: Array<{
    name: string;
    type: string;
  }>;
  row_count: number;
}

export interface DataPreview {
  columns: string[];
  rows: Record<string, any>[];
  total_rows: number;
  preview_rows: number;
  file_type?: string;
  table_name?: string;
}

export interface ExcelSheets {
  filename: string;
  sheets: string[];
  sheet_count: number;
}
