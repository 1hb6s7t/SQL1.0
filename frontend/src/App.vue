<template>
  <div id="app" class="app-container">
    <DynamicBackground />

    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <div class="brand-mark">DB</div>
          <div class="brand-copy">
            <span class="brand-text">《数据库原理与应用》智能学习平台</span>
            <span class="brand-subtext">Database Principles & Applications Smart Learning Platform</span>
          </div>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="icon">🏠</span> 首页
          </router-link>
          <router-link to="/knowledge" class="nav-link">
            <span class="icon">📚</span> 知识库
          </router-link>
          <router-link to="/exercises" class="nav-link">
            <span class="icon">📝</span> 项目练习
          </router-link>
          <router-link to="/playground" class="nav-link">
            <span class="icon">💻</span> 练习场
          </router-link>
          <router-link to="/community" class="nav-link">
            <span class="icon">💬</span> 社区
          </router-link>
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

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer">
      <div class="footer-container">
        <div class="footer-logo">
          <div class="footer-mark">DB</div>
        </div>
        <p>© 2026 《数据库原理与应用》智能学习平台</p>
        <p class="footer-links">
          <router-link to="/about">关于平台</router-link>
          <span class="divider">|</span>
          <a href="#">课程资源</a>
          <span class="divider">|</span>
          <a href="#">反馈建议</a>
        </p>
      </div>
    </footer>

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
import DynamicBackground from '@/components/DynamicBackground.vue'

const authStore = useAuthStore()
const router = useRouter()

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

const handleLogout = () => {
  authStore.logout()
  showToast('已退出登录', 'success')
  router.push('/')
}

authStore.checkAuth()
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(8, 18, 40, 0.84);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(125, 211, 252, 0.18);
  padding: 0 1rem;
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.35);
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
}

.brand-mark,
.footer-mark {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: 1px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.brand-text {
  font-size: 1.35rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: 0.5px;
}

.brand-subtext {
  font-size: 0.75rem;
  color: rgba(226, 232, 240, 0.7);
}

.nav-links {
  display: flex;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.45);
  padding: 0.6rem;
  border-radius: 99px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.nav-link {
  padding: 0.6rem 1.4rem;
  text-decoration: none;
  color: rgba(241, 245, 249, 0.92);
  border-radius: 99px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.28);
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: #fff;
  padding: 0.4rem 1.1rem 0.4rem 0.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-user:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(96, 165, 250, 0.5);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-name {
  font-weight: 600;
}

.btn-login,
.btn-register,
.btn-logout {
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  font-weight: 700;
  border: none;
}

.btn-login {
  color: #e2e8f0;
  background: rgba(255,255,255,0.06);
}

.btn-register,
.btn-logout {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.24);
}

.main-content {
  flex: 1;
  padding: 2rem 1rem 3rem;
}

.footer {
  margin-top: auto;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(8, 18, 40, 0.72);
  backdrop-filter: blur(12px);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
  color: #cbd5e1;
}

.footer-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.footer-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.footer-links {
  margin-top: 0.75rem;
}

.divider {
  margin: 0 0.5rem;
  color: rgba(148, 163, 184, 0.5);
}

.toast {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  padding: 0.9rem 1.2rem;
  border-radius: 14px;
  color: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.35);
}

.toast.info { background: #2563eb; }
.toast.success { background: #16a34a; }
.toast.error { background: #dc2626; }

.fade-enter-active,
.fade-leave-active,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to,
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 1200px) {
  .nav-container {
    height: auto;
    padding: 1rem 0;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    border-radius: 20px;
  }
}

@media (max-width: 768px) {
  .brand-text {
    font-size: 1rem;
  }

  .brand-subtext {
    display: none;
  }

  .nav-link {
    padding: 0.55rem 1rem;
    font-size: 0.95rem;
  }

  .main-content {
    padding: 1.2rem 0.75rem 2rem;
  }
}
</style>
