<template>
  <div class="home">
    <!-- Hero区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">《数据库原理与应用》<br><span class="gradient-text">智能学习平台</span></h1>
        <p class="hero-subtitle">聚焦数据库原理、SQL实训、案例化练习与智能辅导，帮助学习者从基础语法快速过渡到项目实战。</p>
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
            <span class="code-title">welcome.sql</span>
          </div>
          <pre class="code-content"><code><span class="keyword">SELECT</span> future, success
<span class="keyword">FROM</span> efforts
<span class="keyword">WHERE</span> passion = <span class="string">'True'</span>
<span class="keyword">AND</span> persistence = <span class="string">'True'</span>
<span class="keyword">ORDER BY</span> created_at <span class="keyword">DESC</span>;</code></pre>
        </div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="features">
      <div class="section-header-wrapper">
        <h2 class="section-title">平台特色</h2>
        <div class="section-line"></div>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>系统化知识库</h3>
          <p>覆盖数据库原理、SQL语法、查询优化与实战案例，按难度分层学习。</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>AI智能助手</h3>
          <p>支持 SQL 纠错、结果分析、解题提示与思路讲解，辅助课堂教学与自主训练。</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3>案例驱动练习</h3>
          <p>围绕真实业务场景设计题目，从单表查询到视图应用，强化解决问题能力。</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>学习追踪</h3>
          <p>记录答题进度、错误类型与掌握情况，便于教师组织教学、学生查漏补缺。</p>
        </div>
      </div>
    </section>

    <!-- 热门知识点 -->
    <section class="popular-section" v-if="popularKnowledge.length">
      <div class="section-header-wrapper">
        <h2 class="section-title">热门知识点</h2>
        <div class="section-line"></div>
      </div>
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
      <div class="section-header-wrapper">
        <h2 class="section-title">社区动态</h2>
        <div class="section-line"></div>
      </div>
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
      <h2>准备好开始数据库实战训练了吗？</h2>
      <p>立即进入平台，体验知识学习、案例练习与智能辅导。</p>
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
  padding: 4rem 0;
  min-height: 70vh;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.gradient-text {
  background: linear-gradient(135deg, #00BFFF, #87CEEB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 2rem;
  border-left: 4px solid var(--accent-primary);
  padding-left: 1rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn-lg {
  padding: 0.875rem 2.5rem;
  font-size: 1.1rem;
}

/* 代码预览 */
.hero-visual {
  display: flex;
  justify-content: center;
  perspective: 1000px;
}

.code-preview {
  width: 100%;
  max-width: 480px;
  background: rgba(5, 10, 26, 0.9);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0, 191, 255, 0.2);
  transform: rotateY(-10deg) rotateX(5deg);
  transition: transform 0.5s ease;
}

.code-preview:hover {
  transform: rotateY(0) rotateX(0) scale(1.02);
}

.code-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
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
  font-size: 1rem;
  line-height: 1.8;
  font-family: var(--font-mono);
}

.code-content .keyword { color: #00BFFF; font-weight: bold; }
.code-content .string { color: #98FB98; }
.code-content .number { color: #FF7F50; }

/* 通用区块标题 */
.section-header-wrapper {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  display: inline-block;
  padding: 0 1rem;
  background: transparent; /* 遮挡线条 - 这里背景是透明的，所以不能用颜色遮挡 */
  position: relative;
  z-index: 2;
}

/* 修改：由于背景是动态的，不能用纯色遮挡线条，改为两段线条 */
.section-line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--accent-primary) 30%, transparent 50%, var(--accent-primary) 70%, transparent 100%);
  z-index: 1;
}

/* 功能特色 */
.features {
  padding: 4rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: rgba(0, 31, 63, 0.4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  transform: translateY(-10px);
  border-color: var(--accent-primary);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3), 0 0 15px var(--accent-glow);
  background: rgba(0, 51, 102, 0.6);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 5px rgba(0, 191, 255, 0.5));
}

.feature-card h3 {
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
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
  background: rgba(0, 31, 63, 0.4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.knowledge-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent-primary);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.knowledge-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.knowledge-card:hover::after {
  transform: scaleX(1);
}

.knowledge-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 999px;
  margin-bottom: 1rem;
  border: 1px solid transparent;
}

.knowledge-badge.beginner {
  background: rgba(50, 205, 50, 0.15);
  color: #32CD32;
  border-color: rgba(50, 205, 50, 0.3);
}

.knowledge-badge.intermediate {
  background: rgba(255, 215, 0, 0.15);
  color: #FFD700;
  border-color: rgba(255, 215, 0, 0.3);
}

.knowledge-badge.advanced {
  background: rgba(255, 99, 71, 0.15);
  color: #FF6347;
  border-color: rgba(255, 99, 71, 0.3);
}

.knowledge-card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
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
  background: rgba(0, 31, 63, 0.4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.comment-item:hover {
  background: rgba(0, 51, 102, 0.6);
  border-color: var(--accent-primary);
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00BFFF, #1E90FF);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
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
  color: var(--accent-primary);
}

.comment-header .time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.comment-content {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
}

/* CTA */
.cta {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(30, 144, 255, 0.1));
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  margin: 2rem 0;
  position: relative;
  overflow: hidden;
}

.cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(0, 191, 255, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.cta h2 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: var(--accent-primary);
  position: relative;
  z-index: 1;
}

.cta p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
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
  
  .hero-subtitle {
    border-left: none;
    border-bottom: 4px solid var(--accent-primary);
    padding-bottom: 1rem;
    padding-left: 0;
    display: inline-block;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-visual {
    order: -1;
    transform: none;
  }
  
  .code-preview {
    transform: none;
  }
  
  .code-preview:hover {
    transform: scale(1.02);
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
