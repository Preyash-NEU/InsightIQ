// Visualization Types

export interface Visualization {
  id: string;
  query_id: string;
  chart_type: 'line' | 'bar' | 'pie' | 'table' | 'scatter' | 'kpi';
  config_json: VisualizationConfig;
  created_at: string;
}

export interface VisualizationConfig {
  type?: string;
  config?: {
    x?: any[];
    y?: any[];
    x_label?: string;
    y_label?: string;
    value?: number | string;
    label?: string;
    data?: any[];
    labels?: string[];
    values?: number[];
    [key: string]: any;
  };
}

export interface ChartData {
  labels?: string[];
  datasets?: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
  // For Recharts format
  data?: Array<Record<string, any>>;
}

export interface KPIData {
  value: number | string;
  label: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}
