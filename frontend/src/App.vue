<template>
  <div id="app" class="app-container">
    <!-- 动态背景 -->
    <DynamicBackground />

    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          <img src="/tb.png" alt="哈尔滨剑桥学院" class="brand-logo" />
          <span class="brand-divider"></span>
          <span class="brand-text">SQL学习平台</span>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="icon">🏠</span> 首页
          </router-link>
          <router-link to="/knowledge" class="nav-link">
            <span class="icon">📚</span> 知识库
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

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-logo">
          <img src="/tb.png" alt="Logo" style="height: 40px; opacity: 0.8;">
        </div>
        <p>© 2024 哈尔滨剑桥学院 SQL学习平台</p>
        <p class="footer-links">
          <router-link to="/about">关于我们</router-link>
          <span class="divider">|</span>
          <a href="#">教学资源</a>
          <span class="divider">|</span>
          <a href="#">反馈建议</a>
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
import DynamicBackground from '@/components/DynamicBackground.vue'

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
}

/* 导航栏 - 玻璃拟态升级版 */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  /* 混合深红背景，保持透亮感 */
  background: rgba(60, 10, 10, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding: 0 1.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px; /* 增加高度以容纳更大的校标 */
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  transition: opacity 0.3s;
}

.nav-brand:hover {
  opacity: 0.9;
}

.brand-logo {
  height: 64px; /* 放大校标，更显眼 */
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.brand-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

/* 导航链接 - 胶囊式设计 */
.nav-links {
  display: flex;
  gap: 0.8rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.4rem;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-link {
  padding: 0.5rem 1.2rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 99px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-link .icon {
  font-size: 1.1em;
}

.nav-link:hover {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: #8B0000;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

/* 用户区域 */
.nav-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  text-decoration: none;
  color: #fff;
  padding: 0.3rem 1rem 0.3rem 0.3rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-user:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #8B0000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.btn-login, .btn-logout {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-login:hover, .btn-logout:hover {
  color: #FFD700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.btn-register {
  padding: 0.5rem 1.8rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #8B0000;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
  text-transform: uppercase;
  font-size: 0.9rem;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 165, 0, 0.5);
  filter: brightness(1.1);
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 2rem 1.5rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 页面过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 页脚 */
.footer {
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(40,10,10,0.6));
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  padding: 3rem 2rem;
  margin-top: auto;
  position: relative;
  z-index: 1;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-logo {
  margin-bottom: 0.5rem;
}

.footer p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #FFD700;
}

/* Toast消息 */
.toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.8rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  z-index: 1000;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  animation: toast-slide-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes toast-slide-in {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.toast.info {
  background: rgba(30, 30, 30, 0.95);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: #fff;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>
