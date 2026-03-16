<template>
  <div class="exercises-page">
    <section class="hero-shell">
      <div class="hero-main card">
        <div class="hero-copy">
          <span class="hero-pill">课程实训 · 智能导学</span>
          <h1>数据库课程案例工作台</h1>
          <p>围绕课程教学场景，把两个训练单元整合为真正独立的项目卡片。你可以查看项目结构、知识点、练习清单，并进入沉浸式答题区完成训练。</p>
          <div class="hero-actions">
            <button class="hero-action primary" @click="switchProject('exercise1')">进入项目一</button>
            <button class="hero-action secondary" @click="switchProject('exercise2')">进入项目二</button>
          </div>
        </div>
        <div class="hero-side">
          <div class="hero-metric"><strong>{{ exercises.length }}</strong><span>当前项目题目</span></div>
          <div class="hero-metric"><strong>{{ progressStats.completed }}</strong><span>已完成题数</span></div>
          <div class="hero-metric"><strong>{{ progressStats.completionRate }}%</strong><span>完成率</span></div>
        </div>
      </div>
    </section>

    <section class="project-gallery">
      <button v-for="project in projects" :key="project.code" class="project-card" :class="{ active: activeProject === project.code }" @click="switchProject(project.code)">
        <div class="project-card-top">
          <span class="project-badge">{{ project.label }}</span>
          <span class="project-status">{{ activeProject === project.code ? '当前查看' : '点击切换' }}</span>
        </div>
        <h3>{{ project.name }}</h3>
        <p>{{ project.summary }}</p>
      </button>
    </section>

    <section class="overview-grid">
      <div class="overview-card card">
        <div class="overview-head">
          <div>
            <span class="section-tag">项目结构</span>
            <h2>{{ schema.projectName }}</h2>
          </div>
          <button class="collapse-btn" @click="showSchema = !showSchema">{{ showSchema ? '收起详情' : '展开详情' }}</button>
        </div>
        <p class="overview-desc">{{ schema.projectDescription }}</p>
        <div class="overview-meta">
          <span class="meta-chip">{{ currentProject.label }}</span>
          <span class="meta-chip">{{ exercises.length }} 道题</span>
          <span class="meta-chip">{{ schema.tables?.length || 0 }} 张表</span>
        </div>
        <div v-if="showSchema" class="schema-panel">
          <div class="tables-grid">
            <div v-for="table in schema.tables" :key="table.name" class="table-card">
              <div class="table-header">
                <h4>{{ table.name }}</h4>
                <span>{{ table.description }}</span>
              </div>
              <table class="column-table">
                <thead><tr><th>列名</th><th>类型</th><th>说明</th></tr></thead>
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

          <div v-if="schema.sampleData?.length" class="schema-subblock">
            <h4>示例数据</h4>
            <div class="sample-table-wrapper">
              <table class="sample-table">
                <thead><tr><th v-for="key in Object.keys(schema.sampleData[0])" :key="key">{{ key }}</th></tr></thead>
                <tbody>
                  <tr v-for="(row, index) in schema.sampleData" :key="index">
                    <td v-for="key in Object.keys(row)" :key="key">{{ row[key] ?? 'NULL' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="schema.knowledgePoints?.length" class="schema-subblock">
            <h4>知识点覆盖</h4>
            <div class="knowledge-pills">
              <span v-for="(point, index) in schema.knowledgePoints" :key="index" class="knowledge-pill">{{ point }}</span>
            </div>
          </div>

          <div class="schema-note" v-if="schema.note"><strong>说明：</strong>{{ schema.note }}</div>
        </div>
      </div>

      <div class="exercise-board card">
        <div class="overview-head">
          <div>
            <span class="section-tag">练习清单</span>
            <h2>{{ currentProject.name }}</h2>
          </div>
        </div>
        <div class="exercise-cards">
          <div v-for="exercise in exercises" :key="exercise.id" class="exercise-card" :class="{ completed: userProgress[exercise.id]?.is_correct, attempted: userProgress[exercise.id]?.attempt_count > 0 && !userProgress[exercise.id]?.is_correct, active: selectedExercise?.id === exercise.id }" @click="selectExercise(exercise)">
            <div class="exercise-index">
              <span v-if="userProgress[exercise.id]?.is_correct">✓</span>
              <span v-else-if="userProgress[exercise.id]?.attempt_count > 0">↺</span>
              <span v-else>{{ exercise.order_index }}</span>
            </div>
            <div class="exercise-body">
              <div class="exercise-title-row">
                <h4>{{ exercise.order_index }}. {{ exercise.title }}</h4>
              </div>
              <p>{{ truncateDescription(exercise.description) }}</p>
              <div class="exercise-meta">
                <span class="difficulty" :class="exercise.difficulty">{{ difficultyText[exercise.difficulty] }}</span>
                <span class="category">{{ exercise.category }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="selectedExercise" class="workspace card" ref="practiceSection">
      <div class="workspace-head">
        <div>
          <span class="section-tag">当前练习</span>
          <h2>{{ selectedExercise.order_index }}. {{ selectedExercise.title }}</h2>
        </div>
        <button class="btn-close" @click="selectedExercise = null">✕</button>
      </div>

      <div class="workspace-grid">
        <div class="workspace-left">
          <div class="workspace-panel glass-panel">
            <h4>题目要求</h4>
            <p class="description-text">{{ selectedExercise.description }}</p>
          </div>
          <div class="workspace-panel glass-panel" v-if="selectedExercise.hint">
            <h4>提示</h4>
            <p>{{ selectedExercise.hint }}</p>
          </div>
          <div class="workspace-panel glass-panel" v-if="selectedExercise.knowledge_point">
            <h4>知识点</h4>
            <p>{{ selectedExercise.knowledge_point }}</p>
          </div>
        </div>

        <div class="workspace-right">
          <div class="workspace-panel editor-panel">
            <div class="editor-top">
              <div>
                <h4>SQL 编辑区</h4>
                <p>支持 Ctrl + Enter 快速运行；项目二支持 CREATE VIEW ... AS SELECT ...</p>
              </div>
            </div>
            <textarea v-model="userSQL" placeholder="在此输入你的SQL查询语句..." @keydown.ctrl.enter="executeSQL"></textarea>
            <div class="editor-actions">
              <button class="btn btn-secondary" @click="executeSQL" :disabled="executing">{{ executing ? '执行中...' : '▶ 运行查询' }}</button>
              <button class="btn btn-primary" @click="submitAnswer" :disabled="submitting">{{ submitting ? '提交中...' : '📤 提交答案' }}</button>
              <button class="btn btn-ghost" @click="getAIHint" :disabled="gettingHint">{{ gettingHint ? '获取中...' : '🤖 AI提示' }}</button>
            </div>
          </div>

          <div v-if="queryResult" class="workspace-panel glass-panel">
            <h4>查询结果</h4>
            <div v-if="queryResult.success">
              <p class="result-info">{{ queryResult.message || `返回 ${queryResult.rowCount} 行数据` }}</p>
              <div class="result-table-wrapper">
                <table v-if="queryResult.rows.length > 0" class="result-table">
                  <thead><tr><th v-for="field in queryResult.fields" :key="field">{{ field }}</th></tr></thead>
                  <tbody><tr v-for="(row, index) in queryResult.rows" :key="index"><td v-for="field in queryResult.fields" :key="field">{{ row[field] ?? 'NULL' }}</td></tr></tbody>
                </table>
                <p v-else class="no-data">{{ queryResult.message || '查询结果为空' }}</p>
              </div>
            </div>
            <div v-else class="result-error">❌ {{ queryResult.error }}</div>
          </div>

          <div v-if="submitResult" class="workspace-panel glass-panel submit-result" :class="{ correct: submitResult.isCorrect, incorrect: !submitResult.isCorrect }">
            <div class="result-header">
              <span class="result-icon">{{ submitResult.isCorrect ? '🎉' : '💪' }}</span>
              <h4>{{ submitResult.message }}</h4>
            </div>
            <p v-if="submitResult.attemptCount" class="attempt-info">第 {{ submitResult.attemptCount }} 次尝试</p>
            <div v-if="submitResult.aiFeedback" class="ai-feedback">
              <h5>AI分析与建议</h5>
              <div class="feedback-content" v-html="formatFeedback(submitResult.aiFeedback)"></div>
            </div>
          </div>

          <div v-if="aiHint" class="workspace-panel glass-panel ai-hint">
            <h5>AI提示</h5>
            <div class="hint-content" v-html="formatFeedback(aiHint)"></div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="loading-overlay"><div class="spinner"></div><p>加载中...</p></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { exerciseAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const projects = [
  { code: 'exercise1', label: '项目一', name: '智慧农业传感器监测系统', summary: '单表查询综合训练，覆盖 SELECT、DISTINCT、WHERE、BETWEEN、LIKE、IS NULL、ORDER BY、聚合函数与多重条件组合查询。' },
  { code: 'exercise2', label: '项目二', name: '智能制造设备管理系统视图应用实战项目', summary: '新增视图应用训练，强调项目化场景、表达式计算、分组统计与视图思维。' }
]
const activeProject = ref('exercise1')
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
const executing = ref(false)
const submitting = ref(false)
const gettingHint = ref(false)
const practiceSection = ref(null)
const difficultyText = { beginner: '初级', intermediate: '中级', advanced: '高级' }
const currentProject = computed(() => projects.find(p => p.code === activeProject.value) || projects[0])
const progressStats = computed(() => {
  const list = Object.values(userProgress.value)
  const total = exercises.value.length || 0
  const completed = list.filter(p => p?.is_correct).length
  const attempted = list.filter(p => (p?.attempt_count || 0) > 0).length
  return { total, completed, attempted, completionRate: total ? Math.round(completed / total * 100) : 0 }
})

const loadExercises = async () => {
  const response = await exerciseAPI.getAll(activeProject.value)
  if (response.data.success) exercises.value = response.data.data.exercises
}
const loadSchema = async () => {
  const response = await exerciseAPI.getSchema(activeProject.value)
  if (response.data.success) schema.value = response.data.data.schema
}
const loadUserProgress = async () => {
  if (!authStore.isLoggedIn) return
  const response = await exerciseAPI.getUserProgress(activeProject.value)
  if (response.data.success) {
    const progress = {}
    response.data.data.progress.forEach(p => { progress[p.id] = p })
    userProgress.value = progress
  }
}
const loadAll = async () => {
  loading.value = true
  selectedExercise.value = null
  queryResult.value = null
  submitResult.value = null
  aiHint.value = null
  try {
    await Promise.all([loadExercises(), loadSchema(), loadUserProgress()])
  } catch (error) {
    console.error('加载项目失败:', error)
  } finally {
    loading.value = false
  }
}
const switchProject = async code => { activeProject.value = code; await loadAll() }
const selectExercise = async exercise => {
  selectedExercise.value = exercise
  userSQL.value = ''
  queryResult.value = null
  submitResult.value = null
  aiHint.value = null
  await nextTick()
  practiceSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const executeSQL = async () => {
  if (!userSQL.value.trim()) return
  executing.value = true
  queryResult.value = null
  try {
    const response = await exerciseAPI.executeSQL(userSQL.value)
    queryResult.value = response.data.data
  } catch (error) {
    queryResult.value = { success: false, error: error.response?.data?.message || '执行失败' }
  } finally { executing.value = false }
}
const submitAnswer = async () => {
  if (!userSQL.value.trim()) return
  if (!authStore.isLoggedIn) return alert('请先登录后再提交答案')
  submitting.value = true
  submitResult.value = null
  try {
    const response = await exerciseAPI.submitAnswer(selectedExercise.value.id, userSQL.value)
    if (response.data.success) {
      submitResult.value = response.data.data
      await loadUserProgress()
    }
  } catch (error) {
    submitResult.value = { isCorrect: false, message: error.response?.data?.message || '提交失败' }
  } finally { submitting.value = false }
}
const getAIHint = async () => {
  if (!authStore.isLoggedIn) return alert('请先登录后再获取AI提示')
  gettingHint.value = true
  aiHint.value = null
  try {
    const response = await exerciseAPI.getHint(selectedExercise.value.id, userSQL.value)
    if (response.data.success) aiHint.value = response.data.data.hint
  } catch { aiHint.value = '获取提示失败，请稍后重试' } finally { gettingHint.value = false }
}
const formatFeedback = text => text ? text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/\n/g, '<br>') : ''
const truncateDescription = text => {
  if (!text) return ''
  const cleanText = text.replace(/【场景】[^\n]*\n\n?/g, '')
  return cleanText.length > 78 ? cleanText.substring(0, 78) + '...' : cleanText
}
onMounted(loadAll)
</script>

<style scoped>
.exercises-page { max-width: 1480px; margin: 0 auto; }
.hero-shell { margin-bottom: 1.5rem; }
.hero-main {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(15,23,42,.88), rgba(30,41,59,.72));
  border: 1px solid rgba(125,211,252,.16);
  box-shadow: 0 24px 60px rgba(15,23,42,.28);
}
.hero-pill,.section-tag,.project-badge,.meta-chip {
  display: inline-flex;
  align-items: center;
  padding: .38rem .82rem;
  border-radius: 999px;
  font-size: .8rem;
  font-weight: 700;
}
.hero-pill, .section-tag, .project-badge { background: rgba(56,189,248,.12); color: #7dd3fc; }
.hero-copy h1 { font-size: 2.5rem; line-height: 1.2; margin: .75rem 0 1rem; }
.hero-copy p { color: var(--text-secondary); line-height: 1.95; max-width: 780px; }
.hero-actions { display: flex; gap: .9rem; margin-top: 1.5rem; flex-wrap: wrap; }
.hero-action { border: none; border-radius: 14px; padding: .9rem 1.3rem; font-weight: 700; }
.hero-action.primary { background: linear-gradient(135deg, #2563eb, #0891b2); color: #fff; }
.hero-action.secondary { background: rgba(255,255,255,.06); color: #e2e8f0; border: 1px solid rgba(148,163,184,.12); }
.hero-side { display: grid; grid-template-columns: 1fr; gap: 1rem; }
.hero-metric { background: rgba(15,23,42,.55); border: 1px solid rgba(148,163,184,.12); border-radius: 20px; padding: 1.2rem; }
.hero-metric strong { display:block; font-size: 2rem; color:#fff; }
.hero-metric span { color:#94a3b8; margin-top:.35rem; display:block; }
.project-gallery { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:1rem; margin-bottom:1.5rem; }
.project-card { text-align:left; border-radius: 24px; border:1px solid rgba(148,163,184,.12); background: linear-gradient(180deg, rgba(15,23,42,.72), rgba(15,23,42,.46)); padding: 1.3rem; color:#e2e8f0; transition:.25s ease; }
.project-card:hover { transform: translateY(-2px); border-color: rgba(96,165,250,.35); }
.project-card.active { border-color: rgba(125,211,252,.45); box-shadow: 0 18px 46px rgba(37,99,235,.16); }
.project-card-top { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:.8rem; }
.project-status { color:#94a3b8; font-size:.82rem; }
.project-card h3 { font-size:1.2rem; margin-bottom:.55rem; }
.project-card p { color:#94a3b8; line-height:1.8; }
.overview-grid { display:grid; grid-template-columns: 1.12fr .88fr; gap:1.5rem; align-items:start; }
.overview-card,.exercise-board,.workspace { padding:1.5rem; }
.overview-head,.workspace-head,.table-header,.exercise-title-row { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
.overview-desc { color: var(--text-secondary); line-height: 1.9; margin: .9rem 0 1rem; }
.overview-meta { display:flex; flex-wrap:wrap; gap:.7rem; margin-bottom:1rem; }
.meta-chip { background: rgba(148,163,184,.1); color:#cbd5e1; }
.collapse-btn,.btn-close { border:none; border-radius: 12px; background: rgba(148,163,184,.12); color:#fff; padding:.7rem 1rem; }
.schema-panel { margin-top:1rem; }
.tables-grid { display:grid; gap:1rem; }
.table-card,.glass-panel,.editor-panel { background: rgba(15,23,42,.58); border:1px solid rgba(148,163,184,.12); border-radius: 20px; padding:1rem; }
.table-header h4 { margin:0; }
.table-header span { color:#94a3b8; font-size:.86rem; }
.column-table,.sample-table,.result-table { width:100%; border-collapse:collapse; margin-top:.8rem; }
.column-table th,.column-table td,.sample-table th,.sample-table td,.result-table th,.result-table td { padding:.8rem .75rem; border-bottom:1px solid rgba(148,163,184,.08); text-align:left; }
.col-name,.col-type { font-family: var(--font-mono); color:#bfdbfe; }
.schema-subblock { margin-top:1.1rem; }
.sample-table-wrapper,.result-table-wrapper { overflow:auto; border-radius:14px; }
.knowledge-pills { display:flex; flex-wrap:wrap; gap:.7rem; margin-top:.8rem; }
.knowledge-pill { display:inline-flex; padding:.35rem .8rem; border-radius:999px; background:rgba(59,130,246,.12); color:#dbeafe; border:1px solid rgba(96,165,250,.14); font-size:.8rem; }
.schema-note { margin-top:1rem; color:#cbd5e1; line-height:1.8; }
.exercise-cards { display:grid; gap:.9rem; margin-top:1rem; }
.exercise-card { display:flex; gap:1rem; align-items:flex-start; padding:1rem; border-radius:20px; border:1px solid rgba(148,163,184,.12); background:rgba(15,23,42,.45); cursor:pointer; transition:.25s ease; }
.exercise-card:hover,.exercise-card.active { transform:translateY(-2px); border-color:rgba(96,165,250,.36); box-shadow:0 14px 38px rgba(15,23,42,.25); }
.exercise-card.completed { border-color:rgba(34,197,94,.35); }
.exercise-card.attempted { border-color:rgba(250,204,21,.3); }
.exercise-index { width:52px; height:52px; border-radius:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:rgba(148,163,184,.12); font-weight:800; color:#fff; }
.exercise-body h4 { margin-bottom:.45rem; }
.exercise-body p { color:#94a3b8; line-height:1.75; }
.exercise-meta { display:flex; flex-wrap:wrap; gap:.6rem; margin-top:.8rem; }
.difficulty,.category { display:inline-flex; align-items:center; padding:.32rem .8rem; border-radius:999px; font-size:.78rem; }
.difficulty.beginner { background:rgba(34,197,94,.16); color:#86efac; }
.difficulty.intermediate { background:rgba(59,130,246,.16); color:#93c5fd; }
.difficulty.advanced { background:rgba(168,85,247,.16); color:#d8b4fe; }
.category { background:rgba(148,163,184,.12); color:#cbd5e1; }
.workspace { margin-top:1.5rem; }
.workspace-grid { display:grid; grid-template-columns: .92fr 1.08fr; gap:1.2rem; margin-top:1rem; }
.workspace-left,.workspace-right { display:grid; gap:1rem; align-content:start; }
.workspace-panel h4,.workspace-panel h5 { margin-bottom:.7rem; }
.description-text { white-space:pre-line; line-height:1.9; color:var(--text-secondary); }
.editor-top p,.result-info,.attempt-info { color:#94a3b8; font-size:.92rem; }
.editor-panel textarea { min-height:260px; margin-top:.8rem; background:#0b1120; border:1px solid rgba(96,165,250,.18); }
.editor-actions { display:flex; gap:.85rem; flex-wrap:wrap; margin-top:1rem; }
.result-error { color:#fca5a5; }
.result-header { display:flex; align-items:center; gap:.8rem; margin-bottom:.7rem; }
.submit-result.correct { border-color:rgba(34,197,94,.35); }
.submit-result.incorrect { border-color:rgba(245,158,11,.35); }
.loading-overlay { display:flex; flex-direction:column; align-items:center; gap:.8rem; padding:3rem 1rem; color:#cbd5e1; }
.spinner { width:34px; height:34px; border:3px solid rgba(148,163,184,.18); border-top-color:#60a5fa; border-radius:50%; animation:spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1180px) { .hero-main,.overview-grid,.workspace-grid,.project-gallery { grid-template-columns:1fr; } }
@media (max-width: 768px) { .hero-copy h1 { font-size:1.9rem; } .overview-card,.exercise-board,.workspace,.hero-main { padding:1.1rem; } }
</style>
