# 🚀 机床性能数据管理与分析平台 - 快速开始

## 🎯 项目概述

这是一个使用 **React + SQLite + Prisma** 的本地化机床数据管理平台，无需任何外部服务或网络连接。

## ⚡ 一键启动

### Windows 用户
```batch
setup.bat
```

### Mac/Linux 用户
```bash
chmod +x setup.sh
./setup.sh
```

## 🔧 手动设置

如果自动脚本失败，可以手动执行：

```bash
# 1. 安装依赖
npm install

# 2. 生成数据库客户端
npm run db:generate

# 3. 创建数据库和表结构
npm run db:push

# 4. 添加基础数据
npm run db:seed

# 5. 生成演示数据
npm run setup:demo

# 6. 启动API服务器（新增！重要）
npm run server

# 7. 在新终端启动前端应用
npm run dev
```

## 🚀 完整启动命令

```bash
# 方法一：同时启动前后端（推荐）
npm run start

# 方法二：分别启动
# 终端1: 启动API服务器
npm run server

# 终端2: 启动前端应用
npm run dev
```

## 🎮 访问应用

- **前端应用**: http://localhost:5173 (Vite开发服务器)
- **API服务器**: http://localhost:3001 (Express后端)
- **健康检查**: http://localhost:3001/api/health
- **数据库文件**: `prisma/dev.db`

⚠️ **重要**: 确保同时运行前端和API服务器，否则会出现"加载数据失败"的错误。

## 🗄️ 数据库管理

### 方法一：图形化界面（推荐）
```bash
npm run db:studio
```
在浏览器中打开 Prisma Studio，可视化管理数据库

### 方法二：命令行工具
```bash
npm run db:manage
```
交互式命令行工具，功能包括：
- 📋 查看所有数据表内容
- 🧹 清除数据
- 🔄 重新生成演示数据
- 📊 查看数据统计

### 方法三：直接访问数据库
```bash
# 使用 sqlite3 命令行工具
sqlite3 prisma/dev.db
```

## 🚀 更快的体验

使用 `pnpm` 替代 `npm` 可以显著提高安装速度：

```bash
# 安装 pnpm
npm install -g pnpm

# 使用 pnpm 安装依赖
pnpm install

# 使用 pnpm 运行命令
pnpm run dev
```

## 📂 项目结构

```
machine-data-nexus-main/
├── prisma/                 # 数据库Schema和迁移
├── src/
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── lib/               # 工具函数和API服务
│   └── hooks/             # React Hooks
├── scripts/               # 数据库脚本
├── setup.bat             # Windows自动设置
└── setup.sh              # Unix自动设置
```

## 🛠️ 功能特性

- 📊 机床性能数据管理
- 📈 数据分析和可视化
- 📁 文件上传和处理
- 👥 用户管理和权限控制
- 🔍 数据搜索和过滤
- 📱 响应式设计

## 🆘 常见问题

### Q: 命令运行速度很慢？
A: 建议使用 `pnpm` 替代 `npm`，速度提升显著。

### Q: Windows终端出现乱码？
A: 在PowerShell中运行 `chcp 65001` 设置UTF-8编码。

### Q: 找不到Prisma命令？
A: 所有脚本已配置使用 `npx prisma`，无需全局安装。

### Q: 数据存储在哪里？
A: 所有数据存储在本地SQLite文件 `prisma/dev.db` 中。

## 🎉 开始使用

现在您可以：
1. 管理机床设备信息
2. 上传和分析测试数据
3. 查看性能报告和趋势
4. 管理用户和权限

**祝您使用愉快！** 🌟