# 🚀 快速启动指南
## 5分钟部署步骤
### 1️⃣ 环境检查
```bash
# 检查 Node.js 版本 (需要 18.0+)
node --version

# 如果没有安装 Node.js，请访问: https://nodejs.org/
```

### 2️⃣ 安装依赖
```bash
# 进入项目目录
cd machine-data-nexus-main

# 安装依赖包
npm install
```

### 3️⃣ 初始化数据库
```bash
# 生成 Prisma 客户端
npm run db:generate

# 创建数据库并导入数据
npm run db:push
npm run db:seed
npm run setup:demo
```

### 4️⃣ 启动项目
```bash
# 启动开发服务器
npm start

# 项目将在以下地址运行:
# 前端: http://localhost:5173
# 后端: http://localhost:3000
```

### 5️⃣ 登录测试
- 打开浏览器访问: `http://localhost:5173`
- 使用演示账户登录:
  - 邮箱: `admin@machine-nexus.com`
  - 密码: 任意密码

---

## 🗄️ 数据库管理

### 可视化编辑 (推荐)
```bash
# 启动 Prisma Studio
npm run db:studio

# 在浏览器打开: http://localhost:5555
# 可以直接编辑所有数据表
```

### 命令行管理
```bash
# 启动数据库管理工具
node scripts/db-manager.js

# 批量更新用户部门名称
node scripts/update-company-name.js
```

---

## ❗ 常见问题

### 端口被占用
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# macOS/Linux
lsof -i :3000
kill -9 <进程ID>
```

### 依赖安装失败
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ES Module 错误
```bash
# 如果看到 "require is not defined" 错误
# 说明脚本需要使用 ES6 导入语法
# 已在最新版本中修复
```

---

## 📱 访问地址

- **前端界面**: http://localhost:5173
- **后端API**: http://localhost:3000
- **数据库管理**: http://localhost:5555 (需先运行 `npm run db:studio`)

---

## 🆘 需要帮助？

查看完整文档: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)