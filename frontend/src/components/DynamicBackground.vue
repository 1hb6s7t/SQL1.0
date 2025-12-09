<template>
  <div class="dynamic-background">
    <!-- 静态背景图层 -->
    <div class="bg-image"></div>
    
    <!-- 动态Canvas层 -->
    <canvas ref="canvas"></canvas>
    
    <!-- 氛围遮罩层 -->
    <div class="atmosphere-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx = null
let animationFrame = null
let particles = []
let width = 0
let height = 0

// 粒子类 - 升级为“金粉”效果
class Particle {
  constructor() {
    this.reset(true)
  }

  reset(initial = false) {
    this.x = Math.random() * width
    this.y = initial ? Math.random() * height : -10
    // 粒子更小，更密集
    this.size = Math.random() * 2 + 0.5
    // 缓慢飘落
    this.speedX = Math.random() * 0.4 - 0.2
    this.speedY = Math.random() * 0.5 + 0.1
    this.opacity = Math.random() * 0.6 + 0.2
    this.life = Math.random() * 200 + 100
    // 蓝白配色 - 白色带一点蓝
    this.color = `rgba(220, 240, 255, ${this.opacity})`
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    // 简单的正弦摆动
    this.x += Math.sin(this.y * 0.01) * 0.1
    
    this.life--

    if (this.life <= 0 || this.x < 0 || this.x > width || this.y > height) {
      this.reset()
    }
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    
    // 偶尔闪烁
    if (Math.random() > 0.98) {
      ctx.shadowBlur = 8
      ctx.shadowColor = '#FFFFFF'
    } else {
      ctx.shadowBlur = 0
    }
  }
}

const init = () => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  resize()
  
  // 增加粒子数量，制造“繁星”感
  const particleCount = Math.min(width * 0.2, 250)
  particles = []
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }
  
  animate()
}

const resize = () => {
  if (!canvas.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvas.value.width = width
  canvas.value.height = height
}

const animate = () => {
  ctx.clearRect(0, 0, width, height)
  
  particles.forEach(p => {
    p.update()
    p.draw()
  })
  
  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.dynamic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-color: #001a33; /* 兜底色 - 深蓝 */
  overflow: hidden;
}

/* 背景图层 */
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/blue-white-bg.png');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  /* 轻微放大以支持视差效果（这里先做静态） */
  transform: scale(1.05);
  filter: brightness(0.9) contrast(1.1); /* 稍微压暗，增加对比度 */
}

canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

/* 氛围遮罩 - 蓝色光晕，顶部深色渐变 */
.atmosphere-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background: linear-gradient(
    to bottom,
    rgba(0, 20, 40, 0.4) 0%,
    rgba(0, 50, 100, 0.2) 40%,
    rgba(255, 255, 255, 0.1) 100%
  );
  pointer-events: none;
}
</style>
