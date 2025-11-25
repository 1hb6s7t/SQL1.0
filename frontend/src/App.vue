<template>
  <div id="app" class="app-container">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <span class="brand-icon">📊</span>
          <span class="brand-text">SQL学习平台</span>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/knowledge" class="nav-link">知识库</router-link>
          <router-link to="/playground" class="nav-link">练习场</router-link>
          <router-link to="/community" class="nav-link">社区</router-link>
        </div>
        
        <div class="nav-auth">
          <template v-if="authStore.isLoggedIn">
            <router-link to="/profile" class="nav-user">
              <span class="user-avatar">{{ authStore.user?.username?.[0]?.toUpperCase() || '?' }}</span>
              <span class="user-name">{{ authStore.user?.username }}</span>
            </router-link>
            <button @click="handleLogout" class="btn-logout">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-login">登录</router-link>
            <router-link to="/register" class="btn-register">注册</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <p>© 2024 SQL学习平台 - 让SQL学习更简单</p>
        <p class="footer-links">
          <a href="#">关于我们</a>
          <span class="divider">|</span>
          <a href="#">使用帮助</a>
          <span class="divider">|</span>
          <a href="#">API文档</a>
        </p>
      </div>
    </footer>

    <!-- 全局消息提示 -->
    <Transition name="toast">
      <div v-if="toastMessage" class="toast" :class="toastType">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Toast消息
const toastMessage = ref('')
const toastType = ref('info')
let toastTimer = null

const showToast = (message, type = 'info', duration = 3000) => {
  if (toastTimer) clearTimeout(toastTimer)
  toastMessage.value = message
  toastType.value = type
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}

provide('showToast', showToast)

// 处理登出
const handleLogout = () => {
  authStore.logout()
  showToast('已退出登录', 'success')
  router.push('/')
}

// 初始化时检查登录状态
authStore.checkAuth()
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

/* 导航栏 */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.nav-link.router-link-active {
  color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.15);
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
  padding: 0.25rem 0.75rem 0.25rem 0.25rem;
  border-radius: 999px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
}

.nav-user:hover {
  background: var(--bg-tertiary);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.btn-login, .btn-logout {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
}

.btn-login:hover, .btn-logout:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.btn-register {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  transition: all 0.2s ease;
}

.btn-register:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 2rem 1.5rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* 页脚 */
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.footer-links {
  margin-top: 0.5rem;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--accent-primary);
}

.footer-links .divider {
  margin: 0 0.5rem;
  opacity: 0.5;
}

/* Toast消息 */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.875rem;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.toast.info {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.toast.success {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.toast.error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* 响应式 */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>

