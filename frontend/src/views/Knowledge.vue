<template>
  <div class="knowledge-page">
    <div class="page-header">
      <h1>📚 SQL知识库</h1>
      <p>系统化学习SQL，从入门到精通</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters">
      <div class="search-box">
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索知识点..."
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">🔍</button>
      </div>
      
      <div class="filter-tags">
        <button 
          class="filter-tag" 
          :class="{ active: !selectedCategory }"
          @click="selectedCategory = ''"
        >全部</button>
        <button 
          v-for="cat in categories" 
          :key="cat.category"
          class="filter-tag"
          :class="{ active: selectedCategory === cat.category }"
          @click="selectedCategory = cat.category"
        >
          {{ cat.category }} ({{ cat.count }})
        </button>
      </div>
      
      <div class="difficulty-filter">
        <select v-model="selectedDifficulty">
          <option value="">全部难度</option>
          <option value="beginner">入门</option>
          <option value="intermediate">进阶</option>
          <option value="advanced">高级</option>
        </select>
      </div>
    </div>

    <!-- 知识点列表 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="filteredKnowledge.length === 0" class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <p class="empty-state-text">没有找到匹配的知识点</p>
    </div>

    <div v-else class="knowledge-grid">
      <div 
        v-for="item in filteredKnowledge" 
        :key="item.id" 
        class="knowledge-card"
        @click="$router.push(`/knowledge/${item.id}`)"
      >
        <div class="card-header">
          <span class="difficulty-badge" :class="item.difficulty">
            {{ difficultyText[item.difficulty] }}
          </span>
          <span class="view-count">👁 {{ item.view_count }}</span>
        </div>
        
        <h3>{{ item.title }}</h3>
        <p class="category">📁 {{ item.category }}</p>
        <p class="description">{{ truncate(item.content, 120) }}</p>
        
        <div class="card-footer">
          <span class="learn-btn">开始学习 →</span>
        </div>
      </div>
    </div>

    <!-- 常见易错点 -->
    <section class="mistakes-section">
      <h2>⚠️ 常见易错点</h2>
      <div class="mistakes-list">
        <div v-for="item in commonMistakes.slice(0, 5)" :key="item.title" class="mistake-item">
          <h4>{{ item.title }}</h4>
          <pre class="mistake-content">{{ item.common_mistakes }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { knowledgeAPI } from '@/services/api'

const loading = ref(true)
const knowledgePoints = ref([])
const categories = ref([])
const commonMistakes = ref([])
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedDifficulty = ref('')
const searchResults = ref(null)

const difficultyText = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级'
}

// 过滤后的知识点
const filteredKnowledge = computed(() => {
  // 如果有搜索结果，使用搜索结果
  if (searchResults.value !== null) {
    return searchResults.value
  }
  
  return knowledgePoints.value.filter(item => {
    if (selectedCategory.value && item.category !== selectedCategory.value) return false
    if (selectedDifficulty.value && item.difficulty !== selectedDifficulty.value) return false
    return true
  })
})

// 截断文本
const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = null
    return
  }
  
  loading.value = true
  try {
    const res = await knowledgeAPI.search(searchKeyword.value)
    if (res.data.success) {
      searchResults.value = res.data.data.results
    }
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

// 清除搜索
watch(searchKeyword, (val) => {
  if (!val) searchResults.value = null
})

// 加载数据
onMounted(async () => {
  try {
    // 并行加载
    const [knowledgeRes, categoriesRes, mistakesRes] = await Promise.all([
      knowledgeAPI.getAll(),
      knowledgeAPI.getCategories(),
      knowledgeAPI.getMistakes()
    ])
    
    if (knowledgeRes.data.success) {
      knowledgePoints.value = knowledgeRes.data.data.knowledgePoints
    }
    if (categoriesRes.data.success) {
      categories.value = categoriesRes.data.data.categories
    }
    if (mistakesRes.data.success) {
      commonMistakes.value = mistakesRes.data.data.mistakes
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.knowledge-page {
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
}

.page-header p {
  color: var(--text-secondary);
}

/* 筛选器 */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  flex: 1;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.search-btn {
  padding: 0 1rem;
  background: var(--accent-primary);
  border: none;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  cursor: pointer;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
}

.filter-tag {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.filter-tag:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.filter-tag.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.difficulty-filter select {
  width: auto;
  padding: 0.5rem 1rem;
}

/* 知识点网格 */
.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
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
  transform: translateY(-2px);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-glow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.view-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.knowledge-card h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.knowledge-card .category {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.knowledge-card .description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.learn-btn {
  font-size: 0.875rem;
  color: var(--accent-primary);
  font-weight: 500;
}

/* 易错点 */
.mistakes-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.mistakes-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.mistakes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mistake-item {
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.mistake-item h4 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: var(--warning);
}

.mistake-content {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
  background: none;
  border: none;
  padding: 0;
}
</style>

