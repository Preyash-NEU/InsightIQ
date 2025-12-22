// Query Types - matching backend schemas

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
}

export interface Query extends QueryBase {
  id: string;
  user_id: string;
  query_type: string | null;
  result_data: Record<string, any> | null;
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
