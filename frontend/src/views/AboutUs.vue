<template>
  <div class="about-us-page">
    <div class="about-container">
      <div class="about-header">
        <h1 class="page-title">关于我们</h1>
        <p class="page-subtitle">哈尔滨剑桥学院 SQL学习平台</p>
      </div>

      <div class="qr-section">
        <div class="qr-card">
          <div class="qr-header">
            <h2>联系我们</h2>
            <p>扫描下方二维码，添加刘君老师微信</p>
          </div>
          
          <div class="qr-image-wrapper">
            <img src="/about-us.png" alt="刘君老师微信二维码" class="qr-image" />
          </div>
          
          <div class="qr-footer">
            <p class="qr-hint">扫一扫上面的二维码图案，加我为朋友</p>
          </div>
        </div>

        <div class="info-card">
          <h3>平台介绍</h3>
          <p>本平台是哈尔滨剑桥学院为SQL学习者打造的在线学习系统，提供系统化的知识库、AI智能辅导、社区互动等功能，助力学生掌握数据库查询语言。</p>
          
          <h3>技术支持</h3>
          <p>如有技术问题或建议，欢迎通过微信联系刘君老师。</p>
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
// 关于我们页面，展示微信二维码
</script>

<style scoped>
.about-us-page {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.about-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #FFD700, #F0E68C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.qr-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.qr-card {
  background: rgba(100, 0, 0, 0.5);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  text-align: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.1);
  transition: all 0.3s ease;
}

.qr-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2);
  border-color: var(--accent-primary);
}

.qr-header {
  margin-bottom: 2rem;
}

.qr-header h2 {
  font-size: 1.75rem;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.qr-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.qr-image-wrapper {
  background: #fff;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  margin: 1.5rem 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  display: block;
}

.qr-footer {
  margin-top: 1.5rem;
}

.qr-hint {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.info-card {
  background: rgba(100, 0, 0, 0.4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.info-card h3 {
  font-size: 1.5rem;
  color: var(--accent-primary);
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.info-card h3:first-child {
  margin-top: 0;
}

.info-card p {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.back-button {
  text-align: center;
  margin-top: 2rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .qr-section {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .qr-card {
    padding: 1.5rem;
  }
}
</style>

