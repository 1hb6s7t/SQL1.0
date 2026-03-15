# 🎓 《数据库原理与应用》智能学习平台

一个功能完整的SQL语言学习平台，支持用户注册登录、评论互动、AI智能回复等功能。

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-purple)

## ✨ 功能特点

- 🔐 **用户系统**：注册、登录、个人中心
- 💬 **评论互动**：发表评论、回复、点赞
- 🤖 **AI智能助手**：基于Qwen大模型，自动分析SQL代码、纠错、答疑
- 📚 **知识库**：系统化的SQL知识点学习
- 🚀 **练习场**：在线编写SQL，获取AI分析反馈
- 📊 **学习追踪**：记录学习进度和SQL执行历史

## 📁 项目结构

```
sql-learning-platform/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── services/       # 服务层
│   │   ├── scripts/        # 脚本文件
│   │   └── app.js          # 入口文件
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 组件
│   │   ├── views/          # 页面
│   │   ├── stores/         # 状态管理
│   │   ├── services/       # API服务
│   │   ├── router/         # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
├── scripts/                 # 工具脚本
├── setup.bat               # Windows一键配置
├── start.bat               # Windows启动脚本
├── package.json
└── README.md
```

---

# 📖 小白使用手册

## 第一部分：环境准备

### 1.1 安装 Node.js

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载 **LTS版本**（长期支持版，推荐18.x或更高）
3. 双击安装包，一路点击"下一步"完成安装
4. 验证安装：打开命令提示符（Win+R，输入`cmd`），输入：
   ```bash
   node --version
   npm --version
   ```
   如果显示版本号，说明安装成功

### 1.2 安装 Git（可选，用于克隆项目）

