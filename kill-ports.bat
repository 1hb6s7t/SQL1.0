@echo off
chcp 65001 >nul
title 清理端口占用

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║   🔧 清理SQL学习平台端口占用                                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 正在查找占用端口的进程...
echo.

:: 查找并关闭3000端口
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 发现进程 %%a 占用3000端口，正在关闭...
    taskkill /F /PID %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ 已关闭3000端口占用
    ) else (
        echo ⚠ 关闭3000端口失败（可能已关闭）
    )
)

:: 查找并关闭5173端口
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo 发现进程 %%a 占用5173端口，正在关闭...
    taskkill /F /PID %%a >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ 已关闭5173端口占用
    ) else (
        echo ⚠ 关闭5173端口失败（可能已关闭）
    )
)

echo.
echo ✨ 端口清理完成！
echo.
echo 现在可以运行 start.bat 启动服务了
echo.
pause

