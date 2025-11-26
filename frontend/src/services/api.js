/**
 * API服务配置
 */
import axios from 'axios'

// API地址配置
// 本地开发：使用 /api（通过 Vite 代理到 localhost:3000）
// ngrok部署：修改为 ngrok 提供的后端地址，如 'https://xxx.ngrok-free.app/api'
const API_BASE_URL = '/api';

console.log('🔗 API地址:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // 401未授权，清除token
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        // 可以在这里触发登录弹窗或跳转
      }
    }
    return Promise.reject(error)
  }
)

// API方法封装
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  getHistory: () => api.get('/auth/history')
}

export const commentsAPI = {
  getAll: (params) => api.get('/comments', { params }),
  getById: (id) => api.get(`/comments/${id}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`),
  requestAIReply: (id) => api.post(`/comments/${id}/ai-reply`),
  getRecent: (limit = 5) => api.get('/comments/recent', { params: { limit } }),
  getUserComments: (params) => api.get('/comments/user/me', { params })
}

export const knowledgeAPI = {
  getAll: (params) => api.get('/knowledge', { params }),
  getById: (id) => api.get(`/knowledge/${id}`),
  getCategories: () => api.get('/knowledge/categories'),
  getPopular: (limit = 5) => api.get('/knowledge/popular', { params: { limit } }),
  search: (keyword) => api.get('/knowledge/search', { params: { keyword } }),
  getMistakes: () => api.get('/knowledge/mistakes'),
  getUserProgress: () => api.get('/knowledge/user/progress'),
  recordProgress: (id, score) => api.post(`/knowledge/${id}/progress`, { score })
}

export const aiAPI = {
  analyze: (sql) => api.post('/ai/analyze', { sql }),
  ask: (question) => api.post('/ai/ask', { question }),
  correct: (sql, errorMessage) => api.post('/ai/correct', { sql, errorMessage }),
  chat: (message) => api.post('/ai/chat', { message }),
  evaluate: (content, codeSnippet) => api.post('/ai/evaluate', { content, codeSnippet }),
  generateExercise: (topic, difficulty) => api.post('/ai/exercise', { topic, difficulty }),
  getWeeklySummary: () => api.get('/ai/weekly-summary')
}

export default api

