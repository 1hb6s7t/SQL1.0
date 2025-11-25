@echo off
chcp 65001 >nul
title SQL学习平台 - 开发服务器

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║   🎓 SQL学习平台 - 启动开发服务器                               ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: 检查依赖是否已安装
if not exist "node_modules" (
    echo ❌ 依赖未安装，请先运行 setup.bat
    pause
    exit /b 1
)

echo 🚀 正在启动开发服务器...
echo.
echo 前端地址: http://localhost:5173
echo 后端API: http://localhost:3000/api
echo.
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev

