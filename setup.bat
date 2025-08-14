chcp 65001
@echo off
setlocal EnableExtensions EnableDelayedExpansion
:: 确保在脚本所在目录执行
cd /d %~dp0

:: ============== 日志设置（自动保存错误信息） ==============
set "LOG_DIR=logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set "LOG=%LOG_DIR%\setup-%RANDOM%.log"
echo 日志文件: %LOG%

:: ================== 一键启动配置 ==================
set "FRONTEND_PORT=5173"
set "API_PORT=3001"
set "API_URL=http://localhost:%API_PORT%"

echo 🚀 机床数据管理平台 - 自动设置脚本（一键启动）
echo ===============================================
echo 前端端口: %FRONTEND_PORT%
echo API端口  : %API_PORT%
echo API地址  : %API_URL%

echo.
echo 🧩 检查 Node 和 npm 版本...
where node >nul 2>nul || (echo ❌ 未检测到 Node.js，请先安装 https://nodejs.org/ & pause & exit /b 1)
where npm  >nul 2>nul || (echo ❌ 未检测到 npm，请安装包含 npm 的 Node.js & pause & exit /b 1)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('npm --version')  do set NPM_VER=%%v
echo ✅ Node: !NODE_VER! / npm: !NPM_VER!

echo.
echo 📝 同步环境变量到 .env （VITE_API_URL）...
:: 纯批处理实现，避免 PowerShell 转义问题
if not exist .env (
  (echo NODE_ENV=development&echo VITE_API_URL=%API_URL%) > .env
) else (
  > tmp_env.txt (
    for /f "usebackq delims=" %%l in (".env") do @(
      echo %%l| findstr /R /B /C:"VITE_API_URL=" >nul || echo %%l
    )
    echo VITE_API_URL=%API_URL%
  )
  move /Y tmp_env.txt .env >nul
)

echo.
echo 📦 安装依赖...
call npm install >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    echo 详情见日志: %LOG%
    pause
    exit /b 1
)

echo.
echo 🗄️ 生成 Prisma 客户端...
call npm run db:generate >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
    echo ❌ Prisma 客户端生成失败
    echo 详情见日志: %LOG%
    pause
    exit /b 1
)

echo.
echo 🏗️ 创建/同步数据库结构...
call npm run db:push >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
    echo ❌ 数据库创建失败
    echo 详情见日志: %LOG%
    pause
    exit /b 1
)

echo.
echo 🌱 生成基础数据...
call npm run db:seed >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
    echo ❌ 基础数据生成失败
    echo 详情见日志: %LOG%
    pause
    exit /b 1
)

echo.
echo 🎮 生成演示数据...
call npm run setup:demo >> "%LOG%" 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ 演示数据生成失败，但可以继续使用
    echo 详情见日志: %LOG%
)

echo.
echo ✅ 设置完成！
echo.
echo 🚀 启动开发服务器（API 与 前端）...
echo   - API:    http://localhost:%API_PORT%
echo   - 前端:   http://localhost:%FRONTEND_PORT%
echo   - 日志:   %LOG%

:: 在单独窗口启动 API（设置 PORT 环境变量）
start "API Server" cmd /k "set PORT=%API_PORT% && npm run server"

:: 给 API 预热几秒
timeout /t 3 /nobreak > nul

:: 启动前端（Vite 端口在 vite.config.ts 中为 %FRONTEND_PORT%）
start "Vite Dev Server" cmd /k "npm run dev -- --port %FRONTEND_PORT%"

:: 自动打开浏览器访问前端和后端健康检查
timeout /t 2 /nobreak > nul
start "" http://localhost:%FRONTEND_PORT%
start "" http://localhost:%API_PORT%/api/health

echo.
echo 📝 使用说明:
echo   前端应用: http://localhost:%FRONTEND_PORT%
echo   API服务器: http://localhost:%API_PORT%
echo   健康检查: http://localhost:%API_PORT%/api/health
echo   可视化DB: 运行 ^"npm run db:studio^" 后访问 http://localhost:5555
echo.
echo 按任意键退出本窗口（服务已在独立窗口运行）...
pause > nul
endlocal