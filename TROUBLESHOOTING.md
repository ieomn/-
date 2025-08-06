# 🔧 故障排除指南

## 🚨 紧急问题处理

### 系统完全无法启动
```bash
# 1. 检查 Node.js 版本
node --version  # 需要 18.0+

# 2. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 重置数据库
npm run db:reset
npm run db:seed
npm run setup:demo

# 4. 重新启动
npm start
```

### 数据库损坏/丢失
```bash
# 1. 停止所有进程
# Ctrl+C 终止所有运行的服务

# 2. 删除损坏的数据库
rm prisma/dev.db

# 3. 重新创建数据库
npm run db:push
npm run db:seed
npm run setup:demo

# 4. 验证数据
npm run db:studio
```

---

## 🐛 具体错误解决

### "Port already in use" 错误

#### Windows 解决方案
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# 终止进程 (替换 <PID> 为实际进程ID)
taskkill /PID <PID> /F

# 或者重启电脑
```

#### macOS/Linux 解决方案
```bash
# 查找占用端口的进程
lsof -i :3000
lsof -i :5173

# 终止进程
kill -9 <PID>

# 批量终止 Node.js 进程
pkill -f node
```

### "Cannot find module" 错误

```bash
# 解决方案 1: 重新安装依赖
npm install

# 解决方案 2: 清除缓存
npm cache clean --force
npm install

# 解决方案 3: 检查 package.json
# 确保所有依赖都在 dependencies 或 devDependencies 中

# 解决方案 4: 安装缺失的包
npm install <缺失的包名>
```

### "Permission denied" 错误

#### Windows (以管理员身份运行)
```powershell
# 右键点击命令提示符/PowerShell
# 选择"以管理员身份运行"
```

#### macOS/Linux
```bash
# 修复 npm 权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 或者使用 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node
```

### "ENOENT" 文件不存在错误

```bash
# 检查当前目录
pwd
ls -la

# 确保在正确的项目目录中
cd /path/to/machine-data-nexus-main

# 检查关键文件是否存在
ls package.json
ls prisma/schema.prisma
ls src/
```

### Prisma 相关错误

#### "Prisma schema not found"
```bash
# 确保 schema.prisma 文件存在
ls prisma/schema.prisma

# 重新生成客户端
npx prisma generate
```

#### "Database connection failed"
```bash
# 检查数据库文件
ls -la prisma/dev.db

# 重新创建数据库
npm run db:push

# 如果还有问题，完全重置
npm run db:reset
```

#### "Migration failed"
```bash
# 重置迁移状态
npx prisma migrate reset

# 重新推送架构
npm run db:push
```

### 网络连接问题

#### API 请求失败
```bash
# 检查后端服务是否运行
curl http://localhost:3000/health

# 检查防火墙设置
# Windows: Windows Defender 防火墙
# macOS: 系统偏好设置 > 安全性与隐私 > 防火墙

# 检查环境变量
cat .env
```

#### 前端资源加载失败
```bash
# 清除浏览器缓存
# Ctrl+Shift+R (强制刷新)

# 检查前端服务
curl http://localhost:5173

# 重新构建
npm run build
npm run preview
```

---

## 🔍 诊断工具

### 系统诊断脚本
```bash
#!/bin/bash
# diagnosis.sh

echo "=== 系统诊断报告 ==="
echo "时间: $(date)"
echo ""

echo "1. Node.js 版本:"
node --version
echo ""

echo "2. npm 版本:"
npm --version
echo ""

echo "3. 项目依赖检查:"
npm list --depth=0
echo ""

echo "4. 数据库文件状态:"
ls -la prisma/dev.db 2>/dev/null || echo "数据库文件不存在"
echo ""

echo "5. 端口占用检查:"
lsof -i :3000 2>/dev/null || echo "端口 3000 未被占用"
lsof -i :5173 2>/dev/null || echo "端口 5173 未被占用"
echo ""

echo "6. 环境变量:"
cat .env 2>/dev/null || echo ".env 文件不存在"
echo ""

echo "=== 诊断完成 ==="
```

### 日志检查命令
```bash
# 查看前端日志 (浏览器控制台)
# F12 -> Console 标签

# 查看后端日志
# 在启动 npm start 的终端窗口中查看

# 查看系统日志 (Linux)
journalctl -u nodejs

# 查看系统日志 (macOS)
tail -f /var/log/system.log
```

---

## 🛠️ 性能问题

### 启动缓慢
```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules/.cache

# 使用更快的包管理器
npm install -g pnpm
pnpm install

# 增加内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm start
```

### 构建失败
```bash
# 检查 TypeScript 错误
npx tsc --noEmit

# 检查代码规范
npm run lint

# 增加构建内存
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# 清除构建缓存
rm -rf dist .vite
npm run build
```

### 运行时性能问题
```bash
# 启用生产模式
NODE_ENV=production npm start

# 检查内存使用
top -p $(pgrep node)

# 启用性能分析
NODE_ENV=development npm start
# 然后在浏览器中使用 Performance 面板
```

---

## 🔄 备份与恢复

### 快速备份
```bash
# 备份数据库
cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)

# 备份配置
cp .env .env.backup

# 备份用户上传文件 (如果有)
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

### 快速恢复
```bash
# 恢复数据库
cp prisma/dev.db.backup prisma/dev.db

# 恢复配置
cp .env.backup .env

# 重新启动服务
npm start
```

---

## 📞 获取更多帮助

### 检查清单
- [ ] Node.js 版本 ≥ 18.0
- [ ] 所有依赖已安装 (`npm install`)
- [ ] 数据库已初始化 (`npm run db:push`)
- [ ] 端口 3000 和 5173 未被占用
- [ ] 防火墙允许本地连接
- [ ] .env 文件配置正确

### 联系支持
1. 📋 准备诊断信息 (运行上面的诊断脚本)
2. 📸 截图错误信息
3. 📝 描述问题复现步骤
4. 💻 提供系统环境信息

### 社区资源
- **Prisma 文档**: https://www.prisma.io/docs
- **Vite 文档**: https://vitejs.dev/guide/
- **React 文档**: https://react.dev/
- **Node.js 文档**: https://nodejs.org/docs/

---

## 🎯 预防措施

### 定期维护
```bash
# 每周运行一次
npm audit               # 安全审计
npm outdated           # 检查过期依赖
npm run lint           # 代码检查

# 每月运行一次
npm update             # 更新依赖
npm run test           # 运行测试 (如果有)
```

### 监控指标
- 应用启动时间
- API 响应时间
- 数据库查询性能
- 内存使用情况
- 磁盘空间使用

记住：大多数问题都可以通过重新安装依赖和重置数据库来解决！