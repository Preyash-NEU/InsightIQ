import apiClient from './api';
import {
  Query,
  QueryCreate,
  QueryExecute,
  QueryFilters,
} from '../types/query';

export class QueryService {
  /**
   * Execute natural language query
   */
  static async naturalLanguageQuery(queryData: QueryCreate): Promise<Query> {
    const response = await apiClient.post<Query>(
      '/queries/natural-language',
      queryData
    );
    return response.data;
  }

  /**
   * Execute direct pandas code
   */
  static async executeDirectQuery(queryData: QueryExecute): Promise<Query> {
    const response = await apiClient.post<Query>(
      '/queries/execute',
      queryData
    );
    return response.data;
  }

  /**
   * Get all queries with filters
   */
  static async getQueries(filters?: QueryFilters): Promise<Query[]> {
    const response = await apiClient.get<Query[]>('/queries', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get single query by ID
   */
  static async getQuery(id: string): Promise<Query> {
    const response = await apiClient.get<Query>(`/queries/${id}`);
    return response.data;
  }

  /**
   * Save/favorite a query
   */
  static async saveQuery(id: string): Promise<Query> {
    const response = await apiClient.post<Query>(`/queries/${id}/save`);
    return response.data;
  }

  /**
   * Delete a query
   */
  static async deleteQuery(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/queries/${id}`
    );
    return response.data;
  }

  /**
   * Format execution time for display
   */
  static formatExecutionTime(ms: number | null): string {
    if (!ms) return '-';
    
    if (ms < 1000) {
      return `${ms}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  }

  /**
   * Get query type label
   */
  static getQueryTypeLabel(type: string | null): string {
    if (!type) return 'Unknown';
    
    const labels: Record<string, string> = {
      natural_language: 'Natural Language',
      direct: 'Direct Code',
      sql: 'SQL',
      aggregation: 'Aggregation',
    };
    
    return labels[type] || type;
  }

  /**
   * Get query type color
   */
  static getQueryTypeColor(type: string | null): {
    bg: string;
    text: string;
    border: string;
  } {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      natural_language: {
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/20',
      },
      direct: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
      },
      sql: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/20',
      },
      aggregation: {
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        border: 'border-green-500/20',
      },
    };
    
    return colors[type || 'natural_language'] || colors.natural_language;
  }
}

export default QueryService;
