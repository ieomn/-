chcp 65001
@echo off
echo 🚀 机床数据管理平台 - 自动设置脚本
echo =======================================

echo.
echo 📦 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🗄️ 生成 Prisma 客户端...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ❌ Prisma 客户端生成失败
    pause
    exit /b 1
)

echo.
echo 🏗️ 创建数据库...
call npm run db:push
if %errorlevel% neq 0 (
    echo ❌ 数据库创建失败
    pause
    exit /b 1
)

echo.
echo 🌱 生成基础数据...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ 基础数据生成失败
    pause
    exit /b 1
)

echo.
echo 🎮 生成演示数据...
call npm run setup:demo
if %errorlevel% neq 0 (
    echo ⚠️ 演示数据生成失败，但可以继续使用
)

echo.
echo ✅ 设置完成！
echo.
echo 🚀 启动开发服务器...
echo 正在同时启动API服务器和前端应用...
start "API Server" npm run server
timeout /t 3 /nobreak > nul
start "Vite Dev Server" npm run dev

echo.
echo 📝 使用说明:
echo   前端应用: http://localhost:5173
echo   API服务器: http://localhost:3001
echo   查看数据: npm run db:studio
echo   健康检查: http://localhost:3001/api/health
echo.
pause