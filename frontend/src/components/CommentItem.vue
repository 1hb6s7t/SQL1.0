<template>
  <div class="comment-item" :class="{ 'ai-comment': comment.is_ai_reply }">
    <div class="comment-avatar" :class="{ 'ai-avatar': comment.is_ai_reply }">
      {{ comment.is_ai_reply ? '🤖' : (comment.username?.[0]?.toUpperCase() || '?') }}
    </div>
    
    <div class="comment-content">
      <div class="comment-header">
        <span class="username" :class="{ 'ai-name': comment.is_ai_reply }">
          {{ comment.is_ai_reply ? 'AI助手' : comment.username }}
        </span>
        <span v-if="comment.is_ai_reply" class="ai-badge">AI</span>
        <span v-if="comment.is_edited" class="edited-badge">已编辑</span>
        <span class="time">{{ formatTime(comment.created_at) }}</span>
      </div>
      
      <div class="comment-body">
        <p class="content-text" v-html="formatContent(comment.content)"></p>
        
        <!-- SQL代码块 -->
        <div v-if="comment.code_snippet" class="code-block">
          <div class="code-header">
            <span>SQL</span>
            <button @click="copyCode" class="copy-btn">📋 复制</button>
          </div>
          <pre><code v-html="highlightSQL(comment.code_snippet)"></code></pre>
        </div>
      </div>
      
      <div class="comment-actions">
        <button 
          class="action-btn" 
          :class="{ liked: comment.hasLiked }"
          @click="$emit('like', comment)"
        >
          {{ comment.hasLiked ? '❤️' : '🤍' }} {{ comment.likes_count || 0 }}
        </button>
        <button class="action-btn" @click="$emit('reply', comment)">
          💬 回复
        </button>
        <button 
          v-if="!comment.is_ai_reply" 
          class="action-btn"
          @click="$emit('ai-reply', comment)"
        >
          🤖 AI回复
        </button>
        <button 
          v-if="canDelete" 
          class="action-btn delete-btn"
          @click="$emit('delete', comment)"
        >
          🗑️ 删除
        </button>
      </div>
      
      <!-- 回复数量 -->
      <div v-if="comment.reply_count > 0" class="reply-count" @click="toggleReplies">
        {{ showReplies ? '收起' : '展开' }} {{ comment.reply_count }} 条回复
      </div>
      
      <!-- 回复列表 -->
      <div v-if="showReplies && replies.length" class="replies-list">
        <CommentItem 
          v-for="reply in replies" 
          :key="reply.id" 
          :comment="reply"
          @reply="$emit('reply', reply)"
          @like="$emit('like', reply)"
          @delete="$emit('delete', reply)"
          @ai-reply="$emit('ai-reply', reply)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { commentsAPI } from '@/services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
})

defineEmits(['reply', 'like', 'delete', 'ai-reply'])

const authStore = useAuthStore()
const showReplies = ref(false)
const replies = ref([])
const loadingReplies = ref(false)

// 判断是否可以删除（自己的评论或管理员）
const canDelete = computed(() => {
  if (!authStore.user) return false
  return authStore.user.id === props.comment.user_id || authStore.user.role === 'admin'
})

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).fromNow()
}

// 格式化内容（简单的markdown支持）
const formatContent = (content) => {
  if (!content) return ''
  // 转义HTML，然后处理简单格式
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

// SQL语法高亮
const highlightSQL = (code) => {
  if (!code) return ''
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 
    'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'ON', 'AS', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
    'TABLE', 'INDEX', 'ALTER', 'DROP', 'NULL', 'IS', 'BETWEEN', 'DISTINCT',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
    'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'PRIMARY', 'KEY']
  
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // 高亮字符串
  result = result.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>')
  
  // 高亮数字
  result = result.replace(/\b(\d+)\b/g, '<span class="sql-number">$1</span>')
  
  // 高亮关键字
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(regex, '<span class="sql-keyword">$1</span>')
  })
  
  return result
}

// 复制代码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.comment.code_snippet)
    // 可以添加toast提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 切换回复显示
const toggleReplies = async () => {
  if (!showReplies.value && replies.value.length === 0) {
    loadingReplies.value = true
    try {
      const res = await commentsAPI.getAll({ parentId: props.comment.id, limit: 50 })
      if (res.data.success) {
        replies.value = res.data.data.comments
      }
    } catch (error) {
      console.error('加载回复失败:', error)
    } finally {
      loadingReplies.value = false
    }
  }
  showReplies.value = !showReplies.value
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.comment-item.ai-comment {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.2);
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

.comment-avatar.ai-avatar {
  background: linear-gradient(135deg, #10b981, #06b6d4);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.username {
  font-weight: 600;
  font-size: 0.875rem;
}

.username.ai-name {
  color: var(--success);
}

.ai-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: white;
  border-radius: 999px;
}

.edited-badge {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.time {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: auto;
}

.comment-body {
  margin-bottom: 0.75rem;
}

.content-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
}

.content-text :deep(code) {
  background: var(--bg-code);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--accent-tertiary);
}

/* 代码块 */
.code-block {
  margin-top: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.code-block .code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.copy-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.copy-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.code-block pre {
  margin: 0;
  padding: 1rem;
  background: var(--bg-code);
  overflow-x: auto;
}

.code-block code {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
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

/* 操作按钮 */
.comment-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.action-btn.liked {
  color: #ef4444;
}

.action-btn.delete-btn:hover {
  color: var(--error);
}

/* 回复 */
.reply-count {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--accent-primary);
  cursor: pointer;
  padding: 0.25rem 0;
}

.reply-count:hover {
  text-decoration: underline;
}

.replies-list {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.replies-list .comment-item {
  padding: 0.75rem;
}

.replies-list .comment-avatar {
  width: 32px;
  height: 32px;
  font-size: 0.8rem;
}
</style>

