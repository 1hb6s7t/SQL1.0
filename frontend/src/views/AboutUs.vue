<template>
  <div class="about-us-page">
    <div class="about-container">
      <div class="about-header">
        <h1 class="page-title">关于平台</h1>
        <p class="page-subtitle">《数据库原理与应用》智能学习平台</p>
      </div>

      <div class="about-grid">
        <div class="info-card card">
          <h3>平台定位</h3>
          <p>本平台面向数据库课程教学与自主学习场景，围绕数据库基础理论、SQL 编写训练、案例化项目实践和学习反馈分析进行设计。</p>

          <h3>核心能力</h3>
          <ul>
            <li>系统化知识点学习</li>
            <li>在线 SQL 练习与结果校验</li>
            <li>智能提示与答题反馈</li>
            <li>项目化案例训练与学习追踪</li>
          </ul>
        </div>

        <div class="info-card card">
          <h3>适用场景</h3>
          <p>适用于课堂教学演示、课程实验、阶段训练、课后复习及项目化实践教学。</p>

          <h3>说明</h3>
          <p>当前平台已支持知识库、项目练习、练习场、社区互动等模块，后续可继续扩展更多数据库课程案例与管理功能。</p>
        </div>
      </div>

      <div class="back-button">
        <router-link to="/" class="btn btn-secondary">
          <span>←</span> 返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about-us-page {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.about-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.about-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #e2e8f0, #7dd3fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.15rem;
  color: var(--text-secondary);
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.info-card {
  padding: 2rem;
}

.info-card h3 {
  margin-bottom: 0.9rem;
  color: #7dd3fc;
}

.info-card p,
.info-card li {
  color: var(--text-secondary);
  line-height: 1.9;
}

.info-card ul {
  padding-left: 1.2rem;
}

.back-button {
  text-align: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style>
