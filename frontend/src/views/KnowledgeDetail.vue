<template>
  <div class="detail-page">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!knowledge" class="empty-state">
      <div class="empty-state-icon">😕</div>
      <p class="empty-state-text">知识点不存在</p>
      <router-link to="/knowledge" class="btn btn-primary">返回知识库</router-link>
    </div>

    <template v-else>
      <!-- 返回按钮 -->
      <div class="back-nav">
        <router-link to="/knowledge" class="back-link">← 返回知识库</router-link>
      </div>

      <!-- 主内容 -->
      <article class="knowledge-article">
        <header class="article-header">
          <div class="meta">
            <span class="difficulty-badge" :class="knowledge.difficulty">
              {{ difficultyText[knowledge.difficulty] }}
            </span>
            <span class="category">📁 {{ knowledge.category }}</span>
            <span class="views">👁 {{ knowledge.view_count }} 次浏览</span>
          </div>
          <h1>{{ knowledge.title }}</h1>
        </header>

        <section class="article-content">
          <h2>📖 概述</h2>
          <p>{{ knowledge.content }}</p>
        </section>

        <section v-if="knowledge.examples" class="article-section">
          <h2>💡 示例代码</h2>
          <div class="code-block">
            <pre><code v-html="highlightSQL(knowledge.examples)"></code></pre>
          </div>
        </section>

        <section v-if="knowledge.common_mistakes" class="article-section mistakes">
          <h2>⚠️ 常见错误</h2>
          <div class="mistakes-content">
            <p v-for="(mistake, index) in parseMistakes(knowledge.common_mistakes)" :key="index">
              {{ mistake }}
            </p>
          </div>
        </section>

        <!-- AI问答 -->
        <section class="ai-section">
          <h2>🤖 AI助手</h2>
          <p class="ai-intro">有问题？向AI助手提问关于「{{ knowledge.title }}」的任何问题</p>
          
          <div class="ai-chat">
            <div class="chat-messages" ref="chatContainer">
              <div 
                v-for="(msg, index) in chatMessages" 
                :key="index" 
                class="chat-message"
                :class="msg.role"
              >
                <div class="message-avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
                <div class="message-content" v-html="formatMessage(msg.content)"></div>
              </div>
              <div v-if="aiLoading" class="chat-message assistant">
                <div class="message-avatar">🤖</div>
                <div class="message-content typing">正在思考...</div>
              </div>
            </div>
            
            <div class="chat-input">
              <textarea 
                v-model="question"
                placeholder="输入你的问题..."
                rows="2"
                @keydown.enter.ctrl="askAI"
              ></textarea>
              <button @click="askAI" class="btn btn-primary" :disabled="!question.trim() || aiLoading">
                发送
              </button>
            </div>
          </div>
        </section>
      </article>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { knowledgeAPI, aiAPI } from '@/services/api'

const route = useRoute()
const loading = ref(true)
const knowledge = ref(null)
const question = ref('')
const chatMessages = ref([])
const aiLoading = ref(false)
const chatContainer = ref(null)

const difficultyText = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级'
}

// SQL语法高亮
const highlightSQL = (code) => {
  if (!code) return ''
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 
    'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'ON', 'AS', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
    'TABLE', 'INDEX', 'ALTER', 'DROP', 'NULL', 'IS', 'BETWEEN', 'DISTINCT',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
    'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS']
  
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  result = result.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>')
  result = result.replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>')
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(regex, '<span class="sql-keyword">$1</span>')
  })
  
  return result
}

// 解析错误列表
const parseMistakes = (text) => {
  if (!text) return []
  return text.split('\n').filter(line => line.trim())
}

// 格式化消息
const formatMessage = (content) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 向AI提问
const askAI = async () => {
  if (!question.value.trim() || aiLoading.value) return
  
  const userQuestion = question.value
  question.value = ''
  
  chatMessages.value.push({
    role: 'user',
    content: userQuestion
  })
  
  scrollToBottom()
  aiLoading.value = true
  
  try {
    const res = await aiAPI.ask(`关于SQL知识点"${knowledge.value.title}"的问题：${userQuestion}`)
    if (res.data.success) {
      chatMessages.value.push({
        role: 'assistant',
        content: res.data.data.answer
      })
    }
  } catch (error) {
    chatMessages.value.push({
      role: 'assistant',
      content: '抱歉，回答问题时出错了，请稍后重试。'
    })
  } finally {
    aiLoading.value = false
    scrollToBottom()
  }
}

// 加载知识点
onMounted(async () => {
  try {
    const res = await knowledgeAPI.getById(route.params.id)
    if (res.data.success) {
      knowledge.value = res.data.data.knowledgePoint
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
}

.back-nav {
  margin-bottom: 1.5rem;
}

.back-link {
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--accent-primary);
}

/* 文章样式 */
.knowledge-article {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.article-header {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-bottom: 1px solid var(--border-color);
}

.article-header .meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 999px;
}

.difficulty-badge.beginner {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.difficulty-badge.intermediate {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.difficulty-badge.advanced {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.category, .views {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.article-header h1 {
  font-size: 1.75rem;
  line-height: 1.3;
}

.article-content,
.article-section {
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.article-content h2,
.article-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.article-content p,
.article-section p {
  color: var(--text-secondary);
  line-height: 1.8;
}

/* 代码块 */
.code-block {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.code-block pre {
  margin: 0;
  padding: 1.5rem;
  background: var(--bg-code);
  overflow-x: auto;
}

.code-block code {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.8;
}

.code-block :deep(.sql-keyword) {
  color: #c678dd;
  font-weight: 500;
}

.code-block :deep(.sql-string) {
  color: #98c379;
}

.code-block :deep(.sql-number) {
  color: #d19a66;
}

/* 错误提示 */
.mistakes {
  background: rgba(239, 68, 68, 0.05);
}

.mistakes-content {
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--error);
}

.mistakes-content p {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.mistakes-content p:last-child {
  margin-bottom: 0;
}

.mistakes-content p::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--error);
}

/* AI聊天 */
.ai-section {
  padding: 2rem;
}

.ai-section h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.ai-intro {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.ai-chat {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.chat-messages {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg-primary);
}

.chat-message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.chat-message:last-child {
  margin-bottom: 0;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  line-height: 1.6;
}

.chat-message.user .message-content {
  background: var(--accent-primary);
  color: white;
  margin-left: 2rem;
}

.chat-message.assistant .message-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.message-content :deep(code) {
  background: rgba(0,0,0,0.2);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.85em;
}

.typing {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chat-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.chat-input textarea {
  flex: 1;
  resize: none;
}

.chat-input .btn {
  align-self: flex-end;
}
</style>

