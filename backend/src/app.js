/**
 * SQL学习平台 - 后端API服务
 * 主应用入口
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');

// 导入路由
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const aiRoutes = require('./routes/aiRoutes');

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100次请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});

// AI路由特殊限制（更严格）
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 最多10次请求
  message: {
    success: false,
    message: 'AI功能请求过于频繁，请稍后再试'
  }
});

// 应用速率限制
app.use('/api/', limiter);
app.use('/api/ai/', aiLimiter);

// 请求日志（开发环境）
if (config.isDev) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SQL学习平台API运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API文档端点
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '欢迎使用SQL学习平台API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': '用户注册',
        'POST /api/auth/login': '用户登录',
        'GET /api/auth/profile': '获取用户信息',
        'PUT /api/auth/profile': '更新用户信息',
        'PUT /api/auth/password': '修改密码'
      },
      comments: {
        'GET /api/comments': '获取评论列表',
        'POST /api/comments': '发表评论',
        'GET /api/comments/:id': '获取评论详情',
        'PUT /api/comments/:id': '更新评论',
        'DELETE /api/comments/:id': '删除评论',
        'POST /api/comments/:id/like': '点赞评论',
        'POST /api/comments/:id/ai-reply': '请求AI回复'
      },
      knowledge: {
        'GET /api/knowledge': '获取知识点列表',
        'GET /api/knowledge/categories': '获取分类列表',
        'GET /api/knowledge/popular': '获取热门知识点',
        'GET /api/knowledge/search': '搜索知识点',
        'GET /api/knowledge/:id': '获取知识点详情'
      },
      ai: {
        'POST /api/ai/analyze': '分析SQL代码',
        'POST /api/ai/ask': '问答',
        'POST /api/ai/correct': 'SQL纠错',
        'POST /api/ai/chat': '智能聊天',
        'POST /api/ai/evaluate': '代码评价',
        'POST /api/ai/exercise': '生成练习题',
        'GET /api/ai/weekly-summary': '获取周总结'
      }
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: config.isDev ? err.message : '服务器内部错误'
  });
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎓 SQL学习平台后端服务启动成功！                          ║
║                                                            ║
║   📍 服务地址: http://localhost:${PORT}                      ║
║   📚 API文档: http://localhost:${PORT}/api                   ║
║   💚 健康检查: http://localhost:${PORT}/api/health           ║
║                                                            ║
║   🔧 环境: ${config.isDev ? '开发环境' : '生产环境'}                               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