1. 访问 [Git官网](https://git-scm.com/)
2. 下载Windows版本并安装

### 1.3 安装代码编辑器（推荐）

推荐使用 [VS Code](https://code.visualstudio.com/)，功能强大且免费。

---

## 第二部分：一键配置（推荐）

### 2.1 Windows用户

1. **下载/解压项目** 到你的电脑
2. **双击运行 `setup.bat`**
3. 等待自动完成以下操作：
   - ✅ 检查Node.js环境
   - ✅ 安装所有依赖包
   - ✅ 创建环境配置文件
   - ✅ 初始化数据库表结构
4. 看到"配置完成"提示即可

### 2.2 启动项目

1. **双击运行 `start.bat`**
2. 等待服务启动
3. 打开浏览器访问：
   - 前端页面：http://localhost:5173
   - 后端API：http://localhost:3000/api

---

## 第三部分：手动配置（如果自动配置失败）

### 3.1 安装依赖

打开命令提示符，进入项目目录：

```bash
# 进入项目目录
cd C:\Users\你的用户名\Desktop\js

# 安装根目录依赖
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 返回根目录
cd ..
```

### 3.2 配置环境变量

在 `backend` 文件夹下创建 `.env` 文件，内容如下：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置 (NeonDB PostgreSQL)
# 请替换为您的数据库连接字符串
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT密钥 (请在生产环境中使用强随机密钥)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Qwen AI API配置
# ⚠️ 重要：请从阿里云通义千问控制台获取您的API密钥
# 访问：https://dashscope.console.aliyun.com/
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_CODER_MODEL=qwen3-coder-plus
QWEN_MAX_MODEL=qwen-max
QWEN_MODEL=qwen3-coder-plus

# 前端URL (CORS配置)
FRONTEND_URL=http://localhost:5173
```

### 3.3 初始化数据库

```bash
cd backend
npm run init-db
```

### 3.4 启动开发服务器

**方式一：同时启动前后端（推荐）**
```bash
# 在项目根目录
npm run dev
```

**方式二：分别启动**

终端1 - 启动后端：
```bash
cd backend
npm run dev
```

终端2 - 启动前端：
```bash
cd frontend
npm run dev
```

---

## 第四部分：使用指南

### 4.1 注册账号

1. 打开 http://localhost:5173
2. 点击右上角"注册"按钮
3. 填写用户名、邮箱、密码
4. 点击"注册"完成

### 4.2 登录系统

1. 点击"登录"按钮
2. 输入注册时的邮箱和密码
3. 登录成功后自动跳转首页

### 4.3 浏览知识库

1. 点击导航栏"知识库"
2. 可以按分类、难度筛选
3. 点击知识点卡片查看详情
4. 在详情页可以向AI提问

### 4.4 使用SQL练习场

1. 点击导航栏"练习场"
2. 在左侧编辑器输入SQL代码
3. 点击"分析代码"获取AI分析
4. 点击"智能纠错"获取错误修正建议
5. 还可以：
   - 生成练习题
   - 向AI提问
   - 查看本周易错点总结

### 4.5 参与社区讨论

1. 点击导航栏"社区"
2. 在输入框发表评论或问题
3. 可以粘贴SQL代码，AI会自动分析
4. 点赞、回复其他用户的评论
5. 点击"AI回复"请求AI智能回复

### 4.6 个人中心

1. 点击右上角头像进入个人中心
2. 可以：
   - 修改个人信息
   - 修改密码
   - 查看SQL执行历史
   - 查看自己的评论

---

## 第五部分：部署到生产环境（多人访问）

### 5.1 方案一：部署到云服务器

#### 准备工作
1. 购买云服务器（阿里云/腾讯云/华为云等）
2. 选择 Ubuntu 20.04 或 CentOS 7+
3. 确保开放端口：80, 443, 3000, 5173

#### 部署步骤

```bash
# 1. 连接服务器
ssh root@你的服务器IP

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装PM2（进程管理器）
npm install -g pm2

# 4. 上传项目文件到服务器（使用FTP或SCP）
# 或使用Git克隆

# 5. 进入项目目录，安装依赖
cd /your/project/path
npm install
cd backend && npm install
cd ../frontend && npm install

# 6. 构建前端
cd ../frontend
npm run build

# 7. 配置环境变量
cd ../backend
# 编辑.env文件，修改配置

# 8. 使用PM2启动后端
pm2 start src/app.js --name sql-backend

# 9. 安装Nginx
sudo apt install nginx

# 10. 配置Nginx
sudo nano /etc/nginx/sites-available/sql-learning
```

Nginx配置示例：
```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 前端静态文件
    location / {
        root /your/project/path/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 11. 启用配置
sudo ln -s /etc/nginx/sites-available/sql-learning /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 12. 设置PM2开机启动
pm2 startup
pm2 save
```

### 5.2 方案二：部署到 Vercel + Railway（免费）

#### 部署前端到Vercel

1. 注册 [Vercel](https://vercel.com) 账号
2. 安装 Vercel CLI：`npm i -g vercel`
3. 在frontend目录执行：`vercel`
4. 按提示完成部署

#### 部署后端到Railway

1. 注册 [Railway](https://railway.app) 账号
2. 新建项目，选择"Deploy from GitHub"
3. 连接你的GitHub仓库
4. 设置环境变量（从.env复制）
5. 部署完成后获取URL

### 5.3 方案三：部署到 Render（免费）

1. 注册 [Render](https://render.com) 账号
2. 新建 Web Service
3. 连接GitHub仓库
4. 设置：
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
5. 添加环境变量
6. 部署

---

## 第六部分：数据库管理

### 6.1 使用DBeaver连接NeonDB

1. 下载安装 [DBeaver](https://dbeaver.io/)
2. 新建连接，选择PostgreSQL
3. 填写连接信息：
   - Host: `ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech`
   - Port: `5432`
   - Database: `neondb`
   - Username: `neondb_owner`
   - Password: `npg_9VrHRgt4KyxT`
4. SSL设置：Mode选择`require`
5. 测试连接

### 6.2 数据库表结构

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| user_learning_records | 用户学习记录 |
| user_sql_history | SQL操作历史 |
| comments | 评论表 |
| comment_likes | 评论点赞 |
| ai_responses | AI回复记录 |
| sql_knowledge_points | SQL知识点 |
| user_knowledge_progress | 用户学习进度 |
| platform_statistics | 平台统计 |

---

## 第七部分：常见问题

### Q1: npm install 很慢怎么办？

设置淘宝镜像：
```bash
npm config set registry https://registry.npmmirror.com
```

### Q2: 端口被占用怎么办？

修改端口：
- 后端：编辑 `backend/.env`，修改 `PORT=3001`
- 前端：编辑 `frontend/vite.config.js`，修改 `server.port`

### Q3: 数据库连接失败？

1. 检查网络连接
2. 确认.env文件中的DATABASE_URL正确
3. 检查NeonDB服务状态

### Q4: AI功能不工作？

1. 检查QWEN_API_KEY是否正确
2. 检查网络是否能访问阿里云API
3. 查看后端控制台错误信息

### Q5: 如何重置数据库？

```bash
cd backend
npm run init-db
```

---

## 第八部分：API接口文档

### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/profile | 获取用户信息 |
| PUT | /api/auth/profile | 更新用户信息 |
| PUT | /api/auth/password | 修改密码 |

### 评论接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/comments | 获取评论列表 |
| POST | /api/comments | 发表评论 |
| PUT | /api/comments/:id | 更新评论 |
| DELETE | /api/comments/:id | 删除评论 |
| POST | /api/comments/:id/like | 点赞评论 |
| POST | /api/comments/:id/ai-reply | 请求AI回复 |

### 知识点接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/knowledge | 获取知识点列表 |
| GET | /api/knowledge/:id | 获取知识点详情 |
| GET | /api/knowledge/categories | 获取分类列表 |
| GET | /api/knowledge/search | 搜索知识点 |

### AI接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/ai/analyze | 分析SQL代码 |
| POST | /api/ai/ask | 问答 |
| POST | /api/ai/correct | SQL纠错 |
| POST | /api/ai/exercise | 生成练习题 |
| GET | /api/ai/weekly-summary | 获取周总结 |

---

## 📞 技术支持

如有问题，可以：
1. 在社区评论区提问
2. 使用AI助手功能
3. 查看本文档

---

## 📜 许可证

MIT License

---

**祝您学习愉快！🎉**

"# SQL-" 
