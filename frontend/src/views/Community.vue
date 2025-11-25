<template>
  <div class="community-page">
    <div class="page-header">
      <h1>💬 社区讨论</h1>
      <p>分享你的SQL学习心得，与其他学习者交流互动</p>
    </div>

    <!-- 发表评论区 -->
    <div class="comment-form-card" v-if="authStore.isLoggedIn">
      <h3>发表评论</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <textarea 
            v-model="newComment.content"
            placeholder="分享你的问题、心得或代码..."
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">SQL代码（可选）</label>
          <textarea 
            v-model="newComment.codeSnippet"
            placeholder="粘贴你的SQL代码，AI将自动分析..."
            rows="4"
            class="code-input"
          ></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting || !newComment.content.trim()">
            {{ submitting ? '发布中...' : '发布评论' }}
          </button>
        </div>
      </form>
    </div>
    <div v-else class="login-prompt">
      <p>💡 <router-link to="/login">登录</router-link> 后即可发表评论</p>
    </div>

    <!-- 评论列表 -->
    <div class="comments-section">
      <div class="section-header">
        <h2>全部评论 ({{ total }})</h2>
        <select v-model="sortBy" @change="loadComments" class="sort-select">
          <option value="latest">最新发布</option>
          <option value="popular">最多点赞</option>
        </select>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="comments.length === 0" class="empty-state">
        <div class="empty-state-icon">💭</div>
        <p class="empty-state-text">还没有评论，来发表第一条吧！</p>
      </div>

      <div v-else class="comments-list">
        <CommentItem 
          v-for="comment in comments" 
          :key="comment.id" 
          :comment="comment"
          @reply="handleReply"
          @like="handleLike"
          @delete="handleDelete"
          @ai-reply="handleAIReply"
        />
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="pagination-btn" 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >上一页</button>
        <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="pagination-btn" 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >下一页</button>
      </div>
    </div>

    <!-- 回复弹窗 -->
    <div v-if="replyingTo" class="modal-overlay" @click.self="replyingTo = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>回复 @{{ replyingTo.username }}</h3>
          <button class="btn-close" @click="replyingTo = null">×</button>
        </div>
        <form @submit.prevent="submitReply">
          <div class="form-group">
            <textarea 
              v-model="replyContent"
              placeholder="输入你的回复..."
              rows="4"
              ref="replyInput"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">SQL代码（可选）</label>
            <textarea 
              v-model="replyCode"
              placeholder="粘贴SQL代码..."
              rows="3"
              class="code-input"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="replyingTo = null">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!replyContent.trim()">发送回复</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { commentsAPI } from '@/services/api'
import CommentItem from '@/components/CommentItem.vue'

const authStore = useAuthStore()
const showToast = inject('showToast')

const comments = ref([])
const loading = ref(true)
const submitting = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const sortBy = ref('latest')

const newComment = ref({
  content: '',
  codeSnippet: ''
})

const replyingTo = ref(null)
const replyContent = ref('')
const replyCode = ref('')
const replyInput = ref(null)

// 加载评论
const loadComments = async (page = 1) => {
  loading.value = true
  try {
    const res = await commentsAPI.getAll({ page, limit: 10 })
    if (res.data.success) {
      comments.value = res.data.data.comments
      totalPages.value = res.data.data.totalPages
      total.value = res.data.data.total
      currentPage.value = page
    }
  } catch (error) {
    showToast('加载评论失败', 'error')
  } finally {
    loading.value = false
  }
}

// 发表评论
const handleSubmit = async () => {
  if (!newComment.value.content.trim()) return
  
  submitting.value = true
  try {
    const res = await commentsAPI.create({
      content: newComment.value.content,
      codeSnippet: newComment.value.codeSnippet || null
    })
    
    if (res.data.success) {
      showToast('评论发布成功！', 'success')
      newComment.value = { content: '', codeSnippet: '' }
      loadComments(1) // 刷新列表
    }
  } catch (error) {
    showToast(error.response?.data?.message || '发布失败', 'error')
  } finally {
    submitting.value = false
  }
}

// 回复评论
const handleReply = async (comment) => {
  if (!authStore.isLoggedIn) {
    showToast('请先登录', 'error')
    return
  }
  replyingTo.value = comment
  replyContent.value = ''
  replyCode.value = ''
  await nextTick()
  replyInput.value?.focus()
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) return
  
  try {
    const res = await commentsAPI.create({
      content: replyContent.value,
      codeSnippet: replyCode.value || null,
      parentId: replyingTo.value.id
    })
    
    if (res.data.success) {
      showToast('回复成功！', 'success')
      replyingTo.value = null
      loadComments(currentPage.value)
    }
  } catch (error) {
    showToast('回复失败', 'error')
  }
}

// 点赞
const handleLike = async (comment) => {
  if (!authStore.isLoggedIn) {
    showToast('请先登录', 'error')
    return
  }
  
  try {
    const res = await commentsAPI.like(comment.id)
    if (res.data.success) {
      // 更新本地状态
      comment.hasLiked = res.data.data.liked
      comment.likes_count += res.data.data.liked ? 1 : -1
    }
  } catch (error) {
    showToast('操作失败', 'error')
  }
}

// 删除评论
const handleDelete = async (comment) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const res = await commentsAPI.delete(comment.id)
    if (res.data.success) {
      showToast('删除成功', 'success')
      loadComments(currentPage.value)
    }
  } catch (error) {
    showToast('删除失败', 'error')
  }
}

// 请求AI回复
const handleAIReply = async (comment) => {
  try {
    showToast('正在请求AI回复...', 'info')
    const res = await commentsAPI.requestAIReply(comment.id)
    if (res.data.success) {
      showToast('AI已回复！', 'success')
      loadComments(currentPage.value)
    }
  } catch (error) {
    showToast('AI回复失败', 'error')
  }
}

// 换页
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    loadComments(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.community-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--text-secondary);
}

/* 发表评论 */
.comment-form-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.comment-form-card h3 {
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.code-input {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  background: var(--bg-code);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.login-prompt {
  text-align: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

/* 评论列表 */
.comments-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
  font-size: 1.125rem;
}

.sort-select {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  width: auto;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.125rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.btn-close:hover {
  color: var(--text-primary);
}
</style>

