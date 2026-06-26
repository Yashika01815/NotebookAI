import axios from 'axios';
import { useAuthStore } from '../store/index.js';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.');
    }
    
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

// Workspace API
export const workspaceAPI = {
  getAll: () => api.get('/workspaces'),
  get: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
  getStats: (id) => api.get(`/workspaces/${id}/stats`),
};

// Document API
export const documentAPI = {
  upload: (workspaceId, formData, onProgress) => 
    api.post(`/documents/workspace/${workspaceId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    }),
  getAll: (workspaceId) => api.get(`/documents/workspace/${workspaceId}`),
  get: (docId) => api.get(`/documents/${docId}`),
  delete: (docId) => api.delete(`/documents/${docId}`),
  reindex: (docId) => api.post(`/documents/${docId}/reindex`),
};

// Chat API
export const chatAPI = {
  sendMessage: (workspaceId, data) => api.post(`/chat/workspace/${workspaceId}`, data),
  getHistory: (workspaceId) => api.get(`/chat/workspace/${workspaceId}/history`),
  getSession: (chatId) => api.get(`/chat/session/${chatId}`),
  deleteSession: (chatId) => api.delete(`/chat/session/${chatId}`),
  clearHistory: (workspaceId) => api.delete(`/chat/workspace/${workspaceId}/clear`),
};

// AI API
export const aiAPI = {
  getSummary: (workspaceId, params) => api.get(`/ai/workspace/${workspaceId}/summary`, { params }),
  getMindMap: (workspaceId, params) => api.get(`/ai/workspace/${workspaceId}/mindmap`, { params }),
  getFlashcards: (workspaceId, params) => api.get(`/ai/workspace/${workspaceId}/flashcards`, { params }),
  getQuiz: (workspaceId, params) => api.get(`/ai/workspace/${workspaceId}/quiz`, { params }),
  getKnowledgeGraph: (workspaceId, params) => api.get(`/ai/workspace/${workspaceId}/knowledge-graph`, { params }),
};

export default api;
