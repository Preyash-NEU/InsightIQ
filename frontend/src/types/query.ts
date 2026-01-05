// UPDATED Query Types
// WITH pipeline quality fields

export interface QueryBase {
  query_text: string;
  data_source_id?: string | null;
}

export interface QueryCreate extends QueryBase {
  // Same as base
}

export interface QueryExecute {
  data_source_id: string;
  query_text: string;
  pandas_code?: string;  // NEW: For direct code execution
}

export interface Query extends QueryBase {
  id: string;
  user_id: string;
  query_type: string | null;
  result_data: QueryResultData | null;
  execution_time_ms: number | null;
  is_saved: boolean;
  created_at: string;
}

export interface QueryWithResults extends Query {
  visualizations?: any[] | null;
}

export interface QueryFilters {
  skip?: number;
  limit?: number;
  data_source_id?: string;
  saved_only?: boolean;
  query_type?: 'natural_language' | 'direct';
  search?: string;
  sort_by?: 'created_at' | 'execution_time_ms';
  sort_order?: 'asc' | 'desc';
}

// NEW: Enhanced Query Result Data (from pipeline)
export interface QueryResultData {
  type: 'scalar' | 'dataframe' | 'series' | 'object' | 'unknown';
  value?: any;
  data?: any[];
  columns?: string[];
  shape?: [number, number];
  name?: string;
  
  // NEW: Pipeline quality info
  data_quality?: {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
  
  // NEW: Column transformations applied
  column_transformations?: Array<{
    original: string;
    normalized: string;
  }>;
}
