/**
 * 认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 设置token
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  // 注册
  const register = async (userData) => {
    loading.value = true
    try {
      const response = await api.post('/auth/register', userData)
      if (response.data.success) {
        user.value = response.data.data.user
        setToken(response.data.data.token)
        return { success: true, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || '注册失败，请稍后重试'
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // 登录
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.success) {
        user.value = response.data.data.user
        setToken(response.data.data.token)
        return { success: true, message: response.data.message }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || '登录失败，请检查账号密码'
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    setToken(null)
  }

  // 获取用户信息
  const fetchProfile = async () => {
    if (!token.value) return
    
    try {
      const response = await api.get('/auth/profile')
      if (response.data.success) {
        user.value = response.data.data.user
      }
    } catch (error) {
      // Token无效，登出
      if (error.response?.status === 401) {
        logout()
      }
    }
  }

  // 检查认证状态
  const checkAuth = async () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      await fetchProfile()
    }
  }

  // 更新用户信息
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile', data)
      if (response.data.success) {
        user.value = response.data.data.user
        return { success: true, message: '更新成功' }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '更新失败' }
    }
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    register,
    login,
    logout,
    fetchProfile,
    checkAuth,
    updateProfile
  }
})

