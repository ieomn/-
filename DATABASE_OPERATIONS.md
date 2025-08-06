# 🗄️ 数据库操作完整指南

## 📋 目录
- [数据库概览](#数据库概览)
- [可视化管理界面](#可视化管理界面)
- [命令行管理工具](#命令行管理工具)
- [数据备份与恢复](#数据备份与恢复)
- [常用操作示例](#常用操作示例)
- [高级操作](#高级操作)

---

## 🏗️ 数据库概览

### 数据库架构
- **类型**: SQLite (轻量级文件数据库)
- **位置**: `prisma/dev.db`
- **ORM**: Prisma
- **架构文件**: `prisma/schema.prisma`

### 主要数据表
```
用户管理:
├── user_profiles (用户档案)

机床管理:
├── machine_categories (机床类别)
├── machine_models (机床型号)
└── machine_components (机床组件)

测试数据:
├── test_sessions (测试会话)
├── simulation_data (仿真数据)
├── test_data (实测数据)
└── data_comparisons (数据对比)

文件管理:
├── uploaded_files (上传文件)
├── analysis_results (分析结果)
└── system_statistics (系统统计)
```

---

## 🎨 可视化管理界面

### 启动 Prisma Studio

#### 方法一：使用 npm 脚本
```bash
npm run db:studio
```

#### 方法二：直接使用 npx
```bash
npx prisma studio
```

#### 方法三：全局安装后使用
```bash
npm install -g prisma
prisma studio
```

### 访问界面
```
URL: http://localhost:5555
自动在浏览器中打开可视化界面
```

### 界面功能详解

#### 📊 数据查看
- **表格视图**: 以表格形式显示所有记录
- **分页浏览**: 自动分页处理大量数据
- **排序功能**: 点击列头进行排序
- **搜索过滤**: 使用搜索框快速查找数据

#### ✏️ 数据编辑
- **添加记录**: 点击 "Add record" 按钮
- **编辑数据**: 直接点击单元格进行编辑
- **删除记录**: 选择记录后点击删除按钮
- **批量操作**: 选择多条记录进行批量删除

#### 🔗 关系查看
- **外键链接**: 点击外键值查看关联记录
- **关系图表**: 可视化显示表之间的关系
- **嵌套编辑**: 在编辑记录时可以同时创建关联记录

### 具体操作步骤

#### 更新用户部门信息
1. 启动 Prisma Studio: `npm run db:studio`
2. 在浏览器中打开 `http://localhost:5555`
3. 点击左侧的 "UserProfile" 表
4. 找到要编辑的用户记录
5. 点击 "department" 列的单元格
6. 输入新的部门名称: "通用技术集团机床工程研究院"
7. 按 Enter 键保存更改

#### 添加新用户
1. 在 UserProfile 表中点击 "Add record"
2. 填写必填字段:
   - email: 用户邮箱
   - fullName: 用户全名
   - role: 选择角色 (ADMIN/ENGINEER/OPERATOR)
   - department: 部门名称
3. 点击 "Save" 保存新记录

#### 查看数据关系
1. 在用户记录中点击任意外键字段
2. 系统会自动跳转到关联的记录
3. 可以查看该用户的所有测试会话、上传文件等

---

## 💻 命令行管理工具

### 启动内置管理工具
```bash
node scripts/db-manager.js
```

### 功能菜单
```
==========================================
🗄️  机床数据管理平台 - 数据库管理工具
==========================================
1. 查看所有用户
2. 查看机床类别
3. 查看机床型号
4. 查看测试会话
5. 查看分析结果
6. 查看上传文件
7. 清除所有数据
8. 重新生成演示数据
9. 数据库统计信息
0. 退出
==========================================
```

### 常用操作

#### 查看用户列表
```bash
# 选择菜单项 1
# 显示所有用户的详细信息:
- ID: user-123
  邮箱: admin@machine-nexus.com
  姓名: 演示管理员
  角色: ADMIN
  部门: 通用技术集团机床工程研究院
  创建时间: 2024-12-19 10:30:00
```

#### 数据库统计
```bash
# 选择菜单项 9
# 显示各表的记录数量:
👥 用户数量: 5
🏭 机床类别: 3
🔧 机床型号: 12
🧪 测试会话: 25
📁 上传文件: 18
📊 分析结果: 15
```

#### 清除和重置数据
```bash
# 选择菜单项 7 - 清除所有数据
# 系统会警告确认，输入 'yes' 继续

# 选择菜单项 8 - 重新生成演示数据
# 自动运行 db:seed 和 setup:demo 脚本
```

### 专用更新脚本

#### 批量更新部门名称
```bash
node scripts/update-company-name.js
```

输出示例:
```
🏢 开始批量更新用户部门名称...
目标部门: 通用技术集团机床工程研究院
✅ 数据库连接成功
📊 当前用户总数: 5

📋 更新前的用户部门信息:
1. 演示管理员 - 当前部门: 技术部
2. 工程师张三 - 当前部门: 工程部
3. 操作员李四 - 当前部门: 生产部

🔄 正在执行批量更新...
✅ 成功更新了 5 个用户的部门信息

📋 更新后的用户部门信息:
1. 演示管理员 - 新部门: 通用技术集团机床工程研究院
2. 工程师张三 - 新部门: 通用技术集团机床工程研究院
3. 操作员李四 - 新部门: 通用技术集团机床工程研究院

🎉 部门名称更新完成！
```

---

## 🛠️ 直接 SQL 操作

### 使用 SQLite 命令行

#### 安装 SQLite 工具
```bash
# Windows (使用 Chocolatey)
choco install sqlite

# macOS (使用 Homebrew)
brew install sqlite

# Linux (Ubuntu/Debian)
sudo apt install sqlite3

# 或使用 npm 全局安装
npm install -g sqlite3
```

#### 连接数据库
```bash
sqlite3 prisma/dev.db
```

#### 基本 SQL 命令
```sql
-- 查看所有表
.tables

-- 查看表结构
.schema user_profiles

-- 查看用户列表
SELECT * FROM user_profiles;

-- 更新所有用户的部门
UPDATE user_profiles 
SET department = '通用技术集团机床工程研究院';

-- 查询特定角色的用户
SELECT email, full_name, role, department 
FROM user_profiles 
WHERE role = 'ADMIN';

-- 统计各角色用户数量
SELECT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role;

-- 查看最近创建的用户
SELECT email, full_name, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 退出
.quit
```

### 高级 SQL 查询示例

#### 用户活动统计
```sql
-- 查看用户的测试会话数量
SELECT 
    up.full_name,
    up.email,
    COUNT(ts.id) as session_count
FROM user_profiles up
LEFT JOIN test_sessions ts ON up.id = ts.operator_id
GROUP BY up.id, up.full_name, up.email
ORDER BY session_count DESC;
```

#### 机床使用情况
```sql
-- 查看各机床型号的测试次数
SELECT 
    mm.name as machine_name,
    COUNT(ts.id) as test_count
FROM machine_models mm
LEFT JOIN test_sessions ts ON mm.id = ts.model_id
GROUP BY mm.id, mm.name
ORDER BY test_count DESC;
```

#### 文件上传统计
```sql
-- 查看用户上传文件统计
SELECT 
    up.full_name,
    COUNT(uf.id) as file_count,
    SUM(uf.file_size) as total_size
FROM user_profiles up
LEFT JOIN uploaded_files uf ON up.id = uf.uploader_id
GROUP BY up.id, up.full_name
ORDER BY file_count DESC;
```

---

## 💾 数据备份与恢复

### 自动备份脚本

#### 创建备份脚本
```bash
#!/bin/bash
# scripts/backup-db.sh

# 创建备份目录
mkdir -p backups

# 生成时间戳
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 备份数据库文件
cp prisma/dev.db "backups/dev_backup_$TIMESTAMP.db"

# 导出数据为 SQL 格式
sqlite3 prisma/dev.db .dump > "backups/dev_backup_$TIMESTAMP.sql"

# 压缩备份文件
gzip "backups/dev_backup_$TIMESTAMP.sql"

# 清理30天前的备份
find backups/ -name "*.db" -mtime +30 -delete
find backups/ -name "*.sql.gz" -mtime +30 -delete

echo "备份完成: dev_backup_$TIMESTAMP"
echo "备份位置: backups/"
```

#### 设置定时备份 (Linux/macOS)
```bash
# 编辑 crontab
crontab -e

# 添加定时任务 (每天凌晨2点备份)
0 2 * * * /path/to/project/scripts/backup-db.sh
```

### 手动备份
```bash
# 快速备份
cp prisma/dev.db prisma/dev.db.backup

# 带时间戳的备份
cp prisma/dev.db "prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"

# 导出为 SQL 格式
sqlite3 prisma/dev.db .dump > backup.sql
```

### 数据恢复
```bash
# 从备份文件恢复
cp prisma/dev.db.backup prisma/dev.db

# 从 SQL 文件恢复
sqlite3 prisma/dev.db < backup.sql

# 验证数据完整性
npm run db:studio
```

---

## 🚀 常用操作示例

### 用户管理操作

#### 创建新管理员用户
```sql
INSERT INTO user_profiles (
    id, email, full_name, role, department, created_at, updated_at
) VALUES (
    'admin-' || datetime('now'),
    'newadmin@company.com',
    '新管理员',
    'ADMIN',
    '通用技术集团机床工程研究院',
    datetime('now'),
    datetime('now')
);
```

#### 批量更新用户角色
```sql
-- 将所有操作员提升为工程师
UPDATE user_profiles 
SET role = 'ENGINEER', updated_at = datetime('now')
WHERE role = 'OPERATOR';
```

#### 查找活跃用户
```sql
-- 查找最近30天有活动的用户
SELECT DISTINCT up.*
FROM user_profiles up
JOIN test_sessions ts ON up.id = ts.operator_id
WHERE ts.created_at >= date('now', '-30 days');
```

### 数据清理操作

#### 清理测试数据
```sql
-- 删除指定日期前的测试会话
DELETE FROM test_sessions 
WHERE created_at < date('now', '-90 days');

-- 删除状态为失败的测试会话
DELETE FROM test_sessions 
WHERE status = 'FAILED';
```

#### 清理上传文件记录
```sql
-- 删除处理失败的文件记录
DELETE FROM uploaded_files 
WHERE status = 'ERROR';

-- 删除超过指定大小的文件记录
DELETE FROM uploaded_files 
WHERE file_size > 100000000;  -- 100MB
```

---

## ⚡ 高级操作

### 数据库性能优化

#### 创建索引
```sql
-- 为常用查询字段创建索引
CREATE INDEX IF NOT EXISTS idx_user_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_session_operator ON test_sessions(operator_id);
CREATE INDEX IF NOT EXISTS idx_session_created ON test_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploader ON uploaded_files(uploader_id);
```

#### 查看查询计划
```sql
-- 分析查询性能
EXPLAIN QUERY PLAN 
SELECT * FROM user_profiles 
WHERE email = 'admin@machine-nexus.com';
```

### 数据完整性检查

#### 验证外键关系
```sql
-- 检查孤立的测试会话记录
SELECT ts.* 
FROM test_sessions ts
LEFT JOIN user_profiles up ON ts.operator_id = up.id
WHERE ts.operator_id IS NOT NULL AND up.id IS NULL;

-- 检查无效的机床模型引用
SELECT ts.*
FROM test_sessions ts
LEFT JOIN machine_models mm ON ts.model_id = mm.id
WHERE mm.id IS NULL;
```

#### 统计数据一致性
```sql
-- 验证用户统计数据
SELECT 
    up.full_name,
    COUNT(ts.id) as actual_sessions,
    COUNT(uf.id) as actual_files
FROM user_profiles up
LEFT JOIN test_sessions ts ON up.id = ts.operator_id
LEFT JOIN uploaded_files uf ON up.id = uf.uploader_id
GROUP BY up.id, up.full_name;
```

### 数据迁移脚本

#### 架构变更迁移
```bash
# 1. 修改 prisma/schema.prisma
# 2. 生成迁移文件
npx prisma migrate dev --name add_user_phone_field

# 3. 应用迁移
npx prisma migrate deploy

# 4. 更新数据
npm run db:generate
```

#### 数据格式转换
```sql
-- 将旧格式的日期字符串转换为标准格式
UPDATE user_profiles 
SET created_at = datetime(created_at_old_format)
WHERE created_at_old_format IS NOT NULL;
```

---

## 🔒 安全操作

### 数据脱敏
```sql
-- 脱敏用户邮箱 (用于测试环境)
UPDATE user_profiles 
SET email = 'user' || id || '@example.com'
WHERE email NOT LIKE '%@example.com';

-- 脱敏用户姓名
UPDATE user_profiles 
SET full_name = '用户' || substr(id, -6);
```

### 权限检查
```sql
-- 检查管理员权限分布
SELECT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role;

-- 查找具有高级权限的用户
SELECT * FROM user_profiles 
WHERE role IN ('ADMIN', 'ENGINEER');
```

---

## 📊 监控与报告

### 生成使用报告
```sql
-- 系统使用统计报告
SELECT 
    '总用户数' as metric,
    COUNT(*) as value
FROM user_profiles
UNION ALL
SELECT 
    '活跃用户数' as metric,
    COUNT(DISTINCT operator_id) as value
FROM test_sessions 
WHERE created_at >= date('now', '-30 days')
UNION ALL
SELECT 
    '本月测试会话' as metric,
    COUNT(*) as value
FROM test_sessions 
WHERE created_at >= date('now', 'start of month');
```

### 性能监控查询
```sql
-- 最耗时的操作
SELECT 
    session_name,
    julianday(completed_at) - julianday(started_at) as duration_days
FROM test_sessions 
WHERE started_at IS NOT NULL 
  AND completed_at IS NOT NULL
ORDER BY duration_days DESC
LIMIT 10;
```

记住：进行任何重要操作前，请务必先备份数据库！