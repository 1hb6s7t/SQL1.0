<template>
  <div class="exercises-page">
    <div class="page-header">
      <h1>🌾 智慧农业SQL实战练习</h1>
      <p class="subtitle">基于传感器监测系统，掌握SQL单表查询核心技能</p>
    </div>

    <!-- 数据库结构说明 -->
    <div class="schema-section card">
      <div class="schema-header" @click="showSchema = !showSchema">
        <h3>🌾 {{ schema.projectName || '练习数据库结构' }}</h3>
        <span class="toggle-icon">{{ showSchema ? '▼' : '▶' }}</span>
      </div>
      <div v-if="showSchema" class="schema-content">
        <div class="schema-intro">
          <p>{{ schema.projectDescription || '本练习基于传感器监测数据库' }}</p>
        </div>
        
        <!-- 表结构展示 -->
        <div class="tables-grid">
          <div v-for="table in schema.tables" :key="table.name" class="table-card">
            <h4>{{ table.name }} <span class="actual-name" v-if="table.actualName !== table.name">({{ table.actualName }})</span></h4>
            <p class="table-desc">{{ table.description }}</p>
            <table class="column-table">
              <thead>
                <tr>
                  <th>列名</th>
                  <th>类型</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="col in table.columns" :key="col.name">
                  <td class="col-name">{{ col.name }}</td>
                  <td class="col-type">{{ col.type }}</td>
                  <td>{{ col.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 示例数据 -->
        <div v-if="schema.sampleData && schema.sampleData.length > 0" class="sample-data-section">
          <h4>📋 示例数据</h4>
          <div class="sample-table-wrapper">
            <table class="sample-table">
              <thead>
                <tr>
                  <th v-for="key in Object.keys(schema.sampleData[0])" :key="key">{{ key }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in schema.sampleData" :key="index">
                  <td v-for="key in Object.keys(row)" :key="key">{{ row[key] ?? 'NULL' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 知识点列表 -->
        <div v-if="schema.knowledgePoints && schema.knowledgePoints.length > 0" class="knowledge-points-section">
          <h4>📚 涵盖知识点</h4>
          <ul class="knowledge-list">
            <li v-for="(point, index) in schema.knowledgePoints" :key="index">{{ point }}</li>
          </ul>
        </div>

        <div class="schema-note" v-if="schema.note">
          <strong>💡 说明：</strong>{{ schema.note }}
        </div>
      </div>
    </div>

    <!-- 例题列表 -->
    <div class="exercises-list">
      <h2>🎯 例题列表</h2>
      <div class="exercise-cards">
        <div 
          v-for="exercise in exercises" 
          :key="exercise.id" 
          class="exercise-card"
          :class="{ 
            'completed': userProgress[exercise.id]?.is_correct,
            'attempted': userProgress[exercise.id]?.attempt_count > 0 && !userProgress[exercise.id]?.is_correct
          }"
          @click="selectExercise(exercise)"
        >
          <div class="exercise-status">
            <span v-if="userProgress[exercise.id]?.is_correct" class="status-icon success">✅</span>
            <span v-else-if="userProgress[exercise.id]?.attempt_count > 0" class="status-icon attempted">🔄</span>
            <span v-else class="status-icon pending">📋</span>
          </div>
          <div class="exercise-info">
            <h4>{{ exercise.order_index }}. {{ exercise.title }}</h4>
            <p class="exercise-desc">{{ truncateDescription(exercise.description) }}</p>
            <div class="exercise-meta">
              <span class="difficulty" :class="exercise.difficulty">{{ difficultyText[exercise.difficulty] }}</span>
              <span class="category">{{ exercise.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 练习区域 -->
    <div v-if="selectedExercise" class="practice-section card" ref="practiceSection">
      <div class="practice-header">
        <h3>{{ selectedExercise.order_index }}. {{ selectedExercise.title }}</h3>
        <button class="btn-close" @click="selectedExercise = null">✕</button>
      </div>

      <div class="exercise-details">
        <div class="question-box">
          <h4>📌 题目要求</h4>
          <p class="description-text">{{ selectedExercise.description }}</p>
        </div>

        <div class="hint-box" v-if="selectedExercise.hint">
          <h4>💡 提示</h4>
          <p>{{ selectedExercise.hint }}</p>
        </div>

        <div class="knowledge-box" v-if="selectedExercise.knowledge_point">
          <h4>📚 知识点</h4>
          <p>{{ selectedExercise.knowledge_point }}</p>
        </div>
      </div>

      <!-- SQL编辑器 -->
      <div class="sql-editor">
        <h4>✏️ 编写SQL语句</h4>
        <textarea 
          v-model="userSQL" 
          placeholder="在此输入你的SQL查询语句..."
          @keydown.ctrl.enter="executeSQL"
        ></textarea>
        <div class="editor-actions">
          <button class="btn btn-secondary" @click="executeSQL" :disabled="executing">
            {{ executing ? '执行中...' : '▶ 运行查询' }}
          </button>
          <button class="btn btn-primary" @click="submitAnswer" :disabled="submitting">
            {{ submitting ? '提交中...' : '📤 提交答案' }}
          </button>
          <button class="btn btn-outline" @click="getAIHint" :disabled="gettingHint">
            {{ gettingHint ? '获取中...' : '🤖 AI提示' }}
          </button>
        </div>
      </div>

      <!-- 执行结果 -->
      <div v-if="queryResult" class="result-section">
        <h4>📊 查询结果</h4>
        <div v-if="queryResult.success" class="result-success">
          <p class="result-info">返回 {{ queryResult.rowCount }} 行数据</p>
          <div class="result-table-wrapper">
            <table v-if="queryResult.rows.length > 0" class="result-table">
              <thead>
                <tr>
                  <th v-for="field in queryResult.fields" :key="field">{{ field }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in queryResult.rows" :key="index">
                  <td v-for="field in queryResult.fields" :key="field">{{ row[field] ?? 'NULL' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="no-data">查询结果为空</p>
          </div>
        </div>
        <div v-else class="result-error">
          <p>❌ {{ queryResult.error }}</p>
        </div>
      </div>

      <!-- 提交结果 -->
      <div v-if="submitResult" class="submit-result" :class="{ correct: submitResult.isCorrect, incorrect: !submitResult.isCorrect }">
        <div class="result-header">
          <span v-if="submitResult.isCorrect" class="result-icon">🎉</span>
          <span v-else class="result-icon">💪</span>
          <h4>{{ submitResult.message }}</h4>
        </div>
        <p v-if="submitResult.attemptCount" class="attempt-info">第 {{ submitResult.attemptCount }} 次尝试</p>
        
        <!-- AI反馈 -->
        <div v-if="submitResult.aiFeedback" class="ai-feedback">
          <h5>🤖 AI分析与建议</h5>
          <div class="feedback-content" v-html="formatFeedback(submitResult.aiFeedback)"></div>
        </div>
      </div>

      <!-- AI提示 -->
      <div v-if="aiHint" class="ai-hint card">
        <h5>💡 AI提示</h5>
        <div class="hint-content" v-html="formatFeedback(aiHint)"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { exerciseAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 状态
const loading = ref(true)
const exercises = ref([])
const schema = ref({ tables: [], note: '' })
const userProgress = ref({})
const selectedExercise = ref(null)
const userSQL = ref('')
const queryResult = ref(null)
const submitResult = ref(null)
const aiHint = ref(null)
const showSchema = ref(true)

// 操作状态
const executing = ref(false)
const submitting = ref(false)
const gettingHint = ref(false)

// 引用
const practiceSection = ref(null)

// 难度文本
const difficultyText = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级'
}

// 加载例题列表
const loadExercises = async () => {
  try {
    const response = await exerciseAPI.getAll()
    if (response.data.success) {
      exercises.value = response.data.data.exercises
    }
  } catch (error) {
    console.error('加载例题失败:', error)
  }
}

// 加载数据库结构
const loadSchema = async () => {
  try {
    const response = await exerciseAPI.getSchema()
    if (response.data.success) {
      schema.value = response.data.data.schema
    }
  } catch (error) {
    console.error('加载数据库结构失败:', error)
  }
}

// 加载用户进度
const loadUserProgress = async () => {
  if (!authStore.isLoggedIn) return
  
  try {
    const response = await exerciseAPI.getUserProgress()
    if (response.data.success) {
      // 转换为以 exercise_id 为 key 的对象
      const progress = {}
      response.data.data.progress.forEach(p => {
        progress[p.id] = p
      })
      userProgress.value = progress
    }
  } catch (error) {
    console.error('加载用户进度失败:', error)
  }
}

// 选择例题
const selectExercise = async (exercise) => {
  selectedExercise.value = exercise
  userSQL.value = ''
  queryResult.value = null
  submitResult.value = null
  aiHint.value = null
  
  // 滚动到练习区域
  await nextTick()
  if (practiceSection.value) {
    practiceSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

// 执行SQL
const executeSQL = async () => {
  if (!userSQL.value.trim()) return
  
  executing.value = true
  queryResult.value = null
  
  try {
    const response = await exerciseAPI.executeSQL(userSQL.value)
    queryResult.value = response.data.data
  } catch (error) {
    queryResult.value = {
      success: false,
      error: error.response?.data?.message || '执行失败'
    }
  } finally {
    executing.value = false
  }
}

// 提交答案
const submitAnswer = async () => {
  if (!userSQL.value.trim()) return
  
  if (!authStore.isLoggedIn) {
    alert('请先登录后再提交答案')
    return
  }
  
  submitting.value = true
  submitResult.value = null
  
  try {
    const response = await exerciseAPI.submitAnswer(selectedExercise.value.id, userSQL.value)
    if (response.data.success) {
      submitResult.value = response.data.data
      // 更新进度
      await loadUserProgress()
    }
  } catch (error) {
    submitResult.value = {
      isCorrect: false,
      message: error.response?.data?.message || '提交失败'
    }
  } finally {
    submitting.value = false
  }
}

// 获取AI提示
const getAIHint = async () => {
  if (!authStore.isLoggedIn) {
    alert('请先登录后再获取AI提示')
    return
  }
  
  gettingHint.value = true
  aiHint.value = null
  
  try {
    const response = await exerciseAPI.getHint(selectedExercise.value.id, userSQL.value)
    if (response.data.success) {
      aiHint.value = response.data.data.hint
    }
  } catch (error) {
    aiHint.value = '获取提示失败，请稍后重试'
  } finally {
    gettingHint.value = false
  }
}

// 格式化反馈内容（支持简单markdown）
const formatFeedback = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 截断描述文字（用于列表展示）
const truncateDescription = (text) => {
  if (!text) return ''
  // 去除【场景】部分，只显示核心描述
  const cleanText = text.replace(/【场景】[^\n]*\n\n?/g, '')
  return cleanText.length > 50 ? cleanText.substring(0, 50) + '...' : cleanText
}

// 初始化
onMounted(async () => {
  loading.value = true
  await Promise.all([
    loadExercises(),
    loadSchema(),
    loadUserProgress()
  ])
  loading.value = false
})
</script>

<style scoped>
.exercises-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--accent-primary);
}

.subtitle {
  color: var(--text-secondary);
}

/* 数据库结构说明 */
.schema-section {
  margin-bottom: 2rem;
}

.schema-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 1rem;
  background: rgba(0, 191, 255, 0.1);
  border-radius: var(--radius-md);
  transition: background 0.3s ease;
}

.schema-header:hover {
  background: rgba(0, 191, 255, 0.15);
}

.schema-header h3 {
  margin: 0;
  color: var(--accent-primary);
}

.toggle-icon {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.schema-content {
  padding: 1rem;
}

.schema-intro {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.table-card {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.table-card h4 {
  color: var(--accent-secondary);
  margin-bottom: 0.5rem;
}

.actual-name {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: normal;
}

.table-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.column-table {
  width: 100%;
  font-size: 0.85rem;
  border-collapse: collapse;
}

.column-table th,
.column-table td {
  padding: 0.4rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.column-table th {
  color: var(--accent-primary);
  font-weight: 500;
}

.col-name {
  color: var(--accent-secondary);
  font-family: monospace;
}

.col-type {
  color: var(--text-muted);
  font-family: monospace;
  font-size: 0.8rem;
}

.schema-note {
  padding: 0.75rem;
  background: rgba(0, 191, 255, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-primary);
  font-size: 0.9rem;
  margin-top: 1rem;
}

/* 示例数据 */
.sample-data-section {
  margin-top: 1.5rem;
}

.sample-data-section h4 {
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.sample-table-wrapper {
  overflow-x: auto;
}

.sample-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.sample-table th,
.sample-table td {
  padding: 0.5rem;
  text-align: left;
  border: 1px solid var(--border-color);
}

.sample-table th {
  background: rgba(0, 191, 255, 0.15);
  color: var(--accent-primary);
  font-weight: 500;
}

.sample-table td {
  font-family: monospace;
  background: rgba(0, 0, 0, 0.2);
}

/* 知识点列表 */
.knowledge-points-section {
  margin-top: 1.5rem;
}

.knowledge-points-section h4 {
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.knowledge-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.knowledge-list li {
  padding: 0.5rem 0.75rem;
  background: rgba(0, 191, 255, 0.08);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-left: 2px solid var(--accent-primary);
}

/* 知识点框 */
.knowledge-box {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid var(--success);
}

.knowledge-box h4 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--success);
}

/* 描述文字样式 */
.description-text {
  white-space: pre-line;
  line-height: 1.7;
}

/* 例题列表 */
.exercises-list h2 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.exercise-cards {
  display: grid;
  gap: 1rem;
}

.exercise-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.exercise-card:hover {
  transform: translateX(5px);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 15px rgba(0, 191, 255, 0.2);
}

.exercise-card.completed {
  border-color: var(--success);
  background: rgba(16, 185, 129, 0.05);
}

.exercise-card.attempted {
  border-color: var(--warning);
  background: rgba(255, 193, 7, 0.05);
}

.exercise-status {
  font-size: 1.5rem;
}

.exercise-info h4 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.exercise-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.exercise-meta {
  display: flex;
  gap: 0.5rem;
}

.difficulty, .category {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
}

.difficulty.beginner {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.difficulty.intermediate {
  background: rgba(255, 193, 7, 0.2);
  color: var(--warning);
}

.difficulty.advanced {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.category {
  background: rgba(0, 191, 255, 0.15);
  color: var(--accent-primary);
}

/* 练习区域 */
.practice-section {
  margin-top: 2rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.practice-header h3 {
  color: var(--accent-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.btn-close:hover {
  color: var(--error);
}

.exercise-details {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.question-box, .hint-box {
  padding: 1rem;
  border-radius: var(--radius-md);
}

.question-box {
  background: rgba(0, 191, 255, 0.1);
  border-left: 3px solid var(--accent-primary);
}

.hint-box {
  background: rgba(59, 130, 246, 0.1);
  border-left: 3px solid var(--info);
}

.question-box h4, .hint-box h4 {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* SQL编辑器 */
.sql-editor {
  margin-bottom: 1.5rem;
}

.sql-editor h4 {
  margin-bottom: 0.5rem;
}

.sql-editor textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.95rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  resize: vertical;
}

.sql-editor textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.2);
}

.editor-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.btn-outline:hover {
  background: rgba(0, 191, 255, 0.1);
}

/* 结果区域 */
.result-section {
  margin-bottom: 1.5rem;
}

.result-section h4 {
  margin-bottom: 0.5rem;
}

.result-success {
  background: rgba(16, 185, 129, 0.1);
  padding: 1rem;
  border-radius: var(--radius-md);
}

.result-info {
  color: var(--success);
  margin-bottom: 0.5rem;
}

.result-table-wrapper {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.result-table th,
.result-table td {
  padding: 0.5rem;
  text-align: left;
  border: 1px solid var(--border-color);
}

.result-table th {
  background: rgba(0, 191, 255, 0.15);
  color: var(--accent-primary);
}

.result-table td {
  font-family: monospace;
}

.no-data {
  color: var(--text-muted);
  text-align: center;
  padding: 1rem;
}

.result-error {
  background: rgba(239, 68, 68, 0.1);
  padding: 1rem;
  border-radius: var(--radius-md);
  color: var(--error);
}

/* 提交结果 */
.submit-result {
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.submit-result.correct {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--success);
}

.submit-result.incorrect {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid var(--error);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.result-icon {
  font-size: 1.5rem;
}

.result-header h4 {
  margin: 0;
}

.attempt-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* AI反馈 */
.ai-feedback, .ai-hint {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--accent-secondary);
}

.ai-feedback h5, .ai-hint h5 {
  color: var(--accent-secondary);
  margin-bottom: 0.5rem;
}

.feedback-content, .hint-content {
  line-height: 1.6;
  color: var(--text-primary);
}

.feedback-content code, .hint-content code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: monospace;
  color: var(--accent-primary);
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 768px) {
  .exercises-page {
    padding: 1rem;
  }
  
  .tables-grid {
    grid-template-columns: 1fr;
  }
  
  .editor-actions {
    flex-direction: column;
  }
}
</style>

