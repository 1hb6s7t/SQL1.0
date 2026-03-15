/**
 * 环境变量配置
 */
function required(name, value) {
  if (!value) {
    throw new Error(`❌ 错误：缺少必需的环境变量 ${name}。请在 backend/.env 中配置。`)
  }
  return value
}

const rawAiBaseUrl = process.env.AI_BASE_URL || process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
const normalizedLegacyUrl = rawAiBaseUrl.replace(/\/$/, '')
const endsWithChatCompletions = /\/chat\/completions$/i.test(normalizedLegacyUrl)

const aiProvider = process.env.AI_PROVIDER || 'openai-compatible'
const aiBaseUrl = endsWithChatCompletions
  ? normalizedLegacyUrl.replace(/\/chat\/completions$/i, '')
  : normalizedLegacyUrl
const aiApiKey = process.env.AI_API_KEY || process.env.QWEN_API_KEY
const aiChatPath = process.env.AI_CHAT_PATH || (endsWithChatCompletions ? '/chat/completions' : '/chat/completions')
const aiAuthScheme = process.env.AI_AUTH_SCHEME || 'Bearer'
const aiExtraHeaderName = process.env.AI_EXTRA_HEADER_NAME || ''
const aiExtraHeaderValue = process.env.AI_EXTRA_HEADER_VALUE || ''

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'sql_learning_platform_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiProvider,
  aiBaseUrl,
  aiApiKey: required('AI_API_KEY', aiApiKey),
  aiChatPath,
  aiAuthScheme,
  aiExtraHeaderName,
  aiExtraHeaderValue,
  qwenApiKey: aiApiKey,
  qwenApiUrl: `${aiBaseUrl}${aiChatPath}`,
  qwenCoderModel: process.env.AI_CODER_MODEL || process.env.QWEN_CODER_MODEL || 'qwen3-coder-plus',
  qwenMaxModel: process.env.AI_CHAT_MODEL || process.env.QWEN_MAX_MODEL || 'qwen-max',
  qwenModel: process.env.AI_DEFAULT_MODEL || process.env.AI_CHAT_MODEL || process.env.QWEN_MODEL || 'qwen3-coder-plus',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isDev: (process.env.NODE_ENV || 'development') === 'development'
}

module.exports = config
