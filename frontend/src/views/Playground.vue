<template>
  <div class="playground-page">
    <div class="page-header">
      <h1>🚀 SQL练习场</h1>
      <p>实时运行SQL代码，获取AI智能分析和纠错建议</p>
    </div>

    <div class="playground-container">
      <!-- 左侧：代码编辑器 -->
      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-title">📝 SQL编辑器</span>
          <div class="editor-actions">
            <button @click="clearCode" class="btn btn-ghost btn-sm">清空</button>
            <button @click="loadExample" class="btn btn-ghost btn-sm">示例</button>
          </div>
        </div>
        
        <div class="editor-wrapper">
          <textarea 
            v-model="sqlCode"
            class="sql-editor"
            placeholder="在此输入SQL代码...

示例：
SELECT * FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;"
            spellcheck="false"
          ></textarea>
          <div class="line-numbers" ref="lineNumbers">
            <span v-for="n in lineCount" :key="n">{{ n }}</span>
          </div>
        </div>

        <div class="editor-footer">
          <button @click="analyzeSQL" class="btn btn-primary" :disabled="!sqlCode.trim() || analyzing">
            <span v-if="analyzing" class="spinner-small"></span>
            {{ analyzing ? '分析中...' : '🔍 分析代码' }}
          </button>
          <button @click="correctSQL" class="btn btn-secondary" :disabled="!sqlCode.trim() || correcting">
            <span v-if="correcting" class="spinner-small"></span>
            {{ correcting ? '纠错中...' : '🔧 智能纠错' }}
          </button>
        </div>
      </div>

      <!-- 右侧：AI分析结果 -->
      <div class="result-panel">
        <div class="panel-header">
          <span class="panel-title">🤖 AI分析结果</span>
        </div>
        
        <div class="result-content">
          <div v-if="!analysisResult && !correctionResult" class="placeholder">
            <div class="placeholder-icon">💡</div>
            <p>输入SQL代码后点击"分析代码"或"智能纠错"</p>
            <p class="hint">AI将帮你检查语法、优化建议、常见错误等</p>
          </div>

          <div v-else class="result-text" v-html="formattedResult"></div>
        </div>
      </div>
    </div>

    <!-- 功能卡片 -->
    <div class="feature-cards">
      <div class="feature-card" @click="showExerciseModal = true">
        <div class="feature-icon">📝</div>
        <h3>生成练习题</h3>
        <p>AI根据主题生成SQL练习题</p>
      </div>
      <div class="feature-card" @click="showAskModal = true">
        <div class="feature-icon">❓</div>
        <h3>问答助手</h3>
        <p>向AI提问任何SQL问题</p>
      </div>
      <div class="feature-card" @click="loadWeeklySummary">
        <div class="feature-icon">📊</div>
        <h3>易错点总结</h3>
        <p>查看本周常见SQL错误</p>
      </div>
    </div>

    <!-- 练习题弹窗 -->
    <div v-if="showExerciseModal" class="modal-overlay" @click.self="showExerciseModal = false">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>📝 生成SQL练习题</h3>
          <button class="btn-close" @click="showExerciseModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">练习主题</label>
            <input v-model="exerciseTopic" type="text" placeholder="如：JOIN连接、子查询、聚合函数..." />
          </div>
          <div class="form-group">
            <label class="form-label">难度级别</label>
            <select v-model="exerciseDifficulty">
              <option value="beginner">入门</option>
              <option value="intermediate">进阶</option>
              <option value="advanced">高级</option>
            </select>
          </div>
          <button @click="generateExercise" class="btn btn-primary" :disabled="!exerciseTopic.trim() || generatingExercise">
            {{ generatingExercise ? '生成中...' : '生成练习题' }}
          </button>
          
          <div v-if="exerciseContent" class="exercise-result" v-html="formattedExercise"></div>
        </div>
      </div>
    </div>

    <!-- 问答弹窗 -->
    <div v-if="showAskModal" class="modal-overlay" @click.self="showAskModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>❓ AI问答助手</h3>
          <button class="btn-close" @click="showAskModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">你的问题</label>
            <textarea v-model="askQuestion" rows="3" placeholder="输入你想问的SQL问题..."></textarea>
          </div>
          <button @click="submitQuestion" class="btn btn-primary" :disabled="!askQuestion.trim() || asking">
            {{ asking ? '思考中...' : '提交问题' }}
          </button>
          
          <div v-if="askAnswer" class="answer-result" v-html="formattedAnswer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { aiAPI } from '@/services/api'
import { marked } from 'marked'

const authStore = useAuthStore()
const showToast = inject('showToast')

const sqlCode = ref('')
const analyzing = ref(false)
const correcting = ref(false)
const analysisResult = ref('')
const correctionResult = ref('')

// 练习题
const showExerciseModal = ref(false)
const exerciseTopic = ref('')
const exerciseDifficulty = ref('beginner')
const generatingExercise = ref(false)
const exerciseContent = ref('')

// 问答
const showAskModal = ref(false)
const askQuestion = ref('')
const asking = ref(false)
const askAnswer = ref('')

// 计算行数
const lineCount = computed(() => {
  return Math.max(sqlCode.value.split('\n').length, 10)
})

