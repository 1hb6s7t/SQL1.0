<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>👤 个人中心</h1>
    </div>

    <div class="profile-container">
      <!-- 左侧：用户信息 -->
      <div class="profile-sidebar">
        <div class="user-card">
          <div class="avatar">
            {{ authStore.user?.username?.[0]?.toUpperCase() || '?' }}
          </div>
          <h2>{{ authStore.user?.username }}</h2>
          <p class="email">{{ authStore.user?.email }}</p>
          <span class="role-badge" :class="authStore.user?.role">
            {{ roleText[authStore.user?.role] }}
          </span>
          <div class="user-meta">
            <p>注册时间：{{ formatDate(authStore.user?.createdAt) }}</p>
            <p>上次登录：{{ formatDate(authStore.user?.lastLogin) }}</p>
          </div>
        </div>

        <!-- 学习统计 -->
        <div class="stats-card" v-if="stats">
          <h3>📊 学习统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ stats.total_records || 0 }}</span>
              <span class="stat-label">学习记录</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.correct_count || 0 }}</span>
              <span class="stat-label">正确数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.topics_learned || 0 }}</span>
              <span class="stat-label">学习主题</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：内容区 -->
      <div class="profile-content">
        <!-- 标签切换 -->
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >账号设置</button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >SQL历史</button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'comments' }"
            @click="activeTab = 'comments'"
          >我的评论</button>
        </div>

        <!-- 账号设置 -->
        <div v-if="activeTab === 'settings'" class="tab-content">
          <div class="settings-section">
            <h3>修改信息</h3>
            <form @submit.prevent="handleUpdateProfile">
              <div class="form-group">
                <label class="form-label">用户名</label>
                <input v-model="profileForm.username" type="text" />
              </div>
              <div class="form-group">
                <label class="form-label">邮箱</label>
                <input v-model="profileForm.email" type="email" />
              </div>
              <button type="submit" class="btn btn-primary" :disabled="updating">
                {{ updating ? '保存中...' : '保存修改' }}
              </button>
            </form>
          </div>

          <div class="settings-section">
            <h3>修改密码</h3>
            <form @submit.prevent="handleChangePassword">
              <div class="form-group">
                <label class="form-label">当前密码</label>
                <input v-model="passwordForm.currentPassword" type="password" />
              </div>
              <div class="form-group">
                <label class="form-label">新密码</label>
                <input v-model="passwordForm.newPassword" type="password" />
              </div>
              <div class="form-group">
                <label class="form-label">确认新密码</label>
                <input v-model="passwordForm.confirmPassword" type="password" />
              </div>
              <button type="submit" class="btn btn-secondary" :disabled="changingPassword">
                {{ changingPassword ? '修改中...' : '修改密码' }}
              </button>
            </form>
          </div>
        </div>

        <!-- SQL历史 -->
        <div v-if="activeTab === 'history'" class="tab-content">
          <div v-if="loadingHistory" class="loading">
            <div class="spinner"></div>
          </div>
          <div v-else-if="sqlHistory.length === 0" class="empty-state">
            <p>暂无SQL执行记录</p>
          </div>
          <div v-else class="history-list">
            <div v-for="item in sqlHistory" :key="item.id" class="history-item">
              <div class="history-header">
                <span class="status" :class="{ success: item.is_success, error: !item.is_success }">
                  {{ item.is_success ? '✓ 成功' : '✗ 失败' }}
                </span>
                <span class="time">{{ formatTime(item.created_at) }}</span>
              </div>
              <pre class="history-code">{{ item.sql_query }}</pre>
            </div>
          </div>
        </div>

        <!-- 我的评论 -->
        <div v-if="activeTab === 'comments'" class="tab-content">
          <div v-if="loadingComments" class="loading">
            <div class="spinner"></div>
          </div>
          <div v-else-if="myComments.length === 0" class="empty-state">
            <p>暂无评论</p>
            <router-link to="/community" class="btn btn-primary mt-3">去发表评论</router-link>
          </div>
          <div v-else class="comments-list">
            <div v-for="comment in myComments" :key="comment.id" class="comment-card">
              <p class="comment-content">{{ comment.content }}</p>
              <div v-if="comment.code_snippet" class="comment-code">
                <pre>{{ comment.code_snippet }}</pre>
              </div>
              <div class="comment-meta">
                <span>❤️ {{ comment.likes_count }}</span>
                <span>{{ formatTime(comment.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI, commentsAPI } from '@/services/api'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const showToast = inject('showToast')

const activeTab = ref('settings')
const stats = ref(null)

// 表单
const profileForm = ref({
  username: authStore.user?.username || '',
  email: authStore.user?.email || ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const updating = ref(false)
const changingPassword = ref(false)

// SQL历史
const sqlHistory = ref([])
const loadingHistory = ref(false)

// 我的评论
const myComments = ref([])
const loadingComments = ref(false)

const roleText = {
  user: '普通用户',
  admin: '管理员',
  moderator: '版主'
}

const formatDate = (date) => {
  if (!date) return '未知'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 更新个人信息
const handleUpdateProfile = async () => {
  updating.value = true
  try {
    const result = await authStore.updateProfile(profileForm.value)
    if (result.success) {
      showToast('更新成功', 'success')
    } else {
      showToast(result.message, 'error')
    }
  } catch (error) {
    showToast('更新失败', 'error')
  } finally {
    updating.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('两次密码输入不一致', 'error')
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    showToast('新密码至少6个字符', 'error')
    return
  }
  
  changingPassword.value = true
  try {
    await authAPI.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    showToast('密码修改成功', 'success')
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (error) {
    showToast(error.response?.data?.message || '修改失败', 'error')
  } finally {
    changingPassword.value = false
  }
}

// 加载SQL历史
const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const res = await authAPI.getHistory()
    if (res.data.success) {
      sqlHistory.value = res.data.data.history
    }
  } catch (error) {
    console.error('加载历史失败:', error)
  } finally {
    loadingHistory.value = false
  }
}

// 加载我的评论
const loadMyComments = async () => {
  loadingComments.value = true
  try {
    const res = await commentsAPI.getUserComments({ limit: 20 })
    if (res.data.success) {
      myComments.value = res.data.data.comments
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    loadingComments.value = false
  }
}

onMounted(async () => {
  // 获取用户统计
  try {
    const res = await authAPI.getProfile()
    if (res.data.success) {
      stats.value = res.data.data.stats
    }
  } catch (error) {
    console.error('获取统计失败:', error)
  }
  
  // 同时加载历史和评论
  loadHistory()
  loadMyComments()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
}

.profile-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

/* 侧边栏 */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 1rem;
}

.user-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.email {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 999px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.role-badge.admin {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.role-badge.moderator {
  background: rgba(99, 102, 241, 0.2);
  color: var(--accent-primary);
}

.user-meta {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: left;
}

.user-meta p {
  margin: 0.25rem 0;
}

/* 统计卡片 */
.stats-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.stats-card h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* 内容区 */
.profile-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--text-primary);
  background: var(--bg-primary);
}

.tab.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.tab-content {
  padding: 1.5rem;
}

/* 设置区块 */
.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.settings-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.settings-section h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
}

/* 历史列表 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.history-header .status {
  font-size: 0.8rem;
  font-weight: 500;
}

.history-header .status.success {
  color: var(--success);
}

.history-header .status.error {
  color: var(--error);
}

.history-header .time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.history-code {
  background: var(--bg-code);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.comment-content {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.comment-code pre {
  background: var(--bg-code);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0 0 0.75rem 0;
}

.comment-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
}
</style>

