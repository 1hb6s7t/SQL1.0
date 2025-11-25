<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>创建账号</h1>
        <p>开始你的SQL学习之旅</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="2-50个字符，支持中英文"
            required
            minlength="2"
            maxlength="50"
          />
        </div>

        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="至少6个字符"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="再次输入密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="spinner-small"></span>
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>已有账号？<router-link to="/login">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showToast = inject('showToast')

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  
  // 验证密码匹配
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }

  loading.value = true

  try {
    const result = await authStore.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })
    
    if (result.success) {
      showToast('注册成功！', 'success')
      router.push('/')
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.btn-block {
  width: 100%;
  justify-content: center;
  padding: 0.875rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.error-message {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: var(--error);
  font-size: 0.875rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.auth-footer a {
  color: var(--accent-primary);
  font-weight: 500;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}
</style>