// 格式化结果
const formattedResult = computed(() => {
  const content = analysisResult.value || correctionResult.value
  if (!content) return ''
  return marked(content)
})

const formattedExercise = computed(() => {
  if (!exerciseContent.value) return ''
  return marked(exerciseContent.value)
})

const formattedAnswer = computed(() => {
  if (!askAnswer.value) return ''
  return marked(askAnswer.value)
})

// 清空代码
const clearCode = () => {
  sqlCode.value = ''
  analysisResult.value = ''
  correctionResult.value = ''
}

// 加载示例
const loadExample = () => {
  sqlCode.value = `-- 查询活跃用户及其订单数量
SELECT 
    u.username,
    u.email,
    COUNT(o.id) AS order_count,
    SUM(o.total_amount) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
    AND u.created_at >= '2024-01-01'
GROUP BY u.id, u.username, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;`
}

// 分析SQL
const analyzeSQL = async () => {
  if (!sqlCode.value.trim()) return
  
  analyzing.value = true
  correctionResult.value = ''
  
  try {
    const res = await aiAPI.analyze(sqlCode.value)
    if (res.data.success) {
      analysisResult.value = res.data.data.analysis
    }
  } catch (error) {
    showToast('分析失败，请稍后重试', 'error')
  } finally {
    analyzing.value = false
  }
}

// 智能纠错
const correctSQL = async () => {
  if (!sqlCode.value.trim()) return
  
  correcting.value = true
  analysisResult.value = ''
  
  try {
    const res = await aiAPI.correct(sqlCode.value)
    if (res.data.success) {
      correctionResult.value = res.data.data.correction
    }
  } catch (error) {
    showToast('纠错失败，请稍后重试', 'error')
  } finally {
    correcting.value = false
  }
}

// 生成练习题
const generateExercise = async () => {
  if (!exerciseTopic.value.trim()) return
  
  if (!authStore.isLoggedIn) {
    showToast('请先登录', 'error')
    return
  }
  
  generatingExercise.value = true
  exerciseContent.value = ''
  
  try {
    const res = await aiAPI.generateExercise(exerciseTopic.value, exerciseDifficulty.value)
    if (res.data.success) {
      exerciseContent.value = res.data.data.exercise
    }
  } catch (error) {
    showToast('生成练习题失败', 'error')
  } finally {
    generatingExercise.value = false
  }
}

// 提交问题
const submitQuestion = async () => {
  if (!askQuestion.value.trim()) return
  
  asking.value = true
  askAnswer.value = ''
  
  try {
    const res = await aiAPI.ask(askQuestion.value)
    if (res.data.success) {
      askAnswer.value = res.data.data.answer
    }
  } catch (error) {
    showToast('获取回答失败', 'error')
  } finally {
    asking.value = false
  }
}

// 加载周总结
const loadWeeklySummary = async () => {
  showToast('正在加载易错点总结...', 'info')
  
  try {
    const res = await aiAPI.getWeeklySummary()
    if (res.data.success) {
      analysisResult.value = res.data.data.summary
      correctionResult.value = ''
    }
  } catch (error) {
    showToast('加载失败', 'error')
  }
}
</script>

<style scoped>
.playground-page {
  max-width: 1400px;
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

/* 主容器 */
.playground-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-weight: 600;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

/* 编辑器 */
.editor-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-wrapper {
  position: relative;
  flex: 1;
  display: flex;
}

.line-numbers {
  padding: 1rem 0.75rem;
  background: var(--bg-code);
  border-right: 1px solid var(--border-color);
  text-align: right;
  user-select: none;
  display: flex;
  flex-direction: column;
}

.line-numbers span {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-muted);
}

.sql-editor {
  flex: 1;
  padding: 1rem;
  background: var(--bg-code);
  border: none;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-primary);
  resize: none;
  min-height: 300px;
}

.sql-editor:focus {
  outline: none;
}

.editor-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

/* 结果面板 */
.result-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.result-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  max-height: 500px;
}

.placeholder {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.placeholder .hint {
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.result-text {
  font-size: 0.9rem;
  line-height: 1.8;
}

.result-text :deep(h2) {
  font-size: 1.125rem;
  margin: 1.5rem 0 0.75rem;
  color: var(--accent-primary);
}

.result-text :deep(h3) {
  font-size: 1rem;
  margin: 1rem 0 0.5rem;
}

.result-text :deep(code) {
  background: var(--bg-code);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.85em;
}

.result-text :deep(pre) {
  background: var(--bg-code);
  padding: 1rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 1rem 0;
}

.result-text :deep(ul), .result-text :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.result-text :deep(li) {
  margin: 0.25rem 0;
}

/* 功能卡片 */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-glow);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
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
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
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
}

.modal-body {
  padding: 1.5rem;
}

.exercise-result,
.answer-result {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
  line-height: 1.8;
}

.exercise-result :deep(h2),
.answer-result :deep(h2) {
  font-size: 1.125rem;
  margin: 1rem 0 0.5rem;
}

.exercise-result :deep(pre),
.answer-result :deep(pre) {
  background: var(--bg-code);
  padding: 1rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
  display: inline-block;
}

/* 响应式 */
@media (max-width: 1024px) {
  .playground-container {
    grid-template-columns: 1fr;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
  }
}
</style>

