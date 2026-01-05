// UPDATED Data Source Types
// WITH pipeline quality fields

export interface ColumnInfo {
  name: string;
  type: string;
  nullable?: boolean;
  original_name?: string;  // NEW: Original column name before normalization
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
  status: 'connected' | 'syncing' | 'error' | 'disconnected' | 'processing';  // Added processing
  file_path: string | null;
  row_count: number | null;
  file_size: number | null;
  columns_info: ColumnInfo[] | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
  
  // NEW: Pipeline Quality Fields
  processing_report?: any | null;
  quality_score?: number | null;
  quality_level?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' | null;
  column_mapping?: Record<string, string> | null;
  column_stats?: Record<string, any> | null;
  cleaned_path?: string | null;
  preview_path?: string | null;
  processing_duration_seconds?: number | null;
  last_processed_at?: string | null;
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
  from_cache?: boolean;  // NEW: Indicates if loaded from cache
  quality_score?: number | null;  // NEW: Quality score
}

export interface ExcelSheets {
  filename: string;
  sheets: string[];
  sheet_count: number;
}

// NEW: Quality Report Types
export interface QualityReport {
  overall_score: number;
  overall_level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  columns: Record<string, ColumnQuality>;
  dataset_stats: {
    total_rows: number;
    total_columns: number;
    total_cells: number;
    missing_cells: number;
    complete_cells: number;
    completeness_percent?: number;
  };
  processing_duration?: number | null;
  last_processed?: string | null;
}

export interface ColumnQuality {
  completeness: number;
  uniqueness: number;
  consistency: number;
  validity: number;
  quality_score: number;
  quality_level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  issues: string[];
}

// NEW: Cleaning Report Types
export interface CleaningReport {
  structural_issues: string[];
  column_transformations: Array<{
    original: string;
    normalized: string;
  }>;
  type_conversions: Record<string, {
    detected_type: string;
    original_dtype?: string;
    final_dtype?: string;
    success_rate: number;
    sample_values?: string[];
  }>;
  data_cleaning: Record<string, {
    original_nulls: number;
    imputed_nulls: number;
    final_nulls: number;
    imputation_method: string;
    outliers_handled: number;
    duplicates_removed: number;
  }>;
  summary: {
    original_rows?: number;
    final_rows?: number;
    rows_removed: number;
    columns_removed: number;
    values_imputed: number;
    outliers_handled: number;
  };
  storage?: {
    original_size_bytes: number;
    cleaned_size_bytes: number;
    compression_ratio_percent: number;
  };
}

// NEW: Reprocess Response
export interface ReprocessResponse {
  success: boolean;
  message?: string;
  quality_score?: number;
  quality_level?: string;
  duration_seconds?: number;
  rows?: number;
  error?: string;
  error_type?: string;
}
