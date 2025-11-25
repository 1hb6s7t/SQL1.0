<template>
  <div class="home">
    <!-- Hero区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">掌握SQL</span>
          <br>从这里开始
        </h1>
        <p class="hero-subtitle">
          交互式学习平台，AI智能辅导，社区互动答疑
          <br>让数据库查询语言学习变得简单有趣
        </p>
        <div class="hero-actions">
          <router-link to="/playground" class="btn btn-primary btn-lg">
            <span>🚀</span> 开始学习
          </router-link>
          <router-link to="/knowledge" class="btn btn-secondary btn-lg">
            <span>📚</span> 浏览知识库
          </router-link>
        </div>
      </div>
      
      <div class="hero-visual">
        <div class="code-preview">
          <div class="code-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="code-title">query.sql</span>
          </div>
          <pre class="code-content"><code><span class="keyword">SELECT</span> name, email, created_at
<span class="keyword">FROM</span> users
<span class="keyword">WHERE</span> status = <span class="string">'active'</span>
<span class="keyword">ORDER BY</span> created_at <span class="keyword">DESC</span>
<span class="keyword">LIMIT</span> <span class="number">10</span>;</code></pre>
        </div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="features">
      <h2 class="section-title">平台特色</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>系统化知识库</h3>
          <p>从基础到高级，覆盖SELECT、JOIN、子查询等核心知识点，循序渐进学习</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>AI智能助手</h3>
          <p>基于Qwen大模型，实时分析代码、纠错指导、智能答疑，24小时在线辅导</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3>社区互动</h3>
          <p>与其他学习者交流讨论，分享代码，互相点评，共同进步</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>学习追踪</h3>
          <p>记录学习进度，分析常见错误，生成个性化学习报告</p>
        </div>
      </div>
    </section>

    <!-- 热门知识点 -->
    <section class="popular-section" v-if="popularKnowledge.length">
      <h2 class="section-title">热门知识点</h2>
      <div class="knowledge-grid">
        <div 
          v-for="item in popularKnowledge" 
          :key="item.id" 
          class="knowledge-card"
          @click="$router.push(`/knowledge/${item.id}`)"
        >
          <div class="knowledge-badge" :class="item.difficulty">
            {{ difficultyText[item.difficulty] }}
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.content?.substring(0, 80) }}...</p>
          <div class="knowledge-meta">
            <span class="category">📁 {{ item.category }}</span>
            <span class="views">👁 {{ item.view_count }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新评论 -->
    <section class="recent-section" v-if="recentComments.length">
      <h2 class="section-title">社区动态</h2>
      <div class="comments-list">
        <div v-for="comment in recentComments" :key="comment.id" class="comment-item">
          <div class="comment-avatar">
            {{ comment.is_ai_reply ? '🤖' : (comment.username?.[0]?.toUpperCase() || '?') }}
          </div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="username">{{ comment.is_ai_reply ? 'AI助手' : comment.username }}</span>
              <span class="time">{{ formatTime(comment.created_at) }}</span>
            </div>
            <p class="comment-content">{{ comment.content?.substring(0, 100) }}{{ comment.content?.length > 100 ? '...' : '' }}</p>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <router-link to="/community" class="btn btn-secondary">查看更多</router-link>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2>准备好开始学习SQL了吗？</h2>
      <p>免费注册，立即开启你的数据库学习之旅</p>
      <router-link v-if="!authStore.isLoggedIn" to="/register" class="btn btn-primary btn-lg">
        立即注册
      </router-link>
      <router-link v-else to="/playground" class="btn btn-primary btn-lg">
        进入练习场
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { knowledgeAPI, commentsAPI } from '@/services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const authStore = useAuthStore()

const popularKnowledge = ref([])
const recentComments = ref([])

const difficultyText = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级'
}

const formatTime = (time) => {
  return dayjs(time).fromNow()
}

onMounted(async () => {
  try {
    // 获取热门知识点
    const knowledgeRes = await knowledgeAPI.getPopular(4)
    if (knowledgeRes.data.success) {
      popularKnowledge.value = knowledgeRes.data.data.knowledgePoints
    }
    
    // 获取最新评论
    const commentsRes = await commentsAPI.getRecent(5)
    if (commentsRes.data.success) {
      recentComments.value = commentsRes.data.data.comments
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero区域 */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 3rem 0;
  min-height: 60vh;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1rem;
}

/* 代码预览 */
.hero-visual {
  display: flex;
  justify-content: center;
}

.code-preview {
  width: 100%;
  max-width: 480px;
  background: var(--bg-code);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.code-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27ca40; }

.code-title {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.code-content {
  padding: 1.5rem;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.8;
}

.code-content .keyword { color: #c678dd; }
.code-content .string { color: #98c379; }
.code-content .number { color: #d19a66; }

/* 功能特色 */
.features {
  padding: 4rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-glow);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 热门知识点 */
.popular-section {
  padding: 4rem 0;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.knowledge-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.knowledge-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.knowledge-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.knowledge-badge.beginner {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.knowledge-badge.intermediate {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.knowledge-badge.advanced {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.knowledge-card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.knowledge-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.knowledge-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* 最新评论 */
.recent-section {
  padding: 4rem 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-header .username {
  font-weight: 600;
  font-size: 0.875rem;
}

.comment-header .time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-content {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* CTA */
.cta {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: var(--radius-xl);
  margin: 2rem 0;
}

.cta h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.cta p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* 响应式 */
@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-visual {
    order: -1;
  }
  
  .features-grid,
  .knowledge-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .features-grid,
  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style>

