import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
};

export const datasetsApi = {
  list: () => api.get('/datasets'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  get: (id: string) => api.get(`/datasets/${id}`),
  delete: (id: string) => api.delete(`/datasets/${id}`),
};

export const queriesApi = {
  execute: (datasetId: string, query: string) =>
    api.post('/queries/execute', { dataset_id: datasetId, query }),
};

export const insightsApi = {
  list: (datasetId: string) => api.get(`/insights/${datasetId}`),
  generate: (datasetId: string) =>
    api.post('/insights/generate', { dataset_id: datasetId }),
};
