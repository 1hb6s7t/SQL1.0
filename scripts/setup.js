/**
 * SQL学习平台 - 一键配置脚本
 * 
 * 功能：
 * 1. 检查Node.js环境
 * 2. 安装所有依赖
 * 3. 创建环境配置文件
 * 4. 初始化数据库
 * 5. 启动开发服务器
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// 执行命令
function runCommand(command, cwd = process.cwd()) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

// 检查Node.js版本
function checkNodeVersion() {
  log.title('🔍 检查Node.js环境');
  
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major >= 18) {
      log.success(`Node.js版本: ${version}`);
      return true;
    } else {
      log.error(`Node.js版本过低 (${version})，需要 v18.0.0 或更高版本`);
      log.info('请访问 https://nodejs.org/ 下载最新版本');
      return false;
    }
  } catch (error) {
    log.error('未检测到Node.js，请先安装Node.js');
    log.info('请访问 https://nodejs.org/ 下载安装');
    return false;
  }
}

// 创建环境配置文件
function createEnvFile() {
  log.title('📝 创建环境配置文件');
  
  const envContent = `# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置 (NeonDB PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_9VrHRgt4KyxT@ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT密钥 (请在生产环境中更换为更安全的密钥)
JWT_SECRET=sql_learning_platform_secret_key_2024
JWT_EXPIRES_IN=7d

# Qwen AI API配置
QWEN_API_KEY=sk-79bf85aad3e94afb9ea071c617d32c3b
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_MODEL=qwen-plus

# 前端URL (CORS配置)
FRONTEND_URL=http://localhost:5173
`;

  const envPath = path.join(__dirname, '..', 'backend', '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    log.success('环境配置文件已创建: backend/.env');
    return true;
  } catch (error) {
    log.error('创建环境配置文件失败: ' + error.message);
    return false;
  }
}

// 安装依赖
function installDependencies() {
  log.title('📦 安装项目依赖');
  
  const rootDir = path.join(__dirname, '..');
  const backendDir = path.join(rootDir, 'backend');
  const frontendDir = path.join(rootDir, 'frontend');
  
  log.info('安装根目录依赖...');
  if (!runCommand('npm install', rootDir)) {
    log.error('根目录依赖安装失败');
    return false;
  }
  log.success('根目录依赖安装完成');
  
  log.info('安装后端依赖...');
  if (!runCommand('npm install', backendDir)) {
    log.error('后端依赖安装失败');
    return false;
  }
  log.success('后端依赖安装完成');
  
  log.info('安装前端依赖...');
  if (!runCommand('npm install', frontendDir)) {
    log.error('前端依赖安装失败');
    return false;
  }
  log.success('前端依赖安装完成');
  
  return true;
}

// 初始化数据库
function initDatabase() {
  log.title('🗄️ 初始化数据库');
  
  const backendDir = path.join(__dirname, '..', 'backend');
  
  log.info('正在连接数据库并创建表结构...');
  if (!runCommand('npm run init-db', backendDir)) {
    log.warning('数据库初始化可能出现问题，请检查数据库连接');
    return false;
  }
  
  log.success('数据库初始化完成');
  return true;
}

// 主函数
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎓 SQL学习平台 - 一键配置工具                                 ║
║                                                                ║
║   本工具将帮助您:                                               ║
║   • 检查运行环境                                                ║
║   • 安装所有依赖                                                ║
║   • 配置数据库                                                  ║
║   • 启动开发服务器                                              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);

  // 1. 检查Node.js
  if (!checkNodeVersion()) {
    process.exit(1);
  }

  // 2. 安装依赖
  if (!installDependencies()) {
    log.error('依赖安装失败，请检查网络连接后重试');
    process.exit(1);
  }

  // 3. 创建环境配置
  createEnvFile();

  // 4. 初始化数据库
  initDatabase();

  // 完成
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ✨ 配置完成！                                                 ║
║                                                                ║
║   启动开发服务器:                                               ║
║   ${colors.cyan}npm run dev${colors.reset}                                                  ║
║                                                                ║
║   或分别启动:                                                   ║
║   后端: ${colors.cyan}cd backend && npm run dev${colors.reset}                             ║
║   前端: ${colors.cyan}cd frontend && npm run dev${colors.reset}                            ║
║                                                                ║
║   访问地址:                                                     ║
║   • 前端: http://localhost:5173                                ║
║   • 后端API: http://localhost:3000/api                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

main().catch(console.error);

