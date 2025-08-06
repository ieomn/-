# 机床性能数据管理平台 - 完整部署与操作指南

## 📋 目录
- [系统要求](#系统要求)
- [环境准备](#环境准备)
- [项目部署](#项目部署)
- [数据库管理](#数据库管理)
- [开发调试](#开发调试)
- [常见问题与解决方案](#常见问题与解决方案)
- [维护与备份](#维护与备份)

---

## 🖥️ 系统要求

### 最低配置
- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 18.04+)
- **内存**: 4GB RAM (推荐 8GB+)
- **存储**: 2GB 可用空间
- **网络**: 稳定的互联网连接

### 软件依赖
- Node.js 18.0+ (推荐 LTS 版本)
- npm 8.0+ 或 pnpm 7.0+
- Git 2.20+
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

---

## 🛠️ 环境准备

### 1. 安装 Node.js

#### Windows
```bash
# 访问官网下载
https://nodejs.org/

# 或使用 Chocolatey (推荐)
choco install nodejs

# 或使用 Winget
winget install OpenJS.NodeJS
```

#### macOS
```bash
# 使用 Homebrew (推荐)
brew install node

# 或使用官网安装包
https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# 使用 NodeSource 仓库 (推荐)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用 snap
sudo snap install node --classic
```

### 2. 验证安装
```bash
node --version  # 应显示 v18.0.0 或更高
npm --version   # 应显示 8.0.0 或更高
```

### 3. 安装 Git
```bash
# Windows
winget install Git.Git

# macOS
brew install git

# Linux
sudo apt install git
```

### 4. 配置 Git (首次使用)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 🚀 项目部署

### 1. 获取项目代码

#### 方法一：从 GitHub 克隆
```bash
git clone <repository-url>
cd machine-data-nexus
```

#### 方法二：下载压缩包
```bash
# 下载并解压到目标目录
# 进入项目目录
cd machine-data-nexus-main
```

### 2. 安装依赖

#### 使用 npm (推荐)
```bash
npm install
```

#### 使用 pnpm (更快)
```bash
# 先安装 pnpm
npm install -g pnpm

# 安装项目依赖
pnpm install
```

#### 使用 yarn
```bash
# 先安装 yarn
npm install -g yarn

# 安装项目依赖
yarn install
```

### 3. 环境配置

#### 创建环境变量文件
```bash
# 复制环境变量模板
cp .env.example .env

# 或手动创建 .env 文件
touch .env
```

#### 配置 .env 文件内容
```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# 应用配置
NODE_ENV=development
PORT=3000
VITE_PORT=5173

# API 配置
API_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000

# 其他配置
LOG_LEVEL=info
```

### 4. 数据库初始化

#### 生成 Prisma 客户端
```bash
npm run db:generate
```

#### 推送数据库架构
```bash
npm run db:push
```

#### 生成种子数据
```bash
npm run db:seed
```

#### 生成演示数据
```bash
npm run setup:demo
```

### 5. 启动项目

#### 开发模式 (前端 + 后端)
```bash
npm start
```

#### 仅前端开发
```bash
npm run dev
```

#### 仅后端服务
```bash
npm run server
```

#### 生产模式
```bash
# 构建项目
npm run build

# 启动生产服务器
npm run preview
```

---

## 🗄️ 数据库管理

### 1. Prisma Studio (可视化界面)

#### 启动 Prisma Studio
```bash
npm run db:studio
# 或
npx prisma studio
```

#### 访问界面
- 打开浏览器访问: `http://localhost:5555`
- 可以直接编辑数据、添加记录、删除数据

#### 主要功能
- 📊 表格视图显示所有数据
- ✏️ 点击单元格直接编辑
- ➕ 添加新记录
- 🗑️ 删除记录
- 🔍 搜索和过滤
- 🔗 查看表关系

### 2. 命令行数据库管理

#### 使用自定义管理工具
```bash
node scripts/db-manager.js
```

#### 可用操作
1. 查看所有用户
2. 查看机床类别
3. 查看机床型号
4. 查看测试会话
5. 查看分析结果
6. 查看上传文件
7. 清除所有数据
8. 重新生成演示数据
9. 数据库统计信息

#### 批量更新用户部门
```bash
node scripts/update-company-name.js
```

### 3. 直接 SQL 操作

#### 使用 SQLite 命令行
```bash
# 安装 sqlite3
npm install -g sqlite3

# 连接数据库
sqlite3 prisma/dev.db

# 常用 SQL 命令
.tables                              # 查看所有表
.schema user_profiles               # 查看表结构
SELECT * FROM user_profiles;       # 查询所有用户
UPDATE user_profiles SET department = '通用技术集团机床工程研究院'; # 更新部门
.quit                              # 退出
```

### 4. 数据库架构管理

#### 修改数据库架构
```bash
# 编辑 prisma/schema.prisma 文件后执行:
npm run db:push          # 开发环境推送变更
npm run db:migrate       # 生产环境迁移
```

#### 重置数据库
```bash
npm run db:reset         # 完全重置数据库
```

---

## 🔧 开发调试

### 1. 开发服务器

#### 启动开发环境
```bash
# 同时启动前后端
npm start

# 分别启动
npm run dev     # 前端 (http://localhost:5173)
npm run server  # 后端 (http://localhost:3000)
```

#### 热重载
- 前端代码修改会自动刷新浏览器
- 后端代码修改需要手动重启服务器

### 2. 代码检查

#### ESLint 检查
```bash
npm run lint            # 检查代码规范
npm run lint:fix        # 自动修复可修复的问题
```

#### TypeScript 检查
```bash
npx tsc --noEmit        # 类型检查
```

### 3. 调试技巧

#### 前端调试
- 使用浏览器开发者工具 (F12)
- 查看 Console 日志
- 使用 React Developer Tools
- 检查 Network 面板查看 API 请求

#### 后端调试
- 查看服务器控制台输出
- 使用 `console.log()` 添加日志
- 检查数据库连接状态

### 4. 性能监控

#### 前端性能
```bash
npm run build           # 查看构建体积
npm run preview         # 预览生产版本
```

#### 后端性能
- 监控 API 响应时间
- 查看数据库查询性能
- 检查内存使用情况

---

## ❗ 常见问题与解决方案

### 1. 安装问题

#### 问题：npm install 失败
```bash
# 解决方案
# 1. 清除缓存
npm cache clean --force

# 2. 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 3. 使用淘宝镜像
npm config set registry https://registry.npmmirror.com/
npm install

# 4. 使用 pnpm 替代
npm install -g pnpm
pnpm install
```

#### 问题：权限错误 (Linux/macOS)
```bash
# 解决方案
# 1. 使用 sudo (不推荐)
sudo npm install

# 2. 配置 npm 全局目录 (推荐)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. 数据库问题

#### 问题：Prisma 生成失败
```bash
# 解决方案
# 1. 重新生成客户端
npx prisma generate

# 2. 清除生成文件重新生成
rm -rf node_modules/.prisma
npm run db:generate

# 3. 检查 schema.prisma 语法
npx prisma validate
```

#### 问题：数据库连接失败
```bash
# 解决方案
# 1. 检查数据库文件是否存在
ls -la prisma/dev.db

# 2. 重新推送架构
npm run db:push

# 3. 完全重置数据库
npm run db:reset
```

#### 问题：ES Module 错误
```bash
# 错误信息：require is not defined in ES module scope

# 解决方案：修改文件导入语法
# 将 const { something } = require('module')
# 改为 import { something } from 'module'

# 或重命名文件为 .cjs 扩展名
mv script.js script.cjs
```

### 3. 启动问题

#### 问题：端口被占用
```bash
# 错误信息：Port 3000 is already in use

# 解决方案
# 1. 查找占用进程
lsof -i :3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 2. 终止进程
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows

# 3. 使用不同端口
PORT=3001 npm start
```

#### 问题：前端页面空白
```bash
# 解决方案
# 1. 检查控制台错误
# 打开浏览器 F12 -> Console

# 2. 检查 API 连接
# 确保后端服务正在运行

# 3. 清除浏览器缓存
# Ctrl+Shift+R 强制刷新

# 4. 重新构建
npm run build
npm run preview
```

### 4. 认证问题

#### 问题：登录失败
```bash
# 检查项目
# 1. 确认数据库中有用户数据
node scripts/db-manager.js
# 选择 1 查看所有用户

# 2. 检查演示用户是否存在
# 默认管理员: admin@machine-nexus.com

# 3. 重新生成演示数据
npm run setup:demo
```

### 5. 构建问题

#### 问题：构建失败
```bash
# 解决方案
# 1. 检查 TypeScript 错误
npx tsc --noEmit

# 2. 检查 ESLint 错误
npm run lint

# 3. 清除缓存重新构建
rm -rf dist .vite
npm run build

# 4. 增加内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 6. 网络问题

#### 问题：API 请求失败
```bash
# 解决方案
# 1. 检查后端服务状态
curl http://localhost:3000/health

# 2. 检查环境变量配置
cat .env

# 3. 检查防火墙设置
# Windows: 检查 Windows Defender 防火墙
# macOS: 检查系统偏好设置 -> 安全性与隐私 -> 防火墙
```

### 7. 跨平台问题

#### Windows 特定问题
```bash
# 路径分隔符问题
# 使用 path.join() 而不是字符串拼接

# 权限问题
# 以管理员身份运行命令提示符

# 字符编码问题
# 设置 PowerShell 编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

#### macOS 特定问题
```bash
# Xcode 命令行工具
xcode-select --install

# Homebrew 权限
sudo chown -R $(whoami) /usr/local/share/zsh
```

#### Linux 特定问题
```bash
# 安装构建工具
sudo apt-get install build-essential

# 权限问题
sudo chown -R $USER:$USER ~/.npm
```

---

## 🔒 维护与备份

### 1. 数据备份

#### 自动备份脚本
```bash
#!/bin/bash
# backup.sh

# 创建备份目录
mkdir -p backups

# 备份数据库
DATE=$(date +%Y%m%d_%H%M%S)
cp prisma/dev.db "backups/dev_backup_$DATE.db"

# 备份上传文件
tar -czf "backups/uploads_$DATE.tar.gz" public/uploads/

# 清理老备份 (保留最近30天)
find backups/ -name "*.db" -mtime +30 -delete
find backups/ -name "*.tar.gz" -mtime +30 -delete

echo "备份完成: $DATE"
```

#### 手动备份
```bash
# 备份数据库
cp prisma/dev.db prisma/dev.db.backup

# 备份配置文件
cp .env .env.backup

# 导出数据
npx prisma db pull
```

### 2. 系统更新

#### 更新依赖
```bash
# 检查过期依赖
npm outdated

# 更新小版本
npm update

# 更新主版本 (谨慎)
npx npm-check-updates -u
npm install
```

#### 更新数据库架构
```bash
# 1. 修改 prisma/schema.prisma
# 2. 生成迁移文件
npx prisma migrate dev --name update_schema

# 3. 应用到生产环境
npx prisma migrate deploy
```

### 3. 性能优化

#### 前端优化
```bash
# 分析包大小
npm run build -- --analyze

# 启用 gzip 压缩
# 在生产服务器配置 gzip

# 使用 CDN
# 配置静态资源 CDN
```

#### 后端优化
```bash
# 数据库索引优化
# 在 schema.prisma 中添加索引

# 查询优化
# 使用 Prisma 查询分析器
npx prisma studio
```

### 4. 监控告警

#### 基础监控
```bash
# 创建健康检查端点
# /health - 服务状态
# /metrics - 性能指标

# 日志收集
# 配置日志轮转
# 使用结构化日志
```

#### 错误追踪
```bash
# 集成 Sentry (可选)
npm install @sentry/node @sentry/react

# 配置错误报告
# 监控关键指标
```

---

## 📞 技术支持

### 获取帮助
- **项目文档**: 查看 README.md
- **API 文档**: 访问 /api/docs (如果配置)
- **数据库管理**: 使用 Prisma Studio
- **日志查看**: 检查控制台输出

### 最佳实践
1. 定期备份数据库
2. 保持依赖更新
3. 使用版本控制
4. 编写测试用例
5. 监控系统性能
6. 定期安全检查

### 紧急处理
1. 服务宕机: 检查日志 -> 重启服务 -> 回滚版本
2. 数据丢失: 恢复备份 -> 检查数据完整性
3. 安全问题: 立即更新 -> 修复漏洞 -> 安全检查

---

## 📚 附录

### 有用的命令速查表
```bash
# 项目管理
npm start              # 启动开发服务器
npm run build          # 构建生产版本
npm run preview        # 预览生产版本
npm test               # 运行测试

# 数据库管理
npm run db:studio      # 启动 Prisma Studio
npm run db:generate    # 生成 Prisma 客户端
npm run db:push        # 推送架构到数据库
npm run db:seed        # 生成种子数据
npm run db:reset       # 重置数据库

# 开发工具
npm run lint           # 代码检查
npm run lint:fix       # 自动修复代码问题
npm run dev           # 仅启动前端开发服务器
npm run server        # 仅启动后端服务器

# 自定义脚本
node scripts/db-manager.js           # 数据库管理工具
node scripts/update-company-name.js  # 批量更新部门名称
```

### 环境变量参考
```env
# 必需变量
DATABASE_URL=file:./dev.db
NODE_ENV=development
PORT=3000
VITE_PORT=5173

# 可选变量
API_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
LOG_LEVEL=info
DEBUG=false
```

---

**版本**: 1.0.0  
**更新日期**: 2024年12月  
**维护者**: 开发团队