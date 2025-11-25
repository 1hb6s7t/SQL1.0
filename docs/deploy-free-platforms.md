# 免费平台部署指南

使用 Vercel（前端）+ Render（后端）实现零成本部署。

## 优势

- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动部署（推送代码自动更新）
- ✅ 无需管理服务器

## 限制

- ⚠️ 免费版有冷启动（首次访问可能慢几秒）
- ⚠️ 有月度使用量限制（个人学习足够）

---

## 准备工作

1. 注册 [GitHub](https://github.com/) 账号
2. 将项目上传到 GitHub 仓库

### 创建 GitHub 仓库并上传代码

```bash
cd C:\Users\25904\Desktop\js

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始提交"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/sql-learning-platform.git

# 推送
git branch -M main
git push -u origin main
```

---

## 第一步：部署后端到 Render

### 1. 注册 Render 账号

访问 https://render.com/ 并用 GitHub 登录

### 2. 创建新服务

1. 点击 "New" → "Web Service"
2. 连接你的 GitHub 仓库
3. 选择 `sql-learning-platform` 仓库

### 3. 配置服务

| 配置项 | 值 |
|--------|-----|
| Name | sql-learning-backend |
| Region | Singapore (离中国近) |
| Branch | main |
| Root Directory | backend |
| Runtime | Node |
| Build Command | npm install |
| Start Command | npm start |

### 4. 添加环境变量

点击 "Environment"，添加以下变量：

```
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_9VrHRgt4KyxT@ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_super_secure_jwt_secret_key_2024
JWT_EXPIRES_IN=7d
QWEN_API_KEY=sk-79bf85aad3e94afb9ea071c617d32c3b
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_MODEL=qwen-plus
FRONTEND_URL=https://你的vercel域名.vercel.app
```

### 5. 部署

点击 "Create Web Service"，等待部署完成。

部署完成后，你会获得一个后端 URL，类似：
```
https://sql-learning-backend.onrender.com
```

**记下这个地址，下一步需要用到。**

---

## 第二步：修改前端 API 配置

在本地修改 `frontend/src/services/api.js`：

```javascript
const api = axios.create({
  baseURL: 'https://sql-learning-backend.onrender.com/api',  // 改为 Render 后端地址
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

提交并推送更改：

```bash
git add .
git commit -m "更新 API 地址"
git push
```

---

## 第三步：部署前端到 Vercel

### 1. 注册 Vercel 账号

访问 https://vercel.com/ 并用 GitHub 登录

### 2. 导入项目

1. 点击 "Add New" → "Project"
2. 选择你的 GitHub 仓库
3. 点击 "Import"

### 3. 配置项目

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Vue.js |
| Root Directory | frontend |
| Build Command | npm run build |
| Output Directory | dist |

### 4. 部署

点击 "Deploy"，等待部署完成。

部署完成后，你会获得一个前端 URL，类似：
```
https://sql-learning-platform.vercel.app
```

---

## 第四步：更新后端 CORS 配置

回到 Render，更新环境变量：

```
FRONTEND_URL=https://sql-learning-platform.vercel.app
```

同时修改 `backend/src/app.js` 的 CORS 配置，添加 Vercel 域名：

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://sql-learning-platform.vercel.app',  // 添加 Vercel 域名
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

提交并推送，Render 会自动重新部署。

---

## 完成！

现在任何人都可以通过以下地址访问你的 SQL 学习平台：

```
https://sql-learning-platform.vercel.app
```

---

## 绑定自定义域名（可选）

### Vercel 绑定域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 按提示配置 DNS

### Render 绑定域名

1. 在 Render 服务设置中点击 "Custom Domain"
2. 添加你的 API 子域名（如 api.你的域名.com）
3. 按提示配置 DNS

---

## 常见问题

### Q: 后端冷启动太慢？
A: Render 免费版会在 15 分钟无请求后休眠，首次访问需要约 30 秒唤醒。可以升级付费版或使用定时任务保活。

### Q: 如何查看日志？
A: 在 Render Dashboard 中点击服务，选择 "Logs" 查看。

### Q: 如何更新代码？
A: 推送到 GitHub 后，Vercel 和 Render 都会自动重新部署。

