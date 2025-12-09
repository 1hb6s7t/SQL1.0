/**
 * 环境变量配置
 * 集中管理所有环境变量
 * 
 * 安全提示：敏感信息（如API密钥）必须从环境变量读取，不得硬编码
 */

// 验证必需的环境变量
function validateRequiredEnv(envName, value) {
  if (!value) {
    throw new Error(
      `❌ 错误：缺少必需的环境变量 ${envName}\n` +
      `请在 backend/.env 文件中设置 ${envName}，或通过环境变量提供。\n` +
      `可以参考 backend/.env.example 文件。`
    );
  }
  return value;
}

const config = {
  // 服务器配置
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  databaseUrl: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9VrHRgt4KyxT@ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  
  // JWT配置
  jwtSecret: process.env.JWT_SECRET || 'sql_learning_platform_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Qwen AI配置 - 必须从环境变量读取，不允许硬编码
  qwenApiKey: validateRequiredEnv('QWEN_API_KEY', process.env.QWEN_API_KEY),
  qwenApiUrl: process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  // 代码相关任务使用 qwen3-coder-plus
  qwenCoderModel: process.env.QWEN_CODER_MODEL || 'qwen3-coder-plus',
  // 通用对话任务使用 qwen3-max
  qwenMaxModel: process.env.QWEN_MAX_MODEL || 'qwen-max',
  // 默认模型（兼容旧配置）
  qwenModel: process.env.QWEN_MODEL || 'qwen3-coder-plus',
  
  // CORS配置
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // 是否为开发环境
  isDev: (process.env.NODE_ENV || 'development') === 'development'
};

module.exports = config;

