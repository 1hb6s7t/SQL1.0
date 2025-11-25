@echo off
chcp 65001 >nul
title SQL学习平台 - 一键配置工具

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║   🎓 SQL学习平台 - Windows一键配置                             ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: 检查Node.js
echo [1/5] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js版本: %NODE_VERSION%

:: 安装根目录依赖
echo.
echo [2/5] 安装根目录依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 根目录依赖安装失败
    pause
    exit /b 1
)
echo ✓ 根目录依赖安装完成

:: 安装后端依赖
echo.
echo [3/5] 安装后端依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo ✓ 后端依赖安装完成
cd ..

:: 安装前端依赖
echo.
echo [4/5] 安装前端依赖...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ 前端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo ✓ 前端依赖安装完成
cd ..

:: 创建环境配置文件
echo.
echo [5/5] 创建环境配置文件...
(
echo # 服务器配置
echo PORT=3000
echo NODE_ENV=development
echo.
echo # 数据库配置 ^(NeonDB PostgreSQL^)
echo DATABASE_URL=postgresql://neondb_owner:npg_9VrHRgt4KyxT@ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
echo.
echo # JWT密钥
echo JWT_SECRET=sql_learning_platform_secret_key_2024
echo JWT_EXPIRES_IN=7d
echo.
echo # Qwen AI API配置
echo QWEN_API_KEY=sk-79bf85aad3e94afb9ea071c617d32c3b
echo QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
echo QWEN_MODEL=qwen-plus
echo.
echo # 前端URL
echo FRONTEND_URL=http://localhost:5173
) > backend\.env
echo ✓ 环境配置文件已创建

:: 初始化数据库
echo.
echo [额外] 初始化数据库...
cd backend
call npm run init-db
cd ..

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║   ✨ 配置完成！                                                ║
echo ║                                                                ║
echo ║   启动开发服务器:                                              ║
echo ║   运行 start.bat 或执行 npm run dev                            ║
echo ║                                                                ║
echo ║   访问地址:                                                    ║
echo ║   • 前端: http://localhost:5173                               ║
echo ║   • 后端API: http://localhost:3000/api                        ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
pause

