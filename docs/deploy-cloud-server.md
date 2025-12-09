# 云服务器部署完整指南

将 SQL 学习平台部署到云服务器，实现真正的公网访问。

## 准备工作

### 1. 购买云服务器

推荐平台（新用户都有优惠）：
- **阿里云**：https://www.aliyun.com/
- **腾讯云**：https://cloud.tencent.com/
- **华为云**：https://www.huaweicloud.com/

### 2. 服务器配置建议

| 配置项 | 最低配置 | 推荐配置 |
|--------|---------|---------|
| CPU | 1核 | 2核 |
| 内存 | 1GB | 2GB |
| 硬盘 | 20GB | 40GB |
| 带宽 | 1Mbps | 3Mbps |
| 系统 | Ubuntu 20.04 | Ubuntu 22.04 |

**价格参考**：新用户首年约 50-200 元

### 3. 开放安全组端口

在云服务器控制台，开放以下端口：
- **22** - SSH 远程连接
- **80** - HTTP
- **443** - HTTPS
- **3000** - 后端 API（可选，用 Nginx 反代后可关闭）

---

## 部署步骤

### 步骤 1：连接服务器

**Windows 用户**：
1. 下载 [PuTTY](https://www.putty.org/) 或使用 Windows Terminal
2. 连接命令：
```bash
ssh root@你的服务器IP
```

### 步骤 2：安装 Node.js

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 步骤 3：安装 PM2（进程管理器）

```bash
sudo npm install -g pm2
```

### 步骤 4：安装 Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤 5：上传项目文件

**方式一：使用 Git（推荐）**

```bash
# 安装 git
sudo apt install git -y

# 克隆项目（如果你有 GitHub 仓库）
cd /var/www
git clone 你的仓库地址 sql-learning
cd sql-learning
```

**方式二：使用 SFTP 上传**

使用 FileZilla 等工具，将项目文件上传到 `/var/www/sql-learning`

### 步骤 6：安装项目依赖

```bash
cd /var/www/sql-learning

# 安装根目录依赖
npm install

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 步骤 7：配置环境变量

```bash
cd /var/www/sql-learning/backend

# 创建 .env 文件
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production

# 请替换为您的数据库连接字符串
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# 请使用强随机密钥
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# ⚠️ 重要：请从阿里云通义千问控制台获取您的API密钥
# 访问：https://dashscope.console.aliyun.com/
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_CODER_MODEL=qwen3-coder-plus
QWEN_MAX_MODEL=qwen-max
QWEN_MODEL=qwen3-coder-plus

FRONTEND_URL=http://你的域名或IP
EOF
```

### 步骤 8：初始化数据库

```bash
cd /var/www/sql-learning/backend
npm run init-db
```

### 步骤 9：构建前端

```bash
cd /var/www/sql-learning/frontend

# 修改 API 地址为生产环境
# 编辑 src/services/api.js，将 baseURL 改为 '/api'

# 构建
npm run build
```

### 步骤 10：配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/sql-learning
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 前端静态文件
    location / {
        root /var/www/sql-learning/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置（AI 请求可能较慢）
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/sql-learning /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # 删除默认配置
sudo nginx -t  # 测试配置
sudo systemctl reload nginx
```

### 步骤 11：使用 PM2 启动后端

```bash
cd /var/www/sql-learning/backend

# 启动服务
pm2 start src/app.js --name sql-backend

# 查看状态
pm2 status

# 查看日志
pm2 logs sql-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 步骤 12：访问测试

打开浏览器，访问 `http://你的服务器IP`

---

## 配置 HTTPS（推荐）

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书（需要先将域名解析到服务器）
sudo certbot --nginx -d 你的域名

# 自动续期
sudo certbot renew --dry-run
```

---

## 常用运维命令

```bash
# 查看后端状态
pm2 status

# 重启后端
pm2 restart sql-backend

# 查看后端日志
pm2 logs sql-backend

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 重启 Nginx
sudo systemctl restart nginx

# 更新代码后重新部署
cd /var/www/sql-learning
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart sql-backend
sudo systemctl reload nginx
```

---

## 故障排查

### 1. 502 Bad Gateway
- 检查后端是否运行：`pm2 status`
- 检查后端日志：`pm2 logs sql-backend`

### 2. 无法访问
- 检查安全组端口是否开放
- 检查防火墙：`sudo ufw status`

### 3. API 请求失败
- 检查 CORS 配置
- 检查 Nginx 代理配置

