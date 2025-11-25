/**
 * 环境变量配置
 * 集中管理所有环境变量
 */

const config = {
  // 服务器配置
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  databaseUrl: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9VrHRgt4KyxT@ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  
  // JWT配置
  jwtSecret: process.env.JWT_SECRET || 'sql_learning_platform_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Qwen AI配置
  qwenApiKey: process.env.QWEN_API_KEY || 'sk-79bf85aad3e94afb9ea071c617d32c3b',
  qwenApiUrl: process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  qwenModel: process.env.QWEN_MODEL || 'qwen-plus',
  
  // CORS配置
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // 是否为开发环境
  isDev: (process.env.NODE_ENV || 'development') === 'development'
};

module.exports = config;

